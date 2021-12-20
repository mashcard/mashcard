# frozen_string_literal: true
module Brickdoc
  module Crypto
    PREFIX = 'CYPHERPUNK'
    SUBKEY_MAPPING = {
      hash_salt: 1,
      data_encryption: 2,
      rails_master_key: 3
    }

    class << self
      def root_key
        seed = ENV['SECRET_KEY_SEED']
        raise 'SECRET_KEY_SEED is not set' unless seed.present?
        # TODO: Add AWS KMS Encryption adapter.
        Base64.strict_decode64(seed)
      end

      def derive_key(sub_key, context = 'unknown')
        key_id = SUBKEY_MAPPING[sub_key]
        raise 'Unknown sub key' unless key_id.present?
        Blake3.derive_key("#{PREFIX}://#{key_id}/#{context}",
          Brickdoc::Crypto.root_key)
      end

      def data_masking(data)
        Blake3::Hasher.hexdigest(data, key: derive_key(:data_encryption))
      end
    end
  end
end