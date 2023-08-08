module UniversalCrm
  class Mailer < ActionMailer::Base
    include UniversalCrm::Concerns::MailConcern
  
    def new_ticket(config, customer, ticket, sent_from_crm=true)
      if !config.transaction_email_address.blank?
        @customer = customer
        @ticket = ticket
        @config = config
        @sent_from_crm = sent_from_crm
        mail  to: to(@customer.email, config.test_email),
              from: "#{config.transaction_email_from} <#{config.transaction_email_address}>",
              reply_to: ticket.inbound_email_address(config),
              subject: "#{ticket.title}"
      end
    end

    def ticket_reply(config, customer, ticket, comment)
      if !config.transaction_email_address.blank?
        @customer = customer
        @ticket = ticket
        @comment = comment
        @config = config
        if !@customer.nil?
          mail  to: to(@customer.email, config.test_email),
                from: "#{config.transaction_email_from} <#{config.transaction_email_address}>",
                reply_to: ticket.inbound_email_address(config),
                subject: "#{ticket.title}"
        end
      end
    end
    
    def assign_ticket(config, ticket, user)
      if !config.transaction_email_address.blank?
        @config = config
        @ticket = ticket
        @user = user
        mail  to: to(@user.email, config.test_email),
              from: "#{config.transaction_email_from} <#{config.transaction_email_address}>",
              subject: "#{config.system_name} Ticket assigned: #{ticket.title}"
      end      
    end
    
    def forward_ticket(config, ticket, email_address)
      if !config.transaction_email_address.blank?
        @config = config
        @ticket = ticket
        mail  to: to(email_address, config.test_email),
              from: "#{config.transaction_email_from} <#{config.transaction_email_address}>",
              subject: "#{config.system_name} Ticket forwarded from #{ticket.from_email}"
      end 
    end
    
  end
end
