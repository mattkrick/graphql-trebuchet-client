# graphql-trebuchet-client

A graphql client to get your subscriptions through tough firewalls and unreliable mobile networks

## Why?

GraphQL subscriptions are important.
Some corporate firewalls block long-running requests like WebSockets.
This gets through them, one way or another.

## What's it do?

- This is just a GraphQL protocol layer, which sits on top of the connection layer
- Keeps track of your fetches & subscriptions
- Resubscribes when the connection is ended prematurely
- Supports multiple responses for the same fetch, allowing for partial resutls using e.g. `@defer`

## How's it different from other graphql client libs?

- This lib won't fail silently when WebSockets fail
- This lib has a pure separation of concerns between connectivity & GraphQL messages
- Other libs do too much so they can lock you into their monolithic trap (don't get got!)

## What's the protocol?

From the client:
- An operation has an `id`, `type`, and `payload`
- The type MUST be `start` or `stop`
- a `start` payload MAY include a `query` param, or a `documentId` param (for persisted queries)
- a `stop` operation MUST include the `id` of the operation to unsubscribe from
- The client MUST send a single operation (batching is left up to the transport)

From the server:
- An operation has an `id`, `type`, and `payload`
- The `id` MUST match the `id` of the request
- The `type` MUST be `data`, `error`, or `complete`
- The payload MUST be a GraphQLResult (`{data, errors}`)
- If the `type` is `data`, the client MUST call `sink.next`
- If the `type` is `error`, the client MUST call `sink.error`
- If the `type` is `complete`, the client MUST call `sink.next` iif a payload is present and call `sink.complete` after

## API

These are the methods you'll probably want to call.
- `fetch({query, variables}, sink)`: Call this for all queries/mutations
- `subscribe({query, variables}, sink): Disposable`: Call this to start a subscription.
Call the return value to stop it.
- `close()`: Unsubscribe from everything and prevent a reconnect. Useful for logouts.

## Example

```js
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import GQLTrebuchetClient, {GQLHTTPClient} from '@mattkrick/graphql-trebuchet-client'

// you can use a plain old websocket here if you don't want to use trebuchet-client.
const trebuchet = await getTrebuchet(settings)
const transport = new GQLTrebuchetClient(trebuchet)
const myFetch = (query, variables) => {
  // note using a promise is easy to get started, but means you can't return multiple responses
  return new Promise((resolve, reject) => {
    return transport.fetch({query, variables}, {
      next(result): {
        resolve(result)
      },
      error(error): {
        reject(error)
      },
      complete(maybeResult): {
        resolve(result)
      }
    })
  })

transport.subscribe({query, variables}, subSink)
```
