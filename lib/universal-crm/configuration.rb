module UniversalCrm
  class Configuration

    cattr_accessor :scope_class, :secondary_scope_class, :mongoid_session_name

    def self.reset
      self.scope_class                     = nil
      self.secondary_scope_class           = nil
      self.mongoid_session_name            = :forklift
    end

  end
end
UniversalCrm::Configuration.reset
