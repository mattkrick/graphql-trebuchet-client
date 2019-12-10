import { IncomingMessage, OperationPayload } from './GQLTrebuchetClient';
declare type BasicStartMessageString = string;
export declare type FetchData = (data: BasicStartMessageString) => Promise<IncomingMessage>;
declare class GQLHTTPClient {
    fetchData: FetchData;
    constructor(fetchData: FetchData);
    fetch(operationPayload: OperationPayload): Promise<import("./GQLTrebuchetClient").GraphQLResult>;
}
export default GQLHTTPClient;
//# sourceMappingURL=GQLHTTPClient.d.ts.map