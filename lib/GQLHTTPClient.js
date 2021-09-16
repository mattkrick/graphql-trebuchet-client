"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GQLHTTPClient {
    constructor(fetchData) {
        this.fetchData = fetchData;
    }
    async fetch(payload, sink) {
        try {
            const res = await this.fetchData({
                type: 'start',
                payload,
                ...(sink && { id: '0' }),
            });
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
            const error = e instanceof Error ? e : new Error(e?.message ?? 'Network error');
            sink.error(error);
        }
    }
}
exports.default = GQLHTTPClient;
//# sourceMappingURL=GQLHTTPClient.js.map