# frozen_string_literal: true

require 'rails_helper'

describe Mutations::Pods::CreateOrUpdate, type: :mutation do
  describe '#resolve' do
    mutation = <<-'TEXT'
      mutation createOrUpdatePod($input: CreateOrUpdatePodInput!) {
        createOrUpdatePod(input: $input) {
          errors
          pod {
            ... on User {
              domain
              name
            }
            ... on Group {
              domain
              name
              inviteEnable
            }
          }
        }
      }
    TEXT

    let(:user) { create(:accounts_user) }

    it 'update' do
      self.current_user = user

      new_name = 'NEWNAME'

      input = { input: { type: 'UPDATE', domain: user.personal_pod.domain, name: new_name } }
      graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:createOrUpdatePod][:errors]).to eq([])
      expect(response.data[:createOrUpdatePod][:pod][:name]).to eq(new_name)

      user.create_own_group!(username: 'createOrUpdatePod', display_name: 'createOrUpdatePod')

      input = { input: { type: 'UPDATE', domain: 'createOrUpdatePod', inviteEnable: true } }
      graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:createOrUpdatePod][:errors]).to eq([])
      expect(response.data[:createOrUpdatePod][:pod][:inviteEnable]).to be(true)

      input = { input: { type: 'UPDATE', domain: 'ERROR_DOMAIN', name: new_name } }
      graphql_execute(mutation, input)
      expect(response.errors).to eq({})
      expect(response.data[:createOrUpdatePod][:errors]).to eq([I18n.t('accounts.errors.pod_not_exist')])

      self.current_user = nil
    end

    it 'create' do
      self.current_user = user

      new_domain = "new#{user.id}"
      new_name = 'NEWNAME'

      input = { input: { type: 'CREATE', domain: new_domain, name: new_name } }
      graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:createOrUpdatePod][:errors]).to eq([])
      expect(response.data[:createOrUpdatePod][:pod][:name]).to eq(new_name)
      expect(response.data[:createOrUpdatePod][:pod][:domain]).to eq(new_domain)

      input = { input: { type: 'CREATE', domain: user.personal_pod.domain, name: new_name } }
      graphql_execute(mutation, input)
      expect(response.errors).to eq({})
      expect(response.data[:createOrUpdatePod][:errors]).to eq([I18n.t('accounts.errors.pod_exist')])

      self.current_user = nil
    end
  end
end
