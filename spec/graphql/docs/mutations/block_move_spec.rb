# frozen_string_literal: true

require 'rails_helper'

describe Docs::Mutations::BlockMove, type: :mutation do
  describe '#resolve' do
    mutation = <<-'GRAPHQL'
      mutation blockMove($input: BlockMoveInput!) {
        blockMove(input: $input) {
          errors
        }
      }
    GRAPHQL

    let(:user) { create(:accounts_user) }
    let(:block1) do
      root = create(:docs_block, pod: user.personal_pod)
      create(:docs_block, pod: user.personal_pod, sort: 100, parent: root)
      create(:docs_block, pod: user.personal_pod, sort: 200, parent: root)
      create(:docs_block, pod: user.personal_pod, sort: 300, parent: root)
      root
    end
    let(:block2) do
      root = create(:docs_block, pod: user.personal_pod)
      create(:docs_block, pod: user.personal_pod, sort: 100, parent: root)
      create(:docs_block, pod: user.personal_pod, sort: 200, parent: root)
      create(:docs_block, pod: user.personal_pod, sort: 300, parent: root)
      root
    end

    it 'root to root' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1

      input = { input: { id: root.id, sort: 150 } }
      internal_graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:blockMove]).to eq(nil)

      self.current_user = nil
      self.current_pod = nil
    end

    it 'child to child: same parent' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1
      child = root.descendants.find_by!(sort: 100)

      input = { input: { id: child.id, targetParentId: child.parent_id, sort: 150 } }
      internal_graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:blockMove]).to eq(nil)

      self.current_user = nil
      self.current_pod = nil
    end

    it 'child to child: different parent' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1
      root2 = block2
      child = root2.descendants.find_by!(sort: 100)

      input = { input: { id: child.id, targetParentId: root.id, sort: 150 } }
      internal_graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:blockMove]).to eq(nil)

      self.current_user = nil
      self.current_pod = nil
    end

    it 'root to child' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1
      child = root.descendants.find_by!(sort: 300)

      input = { input: { id: child.id, sort: 150 } }
      internal_graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:blockMove]).to eq(nil)

      self.current_user = nil
      self.current_pod = nil
    end

    it 'child to root' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1

      input = { input: { id: root.id, targetParentId: block2.id, sort: 300 } }
      internal_graphql_execute(mutation, input)

      expect(response.errors).to eq({})
      expect(response.data[:blockMove]).to eq(nil)

      self.current_user = nil
      self.current_pod = nil
    end

    it 'self' do
      self.current_user = user
      self.current_pod = user.personal_pod.as_session_context

      root = block1

      input = { input: { id: root.id, targetParentId: root.id, sort: 300 } }
      internal_graphql_execute(mutation, input)

      expect(response.data[:blockMove]).to eq(nil)
      expect(response.errors[0]['message']).to include("Invalid target")

      self.current_user = nil
      self.current_pod = nil
    end
  end
end