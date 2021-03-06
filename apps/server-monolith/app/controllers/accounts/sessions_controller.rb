# frozen_string_literal: true

module Accounts
  class SessionsController < ::Devise::SessionsController
    # before_action :configure_sign_in_params, only: [:create]

    # GET /resource/sign_in
    def new
      redirect_to '/accounts/sign-in'
    end

    # POST /resource/sign_in
    def create
      # Only Support GraphQL API
      raise ActionController::RoutingError, 'Not Found'
    end

    # DELETE /resource/sign_out
    def destroy
      super
    end
  end
end
