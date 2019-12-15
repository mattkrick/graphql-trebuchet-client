import { Trebuchet } from '@mattkrick/trebuchet-client';
import { Sink } from 'relay-runtime/lib/network/RelayObservable';
export interface ErrorObj {
    name: string;
    message: string;
    stack?: string;
}
export interface OperationPayload {
    documentId?: string;
    query?: string;
    variables?: {
        [key: string]: any;
    };
}
export interface GraphQLData {
    [key: string]: any;
}
export interface GraphQLResult {
    data?: GraphQLData;
    errors?: Array<ErrorObj>;
}
export interface Operation<T = any> {
    id: string;
    payload: OperationPayload;
    sink: Sink<T>;
}
export interface Operations {
    [id: string]: Operation;
}
export declare type OutgoingMessage = StartMessage | StopMessage;
export interface StartMessage {
    type: 'start';
    id?: string;
    payload: OperationPayload;
    connectionId?: string;
}
export interface StopMessage {
    type: 'stop';
    id: string;
    connectionId?: string;
}
export interface IncomingDataMessage {
    id: string;
    type: 'data';
    payload: GraphQLResult;
}
export interface IncomingErrorMessage {
    id: string;
    type: 'error';
    payload: {
        errors: Array<ErrorObj>;
    };
}
export interface IncomingCompleteMessage {
    id: string;
    type: 'complete';
    payload: GraphQLResult;
}
export declare type IncomingMessage = IncomingCompleteMessage | IncomingDataMessage | IncomingErrorMessage;
declare class GQLTrebuchetClient {
    trebuchet: Trebuchet;
    operations: Operations;
    private nextOperationId;
    constructor(trebuchet: Trebuchet);
    private dispatch;
    private generateOperationId;
    private unsubscribe;
    close(reason?: string): void;
    fetch<T = any>(payload: OperationPayload, sink?: Sink<T>): void;
    subscribe<T = any>(payload: OperationPayload, sink: Sink<T>): {
        unsubscribe: () => void;
    };
}
export default GQLTrebuchetClient;
//# sourceMappingURL=GQLTrebuchetClient.d.ts.map