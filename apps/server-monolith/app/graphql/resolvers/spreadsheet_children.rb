# frozen_string_literal: true

module Resolvers
  class SpreadsheetChildren < BaseResolver
    type Types::SpreadsheetChildren, null: true

    argument :parent_id, GraphQL::Types::String, required: true,
      description: 'List all children from parent id'

    def resolve(parent_id:)
      rows = Docs::Block.where(parent_id: parent_id, type: ['spreadsheetRow']).non_deleted.to_a
      cells = Docs::Block.where(parent_id: rows.map(&:id), type: ['spreadsheetCell']).non_deleted.to_a
      {
        blocks: rows + cells,
      }
    end
  end
end
