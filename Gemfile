# frozen_string_literal: true

source 'https://rubygems.org'

gemspec

gem 'bootstrap-sass'
gem 'carrierwave', '2.1.0'
gem 'carrierwave-mongoid', '0.1.0', require: 'carrierwave/mongoid'
gem 'delayed_job_mongoid'
gem 'delayed_job_web_mongoid', git: 'https://github.com/dominioncross/delayed_job_web_mongoid'
gem 'haml'
gem 'jquery-ui-rails'
gem 'light-service'
gem 'mongo'
gem 'mongoid'
gem 'mongoid_auto_increment'
gem 'mongoid_orderable'
gem 'mongoid_search'
gem 'puma'
gem 'rails'
gem 'react-rails'
gem 'rmagick'
gem 'sass-rails'
gem 'uglifier'

gem 'universal', git: 'https://github.com/dominioncross/universal', tag: '2.0.0'

group :development, :test do
  gem 'database_cleaner', '1.7.0'
  gem 'dotenv-rails', require: 'dotenv/load'
  gem 'factory_bot_rails'
  gem 'guard-rspec'
  gem 'guard-rubocop'
  gem 'rspec-rails'
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
end

group :test do
  gem 'timecop'
  gem 'webmock'
end
