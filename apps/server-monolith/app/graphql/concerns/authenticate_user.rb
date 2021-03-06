# frozen_string_literal: true

module AuthenticateUser
  extend ActiveSupport::Concern

  class_methods do
    def authenticate_user!
      @authenticate_user = true
    end

    def authorized?(object, context)
      return super unless @authenticate_user

      context[:current_user].present? && super
    end
  end
end
