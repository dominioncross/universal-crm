require_dependency "universal_crm/application_controller"

module UniversalCrm
  class AttachmentsController < ApplicationController

    before_action :find_subject, :find_parent

    def index
      if !@subject.nil?
        render json: {attachments: @subject.attachments.map{|a| a.to_json}}
      elsif !@parent.nil?
        #find the attachments for the children of the parent
        att = []
        children = params[:subject_type].classify.constantize.where(subject_type: params[:parent_type], subject_id: params[:parent_id])
        attachments = Universal::Attachment.in(subject_id: children.map{|c| c.id})
        render json: {attachments: attachments.map{|a| a.to_json}}
      else
        render json: {attachments: []}
      end

    end

    def create
      if !@subject.nil?
        attachments = []
        params[:files].each do |file|
          attachments.push(@subject.attachments.create file: file)
        end
        render json: {attachments: @subject.attachments.map{|a| a.to_json}}
      end
    end

    def shorten_url
      @attachment = @subject.attachments.find(params[:id])
      if @attachment.shortened_url.blank?
        if !params[:google_api_key].blank?
          r = HTTParty.post("https://www.googleapis.com/urlshortener/v1/url",
              query: {key: params[:google_api_key]},
              body: {longUrl: @attachment.file.url}.to_json,
              headers: {'Content-Type' => 'application/json'})
          json = JSON.parse(r.body)
          puts json
          if !json['id'].blank?
            @attachment.update(shortened_url: json['id'])
            render json: {url: json['id']}
          else
            render json: {}
          end
        else
          render json: {}
        end
      else
        render json: {url: @attachment.shortened_url}
      end
    end

    private
    def find_subject
      if !params[:subject_type].blank? and params[:subject_type] != 'undefined' and !params[:subject_id].blank? and params[:subject_id] != 'undefined'
        @subject = params[:subject_type].classify.constantize.find(params[:subject_id])
      end
    end
    def find_parent
      if !params[:parent_type].blank? and params[:parent_type] != 'undefined' and !params[:parent_id].blank? and params[:parent_id] != 'undefined'
        @parent = params[:parent_type].classify.constantize.find(params[:parent_id])
      end
    end
  end
end
