# frozen_string_literal: true

require 'rails_helper'

describe Mashcard do
  describe '.root' do
    it 'returns the root path same as Rails' do
      expect(described_class.root).to eq(Rails.root)
    end
  end
end
