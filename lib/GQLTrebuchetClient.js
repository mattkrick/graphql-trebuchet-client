"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GQLTrebuchetClient {
    trebuchet;
    operations = {};
    nextOperationId = 0;
    pendingMessages = [];
    constructor(trebuchet) {
        this.trebuchet = trebuchet;
        trebuchet.on('data', (data) => {
            this.dispatch(data);
        });
        trebuchet.on('reconnected', () => {
            Object.keys(this.operations).forEach((opId) => {
                const operation = this.operations[opId];
                const { isSubscription, payload } = operation;
                // "at-most-once" message delivery guarantee for queries/mutations
                if (!isSubscription)
                    return;
                this.trebuchet.send({
                    id: opId,
                    type: 'start',
                    payload,
                });
            });
        });
    }
    dispatch(message) {
        const { id: opId } = message;
        const operation = this.operations[opId];
        if (!operation)
            return;
        const { sink, payload } = operation;
        const casualOrderingGroup = payload.cacheConfig?.metadata?.casualOrderingGroup ?? null;
        if (casualOrderingGroup) {
            const expectedOpIdMismatch = Object.keys(this.operations).find((id) => id < opId &&
                this.operations[id].payload.cacheConfig?.metadata?.casualOrderingGroup ===
                    casualOrderingGroup);
            if (expectedOpIdMismatch) {
                // the message dispatched is out of order. queue it until the correct one comes in
                this.pendingMessages.push(message);
                return;
            }
        }
        // the message received is the one that should be dispatched
        switch (message.type) {
            case 'complete':
                delete this.operations[opId];
                if (message.payload) {
                    sink.next(message.payload);
                }
                sink.complete();
                break;
            case 'error':
                delete this.operations[opId];
                const { errors } = message.payload;
                const [firstError] = errors;
                sink.error(new Error(firstError.message));
                break;
            case 'data':
                sink.next(message.payload);
        }
        // attempt to flush the queue
        if (casualOrderingGroup && this.pendingMessages.length > 0) {
            const nextOpIdInGroup = Object.keys(this.operations).find((id) => this.operations[id].payload.cacheConfig?.metadata?.casualOrderingGroup ===
                casualOrderingGroup);
            const pendingMessageIdx = this.pendingMessages.findIndex((pendingMessage) => pendingMessage.id === nextOpIdInGroup);
            if (pendingMessageIdx === -1)
                return;
            const [messageToFlush] = this.pendingMessages.splice(pendingMessageIdx, 1);
            this.dispatch(messageToFlush);
        }
    }
    generateOperationId() {
        return String(++this.nextOperationId);
    }
    unsubscribe(opId) {
        if (this.operations[opId]) {
            delete this.operations[opId];
            this.trebuchet.send({ id: opId, type: 'stop' });
        }
    }
    close(reason) {
        Object.keys(this.operations).forEach((opId) => {
            this.unsubscribe(opId);
        });
        this.trebuchet.close(reason);
    }
    fetch(payload, sink) {
        if (sink) {
            const opId = this.generateOperationId();
            this.operations[opId] = {
                isSubscription: false,
                id: opId,
                payload,
                sink,
            };
            this.trebuchet.send({ id: opId, type: 'start', payload });
        }
        else {
            this.trebuchet.send({ type: 'start', payload });
        }
    }
    subscribe(payload, sink) {
        const opId = this.generateOperationId();
        this.operations[opId] = {
            isSubscription: true,
            id: opId,
            payload,
            sink,
        };
        this.trebuchet.send({ id: opId, type: 'start', payload });
        const unsubscribe = () => {
            this.unsubscribe(opId);
        };
        return { unsubscribe };
    }
}
exports.default = GQLTrebuchetClient;
//# sourceMappingURL=GQLTrebuchetClient.js.map