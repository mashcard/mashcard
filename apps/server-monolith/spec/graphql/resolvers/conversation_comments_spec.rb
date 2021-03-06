# frozen_string_literal: true

require 'rails_helper'

describe Resolvers::ConversationComments, type: :query do
  describe '#resolver' do
    query = <<~TEXT
      query GetConversationComments($pageIds: [UUID!]!) {
        conversationComments(pageIds: $pageIds) {
          id
          docId
          markIds
          blockIds
          latestReplyAt
          updatedAt
          createdAt
          status
          comments {
            id
            content
            status
            createdAt
            updatedAt
            creator {
              name
              domain
              avatarData {
                url
                downloadUrl
                signedId
              }
            }
          }
        }
      }
    TEXT
    it 'empty' do
      user = create(:accounts_user)
      self.current_user = user

      block = create(:docs_block, pod: user.personal_pod)

      graphql_execute(query, { pageIds: [block.id] })

      expect(response.errors).to be {}
      expect(response.success?).to be true
      expect(response.data['conversationComments']).to eq([])
    end

    it 'conversation' do
      user = create(:accounts_user)
      self.current_user = user

      block = create(:docs_block, pod: user.personal_pod)
      conversation = Docs::Conversation.create!(
        creator_id: user.id,
        doc_id: block.id,
        pod_id: block.pod_id
      )

      graphql_execute(query, { pageIds: [block.id] })

      expect(response.errors).to be {}
      expect(response.success?).to be true
      conversations = response.data['conversationComments'].map do |x|
        x.slice!('createdAt', 'updatedAt')
      end
      expect(conversations).to eq([{
        'blockIds' => [], 'markIds' => [],
        'docId' => block.id, 'id' => conversation.id.to_s, 'latestReplyAt' => nil,
        'status' => 'opened', 'comments' => [],
      }])

      comment = conversation.comments.create!(
        content: { hello: 'world' },
        creator_id: user.id
      )

      graphql_execute(query, { pageIds: [block.id] })

      expect(response.errors).to be {}
      expect(response.success?).to be true
      comments = response.data['conversationComments'].flat_map { |x| x['comments'] }.map { |x| x.slice!('createdAt', 'updatedAt') }
      expect(comments).to eq([{ 'content' => { 'hello' => 'world' }, 'id' => comment.id.to_s, 'status' => 'normal', 'creator' => {
        'domain' => user.domain,
        'name' => user.name,
        'avatarData' => user.avatar_data,
      }, }])
    end
  end
end
