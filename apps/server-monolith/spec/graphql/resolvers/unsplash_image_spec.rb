# frozen_string_literal: true

require 'rails_helper'

describe Resolvers::UnsplashImage, type: :query do
  describe '#resolver' do
    it 'works' do
      user = create(:accounts_user)
      self.current_user = user

      query = <<-'GRAPHQL'
        query QueryUnsplashImage($query: String, $page: Int, $per_page: Int) {
          unsplashImage(query: $query, page: $page, perPage: $per_page) {
            id,
            width,
            height,
            fullUrl,
            smallUrl,
            username
            blurHash
          }
        }
      GRAPHQL
      VCR.use_cassette('unsplash_photo_search_cat') do
        graphql_execute(query, query: 'cat', page: 1, per_page: 1)
      end
      data = response.data[:unsplashImage]
      expect(response.success?).to be true
      expect(data.size).to be 1
      expect(data.first[:id]).not_to be_nil
      expect(data.first[:width]).not_to be_nil
      expect(data.first[:height]).not_to be_nil
      expect(data.first[:fullUrl]).not_to be_nil
      expect(data.first[:smallUrl]).not_to be_nil
      expect(data.first[:username]).not_to be_nil
      expect(data.first[:blurHash]).not_to be_nil
    end

    it 'works with blank search' do
      user = create(:accounts_user)
      self.current_user = user

      query = <<-'GRAPHQL'
        query QueryUnsplashImage($query: String, $page: Int, $per_page: Int) {
          unsplashImage(query: $query, page: $page, perPage: $per_page) {
            id,
            width,
            height,
            fullUrl,
            smallUrl,
            username,
            blurHash
          }
        }
      GRAPHQL
      VCR.use_cassette('unsplash_photo_all') do
        graphql_execute(query, query: '', page: 1, per_page: 2)
      end
      data = response.data[:unsplashImage]
      expect(response.success?).to be true
      expect(data.size).to be 2
      expect(data.first[:id]).not_to be_nil
      expect(data.first[:width]).not_to be_nil
      expect(data.first[:height]).not_to be_nil
      expect(data.first[:fullUrl]).not_to be_nil
      expect(data.first[:smallUrl]).not_to be_nil
      expect(data.first[:username]).not_to be_nil
      expect(data.first[:blurHash]).not_to be_nil
    end
  end
end
