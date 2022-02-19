# frozen_string_literal: true

require 'rails_helper'

describe Docs::Mutations::BlockRestore, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation blockRestore($input: BlockRestoreInput!) {
        blockRestore(input: $input) {
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }

    it 'work' do
      self.current_user = user
      self.current_space = user.personal_space.as_session_context

      root_block = create(:docs_block, space: user.personal_space)
      expect(root_block.deleted_at).to eq(nil)

      input = { input: { id: root_block.id } }
      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(false)
      expect(response.errors[0]['message']).to eq(I18n.t("errors.graphql.argument_error.already_restored"))

      root_block.soft_delete!

      input = { input: { id: root_block.id } }
      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(true)
      expect(response.data).to eq({ "blockRestore" => nil })

      root_block.reload
      expect(root_block.deleted_at).to eq(nil)

      self.current_user = nil
      self.current_space = nil
    end
  end
end
