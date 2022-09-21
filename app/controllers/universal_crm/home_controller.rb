require_dependency "universal_crm/application_controller"

module UniversalCrm
  class HomeController < ApplicationController
    include UniversalCrm::Concerns::Home

    before_action :check_crm_access, except: %w(inbound)

    private

    def check_crm_access
      invalid and return false if !signed_in? or !current_user.has?(:crm)
    end
  end
end
