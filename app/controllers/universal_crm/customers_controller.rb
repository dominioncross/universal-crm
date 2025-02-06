# frozen_string_literal: true

require_dependency 'universal_crm/application_controller'

module UniversalCrm
  class CustomersController < ApplicationController
    before_action :find_customer, only: %w[show update update_status]

    def index
      params[:page] = 1 if params[:page].blank?
      @customers = UniversalCrm::Customer.order_by(name: :asc)
      @customers = @customers.scoped_to(universal_scope) unless universal_scope.nil?
      @customers = @customers.where(status: params[:status]) if params[:status].present?
      @customers = @customers.full_text_search(params[:q], match: :all) if params[:q].present?
      @customers = @customers.page(params[:page])
      render json: {
        pagination: {
          total_count: @customers.total_count,
          page_count: @customers.total_pages,
          current_page: params[:page].to_i,
          per_page: 20
        },
        customers: @customers.map do |c|
          { id: c.id.to_s,
            number: c.number.to_s,
            name: c.name,
            position: c.position,
            email: c.email,
            token: c.token,
            ticket_count: c.tickets.not_closed.count,
            status: c.status }
        end
      }
    end

    def autocomplete
      @customers = UniversalCrm::Customer.all
      @customers = @customers.full_text_search(params[:term], match: :all) if params[:term].present?
      json = @customers.map { |c| { label: "#{c.name} - #{c.email}", value: c.id.to_s } }
      render json: json.to_json
    end

    def show
      if @customer.nil?
        render json: { customer: nil }
      else
        respond_to do |format|
          format.html {}
          format.json do
            render json: { customer: @customer.to_json(universal_crm_config) }
          end
        end
      end
    end

    def create
      # make sure we don't have an existing customer
      @customer = UniversalCrm::Customer.find_or_create_by(scope: universal_scope, email: params[:email].strip.downcase)
      if @customer.nil?
        render json: {}
      else
        @customer.update(name: params[:name].strip, status: universal_crm_config.default_customer_status)
        render json: { name: @customer.name, email: @customer.email, existing: @customer.created_at < 1.minute.ago }
      end
    end

    def update
      @customer.update(params.require(:customer).permit(:name, :position, :email, :phone_home, :phone_work,
                                                        :phone_mobile))
      render json: { customer: @customer.to_json(universal_crm_config) }
    end

    def update_status
      if params[:status] == 'blocked'
        @customer.block!(universal_user)
      elsif params[:status] == 'active'
        @customer.unblock!(universal_user)
      end
      render json: { customer: @customer.to_json(universal_crm_config) }
    end

    private

    def find_customer
      @customer = UniversalCrm::Customer.find(params[:id])
    end
  end
end
