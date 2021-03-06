# frozen_string_literal: true

require 'rails_helper'

describe Resolvers::EmailAvailable, type: :query do
  describe '#resolver' do
    query = <<-'GRAPHQL'
       query QueryEmailAvailable($email: String!) {
         emailAvailable(email: $email) {
           success
           message
         }
       }
    GRAPHQL

    it 'works' do
      graphql_execute(query, { email: 'legitimate name example' })
      expect(response.data['emailAvailable']).to eq({ 'success' => false,
'message' => I18n.t('errors.messages.invalid'), })
    end

    it 'expect email uniqueness' do
      stub = create(:accounts_user_authentication).user
      graphql_execute(query, { email: stub.authentication.email })
      expect(response.data['emailAvailable']).to eq({ 'success' => false,
'message' => I18n.t('errors.messages.taken'), })

      graphql_execute(query, { email: 'legitimate@mashcard.cloud' })
      expect(response.data['emailAvailable']).to eq({ 'success' => true, 'message' => 'ok' })
    end
  end
end
