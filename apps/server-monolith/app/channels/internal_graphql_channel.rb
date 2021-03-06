# frozen_string_literal: true

# @see https://graphql-ruby.org/api-doc/1.11.6/GraphQL/Subscriptions/ActionCableSubscriptions
class InternalGraphQLChannel < ApplicationCable::Channel
  def subscribed
    @subscription_ids = []
  end

  def execute(data)
    query = data['query']
    variables = Mashcard::GraphQL.ensure_hash(data['variables'])
    operation_name = data['operationName']
    request = ActionDispatch::Request.new(connection.env)
    context = {
      protocol: 'websocket',
      real_ip: request.remote_ip,
      current_user: current_user,
      current_pod: current_pod,
      channel: self,
      request_id: request.uuid,
    }

    result = MashcardSchema.execute(query, context: context,
      variables: variables, operation_name: operation_name)
    payload = { result: result.to_h, more: result.subscription? }

    # Track the subscription here so we can remove it
    # on unsubscribe.
    if result.context[:subscription_id]
      @subscription_ids << result.context[:subscription_id]
    end

    transmit(payload)
  end

  def unsubscribed
    @subscription_ids.each do |sid|
      MashcardSchema.subscriptions.delete_subscription(sid)
    end
  end
end
