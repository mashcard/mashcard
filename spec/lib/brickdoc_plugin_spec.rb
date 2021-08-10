# frozen_string_literal: true

require 'rails_helper'

describe BrickdocPlugin do
  it 'can define and configure a plugin' do
    BrickdocPlugin.config :test_plugin do
      settings do
        field :test_plugin_key, default: 'value'
      end
    end

    the_plugin = BrickdocPlugin.plugin(:test_plugin)

    expect(BrickdocConfig.scope('plugin.test_plugin').test_plugin_key).to eq('value')
    expect(the_plugin.settings.test_plugin_key).to eq('value')

    BrickdocConfig.current = BrickdocConfig.at('pod1')

    the_plugin.settings.test_plugin_key = 'pod1_value'

    expect(BrickdocConfig.scope('plugin.test_plugin').test_plugin_key).to eq('value')
    expect(BrickdocConfig.scope('plugin.test_plugin').at('pod1').test_plugin_key).to eq('pod1_value')

    BrickdocConfig.current = BrickdocConfig.at('pod2')

    expect(the_plugin.settings.test_plugin_key).to eq('value')

    # test #enabled?

    expect(BrickdocPlugin.enabled?(:test_plugin)).to be(false)

    the_plugin.enabled = true # enable the plugin on current domain (pod2) only

    expect(BrickdocPlugin.enabled?(:test_plugin)).to be(true)

    expect(BrickdocPlugin.enabled_plugins).to include(:test_plugin)

    # switch back to domain (pod1)

    BrickdocConfig.current = BrickdocConfig.at('pod1')

    expect(BrickdocPlugin.enabled?(:test_plugin)).to be(false)

    expect(BrickdocPlugin.enabled_plugins).to_not include(:test_plugin)
  end

  it 'can load plugin dummy_plugin' do
    BrickdocPlugin.load_plugins(Rails.root.join('spec/dummy/plugins/**'))

    expect(BrickdocPlugin.loaded?(:dummy_plugin)).to be(true)
    dummy_plugin = BrickdocPlugin.plugin(:dummy_plugin)
    expect(dummy_plugin.settings.test_plugin_key).to eq('value2')

    expect(dummy_plugin.metadata[:name]).to eq('dummy_plugin')
    expect(dummy_plugin.metadata[:version]).to eq('0.0.1')

    test_value = { done: false }

    BrickdocPlugin.update_hooks_scopes
    expect(BrickdocHook.enabled_scopes).to_not include('plugin.dummy_plugin')

    BrickdocHook.trigger :test_hook, test_value
    expect(test_value[:done]).to be(false)

    dummy_plugin.enabled = true

    BrickdocPlugin.update_hooks_scopes
    expect(BrickdocHook.enabled_scopes).to include('plugin.dummy_plugin')

    BrickdocHook.trigger :test_hook, test_value
    expect(test_value[:done]).to be(true)

    BrickdocHook.trigger :test_autoload, test_value
    expect(test_value[:lib]).to be('lib loaded')
    expect(test_value[:model]).to be('model loaded')
  end
end