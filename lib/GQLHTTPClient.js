"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GQLHTTPClient {
    constructor(fetchData) {
        this.fetchData = fetchData;
    }
    async fetch(payload, sink) {
        try {
            const res = await this.fetchData({ type: 'start', payload });
            if (!sink)
                return;
            if (res?.payload) {
                sink.next(res.payload);
                sink.complete();
            }
            else {
                throw new Error('No payload received');
            }
        }
        catch (e) {
            if (!sink)
                return;
            sink.error(e);
        }
    }
}
exports.default = GQLHTTPClient;
//# sourceMappingURL=GQLHTTPClient.js.map