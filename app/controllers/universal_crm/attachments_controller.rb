# frozen_string_literal: true

require_dependency 'universal_crm/application_controller'

module UniversalCrm
  class AttachmentsController < ApplicationController
    before_action :find_subject, :find_parent

    def index
      if !@subject.nil?
        render json: { attachments: @subject.attachments.map(&:to_json) }
      elsif !@parent.nil?
        # find the attachments for the children of the parent
        children = params[:subject_type].classify.constantize.where(subject_type: params[:parent_type],
                                                                    subject_id: params[:parent_id])
        attachments = Universal::Attachment.in(subject_id: children.map(&:id))
        render json: { attachments: attachments.map(&:to_json) }
      else
        render json: { attachments: [] }
      end
    end

    def create
      return if @subject.nil?

      params[:files].map do |file|
        @subject.attachments.create(file: file)
      end
      render json: { attachments: @subject.attachments.map(&:to_json) }
    end

    def shorten_url
      @attachment = @subject.attachments.find(params[:id])
      if @attachment.shortened_url.blank?
        if params[:google_api_key].blank?
          render json: {}
        else
          r = HTTParty.post('https://www.googleapis.com/urlshortener/v1/url',
                            query: { key: params[:google_api_key] },
                            body: { longUrl: @attachment.file.url }.to_json,
                            headers: { 'Content-Type' => 'application/json' })
          json = JSON.parse(r.body)
          Rails.logger.debug json
          if json['id'].blank?
            render json: {}
          else
            @attachment.update(shortened_url: json['id'])
            render json: { url: json['id'] }
          end
        end
      else
        render json: { url: @attachment.shortened_url }
      end
    end

    private

    def find_subject
      if params[:subject_type].present? && (params[:subject_type] != 'undefined') && params[:subject_id].present? && (params[:subject_id] != 'undefined')
        @subject = params[:subject_type].classify.constantize.find(params[:subject_id])
      end
    end

    def find_parent
      if params[:parent_type].present? && (params[:parent_type] != 'undefined') && params[:parent_id].present? && (params[:parent_id] != 'undefined')
        @parent = params[:parent_type].classify.constantize.find(params[:parent_id])
      end
    end
  end
end
