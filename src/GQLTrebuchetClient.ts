import {CLOSE, DATA, Trebuchet} from '@mattkrick/trebuchet-client'

export interface ErrorObj {
  message: string
}

export interface OperationPayload {
  query: string
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
  onNext: (result: any) => void
  onError: (error: any) => void
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
  id?: string
  type: 'start'
  payload: OperationPayload
  connectionId?: string
}

export interface StopMessage {
  id: string
  type: 'stop'
  connectionId?: string
}

export interface IncomingMessage {
  id: string
  type: 'data' | 'error' | 'complete'
  payload: GraphQLResult
}

export const GQL_DATA = 'data' // Server -> Client
export const GQL_ERROR = 'error' // Server -> Client
export const GQL_COMPLETE = 'complete' // Server -> Client

export const GQL_START = 'start' // Client -> Server
export const GQL_STOP = 'stop' // Client -> Server

class GQLTrebuchetClient {
  operations: Operations = {}
  private nextOperationId: number = 0

  constructor (public trebuchet: Trebuchet) {
    trebuchet.on(DATA, (data: string | object) => {
      this.dispatch(typeof data === 'string' ? JSON.parse(data) : data)
    })
    trebuchet.on(CLOSE, (reason?: string) => {
      this.close(reason)
    })
  }

  private dispatch (message: IncomingMessage) {
    const {id: opId} = message
    if (opId && !this.operations[opId]) {
      this.unsubscribe(opId)
      return
    }
    switch (message.type) {
      case GQL_COMPLETE:
        this.operations[opId].observer.onCompleted()
        delete this.operations[opId]
        break

      case GQL_ERROR:
        this.operations[opId].observer.onError(message.payload)
        delete this.operations[opId]
        break

      case GQL_DATA:
        this.operations[opId].observer.onNext(message.payload)
        break
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
    this.trebuchet.close(reason)
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
            reject(errors && errors[0])
          },
          onCompleted: () => {
            // server should never send this for a fetch
            delete this.operations[opId]
          }
        }
      }
      this.send({id: opId, type: GQL_START, payload})
    })
  }

  subscribe (payload: OperationPayload, observer: Observer) {
    const opId = this.generateOperationId()
    this.operations[opId] = {
      id: opId,
      payload,
      observer
    }
    this.send({id: opId, type: GQL_START, payload})
    const unsubscribe = () => {
      this.unsubscribe(opId)
    }
    return {unsubscribe}
  }

  private unsubscribe (opId: string) {
    if (this.operations[opId]) {
      delete this.operations[opId]
      this.send({id: opId, type: GQL_STOP})
    }
  }
}

export default GQLTrebuchetClient
