# Use official Ruby image
FROM ruby:4.0.0-slim

# Install system dependencies including LaTeX
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    libyaml-dev \
    texlive-full \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install Ruby dependencies
RUN bundle install

# Copy the entire app
COPY . .

# Set production environment
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true
ENV RAILS_SERVE_STATIC_FILES=true
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start Puma directly
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
