import {Events, Trebuchet} from '@mattkrick/trebuchet-client'

export enum ServerMessageTypes {
  GQL_START = 'start',
  GQL_STOP = 'stop'
}

export enum ClientMessageTypes {
  GQL_DATA = 'data',
  GQL_ERROR = 'error',
  GQL_COMPLETE = 'complete'
}

export interface ErrorObj {
  name: string
  message: string
  stack?: string
}

export interface OperationPayload {
  documentId?: string
  query?: string
  variables?: {
    [key: string]: string | object
  }
}

export interface GraphQLData {
  [key: string]: any
}

export interface GraphQLResult {
  data?: GraphQLData
  errors?: Array<ErrorObj>
}

export interface Observer {
  onNext: (result: {[key: string]: any}) => void
  onError: (error: Array<ErrorObj>) => void
  onCompleted: () => void
}

export interface Operation {
  id: string
  payload: OperationPayload
  observer: Observer
}

export interface Operations {
  [id: string]: Operation
}

export type OutgoingMessage = StartMessage | StopMessage

export interface StartMessage {
  type: ServerMessageTypes.GQL_START
  id?: string
  payload: OperationPayload
  connectionId?: string
}

export interface StopMessage {
  type: ServerMessageTypes.GQL_STOP
  id: string
  connectionId?: string
}

export interface IncomingMessage {
  id: string
  type: ClientMessageTypes
  payload: GraphQLResult
}

class GQLTrebuchetClient {
  isTrebuchetClosed: boolean = false
  operations: Operations = {}
  private nextOperationId: number = 0

  constructor (public trebuchet: Trebuchet) {
    trebuchet.on(Events.DATA, (data: string | object) => {
      this.dispatch(typeof data === 'string' ? JSON.parse(data) : data)
    })
    trebuchet.on(Events.CLOSE, (reason?: string) => {
      this.isTrebuchetClosed = true
      this.close(reason)
    })
    trebuchet.on(Events.TRANSPORT_DISCONNECTED, () => {
      // queue up the start subscription messages
      Object.keys(this.operations).forEach((opId) => {
        this.send({
          id: opId,
          type: ServerMessageTypes.GQL_START,
          payload: this.operations[opId].payload
        })
      })
    })
  }

  private dispatch (message: IncomingMessage) {
    const {id: opId} = message
    if (!this.operations[opId]) {
      this.unsubscribe(opId)
      return
    }
    const {onCompleted, onError, onNext} = this.operations[opId].observer
    switch (message.type) {
      case ClientMessageTypes.GQL_COMPLETE:
        onCompleted()
        delete this.operations[opId]
        break

      case ClientMessageTypes.GQL_ERROR:
        onError(message.payload.errors!)
        delete this.operations[opId]
        break

      case ClientMessageTypes.GQL_DATA:
        onNext(message.payload)
    }
  }

  private generateOperationId () {
    return String(++this.nextOperationId)
  }

  private send (message: OutgoingMessage) {
    this.trebuchet.send(JSON.stringify(message))
  }

  close (reason?: string) {
    Object.keys(this.operations).forEach((opId) => {
      this.unsubscribe(opId)
    })
    if (!this.isTrebuchetClosed) {
      this.trebuchet.close(reason)
    }
  }

  fetch (payload: OperationPayload) {
    return new Promise((resolve, reject) => {
      const opId = this.generateOperationId()
      this.operations[opId] = {
        id: opId,
        payload,
        observer: {
          onNext: (result) => {
            delete this.operations[opId]
            resolve(result)
          },
          onError: (errors) => {
            delete this.operations[opId]
            // no UI needs to handle a possible array of cryptic errors. change my mind
            const firstError = Array.isArray(errors) ? errors[0] : errors
            reject(firstError.message || firstError)
          },
          onCompleted: () => {
            // server should never send this for a fetch
            delete this.operations[opId]
          }
        }
      }
      this.send({id: opId, type: ServerMessageTypes.GQL_START, payload})
    })
  }

  subscribe (payload: OperationPayload, observer: Observer) {
    const opId = this.generateOperationId()
    this.operations[opId] = {
      id: opId,
      payload,
      observer
    }
    this.send({id: opId, type: ServerMessageTypes.GQL_START, payload})
    const unsubscribe = () => {
      this.unsubscribe(opId)
    }
    return {unsubscribe}
  }

  private unsubscribe (opId: string) {
    if (this.operations[opId]) {
      delete this.operations[opId]
      this.send({id: opId, type: ServerMessageTypes.GQL_STOP})
    }
  }
}

export default GQLTrebuchetClient
