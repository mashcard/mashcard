# frozen_string_literal: true
module Docs
  module Objects
    class BlockInfo < BrickGraphQL::BaseObject
      field :is_deleted, Boolean, 'is deleted', null: false
      field :title, String, 'title', null: false
      field :id, BrickGraphQL::Scalars::UUID, 'id', null: false
      field :pin, Boolean, 'pin', null: false
      field :payload, GraphQL::Types::JSON, 'payload', null: false
      field :permission, ShareLink, 'permission', null: true
      field :collaborators, [System::Objects::Pod], 'pod', null: false
      field :path_array, [BlockPath], 'path', null: false
    end
  end
end
