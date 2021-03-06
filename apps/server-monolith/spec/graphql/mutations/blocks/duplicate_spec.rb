# frozen_string_literal: true

require 'rails_helper'

describe Mutations::Blocks::Duplicate, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation blockDuplicate($input: BlockDuplicateInput!) {
        blockDuplicate(input: $input) {
          id
          formulaIds
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }

    it 'work' do
      self.current_user = user

      root_block = create(:docs_block, pod: user.personal_pod)

      input = { input: { id: root_block.id } }
      graphql_execute(mutation, input)
      expect(response.errors).to eq({})
      expect(response.data['blockDuplicate']['errors']).to eq([])
      expect(response.data['blockDuplicate']['id']).not_to be_nil

      self.current_user = nil
    end
  end
end
