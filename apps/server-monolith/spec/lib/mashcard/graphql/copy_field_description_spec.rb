# frozen_string_literal: true

require 'rails_helper'

describe Mashcard::GraphQL::CopyFieldDescription do
  subject { Class.new.include(described_class) }

  describe '.copy_field_description' do
    let(:type) do
      Class.new(Types::BaseObject) do
        graphql_name 'TestType'

        field :field_name, GraphQL::Types::String, null: true, description: 'Foo'
      end
    end

    it 'returns the correct description' do
      expect(subject.description_same(type, :field_name)).to eq('Foo')
    end
  end
end
