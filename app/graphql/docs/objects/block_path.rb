# frozen_string_literal: true
module Docs
  module Objects
    class BlockPath < BrickGraphQL::BaseObject
      field :id, BrickGraphQL::Scalars::UUID, 'icon', null: false
      field :text, String, 'cover', null: false
      field :icon, BlockIcon, 'icon', null: true
    end
  end
end
