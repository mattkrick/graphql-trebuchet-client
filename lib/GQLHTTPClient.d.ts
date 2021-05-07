import { Sink } from 'relay-runtime/lib/network/RelayObservable';
import { IncomingCompleteMessage, IncomingErrorMessage, OperationPayload } from './GQLTrebuchetClient';
export declare type FetchData = (data: any) => Promise<IncomingErrorMessage | IncomingCompleteMessage>;
export default class GQLHTTPClient {
    fetchData: FetchData;
    constructor(fetchData: FetchData);
    fetch(payload: OperationPayload, sink?: Sink<any> | null): Promise<void>;
}
