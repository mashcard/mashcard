# frozen_string_literal: true

require 'rails_helper'

describe Docs::Mutations::BlockCreateShareLink, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation blockCreateShareLink($input: BlockCreateShareLinkInput!) {
        blockCreateShareLink(input: $input) {
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }
    let(:share_user) { create(:accounts_user) }
    let(:block) { create(:docs_block, space: user.personal_space) }

    it 'work' do
      self.current_user = user
      self.current_space = user.personal_space.as_session_context

      input = { input: { id: block.id, target: [{ policy: "view", state: "enabled", domain: Space::ANYONE_DOMAIN }] } }
      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(true)
      expect(response.data).to eq({ 'blockCreateShareLink' => nil })

      input = { input: { id: block.id, target: [{ policy: "edit", state: "enabled", domain: share_user.domain }] } }
      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(true)
      expect(response.data).to eq({ 'blockCreateShareLink' => nil })

      self.current_user = nil
      self.current_space = nil
    end

    it 'error' do
      self.current_user = user
      self.current_space = user.personal_space.as_session_context

      input = { input: { id: block.id, target: [{ policy: "view", state: "enabled", domain: "foobar" }] } }
      internal_graphql_execute(mutation, input)
      expect(response.success?).to eq(false)
      expect(response.errors[0]['message']).to include(I18n.t("errors.messages.domain_presence_invalid"))

      self.current_user = nil
      self.current_space = nil
    end
  end
end
