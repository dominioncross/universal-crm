# frozen_string_literal: true

require 'geocoder'

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

        store_in collection: 'crm_companies'

        field :n, as: :name
        field :e, as: :email
        field :p, as: :phone

        has_many :tickets, as: :subject, class_name: 'UniversalCrm::Ticket'

        search_in :n, :e

        statuses %w[active draft blocked], default: :active

        validates :name, :email, presence: true
        validates_uniqueness_of :email, scope: %i[scope_type scope_id]
        #         numbered_prefix 'CP'

        # default_scope ->(){order_by(created_at: :desc)}

        def inbound_email_address(config)
          "cp-#{token}@#{config.inbound_domain}"
        end

        def to_json(config)
          {
            id: id.to_s,
            number: number.to_s,
            status: status,
            name: name,
            email: email,
            phone: phone,
            tags: tags,
            ticket_count: tickets.count,
            token: token,
            inbound_email_address: inbound_email_address(config),
            closed_ticket_count: tickets.unscoped.closed.count,
            employee_ids: employee_ids,
            employees: employees_json,
            address: address,
            subject_type: subject_type,
            subject_id: subject_id.to_s
          }
        end

        def employees_json
          employees.map do |e|
            {
              id: e.id.to_s,
              name: e.name,
              email: e.email,
              type: e.class.to_s,
              open_ticket_count: e.tickets.active.count
            }
          end
        end

        def block!(user)
          comments.create content: 'Company blocked', author: user.name, when: Time.now.utc
          blocked!
        end

        def unblock!(user)
          comments.create content: 'Company unblocked', author: user.name, when: Time.now.utc
          active!
        end
      end
    end
  end
end
