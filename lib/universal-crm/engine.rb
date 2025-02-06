# frozen_string_literal: true

module UniversalCrm
  class Engine < ::Rails::Engine
    isolate_namespace UniversalCrm

    initializer 'universal-crm.assets.precompile' do |_app|
      config.assets.precompile += ['*.png', '*.ico']
    end

    config.after_initialize do
      Universal::Configuration.class_name_user = 'Padlock::User'
      UniversalCrm::Configuration.reset
    end

    config.generators do |generator|
      generator.test_framework :rspec
      generator.fixture_replacement :factory_bot
      generator.factory_bot dir: 'spec/factories'
    end
  end
end
