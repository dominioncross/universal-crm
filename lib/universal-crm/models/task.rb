module UniversalCrm
  module Models
    module Task
      extend ActiveSupport::Concern

      included do
        include Mongoid::Document
        include Mongoid::Timestamps
        include Mongoid::Search
        include Universal::Concerns::Status
        include Universal::Concerns::Kind
        include Universal::Concerns::Taggable
        include Universal::Concerns::Scoped
        include Universal::Concerns::Polymorphic
        include Universal::Concerns::Commentable
        
        store_in collection: 'crm_tasks'

        field :an, as: :assignee_name
        field :t, as: :title
        field :n, as: :notes
        field :ca, as: :completed_at, type: DateTime
        field :d, as: :due_on, type: Date
        
        statuses %w(active complete)
        
        validates_presence_of :title, :subject

        search_in :title
        
        def overdue?
          !self.due_on.blank? and self.due_on < Time.zone.now
        end
        
      end
    end
  end
end
