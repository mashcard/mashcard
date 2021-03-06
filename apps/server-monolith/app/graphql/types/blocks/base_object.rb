# frozen_string_literal: true

module Types
  module Blocks
    class BaseObject < Types::BaseObject
      graphql_name 'blockBaseObject'
      has_primary_key uuid: true
      field :deleted_at, GraphQL::Types::ISO8601DateTime, 'deleted_at', null: true
      field :parent_id, Scalars::UUID, 'parent uuid', null: true
      field :root_id, Scalars::UUID, 'root uuid', null: false
      field :sort, GraphQL::Types::BigInt, 'block sort', null: false
      field :type, String, 'block type', null: false
      # TODO: GraphQL::Types::BigInt -> Types::User
      field :blobs, [Types::Blob], 'blobs', null: true
      field :collaborators, [GraphQL::Types::BigInt], 'collaborators', null: false
      field :first_child_sort, GraphQL::Types::BigInt, 'block first child sort', null: false
      field :next_sort, GraphQL::Types::BigInt, 'block next sort', null: false
      field :path_array, [Types::Blocks::Path], 'path', null: false

      expose_permissions_field :show?
    end
  end
end
