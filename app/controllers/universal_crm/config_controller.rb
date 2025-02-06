# frozen_string_literal: true

require_dependency 'universal_crm/application_controller'

module UniversalCrm
  class ConfigController < ApplicationController
    def show
      respond_to do |format|
        format.json { render json: universal_crm_config.to_json }
        format.html {}
      end
    end

    def update
      params[:config][:functions] = [] if params[:config][:functions].blank?
      p = params.require(:config).permit(
        :system_name,
        :url,
        :inbound_domain,
        :inbound_email_addresses,
        :transaction_email_address,
        :transaction_email_from,
        :new_ticket_header,
        :new_reply_header,
        :email_footer,
        :ticket_flags,
        :google_api_key,
        :test_email,
        :tasks,
        :companies,
        :edit_companies,
        :default_customer_status,
        functions: []
      )
      p[:ticket_flags] = p[:ticket_flags].to_s.gsub('\r', '').split("\n").map do |p|
        { label: p.split('|')[0], color: p.split('|')[1] }
      end
      p[:inbound_email_addresses] = p[:inbound_email_addresses].downcase.gsub(' ', '').split(',')

      universal_crm_config.update(p)
      render json: universal_crm_config.to_json
    end

    def set_password
      password = params[:password]
      hashed_password = Digest::SHA1.hexdigest(password)
      universal_crm_config.update(hashed_password: hashed_password)
      universal_crm_config.reload
      render json: universal_crm_config.to_json
    end

    def signin
      password = params[:password]
      hashed_password = Digest::SHA1.hexdigest(password)
      render json: { signedIn: (universal_crm_config.hashed_password == hashed_password) }
    end
  end
end
