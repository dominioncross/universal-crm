# frozen_string_literal: true

module UniversalCrm
  module Concerns
    module CrmCompany
      extend ActiveSupport::Concern

      included do
        has_many :crm_companies, as: :subject, class_name: 'UniversalCrm::Company'

        # can be overwritten in model
        def crm_company_name
          name.to_s.strip
        end

        # can be overwritten in model
        def crm_company_email
          email.to_s.strip.downcase
        end

        def crm_company(scope, kind = nil)
          company = crm_companies.scoped_to(scope).first
          company ||= crm_companies.create scope: scope,
                                           name: crm_company_name,
                                           email: crm_company_email,
                                           kind: kind.to_s,
                                           address_line_1: address_line_1,
                                           address_line_2: address_line_2,
                                           address_city: address_city,
                                           address_state: address_state,
                                           address_post_code: address_post_code,
                                           country: (country.nil? ? Universal::Country.find_by(code: country_code) : country)
          company
        end
      end
    end
  end
end
