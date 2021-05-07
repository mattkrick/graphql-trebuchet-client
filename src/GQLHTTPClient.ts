import {Sink} from 'relay-runtime/lib/network/RelayObservable'
import {IncomingCompleteMessage, IncomingErrorMessage, OperationPayload} from './GQLTrebuchetClient'

export type FetchData = (data: any) => Promise<IncomingErrorMessage | IncomingCompleteMessage>

export default class GQLHTTPClient {
  constructor(public fetchData: FetchData) {}

  async fetch(payload: OperationPayload, sink?: Sink<any> | null) {
    try {
      const res = await this.fetchData({type: 'start', payload})
      if (!sink) return
      if (res?.payload) {
        sink.next(res.payload)
        sink.complete()
      } else {
        throw new Error('No payload received')
      }
    } catch (e) {
      if (!sink) return
      sink.error(e)
    }
  }
}
