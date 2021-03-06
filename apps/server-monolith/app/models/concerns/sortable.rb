# frozen_string_literal: true

module Sortable
  extend ActiveSupport::Concern

  module ClassMethods
    def remove_dangling_blocks(roots_result, blocks)
      target = roots_result

      loop do
        break if roots_result.blank?

        parent_ids = roots_result.map(&:id)
        roots_result = blocks.select { |block| block.parent_id.in?(parent_ids) }
        target += roots_result
      end

      target.uniq(&:id)
    end

    def fill_sorts(domain, blocks)
      tree_map = blocks.group_by(&:parent_id).transform_values do |a|
        [a.count, flatten_hash(a)]
      end

      first_child_sort = {}

      target_blocks = []
      tree_map.each do |parent_id, (size, hash)|
        last_size = nil
        need_rebalance = false
        ## Check rebalance
        size.times.to_a.each do |idx|
          current_size = hash.fetch(idx)

          if last_size && current_size - last_size <= Docs::Block::REBALANCE_GAP
            need_rebalance = true
            break
          end

          last_size = current_size
        end

        ## Rebalance
        if need_rebalance
          new_sorts = Array.new(size) { |idx| idx * Docs::Block::SORT_GAP }
          current_blocks = Array.new(size) { |idx| hash.fetch("idx_#{idx}") }
          current_blocks = do_rebalance(domain, parent_id, current_blocks, new_sorts)
          hash = flatten_hash(current_blocks)
        end

        ## Fill
        size.times.to_a.each do |idx|
          block = hash.fetch("idx_#{idx}")
          block.next_sort = hash[idx + 1] || block.sort + Docs::Block::SORT_GAP
          target_blocks << block
          first_child_sort[block.parent_id] = [first_child_sort[block.parent_id], block.sort].compact.min
        end
      end

      blocks.map do |block|
        block.first_child_sort = first_child_sort[block.id] || 0
        block
      end
    end

    def do_rebalance(domain, parent_id, blocks, new_sorts)
      throttle_key = "rebalance:#{domain}:#{parent_id}"

      Mashcard::Redis.with(:state) do |redis|
        bol = redis.get(throttle_key)
        return blocks if bol

        redis.set(throttle_key, 1)
      end

      Rails.logger.info("rebalance #{domain} #{parent_id} #{new_sorts}")

      blocks = blocks.each_with_index.map do |block, idx|
        block.update!(sort: new_sorts[idx])
        block
      end

      Mashcard::Redis.with(:state) { |redis| redis.del(throttle_key) }
      blocks
    rescue => _e
      ## TODO handle error
      Mashcard::Redis.with(:state) { |redis| redis.del(throttle_key) }
      blocks
    end

    def flatten_hash(blocks)
      Hash[*blocks.sort_by(&:sort).each_with_index.map { |b, i| [[b.id, i], ["idx_#{i}", b], [i, b.sort]] }.flatten]
    end
  end
end
