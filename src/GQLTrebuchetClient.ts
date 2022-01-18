import { Trebuchet } from '@mattkrick/trebuchet-client'
import { CacheConfig } from 'relay-runtime'
import { Sink } from 'relay-runtime/lib/network/RelayObservable'

interface TrebuchetCacheConfig extends CacheConfig {
  metadata?: {
    casualOrderingGroup?: string
    [key: string]: unknown
  }
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
    [key: string]: any
  }
  uploadables?: {
    [key: string]: File | Blob
  }
  cacheConfig?: TrebuchetCacheConfig
}

export interface GraphQLData {
  [key: string]: any
}

export interface GraphQLResult {
  data?: GraphQLData
  errors?: Array<ErrorObj>
}

export interface Operation<T = any> {
  isSubscription: boolean

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
  private nextOperationId = 0
  private pendingMessages = [] as IncomingMessage[]

  constructor(public trebuchet: Trebuchet) {
    trebuchet.on('data', (data) => {
      this.dispatch(data as unknown as IncomingMessage)
    })
    trebuchet.on('reconnected', () => {
      Object.keys(this.operations).forEach((opId) => {
        const operation = this.operations[opId]
        const {isSubscription, payload} = operation
        // "at-most-once" message delivery guarantee for queries/mutations
        if (!isSubscription) return
        this.trebuchet.send({
          id: opId,
          type: 'start',
          payload,
        })
      })
    })
  }

  private dispatch(message: IncomingMessage) {
    const {id: opId} = message
    const operation = this.operations[opId]
    if (!operation) return
    const {sink, payload} = operation
    const casualOrderingGroup = payload.cacheConfig?.metadata?.casualOrderingGroup ?? null
    if (casualOrderingGroup) {
      const expectedOpIdMismatch = Object.keys(this.operations).find(
        (id) =>
          id < opId &&
          this.operations[id].payload.cacheConfig?.metadata?.casualOrderingGroup ===
            casualOrderingGroup,
      )
      if (expectedOpIdMismatch) {
        // the message dispatched is out of order. queue it until the correct one comes in
        this.pendingMessages.push(message)
        return
      }
    }
    // the message received is the one that should be dispatched
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
        sink.error(new Error(firstError.message))
        break
      case 'data':
        sink.next(message.payload)
    }

    // attempt to flush the queue
    if (casualOrderingGroup && this.pendingMessages.length > 0) {
      const nextOpIdInGroup = Object.keys(this.operations).find(
        (id) =>
          this.operations[id].payload.cacheConfig?.metadata?.casualOrderingGroup ===
          casualOrderingGroup,
      )
      const pendingMessageIdx = this.pendingMessages.findIndex(
        (pendingMessage) => pendingMessage.id === nextOpIdInGroup,
      )
      if (pendingMessageIdx === -1) return
      const [messageToFlush] = this.pendingMessages.splice(pendingMessageIdx, 1)
      this.dispatch(messageToFlush)
    }
  }

  private generateOperationId() {
    return String(++this.nextOperationId)
  }

  private unsubscribe(opId: string) {
    if (this.operations[opId]) {
      delete this.operations[opId]
      this.trebuchet.send({id: opId, type: 'stop'})
    }
  }

  close(reason?: string) {
    Object.keys(this.operations).forEach((opId) => {
      this.unsubscribe(opId)
    })
    this.trebuchet.close(reason)
  }

  fetch(payload: OperationPayload, sink?: Sink<any> | null) {
    if (sink) {
      const opId = this.generateOperationId()
      this.operations[opId] = {
        isSubscription: false,
        id: opId,
        payload,
        sink,
      }
      this.trebuchet.send({id: opId, type: 'start', payload})
    } else {
      this.trebuchet.send({type: 'start', payload})
    }
  }

  subscribe(payload: OperationPayload, sink: Sink<any>) {
    const opId = this.generateOperationId()
    this.operations[opId] = {
      isSubscription: true,
      id: opId,
      payload,
      sink,
    }
    this.trebuchet.send({id: opId, type: 'start', payload})

    const unsubscribe = () => {
      this.unsubscribe(opId)
    }
    return {unsubscribe}
  }
}

export default GQLTrebuchetClient
