require 'net/http'
require 'json'
require 'base64'

class ImageToLatexService
  GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

  def initialize(image_file)
    @image_file = image_file
    @api_key = ENV["GEMINI_API_KEY"]
  end

  def convert
    # Read and encode image
    image_data = File.read(@image_file.path)
    base64_image = Base64.strict_encode64(image_data)
    mime_type = determine_mime_type(@image_file.content_type || @image_file.filename)

    # Build request payload
    payload = {
      contents: [
        {
          parts: [
            { text: vision_prompt },
            {
              inline_data: {
                mime_type: mime_type,
                data: base64_image
              }
            }
          ]
        }
      ]
    }

    # Make REST API call
    uri = URI(GEMINI_API_URL)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 300 # 5 minutes

    request = Net::HTTP::Post.new(uri)
    request["x-goog-api-key"] = @api_key
    request["Content-Type"] = "application/json"
    request.body = payload.to_json

    response = http.request(request)

    # Parse response
    if response.code == "200"
      result = JSON.parse(response.body)
      result.dig("candidates", 0, "content", "parts", 0, "text") || ""
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  rescue StandardError => e
    raise "Error converting image to LaTeX: #{e.message}"
  end

  private

  def vision_prompt
    <<~PROMPT
      Analyze this image of handwritten math notes. Extract all the text and mathematical equations.
      
      For mathematical expressions:
      - Use LaTeX syntax enclosed in $ for inline math or $$ for display math
      - Preserve the structure and layout of the original content
      
      Return the extracted content in a clean format with:
      1. Regular text as-is
      2. Math equations in proper LaTeX syntax
      3. Preserve section structure (headings, lists, etc.)
      
      Do not add any additional formatting or commentary - just extract and convert the content.
    PROMPT
  end

  def determine_mime_type(content_type)
    case content_type
    when /jpeg/, /jpg/
      "image/jpeg"
    when /png/
      "image/png"
    when /gif/
      "image/gif"
    when /webp/
      "image/webp"
    else
      "image/jpeg" # Default to JPEG
    end
  end
end
