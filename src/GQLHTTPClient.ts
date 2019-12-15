import {IncomingCompleteMessage, IncomingErrorMessage, OperationPayload} from './GQLTrebuchetClient'
import {Sink} from 'relay-runtime/lib/network/RelayObservable'

export type FetchData = (data: any) => Promise<IncomingErrorMessage | IncomingCompleteMessage>

export default class GQLHTTPClient {
  constructor (public fetchData: FetchData) {}

  async fetch (payload: OperationPayload, sink: Sink<any>) {
    const res = await this.fetchData({type: 'start', payload})
    sink.next(res.payload)
    sink.complete()
  }
}
