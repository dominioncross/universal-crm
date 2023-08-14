module UniversalCrm
  module Concerns
    module MailConcern
      extend ActiveSupport::Concern
      
      included do
        
        def to(email_addresses, test_address=nil)
          return test_address if !test_address.blank? and (Rails.env.development? or Rails.env.staging?)
          email_addresses
        end
        
      end
      
    end
  end
end
