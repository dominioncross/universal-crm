# frozen_string_literal: true

require_dependency 'universal/application_controller'

module Universal
  class CommentsController < ::UniversalCrm::ApplicationController
    before_action :find_model

    def index
      @model = find_model
      comments = load_comments
      render json: comments.map(&:to_json)
    end

    def create
      @model = find_model
      @comment = @model.comments.new content: params[:content], kind: params[:kind], scope: universal_scope,
                                     subject_name: @model.name, subject_kind: @model.kind
      @comment.when = Time.now.utc
      @comment.user = current_user
      if @comment.save
        if @model.instance_of?(UniversalCrm::Ticket)
          if @comment.email?
            UniversalCrm::Mailer.ticket_reply(universal_crm_config, @model.subject, @model, @comment).deliver_now
          end
          @model.not_edited_by!(universal_user)
        end
        @model.touch
      else
        logger.debug @comment.errors.to_json
      end
      comments = load_comments
      render json: comments.map(&:to_json)
    end

    def recent
      @comments = Universal::Comment.unscoped.order_by(created_at: :desc)
      @comments = @comments.scoped_to(universal_scope) unless universal_scope.nil?
      @comments = @comments.where(subject_type: params[:subject_type]) if params[:subject_type].present?
      @comments = @comments.where(user_id: params[:user_id]) if params[:user_id].present?
      @comments = @comments.where(subject_kind: params[:subject_kind]) if params[:subject_kind].present?
      @comments = @comments.page(params[:page])
      render json: {
        pagination: {
          total_count: @comments.total_count,
          page_count: @comments.total_pages,
          current_page: params[:page].to_i,
          per_page: 20
        },
        comments: @comments.map(&:to_json)
      }
    end

    private

    def find_model
      return params[:subject_type].classify.constantize.unscoped.find params[:subject_id] if params[:subject_type]

      nil
    end

    def load_comments
      comments = @model.comments
      comments = comments.not_system_generated.email if params[:hide_private_comments].to_s == 'true'
      comments
    end
  end
end
