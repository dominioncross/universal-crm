# frozen_string_literal: true

require 'factory_bot_rails'

FactoryBot.definition_file_paths << File.join(UniversalCrm::Engine.root, 'spec', 'factories')
FactoryBot.find_definitions

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
end
