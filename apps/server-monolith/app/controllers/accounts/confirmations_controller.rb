# frozen_string_literal: true

module Accounts
  class ConfirmationsController < Devise::ConfirmationsController
    # before_action :configure_sign_in_params, only: [:create]

    # GET /resource/confirmation/new
    def new
      render 'pages/pwa'
    end

    def show
      render 'pages/pwa'
    end

    # POST /resource/confirmation
    def create
      # Only Support GraphQL API
      raise ActionController::RoutingError, 'Not Found'
    end
  end
end