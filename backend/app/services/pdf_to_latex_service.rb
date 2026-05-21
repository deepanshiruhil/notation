require 'net/http'
require 'json'
require 'fileutils'

class PdfToLatexService
  GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
  FILES_API_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files"
  CONTENT_TYPE = "application/pdf"

  def initialize(pdf_file)
    @pdf_file = pdf_file
    @api_key = ENV["GEMINI_API_KEY"]
  end

  def convert
    # Upload PDF using Files API
    file_uri = upload_pdf_to_files_api
    
    # Generate LaTeX content using the uploaded file
    generate_latex_from_file(file_uri)
  rescue StandardError => e
    raise "Error converting PDF to LaTeX: #{e.message}"
  end

  private

  def upload_pdf_to_files_api
    # Read file size and mime type
    file_size = File.size(@pdf_file.path)
    
    # Get upload URL via resumable upload initialization
    upload_url = initiate_resumable_upload(file_size)
    
    # Upload the file bytes
    response = upload_file_bytes(upload_url, file_size)
    
    # Extract file URI from response
    response_data = JSON.parse(response.body)
    response_data.dig("file", "uri") || raise("Failed to get file URI from upload response")
  end

  def initiate_resumable_upload(file_size)
    uri = URI("#{FILES_API_URL}?key=#{@api_key}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300 # 5 minutes

    request = Net::HTTP::Post.new(uri)
    request["X-Goog-Upload-Protocol"] = "resumable"
    request["X-Goog-Upload-Command"] = "start"
    request["X-Goog-Upload-Header-Content-Length"] = file_size.to_s
    request["X-Goog-Upload-Header-Content-Type"] = CONTENT_TYPE
    request["Content-Type"] = "application/json"

    display_name = File.basename(@pdf_file.original_filename || "document")
    request.body = JSON.generate({
      file: {
        display_name: display_name
      }
    })

    response = http.request(request)
    
    # Extract upload URL from response headers
    upload_url = response["x-goog-upload-url"]
    raise "Failed to get upload URL: #{response.code} - #{response.body}" unless upload_url
    
    upload_url
  end

  def upload_file_bytes(upload_url, file_size)
    uri = URI(upload_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300 # 5 minutes

    request = Net::HTTP::Post.new(uri)
    request["Content-Length"] = file_size.to_s
    request["X-Goog-Upload-Offset"] = "0"
    request["X-Goog-Upload-Command"] = "upload, finalize"
    request.body = File.read(@pdf_file.path)

    http.request(request)
  end

  def generate_latex_from_file(file_uri)
    payload = {
      contents: [
        {
          parts: [
            { text: conversion_prompt },
            {
              file_data: {
                mime_type: CONTENT_TYPE,
                file_uri: file_uri
              }
            }
          ]
        }
      ]
    }

    uri = URI(GEMINI_API_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300 # 5 minutes

    request = Net::HTTP::Post.new(uri)
    request["x-goog-api-key"] = @api_key
    request["Content-Type"] = "application/json"
    request.body = payload.to_json

    response = http.request(request)

    if response.code == "200"
      result = JSON.parse(response.body)
      result.dig("candidates", 0, "content", "parts", 0, "text") || ""
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  end

  def conversion_prompt
    <<~PROMPT
      Analyze this PDF document and extract all text content, equations, and structured information.
      
      For mathematical expressions:
      - Use LaTeX syntax enclosed in $ for inline math or $$ for display math
      - Preserve the mathematical notation and structure
      
      Return the extracted content in a clean format with:
      1. Regular text preserved with proper formatting
      2. Math equations in proper LaTeX syntax
      3. Section structure (headings, lists, tables, etc.)
      4. Maintain the logical flow and organization of the document
      
      Do not add any additional formatting or commentary - just extract and convert the content.
    PROMPT
  end
end
