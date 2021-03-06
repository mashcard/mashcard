import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import * as ActionCable from '@rails/actioncable'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'
import { typePolicies } from './typePolicies'

const securityLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'X-CSRF-Token': globalThis.mashcardContext?.csrfToken
    }
  }
})

const httpLink = securityLink.concat(
  createHttpLink({
    uri: globalThis.mashcardContext.internalApiEndpoint.graphql,
    credentials: 'same-origin'
  })
)

export const cable = ActionCable.createConsumer(globalThis.mashcardContext.internalApiEndpoint.actionCable)

const websocketLink = new ActionCableLink({ cable, channelName: 'InternalGraphQLChannel' })

// If subscription operation or operation name end with 'FromWS' use WebSocket else use HTTP.
const mashcardLink = split(
  ({ query, operationName }) => {
    const definition = getMainDefinition(query)
    return (
      (definition.kind === 'OperationDefinition' && definition.operation === 'subscription') ||
      operationName.endsWith('FromWS')
    )
  },
  websocketLink,
  httpLink
)

export const apolloClient = new ApolloClient({
  link: mashcardLink,
  cache: new InMemoryCache({ typePolicies })
})
