module UniversalCrm
  module Models
    module Config
      extend ActiveSupport::Concern

      included do
        include Mongoid::Document
        include Universal::Concerns::Scoped
        include Universal::Concerns::Tokened
        include Universal::Concerns::Functional
        
        store_in database: UniversalCrm::Configuration.mongoid_session_name, collection: 'crm_configs'

        field :tf, as: :ticket_flags, type: Array, default: [{label: 'priority', color: 'e25d5d'}, {label: 'general', color: '27b6af'}]
        field :system_name
        field :url
        field :hp, as: :hashed_password
        field :ibd, as: :inbound_domain
        field :iea, as: :inbound_email_addresses, type: Array, default: []
        field :tef, as: :transaction_email_from
        field :sea, as: :transaction_email_address
        field :nth, as: :new_ticket_header
        field :nrh, as: :new_reply_header
        field :ef, as: :email_footer
        field :gak, as: :google_api_key
        field :cs, as: :companies, type: Boolean, default: false
        field :ecs, as: :edit_companies, type: Boolean, default: false
        field :ts, as: :tasks, type: Boolean, default: false
        field :te, as: :test_email
        field :dcs, as: :default_customer_status, type: :string, default: :draft
        
        def to_json
          {
            scope_id: self.scope_id.to_s,
            system_name: self.system_name,
            url: self.url,
            ticket_flags: self.ticket_flags,
            hashed_password: self.hashed_password,
            inbound_domain: inbound_domain,
            inbound_email_addresses: inbound_email_addresses,
            transaction_email_address: transaction_email_address,
            transaction_email_from: transaction_email_from,
            token: self.token,
            new_ticket_header: self.new_ticket_header,
            new_reply_header: self.new_reply_header,
            email_footer: self.email_footer,
            google_api_key: self.google_api_key,
            test_email: self.test_email,
            default_customer_status: self.default_customer_status,
            functions: self.functions
          }
        end
        
      end
      
      module ClassMethods
        def find_by_scope(scope)
          return UniversalCrm::Config.find_or_create_by(scope: scope)
        end
      end
    end
  end
end
