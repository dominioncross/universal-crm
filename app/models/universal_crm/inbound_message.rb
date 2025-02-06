# frozen_string_literal: true

module UniversalCrm
  class InboundMessage
    include Mongoid::Document
    include Mongoid::Timestamps
    include Universal::Concerns::Status
    include Universal::Concerns::Scoped

    store_in collection: 'crm_inbound_messages'

    field :params, type: Hash

    statuses %w[pending success fail], default: :pending
  end
end
