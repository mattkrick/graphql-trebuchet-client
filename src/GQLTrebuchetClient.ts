import {Trebuchet} from '@mattkrick/trebuchet-client'
import {Sink} from 'relay-runtime/lib/network/RelayObservable'

export interface ErrorObj {
  name: string
  message: string
  stack?: string
}

export interface OperationPayload {
  documentId?: string
  query?: string
  variables?: {
    [key: string]: any
  }
  uploadables?: {
    [key: string]: File | Blob
  }
}

export interface GraphQLData {
  [key: string]: any
}

export interface GraphQLResult {
  data?: GraphQLData
  errors?: Array<ErrorObj>
}

export interface Operation<T = any> {
  id: string
  payload: OperationPayload
  sink: Sink<T>
}

export interface Operations {
  [id: string]: Operation
}

export type OutgoingMessage = StartMessage | StopMessage

export interface StartMessage {
  type: 'start'
  id?: string
  payload: OperationPayload
  connectionId?: string
}

export interface StopMessage {
  type: 'stop'
  id: string
  connectionId?: string
}

export interface IncomingDataMessage {
  id: string
  type: 'data'
  payload: GraphQLResult
}

export interface IncomingErrorMessage {
  id: string
  type: 'error'
  payload: {errors: Array<ErrorObj>}
}
export interface IncomingCompleteMessage {
  id: string
  type: 'complete'
  payload: GraphQLResult
}

export type IncomingMessage = IncomingCompleteMessage | IncomingDataMessage | IncomingErrorMessage

class GQLTrebuchetClient {
  operations: Operations = {}
  private nextOperationId: number = 0

  constructor (public trebuchet: Trebuchet) {
    trebuchet.on('data', (data) => {
      this.dispatch((data as unknown) as IncomingMessage)
    })
    trebuchet.on('reconnected', () => {
      Object.keys(this.operations).forEach((opId) => {
        this.trebuchet.send({
          id: opId,
          type: 'start',
          payload: this.operations[opId].payload
        })
      })
    })
  }

  private dispatch (message: IncomingMessage) {
    const {id: opId} = message
    const operation = this.operations[opId]
    if (!operation) return
    const {sink} = operation
    switch (message.type) {
      case 'complete':
        delete this.operations[opId]
        if (message.payload) {
          sink.next(message.payload)
        }
        sink.complete()
        break
      case 'error':
        delete this.operations[opId]
        const {errors} = message.payload
        const [firstError] = errors
        sink.error(firstError)
        break
      case 'data':
        sink.next(message.payload)
    }
  }

  private generateOperationId () {
    return String(++this.nextOperationId)
  }

  private unsubscribe (opId: string) {
    if (this.operations[opId]) {
      delete this.operations[opId]
      this.trebuchet.send({id: opId, type: 'stop'})
    }
  }

  close (reason?: string) {
    Object.keys(this.operations).forEach((opId) => {
      this.unsubscribe(opId)
    })
    this.trebuchet.close(reason)
  }

  fetch<T = any> (payload: OperationPayload, sink?: Sink<T>) {
    if (sink) {
      const opId = this.generateOperationId()
      this.operations[opId] = {
        id: opId,
        payload,
        sink
      }
      this.trebuchet.send({id: opId, type: 'start', payload})
    } else {
      this.trebuchet.send({type: 'start', payload})
    }
  }

  subscribe<T = any> (payload: OperationPayload, sink: Sink<T>) {
    const opId = this.generateOperationId()
    this.operations[opId] = {
      id: opId,
      payload,
      sink
    }
    this.trebuchet.send({id: opId, type: 'start', payload})

    const unsubscribe = () => {
      this.unsubscribe(opId)
    }
    return {unsubscribe}
  }
}

export default GQLTrebuchetClient
