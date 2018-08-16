# graphql-trebuchet-client

A graphql client to get subscriptions through the toughest corporate firewalls 

## Why?

GraphQL subscriptions are important.
Some corporate firewalls block long-running requests like WebSockets.
This gets through them, one way or another.

## What's it do?

- Follows the trebuchet protocol to ensure that your subscriptions always work
- Keeps track of your fetches & subscriptions

## How's it different from other graphql client libs?

- Unlike other libs, this lib won't fail silently when WebSockets fail, causing grumpy perspective users to bail
- This lib has a pure separation of concerns between connectivity & GraphQL messages. 
Other libs do too much so they can lock you into their monolithic trap (don't get got!)
 
## API

These are the methods you'll probably want to call.
- `fetch({query, variables}): Promise<GraphQLExecutionResult>`: Call this for all queries/mutations 
- `subscribe({query, variables}, {onNext, onError, onCompleted}): Disposable`: Call this to start/stop subscriptions
- `close()`: Unsubscribe from everything and prevent a reconnect. Useful for logouts.

## Example

```js
import getTrebuchet, {SocketTrebuchet, SSETrebuchet} from '@mattkrick/trebuchet-client'
import GQLTrebuchetClient, {GQLHTTPClient} from '@mattkrick/graphql-trebuchet-client'

// you can use a plain old websocket here if you don't want to use trebuchet-client. 
const trebuchet = await getTrebuchet(settings)
const transport = new GQLTrebuchetClient(trebuchet)
transport.fetch({query, variables})
transport.subscribe({query, variables}, {onNext, onError, onCompleted})
```
