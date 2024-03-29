import { Trebuchet } from '@mattkrick/trebuchet-client';
import { CacheConfig } from 'relay-runtime';
import { Sink } from 'relay-runtime/lib/network/RelayObservable';
interface TrebuchetCacheConfig extends CacheConfig {
    metadata?: {
        casualOrderingGroup?: string;
        [key: string]: unknown;
    };
}
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
    uploadables?: {
        [key: string]: File | Blob;
    };
    cacheConfig?: TrebuchetCacheConfig;
}
export interface GraphQLData {
    [key: string]: any;
}
export interface GraphQLResult {
    data?: GraphQLData;
    errors?: Array<ErrorObj>;
}
export interface Operation<T = any> {
    isSubscription: boolean;
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
    private pendingMessages;
    constructor(trebuchet: Trebuchet);
    private dispatch;
    private generateOperationId;
    private unsubscribe;
    close(reason?: string): void;
    fetch(payload: OperationPayload, sink?: Sink<any> | null): void;
    subscribe(payload: OperationPayload, sink: Sink<any>): {
        unsubscribe: () => void;
    };
}
export default GQLTrebuchetClient;
