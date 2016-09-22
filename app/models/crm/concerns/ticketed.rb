module Crm
  module Concerns
    module Ticketed
      extend ActiveSupport::Concern
      
      included do
        has_many :tickets, as: :document, class_name: 'Crm::Ticket'
        
        def open_ticket!(subject, document, title, content)
          ::Crm::Ticket.create title: title, content: content, subject: subject, document: document
        end
        
      end
      
    end
    
  end
end