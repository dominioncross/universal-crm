module UniversalCrm
  class Configuration

    cattr_accessor :scope_class, :secondary_scope_class

    def self.reset
      self.scope_class                     = nil
      self.secondary_scope_class           = nil
    end

  end
end
UniversalCrm::Configuration.reset
