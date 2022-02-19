# frozen_string_literal: true

require 'rails_helper'

describe Docs::Queries::BlockSearch, type: :query do
  describe '#resolver' do
    query = <<-'GRAPHQL'
      query GetBlockSearch($domain: String!, $input: String!) {
        blockSearch(domain: $domain, input: $input) {
          id
          type
          text
          rootId
        }
      }
    GRAPHQL

    it 'works' do
      user = create(:accounts_user)
      self.current_user = user
      self.current_space = user.personal_space.as_session_context

      internal_graphql_execute(query, domain: user.domain, input: "")
      expect(response.success?).to eq(true)
      expect(response.data['blockSearch']).to eq([])

      _block = create(:docs_block, space: user.personal_space, text: "Foo Bar Baz")

      internal_graphql_execute(query, domain: user.domain, input: "")
      expect(response.success?).to eq(true)
      expect(response.data['blockSearch'].length).to eq(1)
      expect(response.data['blockSearch'][0]['text']).to eq("Foo Bar Baz")

      internal_graphql_execute(query, domain: user.domain, input: "Bar")
      expect(response.success?).to eq(true)
      expect(response.data['blockSearch'].length).to eq(1)
      expect(response.data['blockSearch'][0]['text']).to eq("Foo Bar Baz")

      internal_graphql_execute(query, domain: user.domain, input: "Barzzz")
      expect(response.success?).to eq(true)
      expect(response.data['blockSearch']).to eq([])

      self.current_user = nil
      self.current_space = nil
    end
  end
end
