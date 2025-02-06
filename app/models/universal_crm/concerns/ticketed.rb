# frozen_string_literal: true

module UniversalCrm
  module Concerns
    module Ticketed
      extend ActiveSupport::Concern

      included do
        has_many :tickets, as: :document, class_name: 'UniversalCrm::Ticket'

        # can be easily overridden in the model
        def crm_name
          name
        end

        def open_ticket!(subject, document, title, content)
          ::UniversalCrm::Ticket.create title: title, content: content, subject: subject, document: document
        end

        def crm_secondary_scope
          # find the document that we want to secondarily scope this ticket to:
          return if UniversalCrm::Configuration.secondary_scope_class.blank?

          klass = UniversalCrm::Configuration.secondary_scope_class.classify.constantize
          foreign_key = "#{klass.to_s.demodulize.downcase}_id"
          klass.find_by(id: self[foreign_key])
        end
      end
    end
  end
end
