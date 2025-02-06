# frozen_string_literal: true

module UniversalCrm
  # ActionController::Base
  class ApplicationController < ::ApplicationController
    helper Universal::ApplicationHelper

    # need helper methods: universal_scope and universal_user
    helper_method :universal_crm_config

    def universal_crm_config
      @universal_crm_config ||= UniversalCrm::Config.find_by(scope: universal_scope)
    end

    def remove_tickets_viewing!
      return if universal_user.nil?

      viewed_tickets = UniversalCrm::Ticket.all
      viewed_tickets = viewed_tickets.scoped_to(universal_scope) unless universal_scope.nil?
      viewed_tickets = viewed_tickets.where(viewer_ids: universal_user.id.to_s)
      viewed_tickets.map { |t| t.pull(viewer_ids: universal_user.id.to_s, editor_ids: universal_user.id.to_s) }
    end
  end
end
