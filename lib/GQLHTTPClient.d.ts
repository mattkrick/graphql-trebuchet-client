import { IncomingCompleteMessage, IncomingErrorMessage, OperationPayload } from './GQLTrebuchetClient';
import { Sink } from 'relay-runtime/lib/network/RelayObservable';
export declare type FetchData = (data: any) => Promise<IncomingErrorMessage | IncomingCompleteMessage>;
export default class GQLHTTPClient {
    fetchData: FetchData;
    constructor(fetchData: FetchData);
    fetch(payload: OperationPayload, sink: Sink<any>): Promise<void>;
}
