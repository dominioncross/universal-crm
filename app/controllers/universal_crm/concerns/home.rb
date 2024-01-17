module UniversalCrm
  module Concerns
    module Home
      extend ActiveSupport::Concern

      included do
        protect_from_forgery except: %w(inbound)

        def index
          #list all tickets
        end

        def init
          if Universal::Configuration.scoped_user_groups
            users = Universal::Configuration.class_name_user.classify.constantize.where("_ugf.crm.#{universal_scope.id.to_s}" => {'$ne' => nil})
          else
            users = Universal::Configuration.class_name_user.classify.constantize.where('_ugf.crm' => {'$ne' => nil})
          end
          users = users.where(Universal::Configuration.user_scope_field => universal_scope.id) if !universal_scope.nil? and !Universal::Configuration.user_scope_field.blank?
          users = users.sort_by{|a| a.name}.map{|u| {name: u.name,
              email: u.email,
              first_name: u.name.split(' ')[0].titleize,
              id: u.id.to_s,
              functions: (u.universal_user_group_functions.blank? ? [] : (Universal::Configuration.scoped_user_groups ? u.universal_user_group_functions['crm'][universal_scope.id.to_s] : u.universal_user_group_functions['crm']))}}

          json = {config: universal_crm_config.to_json, user_count: users.length, users: users}

          if universal_user
            json.merge!({universal_user: {
              id: universal_user.id.to_s,
              name: universal_user.name,
              email: universal_user.email,
              functions: (universal_user.universal_user_group_functions.blank? ? [] : (Universal::Configuration.scoped_user_groups ? universal_user.universal_user_group_functions['crm'][universal_scope.id.to_s] : universal_user.universal_user_group_functions['crm']))
            }})
          end
          render json: json
        end

        #we don't have universal scope here, so need to establish it from the to address or sender
        def inbound
          logger.warn "#### Inbound CRM mail received from #{params['From']}"
          # logger.info params
          if request.post? && !params['From'].blank? && !params['ToFull'].blank?
            # Save the inbound request for later...
            inbound_message = UniversalCrm::InboundMessage.create(params: (params.class == Hash ? params : params.to_unsafe_h))

            #find the email address we're sending to
            to = params['ToFull'][0]['Email'].downcase if !params['ToFull'].blank? and !params['ToFull'][0].blank? and !params['ToFull'][0]['Email'].blank? and params['ToFull'][0]['Email'].include?('@')
            to_name = params['ToFull'][0]['Name'].downcase if !params['ToFull'].blank? and !params['ToFull'][0].blank? and !params['ToFull'][0]['Name'].blank?
            bcc = params['BccFull'][0]['Email'].downcase if !params['BccFull'].blank? and !params['BccFull'][0].blank? and !params['BccFull'][0]['Email'].blank? and params['BccFull'][0]['Email'].include?('@')
            from = params['From'].downcase
            from_name = params['FromName']
            ticket = nil

            #check if the BCC is for our inbound addresses:
            if !bcc.blank?
              #check if it was forwarded to the bcc address:
              possible_token = bcc.split('@')[0]
              if config = UniversalCrm::Config.find_by(token: /#{possible_token}/i)
                inbound_message&.update(scope: config.scope)

                #To = Owner, From = user, BCC'd/forwarded to CRM
                ticket_subject = UniversalCrm::Customer.find_by(scope: config.scope, email: from)
                ticket_subject ||= UniversalCrm::Company.find_by(scope: config.scope, email: from) #check if there's a company now
                ticket_subject ||= UniversalCrm::Customer.create(scope: config.scope, email: from, name: from_name, status: config.default_customer_status)
                puts ticket_subject.errors.to_json
                creator = Universal::Configuration.class_name_user.classify.constantize.find_by(email: from)
                if !ticket_subject.nil? and !ticket_subject.blocked?
                  ticket_subject.update(name: to_name) if ticket_subject.name.blank?
                  ticket = ticket_subject.tickets.create  kind: :email,
                                                          title: params['Subject'],
                                                          content: params['TextBody'].hideQuotedLines,
                                                          html_body: params['HtmlBody'].hideQuotedLines,
                                                          scope: config.scope,
                                                          to_email: to,
                                                          from_email: from,
                                                          creator: creator
                end
              elsif config = UniversalCrm::Config.find_by(inbound_email_addresses: bcc)
                inbound_message&.update(scope: config.scope)

                #To = customer, From = user
                ticket_subject = UniversalCrm::Customer.find_by(scope: config.scope, email: to)
                ticket_subject ||= UniversalCrm::Company.find_by(scope: config.scope, email: to) #check if there's a company now
                ticket_subject ||= UniversalCrm::Customer.create(scope: config.scope, email: (to), name: to_name, status: config.default_customer_status)
                creator = Universal::Configuration.class_name_user.classify.constantize.find_by(email: from)
                if !ticket_subject.nil? and !ticket_subject.blocked?
                  ticket_subject.update(name: to_name) if ticket_subject.name.blank?
                  ticket = ticket_subject.tickets.create  kind: :email,
                                                          title: params['Subject'],
                                                          content: params['TextBody'].hideQuotedLines,
                                                          html_body: params['HtmlBody'].hideQuotedLines,
                                                          scope: config.scope,
                                                          to_email: to,
                                                          from_email: from,
                                                          creator: creator
                end
              end
            elsif !to.blank? and config = UniversalCrm::Config.find_by(inbound_email_addresses: to) #SENT Directly to the CRM
              if !config.nil?
                inbound_message&.update(scope: config.scope)

                creator = Universal::Configuration.class_name_user.classify.constantize.find_by(email: from)
                #find who it was originally from:
                forwarded_from = nil
                #Need to establish if this was a forwarded message, and find who it was originally from
                forwarded_match_regexp = /from:[\\n|\s]*(\b[^\<\[]*)?[\\n|\s|\<|\[]*[\b|mailto\:]*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b)[\>|\]]/i
                s = params['TextBody']
                forwarded_message = s.match(forwarded_match_regexp)
                if !forwarded_message.nil?
                  from_name = forwarded_message[1].to_s.strip
                  forwarded_from = forwarded_message[2].to_s.downcase.strip
                  ticket_subject = UniversalCrm::Customer.find_by(scope: config.scope, email: /^#{forwarded_from||to}$/i)
                  ticket_subject ||= UniversalCrm::Company.find_by(scope: config.scope, email: /^#{forwarded_from||to}$/i) #check if there's a company now
                  ticket_subject ||= UniversalCrm::Customer.create(scope: config.scope, email: (forwarded_from||to), status: config.default_customer_status)
                  ticket_subject.update(name: (from_name.blank? ? forwarded_from : from_name)) if ticket_subject.name.blank?
                else
                  ticket_subject = UniversalCrm::Customer.find_by(scope: config.scope, email: /^#{forwarded_from||from}$/i)
                  ticket_subject ||= UniversalCrm::Company.find_by(scope: config.scope, email: /^#{forwarded_from||from}$/i) #check if there's a company now
                  ticket_subject ||= UniversalCrm::Customer.create(scope: config.scope, email: (forwarded_from||from), status: config.default_customer_status)
                  ticket_subject.update(name: to_name) if ticket_subject.name.blank?
                end
                puts ticket_subject.to_json(config)
                if !ticket_subject.nil? and !ticket_subject.blocked?
                  ticket = ticket_subject.tickets.create  kind: :email,
                                                          title: params['Subject'],
                                                          content: params['TextBody'].hideQuotedLines,
                                                          html_body: params['HtmlBody'].hideQuotedLines,
                                                          scope: config.scope,
                                                          to_email: (forwarded_from||to),
                                                          from_email: from,
                                                          creator: creator
                end
              end
            elsif !to.blank?
              #find email addresses that match our config domains
              inbound_domains = UniversalCrm::Config.all.map{|c| c.inbound_domain}
              puts inbound_domains
              if !to.blank? and inbound_domains.include?(to[to.index('@')+1, to.length])
                to = to
              elsif !bcc.blank? and inbound_domains.include?(bcc[bcc.index('@')+1, bcc.length])
                to = bcc
              end
              token = to[3, to.index('@')-3]
              if to[0,3] == 'tk-'
                logger.warn "Direct to ticket"
                ticket = UniversalCrm::Ticket.unscoped.find_by(token: /^#{token}$/i)
                if !ticket.nil?
                  inbound_message&.update(scope: ticket.scope)

                  ticket_subject = ticket.subject
                  user = (ticket_subject.class.to_s == Universal::Configuration.class_name_user.to_s ? ticket_subject : nil)
                  ticket.open!(user)
                  ticket.update(kind: :email)
                  comment = ticket.comments.create content: params['TextBody'].hideQuotedLines,
                                          html_body: params['HtmlBody'].hideQuotedLines,
                                          user: user,
                                          kind: :email,
                                          when: Time.now.utc,
                                          author: (ticket_subject.nil? ? 'Unknown' : ticket_subject.name),
                                          incoming: true,
                                          subject_name: ticket.name,
                                          subject_kind: ticket.kind,
                                          subject: ticket_subject

                  logger.warn comment.errors.to_json
                end
              end
            else
              logger.warn "To not received"
            end
            #check for attachments
            if !ticket.nil? and !params['Attachments'].blank? and !params['Attachments'].empty?
              params['Attachments'].each do |email_attachment|
                filename = email_attachment['Name']
                body = email_attachment['Content']
#                 puts body
                begin
                  decoded = Base64.decode64(body.to_s)
#                 puts decoded
                  path = "#{Rails.root}/tmp/#{Time.now.to_i}-#{filename}"
                  File.open(path, 'wb'){|f| f.write(decoded)}
                  att = ticket.attachments.create file: File.open(path), name: filename
                  logger.warn att.errors.to_json
                  File.delete(path)
                rescue => error
                  puts "Attachment error: #{error.to_s}"
                end
              end
            end

            inbound_message&.success!
            render json: {}
          else
            inbound_message&.fail!
            render json: {status: 200, message: "From/To not sent"}
          end
        end

        def unload
          remove_tickets_viewing!
          render json: {}
        end

        def dashboard
          @customers = UniversalCrm::Customer.unscoped
          @customers = @customers.scoped_to(universal_scope) if !universal_scope.nil?
          @companies = UniversalCrm::Company.unscoped
          @companies = @companies.scoped_to(universal_scope) if !universal_scope.nil?
          match = {'$match': universal_scope.present? ? {scope_id: universal_scope.id, scope_type: universal_scope.class.to_s} : {}}
          group = {'$group': {_id: {status: "$_s", kind: "$_kn"}, value: {'$sum': 1}}}
          status_count = UniversalCrm::Ticket.collection.aggregate([match, group]).each{}
          unwind = {'$unwind': '$_fgs'}
          group = {'$group': {_id: "$_fgs", value: {'$sum': 1}}}
          sort = {'$sort' => {value: -1}}
          flag_count = UniversalCrm::Ticket.collection.aggregate([match, unwind, group, sort]).each{}
          flags = {}
          flag_count.each do |c|
            flags.merge!(c['_id'] => ActiveSupport::NumberHelper.number_to_delimited(c['value'].to_i))
          end
          render json: {
            ticket_counts: {
              inbox: ticket_status_count(status_count, :email, :active),
              notes: ticket_status_count(status_count, :normal, :active),
              tasks: ticket_status_count(status_count, :task, :active),
              open: ticket_status_count(status_count, nil, :active),
              actioned: ticket_status_count(status_count, nil, :actioned),
              closed: ticket_status_count(status_count, nil, :closed)
              },
            flags: flags,
            totalFlags:  flag_count.map{|a| a['value'].to_i}.sum,
            customer_counts: {
              draft: ActiveSupport::NumberHelper.number_to_delimited(@customers.draft.count)
            },
            company_counts: {
              draft: ActiveSupport::NumberHelper.number_to_delimited(@companies.draft.count)
            }
          }
        end

        def search
          render json: {type: params[:search_type], results: []}
        end

        def newsfeed
          @comments = Universal::Comment.unscoped.order_by(created_at: :desc)
          @comments = @comments.scoped_to(universal_scope) if !universal_scope.nil?
          @comments = @comments.where(subject_type: params[:subject_type]) if !params[:subject_type].blank?
          @comments = @comments.where(user_id: params[:user_id]) if !params[:user_id].blank?
          @comments = @comments.where(subject_kind: params[:subject_kind]) if !params[:subject_kind].blank?
          @tickets = UniversalCrm::Ticket.unscoped.order_by(created_at: :desc)
          @tickets = @tickets.scoped_to(universal_scope) if !universal_scope.nil?
          @tickets = @tickets.where(creator_id: params[:user_id]) if !params[:user_id].blank?
          @tickets = @tickets.where(kind: params[:subject_kind]) if !params[:subject_kind].blank?
          results = []
          per_page=20
          offset = ((params[:page].blank? ? 1 : params[:page].to_i)-1)*per_page
          @comments[offset, offset+41].each do |comment|
            results.push({type: 'comment', result: comment.to_json, subject: comment.subject.to_json})
          end
          @tickets[offset, offset+41].each do |ticket|
            results.push({type: 'ticket', result: ticket.to_json})
          end
          results = results.sort_by{|a| a[:result][:created_at]}.reverse[0, per_page]
          render json: {
            pagination: {
              total_count: @tickets.count+@comments.count,
              page_count: (@tickets.count/per_page).to_i + (@comments.count/per_page).to_i,
              current_page: params[:page].to_i,
              per_page: per_page
            },
            results: results
          }
        end

        private

        def ticket_status_count(aggregate, kind=nil, status=nil)
          ActiveSupport::NumberHelper.number_to_delimited(
            aggregate.select{|s| 
              (kind.present? && s['_id']['kind']==kind.to_s || kind.blank?) && s['_id']['status'] == status.to_s
            }.map{|s| s['value'].to_i}.sum
          )
        end


      end
    end
  end
end
