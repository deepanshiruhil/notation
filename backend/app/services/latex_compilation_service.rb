require 'tempfile'
require 'open3'

class LatexCompilationService
  def initialize(latex_content)
    @latex_content = latex_content
  end

  def compile
    # Create a temporary directory for LaTeX compilation
    Dir.mktmpdir do |dir|
      tex_file = File.join(dir, 'document.tex')
      pdf_file = File.join(dir, 'document.pdf')
      
      # Write LaTeX content to file
      File.write(tex_file, clean_latex_content)
      
      # Compile LaTeX to PDF (run twice for references)
      compile_command = "cd #{dir} && #{pdflatex_command} -interaction=nonstopmode -halt-on-error document.tex"
      
      stdout1, stderr1, status1 = Open3.capture3(compile_command)
      
      # Run pdflatex a second time to resolve references
      stdout2, stderr2, status2 = Open3.capture3(compile_command)
      
      # Check if PDF was generated
      unless File.exist?(pdf_file)
        error_message = extract_error_message(stdout2, stderr2)
        raise "LaTeX compilation failed: #{error_message}"
      end
      
      # Read and return the PDF content
      File.binread(pdf_file)
    end
  end

  private

  def pdflatex_command
    @pdflatex_command ||= begin
      # Try to find pdflatex in PATH
      command = `which pdflatex`.strip
      
      # Fallback to common locations if not in PATH
      if command.empty?
        common_paths = [
          '/Library/TeX/texbin/pdflatex',        # MacOS MacTeX
          '/usr/bin/pdflatex',                    # Linux
          '/usr/local/bin/pdflatex',              # Homebrew/manual install
          '/opt/homebrew/bin/pdflatex'            # Apple Silicon Homebrew
        ]
        
        command = common_paths.find { |path| File.executable?(path) }
        raise "pdflatex not found. Please install a LaTeX distribution." unless command
      end
      
      command
    end
  end

  def clean_latex_content
    # Strip markdown code blocks if present
    content = @latex_content.strip
    
    if content.start_with?('```latex')
      content = content.gsub(/^```latex\n?/, '').gsub(/\n?```$/, '')
    elsif content.start_with?('```')
      content = content.gsub(/^```\n?/, '').gsub(/\n?```$/, '')
    end
    
    content
  end

  def extract_error_message(stdout, stderr)
    # Look for LaTeX errors in output and include context
    error_lines = []
    lines = stdout.split("\n")
    
    lines.each_with_index do |line, i|
      if line.match(/^!/) || line.include?('Error') || line.include?('error')
        # Add the error line and the next 2 lines for context
        error_lines << line
        error_lines << lines[i + 1] if i + 1 < lines.length
        error_lines << lines[i + 2] if i + 2 < lines.length
      end
    end
    
    return error_lines.first(20).join("\n") unless error_lines.empty?
    return stderr unless stderr.empty?
    
    "Unknown compilation error. Check LaTeX syntax."
  end
end
