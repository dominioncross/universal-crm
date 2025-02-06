# frozen_string_literal: true

require 'rails_helper'

module UniversalCrm
  RSpec.describe Company, type: :model do
    subject(:model) { build(:company) }

    it { expect(model).to be_valid }
  end
end
