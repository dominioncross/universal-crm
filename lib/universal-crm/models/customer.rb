# frozen_string_literal: true

module UniversalCrm
  module Models
    module Customer
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
        include Universal::Concerns::Tokened
        include Universal::Concerns::HasAttachments
        include Universal::Concerns::Employee

        store_in collection: 'crm_customers'

        field :n, as: :name
        field :p, as: :position
        field :e, as: :email
        field :ph, as: :phone_home
        field :pw, as: :phone_work
        field :pm, as: :phone_mobile

        has_many :tickets, as: :subject, class_name: 'UniversalCrm::Ticket'
        employed_by [{ companies: 'UniversalCrm::Company' }]

        statuses %w[active draft blocked], default: :active

        search_in :n, :e

        validates :email, presence: true
        validates_uniqueness_of :email, scope: %i[scope_type scope_id]
        # default_scope ->(){order_by(created_at: :desc)}

        def inbound_email_address(config)
          "cr-#{token}@#{config.inbound_domain}"
        end

        # Look through our user model, and see if we can find someone with the same email address,
        # and if so, assign them as the subject of this customer
        def assign_user_subject!(scope = nil)
          return unless Universal::Configuration.class_name_user.present? && subject.nil?

          user = if Universal::Configuration.user_scoped
                   Universal::Configuration.class_name_user.classify.constantize.find_by(scope: scope,
                                                                                         email: email)
                 else
                   Universal::Configuration.class_name_user.classify.constantize.find_by(email: email)
                 end
          update(subject: user, kind: :user) unless user.nil?
        end

        def to_json(config)
          {
            id: id.to_s,
            status: status,
            number: number.to_s,
            name: name,
            position: position,
            email: email,
            phone_home: phone_home,
            phone_work: phone_work,
            phone_mobile: phone_mobile,
            tags: tags,
            ticket_count: tickets.count,
            token: token,
            inbound_email_address: inbound_email_address(config),
            closed_ticket_count: tickets.unscoped.closed.count,
            companies: companies.map { |c| c.to_json(config) },
            subject_type: subject_type,
            subject_id: subject_id.to_s
          }
        end

        def block!(user)
          comments.create content: 'Customer blocked', author: user.name, when: Time.now.utc
          blocked!
        end

        def unblock!(user)
          comments.create content: 'Customer unblocked', author: user.name, when: Time.now.utc
          active!
        end
      end
    end
  end
end
