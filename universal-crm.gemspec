# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

# Maintain your gem's version:
require 'universal-crm/version'

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = 'universal-crm'
  s.version     = UniversalCrm::VERSION
  s.authors     = ['Ben Petro']
  s.email       = ['ben@bthree.com.au']
  s.homepage    = ''
  s.summary     = 'Summary of Crm.'
  s.description = 'Description of Crm.'
  s.license     = 'MIT'

  s.files = Dir['{app,config,db,lib}/**/*', 'MIT-LICENSE', 'Rakefile', 'README.rdoc']

  s.add_dependency 'bootstrap-sass'
  s.add_dependency 'carrierwave'
  s.add_dependency 'carrierwave-mongoid'
  s.add_dependency 'geocoder'
  s.add_dependency 'haml'
  s.add_dependency 'mongoid'
  s.add_dependency 'rails', '>= 6.1.7.10', '<= 8.2.0'
  s.add_dependency 'react-rails'
  s.add_dependency 'universal'
  s.metadata['rubygems_mfa_required'] = 'true'
end
