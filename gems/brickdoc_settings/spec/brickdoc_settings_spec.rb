# frozen_string_literal: true

require 'spec_helper'

require 'active_record'
require 'lockbox'

Lockbox.master_key = '0000000000000000000000000000000000000000000000000000000000000000'
ActiveRecord::Base.establish_connection(adapter: "sqlite3", database: ":memory:")

ActiveRecord::Schema.define do
  self.verbose = false

  create_table :brick_settings, force: true do |t|
    t.string :key
    t.text :value
    t.string :scope
    t.string :domain
    t.integer :domain_len
  end
end

ActiveRecord::Base.cache_versioning = true if ActiveRecord::Base.respond_to?(:cache_versioning)

class BrickSettings < ActiveRecord::Base
  include BrickdocSettings::Base
  serialize :value

  field :secret, type: :encrypted
  field :int, type: :integer
  field :bool, type: :boolean
  field :default_val, default: 'test'

  field :ro_val, default: 'x', read_only: true

  field :array_val, type: :array
  field :hash_val, type: :hash
  field :hash_val2, type: :hash, symbolize_keys: true

  scope :l1, :l2 do
    field :l3_val, default: 'ha'
  end
end

describe BrickdocSettings do
  it 'can set and get settings' do
    expect(BrickSettings.get('int')).to eq(nil)
    BrickSettings.set('int', 1)
    expect(BrickSettings.get('int')).to eq(1)

    expect(BrickSettings.int).to eq(1)

    BrickSettings.new_value = 'new'
    expect(BrickSettings.new_value).to eq('new')
    expect(BrickSettings.find_by!(key: 'new_value', scope: '', domain: '').value).to eq('new')

    expect(BrickSettings.get('bool')).to eq(nil)
    expect(BrickSettings.bool?).to eq(false)
    BrickSettings.set('bool', true)
    expect(BrickSettings.get('bool')).to eq(true)
    expect(BrickSettings.bool?).to eq(true)
    BrickSettings.set('bool', false)
    expect(BrickSettings.get('bool')).to eq(false)
    expect(BrickSettings.bool?).to eq(false)

    expect(BrickSettings.get('default_val')).to eq('test')
    BrickSettings.set('default_val', 'test2')
    expect(BrickSettings.get('default_val')).to eq('test2')

    expect(BrickSettings.scope('l1.l2').get('l3_val')).to eq('ha')

    expect(BrickSettings.scope('l1.l2') { get('l3_val') }).to eq('ha')

    expect(BrickSettings.scope('l1.l2').l3_val).to eq('ha')

    expect(BrickSettings.scope('l1.l2').get_field(:l3_val)[:default]).to eq('ha')

    expect(BrickSettings.scope('l1.l2').defined_keys).to eq(['l3_val'])

    expect(BrickSettings.respond_to?(:int)).to eq(true)
    expect(BrickSettings.respond_to?(:l3_val)).to eq(false)
    expect(BrickSettings.scope('l1.l2').respond_to?(:l3_val)).to eq(true)
    expect(BrickSettings.scope('l1.l2').respond_to?(:int)).to eq(false)

    expect(BrickSettings.ro_val).to eq('x')
    expect { BrickSettings.ro_val = 'y' }.to raise_error(BrickdocSettings::ReadOnlyField)
    expect(BrickSettings.ro_val).to eq('x')

    BrickSettings.array_val = ['a', 1, true, :sym]
    expect(BrickSettings.array_val).to eq(['a', 1, true, :sym])

    BrickSettings.hash_val = { 'a' => 1, 'b' => '2' }
    expect(BrickSettings.hash_val).to eq({ 'a' => 1, 'b' => '2' })

    BrickSettings.hash_val2 = { 'a' => 1, 'b' => '2' }
    expect(BrickSettings.hash_val2).to eq({ a: 1, b: '2' })
  end

  it 'can match value by domain' do
    BrickSettings.set('int', 1)
    BrickSettings.set('int', 2, domain: 'space1')
    BrickSettings.set('int', 3, domain: 'space1.user1')

    expect(BrickSettings.get('int')).to eq(1)
    expect(BrickSettings.get('int', domain: 'space1')).to eq(2)
    expect(BrickSettings.get('int', domain: 'space2')).to eq(1)
    expect(BrickSettings.get('int', domain: 'space1.user1')).to eq(3)
    expect(BrickSettings.get('int', domain: 'space1.user3')).to eq(2)

    BrickSettings.at('space3').set('int', 4)
    expect(BrickSettings.at('space1').get('int')).to eq(2)
    expect(BrickSettings.at('space3').get('int')).to eq(4)
  end

  it 'can set encrypted value' do
    BrickSettings.set('secret', 'ok')
    expect(BrickSettings.get('secret')).to eq('ok')
    expect(BrickSettings._get_value('secret')).not_to eq('ok')
  end

  it 'can handle settings on different domains' do
    BrickSettings.field :domains_test, default: 'test'
    BrickSettings.scope(:test_scope).field :domains_test2, default: 'test'

    expect(BrickSettings.domains_test).to eq('test')
    expect(BrickSettings.scope(:test_scope).domains_test2).to eq('test')

    space1_settings = BrickSettings.at('space1')
    space2_settings = BrickSettings.at('space2')

    expect(space1_settings.instance_variable_get(:@domain)).to eq('space1')
    expect(space2_settings.instance_variable_get(:@domain)).to eq('space2')
    expect(space1_settings.instance_variable_get(:@scope)).to eq('')
    expect(space2_settings.instance_variable_get(:@scope)).to eq('')

    space2_settings.domains_test = 'test2'
    expect(BrickSettings.scope(:test_scope).at('space2').instance_variable_get(:@domain)).to eq('space2')
    expect(BrickSettings.scope(:test_scope).at('space2').instance_variable_get(:@scope)).to eq('test_scope')
    BrickSettings.scope(:test_scope).at('space2').domains_test2 = 'test2'

    expect(space1_settings.domains_test).to eq('test')
    expect(space1_settings.scope(:test_scope).instance_variable_get(:@domain)).to eq('space1')
    expect(space1_settings.scope(:test_scope).instance_variable_get(:@scope)).to eq('test_scope')
    expect(space1_settings.scope(:test_scope).domains_test2).to eq('test')

    expect(space2_settings.domains_test).to eq('test2')
    expect(space2_settings.scope(:test_scope).domains_test2).to eq('test2')

    expect(BrickSettings.at('space2.user1').domains_test).to eq('test2')
  end

  it 'can set scope or domain on accessor' do
    BrickSettings.field :test_key, default: '1', scope: 'cross1'
    BrickSettings.field :test_key, default: '2', scope: 'cross2'

    expect(BrickSettings.scope('cross1').test_key).to eq('1')
    expect(BrickSettings.scope('cross1').get(:test_key, scope: 'cross2')).to eq('2')

    BrickSettings.scope('cross1').at('d1').test_key = '3'

    expect(BrickSettings.scope('cross1').at('d1').test_key).to eq('3')
    expect(BrickSettings.scope('cross1').at('d1').get(:test_key, domain: 'd2')).to eq('1')
    expect(BrickSettings.scope('cross1').at('d1').get(:test_key, scope: 'cross2', domain: 'd2')).to eq('2')
  end
end
