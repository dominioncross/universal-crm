# frozen_string_literal: true

UniversalCrm::Engine.routes.draw do
  root to: 'home#index'

  get '/logout', to: 'user_sessions#logout', as: :logout
  get '/customer/:customer_id', to: 'home#index'
  get '/company/:company_id', to: 'home#index'
  get '/ticket/:ticket_id', to: 'home#index'
  post '/inbound', to: 'home#inbound'
  get '/inbound', to: 'home#inbound'
  post '/config/set_password', to: 'config#set_password'
  post '/config/signin', to: 'config#signin'
  get '/email', to: 'home#index'
  get '/actioned', to: 'home#index'
  get '/active', to: 'home#index'
  get '/closed', to: 'home#index'
  get '/init.json', to: 'home#init'
  get '/unload', to: 'home#unload'
  get '/dashboard', to: 'home#dashboard'
  get '/newsfeed', to: 'home#newsfeed'
  get '/search', to: 'home#search'

  resource :config, controller: :config

  resources :attachments do
    member do
      get :shorten_url
    end
  end
  resources :customers do
    collection do
      get :autocomplete
    end
    member do
      patch :update_status
    end
  end
  resources :companies do
    collection do
      get :autocomplete
      get :recent
    end
    member do
      patch :add_employee
      patch :update_status
    end
  end
  resources :tickets do
    member do
      patch :update_status
      patch :flag
      patch :update_customer
      patch :assign_user
      patch :editing
      patch :update_due_on
      post :forward
    end
  end
  resources :comments
end
