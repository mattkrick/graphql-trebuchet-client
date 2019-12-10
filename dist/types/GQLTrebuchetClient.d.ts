import { Trebuchet } from '@mattkrick/trebuchet-client';
export declare enum ServerMessageTypes {
    GQL_START = "start",
    GQL_STOP = "stop"
}
export declare enum ClientMessageTypes {
    GQL_DATA = "data",
    GQL_ERROR = "error",
    GQL_COMPLETE = "complete"
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
}
export interface GraphQLData {
    [key: string]: any;
}
export interface GraphQLResult {
    data?: GraphQLData;
    errors?: Array<ErrorObj>;
}
export interface Observer {
    onNext: (result: {
        [key: string]: any;
    }) => void;
    onError: (error: Array<ErrorObj>) => void;
    onCompleted: () => void;
}
export interface Operation {
    id: string;
    payload: OperationPayload;
    observer: Observer;
}
export interface Operations {
    [id: string]: Operation;
}
export declare type OutgoingMessage = StartMessage | StopMessage;
export interface StartMessage {
    type: ServerMessageTypes.GQL_START;
    id?: string;
    payload: OperationPayload;
    connectionId?: string;
}
export interface StopMessage {
    type: ServerMessageTypes.GQL_STOP;
    id: string;
    connectionId?: string;
}
export interface IncomingMessage {
    id: string;
    type: ClientMessageTypes;
    payload: GraphQLResult;
}
declare class GQLTrebuchetClient {
    trebuchet: Trebuchet;
    isTrebuchetClosed: boolean;
    operations: Operations;
    private nextOperationId;
    constructor(trebuchet: Trebuchet);
    private dispatch;
    private generateOperationId;
    private send;
    close(reason?: string): void;
    fetch(payload: OperationPayload): Promise<unknown>;
    subscribe(payload: OperationPayload, observer: Observer): {
        unsubscribe: () => void;
    };
    private unsubscribe;
}
export default GQLTrebuchetClient;
//# sourceMappingURL=GQLTrebuchetClient.d.ts.map