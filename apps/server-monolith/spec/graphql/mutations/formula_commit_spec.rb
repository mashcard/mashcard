# frozen_string_literal: true

require 'rails_helper'

describe Mutations::FormulaCommit, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation formulaCommit($input: FormulaCommitInput!) {
        formulaCommit(input: $input) {
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }
    let(:share_user) { create(:accounts_user) }
    let(:block) { create(:docs_block, pod: user.personal_pod) }

    it 'create' do
      self.current_user = user

      input = { input: {
        commitFormulas: [{
          id: Mashcard::Utils::Encoding::UUID.gen_v4,
          blockId: block.id,
          type: 'normal',
          name: 'create_formula',
          cacheValue: { type: 'string', result: '123' },
          definition: '=123',
          meta: {},
          version: 0,
        }], deleteFormulas: [],
      } }

      graphql_execute(mutation, input)
      expect(response.success?).to be(true)

      self.current_user = nil
    end

    it 'update' do
      self.current_user = user

      formula = Docs::Formula.create!(
        block_id: block.id,
        id: Mashcard::Utils::Encoding::UUID.gen_v4,
        name: 'formula_update',
        definition: '=123',
        meta: {},
        cache_value: { type: 'string', result: '123' },
        version: 0,
        type: 'normal'
      )

      new_name = 'formula_update_name'

      input = { input: { commitFormulas: [{
        id: formula.id,
        blockId: block.id,
        name: new_name,
        definition: '=123 + 1',
        cacheValue: { type: 'string', result: '123' },
        meta: {},
        version: 0,
        type: 'normal',
      }], deleteFormulas: [], } }

      graphql_execute(mutation, input)
      expect(response.success?).to be(true)

      formula.reload

      expect(formula.name).to eq(new_name)

      self.current_user = nil
    end

    it 'delete' do
      self.current_user = user

      formula = Docs::Formula.create!(
        block_id: block.id, id: Mashcard::Utils::Encoding::UUID.gen_v4, name: 'formula delete', meta: {},
        definition: '=123', cache_value: { 'value' => '123', 'type' => 'number' }
      )

      input = { input: { commitFormulas: [], deleteFormulas: [{
        id: formula.id,
        blockId: block.id,
      }], } }

      graphql_execute(mutation, input)
      expect(response.success?).to be(true)

      expect do
        formula.reload
      end.to raise_error(ActiveRecord::RecordNotFound)

      self.current_user = nil
    end
  end
end
