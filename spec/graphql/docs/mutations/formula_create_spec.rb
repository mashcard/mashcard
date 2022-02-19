# frozen_string_literal: true

require 'rails_helper'

describe Docs::Mutations::FormulaCreate, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation formulaCreate($input: FormulaCreateInput!) {
        formulaCreate(input: $input) {
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }
    let(:share_user) { create(:accounts_user) }
    let(:block) { create(:docs_block, space: user.personal_space) }

    it 'create' do
      self.current_user = user
      self.current_space = user.personal_space.as_session_context

      input = { input: {
        id: SecureRandom.uuid,
        blockId: block.id,
        type: 'normal',
        name: 'create formula',
        cacheValue: { type: 'string', value: '123' }, definition: '=123'
      } }

      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(true)

      self.current_user = nil
      self.current_space = nil
    end
  end
end
