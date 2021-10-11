# frozen_string_literal: true
module Docs
  class Inputs::ShareLinkInput < BrickGraphQL::BaseInputObject
    argument :webid, String, 'block unique id', required: true
    argument :policy, Enums::Policytype, 'policy', required: true
    argument :state, Enums::ShareLinkStateType, 'state type', required: true
  end
end