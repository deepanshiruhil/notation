class ConversionsController < ApplicationController
  def create
    file = params[:file]
    
    unless file.present?
      return render json: { error: "File is required" }, status: :bad_request
    end

    begin
      # Determine file type and extract content
      mime_type = file.content_type
      raw_content = extract_content(file, mime_type)
      
      # Format the extracted content
      formatted_latex = ContentFormattingService.new(raw_content).format
      
      render json: { latex: formatted_latex }, status: :ok
    rescue StandardError => e
      Rails.logger.error "Conversion Error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  private

  def extract_content(file, mime_type)
    case mime_type
    when /pdf/
      PdfToLatexService.new(file).convert
    when /image/
      ImageToLatexService.new(file).convert
    else
      raise "Unsupported file type. Please upload an image (PNG, JPG) or PDF file."
    end
  end
end
