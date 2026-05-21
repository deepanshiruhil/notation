require 'net/http'
require 'json'

class ContentFormattingService
  GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

  def initialize(raw_content)
    @raw_content = raw_content
    @api_key = ENV["GEMINI_API_KEY"]
  end

  def format
    # Build request payload
    payload = {
      contents: [
        {
          parts: [
            { text: formatting_prompt }
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
      latex_content = result.dig("candidates", 0, "content", "parts", 0, "text") || ""
      # Strip markdown code block wrapper if present
      latex_content.gsub(/^```latex\n?/, '').gsub(/\n?```$/, '')
    else
      raise "API Error: #{response.code} - #{response.body}"
    end
  rescue StandardError => e
    raise "Error formatting content: #{e.message}"
  end

  private

  def formatting_prompt
    <<~PROMPT
      You are a LaTeX formatting expert. Take the following extracted mathematical content and transform it into a beautifully formatted LaTeX document.

      Raw content to format:
      ---
      #{@raw_content}
      ---

      Requirements:
      1. Create a complete, compilable LaTeX document with proper preamble
      2. Use the tcolorbox package to create visually appealing colored boxes for:
         - Definitions (use a light blue box)
         - Theorems (use a light green box)
         - Examples (use a light yellow box)
         - Important notes (use a light red/pink box)
      3. Avoid using tcolorbox for all content; use it only for the boxes mentioned above
      4. Ensure boxes are not too long and do not surpass the length of one page
      5. Use appropriate mathematical packages (amsmath, amssymb, amsthm, etc.)
      6. Add proper document structure with sections and subsections where appropriate
      7. Ensure all math notation is properly formatted
      8. Add any missing LaTeX commands needed for proper rendering
      9. Use professional typography and spacing

      Example tcolorbox usage you should follow:
      \\begin{tcolorbox}[colback=blue!5!white,colframe=blue!75!black,title=Definition]
      Content here
      \\end{tcolorbox}

      DO NOT USE: pdfcol.sty, pgfkeys. Do not overcomplicate the number of import libraries.
      Return ONLY the complete LaTeX document code, starting with \\documentclass and ending with \\end{document}.
      Do not include any explanations or commentary outside the LaTeX code.
    PROMPT
  end
end
