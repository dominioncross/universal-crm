# frozen_string_literal: true

FactoryBot.define do
  factory :company, class: UniversalCrm::Company do
    name { 'test' }
    email { 'some@email.com' }
  end
end
