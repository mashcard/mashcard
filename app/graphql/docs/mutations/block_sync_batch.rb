# frozen_string_literal: true
module Docs
  class Mutations::BlockSyncBatch < BrickGraphQL::BaseMutation
    argument :blocks, [Inputs::BlockInput], required: true
    argument :root_id, BrickGraphQL::Scalars::UUID, 'block root id', required: true

    def resolve(blocks:, root_id:)
      lock = Redis::Lock.new("sync_batch:#{root_id}", expiration: 15, timeout: 0.1)
      lock.lock do
        do_resolve(blocks: blocks, root_id: root_id)
      end
    end

    def do_resolve(blocks:, root_id:)
      root = Docs::Block.find_by(id: root_id)

      if root
        preloads = root.descendants.index_by(&:id)
        delete_block_ids = preloads.keys - blocks.map(&:id)
        Docs::Block.where(id: delete_block_ids).update_all(deleted_at: Time.current) if delete_block_ids.present?
      else
        preloads = {}
      end

      ## TODO from context
      pod = current_user.pods.first

      blocks.each do |args|
        block = preloads[args.id] || Docs::Block.new(id: args.id)

        block.sort = args.sort.to_i
        block.data = args.data
        block.meta = args.meta
        block.parent_id = args.parent_id
        block.type = args.type

        block.pod_id = pod.id

        block.collaborators << current_user.id

        valid_payload(block)

        block.save!
      end

      nil
    end

    def valid_payload(block)
      block_type = Objects::Block.resolve_type(OpenStruct.new(type: block.type), {})
      %w(data meta).each do |payload_type|
        payload_defn = block_type.try("#{payload_type}_payload")
        # clean unsupported payload type
        if payload_defn.blank?
          block.send("#{payload_type}=", {})
          next
        end
        nonnull_payload_defn = payload_defn.select { |x| x[:opts][:null] == false }
        if nonnull_payload_defn.present? && block.send(payload_type).blank?
          raise BrickGraphQL::Errors::ArgumentError, "#{payload_type} is required"
        end
        # remove unpermitted keys
        params = ActionController::Parameters.new(block.send(payload_type))
        permit_keys = payload_defn.map { |x| x[:name] }
        block.send("#{payload_type}=", params.permit(permit_keys).as_json)

        nonnull_payload_defn.each do |f|
          if block.send(payload_type).try(:[], f[:name].to_s).in?([nil, ""])
            raise BrickGraphQL::Errors::ArgumentError, "#{payload_type}.#{f[:name]} is required"
          end
        end
      end
    end
  end
end