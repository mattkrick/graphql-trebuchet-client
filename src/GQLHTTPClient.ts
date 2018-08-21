import {ServerMessageTypes, IncomingMessage, OperationPayload} from './GQLTrebuchetClient'

type BasicStartMessageString = string

export type FetchData = (data: BasicStartMessageString) => Promise<IncomingMessage>

class GQLHTTPClient {
  constructor (public fetchData: FetchData) {}

  async fetch (operationPayload: OperationPayload) {
    const res = await this.fetchData(
      JSON.stringify({type: ServerMessageTypes.GQL_START, payload: operationPayload})
    )
    return res.payload
  }
}
export default GQLHTTPClient
