# frozen_string_literal: true

module UniversalCrm
  module Concerns
    module CrmCustomer
      extend ActiveSupport::Concern

      included do
        has_many :crm_customers, as: :subject, class_name: 'UniversalCrm::Customer'

        before_update :update_crm_customer

        # can be overwritten in model
        def crm_customer_name
          name.to_s.strip.titleize
        end

        # can be overwritten in model
        def crm_customer_email
          email.to_s.strip.downcase
        end

        # pass a company, to check if we're employed by them
        def crm_customer(scope, crm_company = nil, kind = nil)
          customer = crm_customers.scoped_to(scope).first
          if customer.nil?
            customer = UniversalCrm::Customer.find_by(scope: scope, email: crm_customer_email, kind: kind&.to_s) # check if a customer with this email already exists in the CRM
            customer&.update(subject: self)
          end
          customer ||= crm_customers.create(scope: scope, name: crm_customer_name,
                                            email: crm_customer_email, kind: kind.to_s)
          # customer.active! if customer.draft?
          crm_company&.add_employee!(customer)
          customer
        end

        def remove_from_company!(scope, crm_company)
          customer = crm_customers.scoped_to(scope).first
          crm_company.remove_employee!(customer) unless customer.nil?
        end
      end

      private

      def update_crm_customer
        return unless given_names_changed? || family_name_changed? || email_changed?

        # find the scope:
        crm_customers.each do |customer|
          customer.update(name: name&.strip, email: email&.strip.downcase)
        end
      end
    end
  end
end
