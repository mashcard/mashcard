# frozen_string_literal: true

module Types
  class DocumentHistories < Types::BaseObject
    graphql_name 'DocumentHistories'

    field :histories, [DocumentHistory], 'History States', null: true
    field :users, [Types::User], 'History Users', null: true
  end
end
