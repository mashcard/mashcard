# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Docs::Block, type: :model do
  it 'normal' do
    title = 'foo'
    block = create(:docs_block, text: title)
    _child_block1 = create(:docs_block, text: title, pod: block.pod, parent: block, root_id: block.id)
    _child_block2 = create(:docs_block, text: title, pod: block.pod, parent: block, root_id: block.id)
    _sub_block1 = create(:docs_block, text: title, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)
    _sub_block2 = create(:docs_block, text: title, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)

    expect(block.descendants_raw.count).to eq(5)
    expect(block.descendants.count).to eq(3)

    new_id = block.duplicate!.fetch('id')
    new_block = described_class.find(new_id)
    new_title = I18n.t('docs.duplicate.new_title', title: block.text)

    expect(new_block.title).to eq(new_title)
    expect(new_block.meta['title']).to eq(new_title)
    expect(new_block.sort - block.sort).to eq(Docs::Block::DUPLICATE_SORT_GAP)
    expect(new_block.descendants_raw.count).to eq(5)
    expect(new_block.descendants.count).to eq(3)
  end

  it 'soft delete' do
    block = create(:docs_block)
    child_block1 = create(:docs_block, pod: block.pod, parent: block, root_id: block.id)
    _child_block2 = create(:docs_block, pod: block.pod, parent: block, root_id: block.id)
    sub_block1 = create(:docs_block, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)
    _sub_block2 = create(:docs_block, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)

    expect(block.descendants_raw.count).to eq(5)
    expect(block.descendants.count).to eq(3)

    child_block1.soft_delete!
    sub_block1.soft_delete!

    expect(block.descendants_raw.count).to eq(3)
    expect(block.descendants.count).to eq(2)

    new_id = block.duplicate!.fetch('id')
    new_block = described_class.find(new_id)

    expect(new_block.descendants_raw.count).to eq(3)
    expect(new_block.descendants.count).to eq(2)
  end

  it 'sub block parent_id' do
    block = create(:docs_block)
    _child_block1 = create(:docs_block, pod: block.pod, parent: block, root_id: block.id)
    _child_block2 = create(:docs_block, pod: block.pod, parent: block, root_id: block.id)
    sub_block1 = create(:docs_block, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)
    _sub_block2 = create(:docs_block, pod: block.pod, parent: block, id: Mashcard::Utils::Encoding::UUID.gen_v4)

    new_id = sub_block1.duplicate!.fetch('id')
    new_block = described_class.find(new_id)

    expect(new_block.parent_id).to eq(block.id)
    expect(new_block.root_id).to eq(new_id)
  end
end
