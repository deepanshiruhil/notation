class CompileController < ApplicationController
  def create
    latex_content = params[:latex]
    
    unless latex_content.present?
      return render json: { error: "LaTeX content is required" }, status: :bad_request
    end

    begin
      pdf_data = LatexCompilationService.new(latex_content).compile
      
      # Send PDF as response
      send_data pdf_data,
                filename: 'compiled.pdf',
                type: 'application/pdf',
                disposition: 'inline'
    rescue StandardError => e
      Rails.logger.error "LaTeX compilation error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
