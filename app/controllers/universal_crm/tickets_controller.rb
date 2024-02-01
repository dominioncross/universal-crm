require_dependency 'universal_crm/application_controller'

module UniversalCrm
  class TicketsController < ApplicationController
    before_action :remove_tickets_viewing!, only: %w[index]

    def index
      params[:page] = 1 if params[:page].blank?
      per_page = Kaminari.config.default_per_page

      @tickets = UniversalCrm::Ticket.all
      @tickets = @tickets.scoped_to(universal_scope) unless universal_scope.nil?
      if !params[:q].blank? && params[:q].to_s != 'undefined'
        if ENV['CRM_TICKET_SEARCH_INDEX'].present?
          compound = []
          params[:q].split(' ').each do |k|
            next unless k.present?

            compound.push({
                            "text": {
                              "query": k,
                              "path": %w[_num c t tags]
                            }
                          })
          end
          pipeline = [
            { '$search': {
              index: ENV['CRM_TICKET_SEARCH_INDEX'],
              compound: { filter: compound }
            } },
            if params[:date_start].present? && params[:date_end].present?
              { '$match': {
                '$and': [
                  { updated_at: { '$gte': params[:date_start].to_date } },
                  { updated_at: { '$lte': params[:date_end].to_date } }
                ]
              } }
            end,
            { '$sort': { created_at: -1 } },
            { '$skip': (params[:page].to_i - 1) * per_page },
            { '$limit': per_page },
            { '$project': { _id: '$_id' } }
          ]
          Rails.logger.debug pipeline.compact.flatten.to_json

          ticket_ids = UniversalCrm::Ticket.collection.aggregate(pipeline.flatten.compact).map { |doc| doc['_id'] }
          @tickets = @tickets.in(id: ticket_ids)
        else
          conditions = []
          params[:q].split(' ').each do |keyword|
            conditions.push({ '$or' => [
                              { title: /#{keyword}/i },
                              { number: /#{keyword}/i },
                              { html_body: /#{keyword}/i },
                              { tags: keyword }
                            ] })
          end
          @tickets = @tickets.where('$and' => conditions)
        end
      else
        if !params[:subject_id].blank? && params[:subject_id].to_s != 'undefined' && !params[:subject_type].blank? && params[:subject_type].to_s != 'undefined'
          conditions = [{ '$and' => [{ subject_id: BSON::ObjectId(params[:subject_id]),
                                       subject_type: params[:subject_type] }] }]
          if params[:subject_type] == 'UniversalCrm::Company'
            company = UniversalCrm::Company.find(params[:subject_id])
            company.employees.each do |employee|
              conditions.push({ '$and' => [{ subject_id: employee.id.to_s, subject_type: 'UniversalCrm::Customer' }] })
            end
          end
          @tickets = @tickets.where('$or' => conditions)
        elsif !params[:flag].blank? && params[:flag] != 'null' && params[:flag] != 'undefined'
          @tickets = @tickets.flagged_with(params[:flag])
        elsif params[:status] == 'email'
          @tickets = @tickets.email.active
        elsif params[:status] == 'normal'
          @tickets = @tickets.normal.active
        elsif params[:status] == 'task'
          @tickets = @tickets.task.active
        elsif !params[:status].blank? && params[:status] != 'priority' && params[:status] != 'all' && params[:status] != 'null'
          @tickets = @tickets.for_status(params[:status])
        elsif params[:status] == 'priority'
          @tickets = @tickets.active.priority
        elsif params[:status] != 'all'
          @tickets = @tickets.active
        end
        @tickets = @tickets.email if params[:kind] == 'email'
      end
      if params[:date_start].present? && params[:date_end].present?
        @tickets = @tickets.between(updated_at: [params[:date_start].to_date, params[:date_end].to_date])
      end
      @tickets = @tickets.page(params[:page]).per(per_page)
      render json: {
        pagination: {
          total_count: @tickets.total_count,
          page_count: @tickets.total_pages,
          current_page: params[:page].to_i,
          per_page: per_page
        },
        tickets: @tickets.map { |t| t.to_json }
      }
    end

    def new; end

    def show
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      if @ticket.nil?
        render json: { ticket: nil }
      else
        @ticket.being_viewed_by!(universal_user)
        respond_to do |format|
          format.html {}
          format.json do
            render json: { ticket: @ticket.to_json }
          end
        end
      end
    end

    def create
      if !params[:subject_id].blank? && !params[:subject_type].blank?
        subject = params[:subject_type].classify.constantize.find params[:subject_id]
        kind = (params[:kind].to_s == 'note' ? 'normal' : params[:kind])
        sent_from_crm = true
      elsif !params[:customer_name].blank? && !params[:customer_email].blank?
        # find a customer by this email
        subject = UniversalCrm::Customer.find_or_create_by(scope: universal_scope, email: params[:customer_email])
        subject.assign_user_subject!(universal_scope)
        kind = :email
        sent_from_crm = false
      end
      if !params[:title].blank?
        document = nil
        if !params[:document_id].blank? && !params[:document_type].blank?
          document = params[:document_type].classify.constantize.find params[:document_id]
        end
        ticket = subject.tickets.new kind: kind,
                                     title: params[:title],
                                     content: params[:content],
                                     scope: universal_scope,
                                     referring_url: params[:url],
                                     document: document,
                                     due_on: params[:due_on],
                                     creator: universal_user,
                                     responsible_id: params[:responsible_id]

        if !document.nil? && !UniversalCrm::Configuration.secondary_scope_class.blank?
          ticket.secondary_scope = document.crm_secondary_scope
        end

        if ticket.save
          unless params[:flag].blank?
            params[:flag].strip.gsub(' ', '').split(',').each do |_flag|
              ticket.flag!(params[:flag], universal_user)
              ticket.save_comment!("Added flag: '#{params[:flag]}'", current_user, universal_scope)
            end
          end
          if ticket.email?
            # Send the contact form to the customer for their reference
            UniversalCrm::Mailer.new_ticket(universal_crm_config, subject, ticket, sent_from_crm).deliver_now
          end
        end
        render json: { ticket: ticket.to_json }
      else
        render json: {}
      end
    end

    def update_status
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      if params[:status] == 'closed'
        @ticket.close!(universal_user)
      elsif params[:status] == 'actioned'
        @ticket.action!(universal_user)
      else
        @ticket.open!(universal_user)
      end
      respond_to do |format|
        format.json do
          render json: { ticket: @ticket.to_json }
        end
        format.js do
          render layout: false
        end
      end
    end

    def update_due_on
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      if @ticket
        @ticket.update(due_on: params[:due_on])
        @ticket.save_comment!("Updated due date: #{params[:due_on].to_date.strftime('%b %d, %Y')}", current_user,
                              universal_scope)
        render json: { ticket: @ticket.to_json }
      else
        render json: {}
      end
    end

    def flag
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      if params[:add] == 'true'
        @ticket.flag!(params[:flag], universal_user)
        @ticket.save_comment!("Added flag: '#{params[:flag]}'", current_user, universal_scope)
      else
        @ticket.remove_flag!(params[:flag])
        @ticket.save_comment!("Removed flag: '#{params[:flag]}'", current_user, universal_scope)
      end
      render json: { ticket: @ticket.to_json }
    end

    def update_customer
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      old_customer_name = @ticket.subject.name
      customer = UniversalCrm::Customer.find(params[:customer_id])
      @ticket.update(subject: customer, from_email: customer.email)
      @ticket.save_comment!("Customer changed from: '#{old_customer_name}'", current_user, universal_scope)
      render json: { ticket: @ticket.to_json }
    end

    def assign_user
      @user = Universal::Configuration.class_name_user.classify.constantize.find(params[:user_id])
      unless @user.nil?
        @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
        @ticket.update(responsible: @user)
        @ticket.save_comment!("Ticket assigned to: #{@user.name}", universal_user, universal_scope)
        begin
          UniversalCrm::Mailer.assign_ticket(universal_crm_config, @ticket, @user).deliver_now
        rescue StandardError
        end
      end
      render json: { user: { name: @user.name, email: @user.email } }
    end

    def editing
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      @ticket.being_edited_by!(universal_user)
      render json: {}
    end

    # forward to an external email address
    def forward
      @ticket = UniversalCrm::Ticket.unscoped.find(params[:id])
      begin
        UniversalCrm::Mailer.forward_ticket(universal_crm_config, @ticket, params[:email].strip).deliver_now
      rescue StandardError
      end
      @ticket.save_comment!("Ticket forwarded to: #{params[:email]}", universal_user, universal_scope)
      render json: { status: 200, email: params[:email] }
    end
  end
end
