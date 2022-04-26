module UniversalCrm
  module Models
    module Company
      extend ActiveSupport::Concern

      included do
        include Mongoid::Document
        include Mongoid::Timestamps
        include Mongoid::Search
        include Universal::Concerns::Status
        include Universal::Concerns::Kind
        include Universal::Concerns::Numbered
        include Universal::Concerns::Taggable
        include Universal::Concerns::Scoped
        include Universal::Concerns::Polymorphic
        include Universal::Concerns::Commentable
        include Universal::Concerns::Employer
        include Universal::Concerns::Tokened
        include Universal::Concerns::HasAttachments
        include Universal::Concerns::Addressed
        
        store_in database: UniversalCrm::Configuration.mongoid_session_name, collection: 'crm_companies'

        field :n, as: :name
        field :e, as: :email
        field :p, as: :phone
        
        has_many :tickets, as: :subject, class_name: 'UniversalCrm::Ticket'
        
        search_in :n, :e

        statuses %w(active draft blocked), default: :active
        
        validates :name, :email, presence: true
        validates_uniqueness_of :email, scope: [:scope_type, :scope_id]
#         numbered_prefix 'CP'
        
        # default_scope ->(){order_by(created_at: :desc)}
        
        def inbound_email_address(config)
          "cp-#{self.token}@#{config.inbound_domain}"
        end
        
        def to_json(config)
          return {
            id: self.id.to_s,
            number: self.number.to_s,
            status: self.status,
            name: self.name,
            email: self.email, 
            phone: self.phone,
            tags: self.tags,
            ticket_count: self.tickets.count, 
            token: self.token,
            inbound_email_address: self.inbound_email_address(config),
            closed_ticket_count: self.tickets.unscoped.closed.count,
            employee_ids: self.employee_ids,
            employees: self.employees_json,
            address: self.address,
            subject_type: self.subject_type,
            subject_id: self.subject_id.to_s
            }
        end
        
        def employees_json
          a=[]
          self.employees.each do |e|
            a.push({
              id: e.id.to_s,
              name: e.name,
              email: e.email,
              type: e.class.to_s,
              open_ticket_count: e.tickets.active.count
              })
          end
          return a
        end
        
        def block!(user)
          self.comments.create content: 'Company blocked', author: user.name, when: Time.now.utc
          self.blocked!
        end
        
        def unblock!(user)
          self.comments.create content: 'Company unblocked', author: user.name, when: Time.now.utc
          self.active!
        end
        
      end
    end
  end
end
