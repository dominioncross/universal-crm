# frozen_string_literal: true

module UniversalCrm
  module Models
    module Ticket
      extend ActiveSupport::Concern

      included do
        include Mongoid::Document
        include Mongoid::Timestamps
        include Mongoid::Search
        include Universal::Concerns::Status
        include Universal::Concerns::Kind
        include Universal::Concerns::Flaggable
        include Universal::Concerns::Taggable
        include Universal::Concerns::Polymorphic # the customer (subject)
        include Universal::Concerns::Commentable
        include Universal::Concerns::Numbered
        include Universal::Concerns::Scoped
        include Universal::Concerns::Tokened
        include Universal::Concerns::HasAttachments

        store_in collection: 'crm_tickets'

        field :t, as: :title
        field :c, as: :content
        field :hb, as: :html_body
        field :te, as: :to_email
        field :fe, as: :from_email
        field :url, as: :referring_url
        field :do, as: :due_on, type: Date
        field :su, as: :snooze_until, type: Date
        field :vids, as: :viewer_ids, type: Array, default: [] # an array of universal users who are viewing this ticket
        field :eids, as: :editor_ids, type: Array, default: [] # an array of universal users who are editing this ticket (replying)

        statuses %w[active actioned closed], default: :active
        kinds %w[normal email task], :normal

        flags %w[priority]

        belongs_to :document, polymorphic: true # the related document that this ticket should link to.
        belongs_to :creator, class_name: Universal::Configuration.class_name_user
        belongs_to :responsible, class_name: Universal::Configuration.class_name_user

        belongs_to :secondary_scope, polymorphic: true if UniversalCrm::Configuration.secondary_scope_class.present?

        default_scope -> { order_by(status: :asc, updated_at: :desc) }
        scope :due_today, ->(date = Time.zone.now.to_date) { where(due_on: date) }
        scope :overdue, ->(date = Time.zone.now.to_date) { where(due_on.lt => date) }

        search_in :t, :c, :te, :fe

        def url(config)
          "#{config.url}/ticket/#{id}"
        end

        def name
          numbered_title
        end

        def numbered_title
          [number, title].join(' - ')
        end

        def inbound_email_address(config)
          "tk-#{token}@#{config.inbound_domain}"
        end

        def close!(user)
          return unless active? || actioned?

          save_comment!('Ticket Closed', user, scope)
          closed!
        end

        def open!(user = nil)
          return unless closed? || actioned?

          save_comment!('Ticket Opened', user, scope)
          active!
        end

        def action!(user = nil)
          return unless active?

          save_comment!('Marked as Follow Up', user, scope)
          actioned!
        end

        # ticket sent from an external source to the CRM
        def incoming?
          from_email.present?
        end

        def document_name
          document&.crm_name
        end

        def secondary_scope_name
          if UniversalCrm::Configuration.secondary_scope_class.present? && secondary_scope_id.present? && !secondary_scope.nil?
            secondary_scope.crm_name
          end
        end

        def viewers
          Universal::Configuration.class_name_user.classify.constantize.in(id: viewer_ids)
        end

        def editors
          Universal::Configuration.class_name_user.classify.constantize.in(id: editor_ids)
        end

        def being_viewed_by!(user)
          push(viewer_ids: user.id.to_s) unless viewer_ids.include?(user.id.to_s)
        end

        def being_edited_by!(user)
          push(editor_ids: user.id.to_s) unless editor_ids.include?(user.id.to_s)
        end

        def not_viewed_by!(user)
          pull(viewer_ids: user.id.to_s)
        end

        def not_edited_by!(user)
          pull(editor_ids: user.id.to_s)
        end

        def brief_body
          ActionView::Base.full_sanitizer
                          .sanitize(html_body).to_s
                          .gsub(/\r|\n/, ' ').to_s
                          .gsub('  ', '').to_s
                          .strip
                          .split[0..25]&.join(' ')
        end

        def to_json(*_args)
          {
            id: id.to_s,
            number: number.to_s,
            numbered_title: numbered_title,
            status: status,
            kind: kind.to_s,
            subject_type: subject_type,
            subject_name: subject&.name,
            subject_id: subject_id.to_s,
            subject_email: subject&.email,
            subject_status: subject&.status,
            document_name: document_name,
            document_type: document_type,
            document_id: document_id.to_s,
            secondary_scope_name: secondary_scope_name,
            viewer_ids: viewer_ids,
            viewer_names: viewers.map(&:name),
            editor_ids: editor_ids,
            editor_names: editors.map(&:name),
            title: title,
            content: content,
            html_body: html_body,
            brief_body: brief_body,
            to_email: to_email,
            from_email: from_email,
            updated_at: updated_at.strftime('%b %d, %Y, %l:%M%P'),
            created_at: created_at.strftime('%b %d, %Y, %l:%M%P'),
            comment_count: comments.system_generated.count,
            reply_count: comments.not_system_generated.count,
            token: token,
            flags: flags,
            tags: tags,
            due_on: (due_on.blank? ? nil : due_on.strftime('%b %d, %Y')),
            snooze_until: (snooze_until.blank? ? nil : snooze_until.strftime('%b %d, %Y')),
            attachments: attachments.map { |a| { name: a.name, url: a.file.url, filename: a.file_filename } },
            incoming: incoming?,
            responsible_id: responsible_id.to_s,
            responsible_name: responsible&.name,
            creator_id: creator_id.to_s,
            creator_name: creator&.name,
            referring_url: referring_url
          }
        end
      end

      module ClassMethods
      end
    end
  end
end
