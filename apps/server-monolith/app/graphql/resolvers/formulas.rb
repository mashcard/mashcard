# frozen_string_literal: true

module Resolvers
  class Formulas < BaseResolver
    type [Types::Formula], null: true

    argument :domain, GraphQL::Types::String, required: true,
      description: 'List all formulas for pod domain'
    argument :ids, GraphQL::Types::String, required: false

    def resolve(args)
      query = Docs::Formula.joins(:pod).where(pod: { domain: args[:domain] })
      if args[:ids]
        query = query.where(id: args[:ids].split(','))
      end

      query.to_a.map do |f|
        f.attributes.merge('created_at' => f.created_at.to_i)
      end
    end
  end
end
