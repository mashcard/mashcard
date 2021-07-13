# frozen_string_literal: true

class CreateDocsSnapshots < ActiveRecord::Migration[6.1]
  def change
    create_table :docs_snapshots do |t|
      t.belongs_to :pod, index: true
      t.uuid :block_id, null: false
      t.column :snapshot_version, :bigint, null: false
      t.jsonb :version_meta, comment: 'child block_id and history_version map'
      t.string :name
      t.timestamps

      t.index [:block_id, :snapshot_version], unique: true, comment: "snapshot identifier"
    end

    create_table :docs_histories do |t|
      t.belongs_to :pod, index: true
      t.jsonb :meta, null: false
      t.jsonb :data, null: false
      t.uuid :block_id, null: false
      t.uuid :parent_id
      t.string :parent_type
      t.column :path, :uuid, array: true
      t.string :type, limit: 32
      t.column :sort, :bigint, null: false
      t.column :history_version, :bigint, null: false

      t.timestamps

      t.index [:block_id, :history_version], unique: true, comment: "history identifier"
      t.index :path, using: :gin
    end
  end
end
