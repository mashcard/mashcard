# frozen_string_literal: true
module Docs
  class Objects::TextBlock < Objects::BlockBaseObject
    description "text blocks"

    def self.data_payload
      [
        {
          name: :content,
          type: String,
          description: 'Text Content',
          opts: { null: false }
        },
      ]
    end

    def self.meta_payload
      [
        {
          name: :marks,
          type: String,
          description: 'marks',
          opts: { null: true }
        },
        {
          name: :attrs,
          type: String,
          description: 'attrs',
          opts: { null: true }
        },
      ]
    end

    field :data, data_object, null: false
    field :meta, meta_object, null: false
  end
end
