require_dependency "universal_crm/application_controller"

module UniversalCrm
  class TicketsController < ApplicationController

    before_filter :remove_tickets_viewing!, only: %w(index)
    
    def index
      params[:page] = 1 if params[:page].blank?
      @tickets = UniversalCrm::Ticket.all
      @tickets = @tickets.scoped_to(universal_scope) if !universal_scope.nil?
      if !params[:q].blank? and params[:q].to_s != 'undefined'
        conditions = []
        params[:q].split(' ').each do |keyword|
          conditions.push({'$or' => [
            {title: /#{keyword}/i},
            {number: /#{keyword}/i},
            {html_body: /#{keyword}/i},
            {tags: keyword}
          ]})
        end
        @tickets = @tickets.where('$and' => conditions)
      else
        if !params[:subject_id].blank? and params[:subject_id].to_s!='undefined' and !params[:subject_type].blank? and params[:subject_type].to_s!='undefined'
          conditions = [{'$and' => [{subject_id: params[:subject_id], subject_type: params[:subject_type]}]}]
          if params[:subject_type]=='UniversalCrm::Company'
            company = UniversalCrm::Company.find(params[:subject_id])
            company.employees.each do |employee|
              conditions.push({'$and' => [{subject_id: employee.id.to_s, subject_type: 'UniversalCrm::Customer'}]})
            end
          end
          @tickets = @tickets.where('$or' => conditions)
        elsif !params[:flag].blank? and params[:flag]!='null' and params[:flag]!='undefined'
          @tickets = @tickets.flagged_with(params[:flag])        
        elsif params[:status] == 'email'
          @tickets = @tickets.email.active
        elsif params[:status] == 'normal'
          @tickets = @tickets.normal.active
        elsif params[:status] == 'task'
          @tickets = @tickets.task.active
        elsif !params[:status].blank? and params[:status] != 'priority' and params[:status] != 'all' and params[:status] != 'null'
          @tickets = @tickets.for_status(params[:status])
        elsif params[:status] == 'priority'
          @tickets = @tickets.active.priority
        elsif params[:status] != 'all'
          @tickets = @tickets.active  
        end
        if params[:kind] == 'email'
          @tickets = @tickets.email
        end
      end
      @tickets = @tickets.page(params[:page])
      render json: {
        pagination: {
          total_count: @tickets.total_count,
          page_count: @tickets.total_pages,
          current_page: params[:page].to_i,
          per_page: 20
        },
        tickets: @tickets.map{|t| t.to_json}
        }
    end
    
    def new
      
    end
    
    def show
      @ticket = UniversalCrm::Ticket.find(params[:id])
      if @ticket.nil?
        render json: {ticket: nil}
      else
        @ticket.being_viewed_by!(universal_user)
        respond_to do |format|
          format.html{}
          format.json{
            render json: {ticket: @ticket.to_json}
          }
        end
      end
    end
    
    def create
      if !params[:subject_id].blank? and !params[:subject_type].blank?
        subject = params[:subject_type].classify.constantize.find params[:subject_id]
        kind = (params[:kind].to_s=='note' ? 'normal' : params[:kind])
        sent_from_crm=true
      elsif !params[:customer_name].blank? and !params[:customer_email].blank?
        #find a customer by this email
        subject = UniversalCrm::Customer.find_or_create_by(scope: universal_scope, email: params[:customer_email])
        subject.assign_user_subject!(universal_scope)
        kind = :email
        sent_from_crm=false
      end
      if !params[:title].blank?
        document=nil
        if !params[:document_id].blank? and !params[:document_type].blank?
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
                                        
        if !document.nil? and !UniversalCrm::Configuration.secondary_scope_class.blank?
          ticket.secondary_scope = document.crm_secondary_scope
        end
                     
        if ticket.save
          if !params[:flag].blank?
            params[:flag].strip.gsub(' ','').split(',').each do |flag|
              ticket.flag!(params[:flag], universal_user)
              ticket.save_comment!("Added flag: '#{params[:flag]}'", current_user, universal_scope)
            end
          end
          if ticket.email?
            #Send the contact form to the customer for their reference
            UniversalCrm::Mailer.new_ticket(universal_crm_config, subject, ticket, sent_from_crm).deliver_now
          end
        end
        render json: {ticket: ticket.to_json}
      else
        render json: {}
      end
    end
    
    def update_status
      @ticket = UniversalCrm::Ticket.find(params[:id])
      if params[:status]=='closed'
        @ticket.close!(universal_user)
      elsif params[:status]=='actioned'
        @ticket.action!(universal_user)
      else
        @ticket.open!(universal_user)
      end
      respond_to do |format|
        format.json{
          render json: {ticket: @ticket.to_json}
        }
        format.js{
          render layout: false
        }
      end
    end
    
    def update_due_on
      @ticket = UniversalCrm::Ticket.find(params[:id])
      if @ticket
        @ticket.update(due_on: params[:due_on])
        @ticket.save_comment!("Updated due date: #{params[:due_on].to_date.strftime('%b %d, %Y')}", current_user, universal_scope)
        render json: {ticket: @ticket.to_json}
      else
        render json: {}
      end
    end
    
    def flag
      @ticket = UniversalCrm::Ticket.find(params[:id])
      if params[:add] == 'true'
        @ticket.flag!(params[:flag], universal_user)
        @ticket.save_comment!("Added flag: '#{params[:flag]}'", current_user, universal_scope)
      else
        @ticket.remove_flag!(params[:flag])
        @ticket.save_comment!("Removed flag: '#{params[:flag]}'", current_user, universal_scope)
      end
      render json: {ticket: @ticket.to_json}
    end
    
    def update_customer
      @ticket = UniversalCrm::Ticket.find(params[:id])
      old_customer_name = @ticket.subject.name
      customer = UniversalCrm::Customer.find(params[:customer_id])
      @ticket.update(subject: customer, from_email: customer.email)
      @ticket.save_comment!("Customer changed from: '#{old_customer_name}'", current_user, universal_scope)
      render json: {ticket: @ticket.to_json}
    end
    
    def assign_user
      @user = Universal::Configuration.class_name_user.classify.constantize.find(params[:user_id])
      if !@user.nil?
        @ticket = UniversalCrm::Ticket.find(params[:id])
        @ticket.update(responsible: @user)
        @ticket.save_comment!("Ticket assigned to: #{@user.name}", universal_user, universal_scope)
        begin
          UniversalCrm::Mailer.assign_ticket(universal_crm_config, @ticket, @user).deliver_now
        rescue
        end
      end
      render json: {user: {name: @user.name, email: @user.email}}
        
    end
    
    def editing
      @ticket = UniversalCrm::Ticket.find(params[:id])
      @ticket.being_edited_by!(universal_user)
      render json: {}
    end
    
    #forward to an external email address
    def forward
      @ticket = UniversalCrm::Ticket.find(params[:id])
      begin
        UniversalCrm::Mailer.forward_ticket(universal_crm_config, @ticket, params[:email].strip).deliver_now
      rescue
      end
      @ticket.save_comment!("Ticket forwarded to: #{params[:email]}", universal_user, universal_scope)
      render json: {status: 200, email: params[:email]}
    end
    
  end
end
