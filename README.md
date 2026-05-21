# Notation

A modern web application for converting PDFs and images into LaTeX—the industry standard for mathematical and technical documents. Built with a Ruby on Rails backend and a React (Vite) frontend, powered by Google's Gemini API.

## 🚀 Features

- **PDF & Image Processing**: Upload documents or images and extract content directly into LaTeX.
- **Mathematical Extraction**: Intelligent recognition of complex mathematical expressions and equations.
- **Real-time Compilation**: Compile LaTeX code into high-quality PDFs instantly using the integrated compilation service.
- **Modern UI**: A sleek, responsive workspace designed for productivity and ease of use.
- **Micro-animations**: Enhanced user experience with fluid transitions and interactive elements.

## 🛠️ Tech Stack

### Backend
- **Ruby on Rails API**: Robust and scalable backend architecture.
- **Gemini API**: Leverages the latest Gemini 2.5 Flash model for high-fidelity content extraction.
- **Docker**: Fully containerized environment for consistent deployment.

### Frontend
- **React (Vite)**: Fast and modern frontend development.
- **TypeScript**: Type-safe development for reliable code.
- **Framer Motion**: Smooth, high-performance animations.
- **KaTeX**: Blazing fast math rendering in the browser.

### Infrastructure
- **Google Cloud Platform**: Deployed on Cloud Run for serverless scaling.
- **CI/CD**: Automated build and deployment with Google Cloud Build.

## 🏗️ Project Structure

```
.
├── backend/           # Ruby on Rails API server
├── frontend/          # React (Vite) web application
├── cloudbuild.yaml    # Cloud Build configuration for GCP
└── docker-compose.yml # Local development configuration
```

## 🚦 Prerequisites

- **Node.js**: v18 or higher
- **Ruby**: 3.3.x or higher
- **Docker & Docker Compose**: For containerized development
- **Gemini API Key**: Required for content extraction

## 🔧 Setup & Installation

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Configure environment**:
   Create a `.env` file and add your `GEMINI_API_KEY`.

4. **Start the Rails server**:
   ```bash
   rails server
   ```

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

You can run the entire stack using Docker:

1. **Build and start services**:
   ```bash
   docker-compose up --build
   ```

## 🚀 Cloud Deployment

The project is optimized for deployment on Google Cloud Run:

1. **Initialize GCP Project**:
   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **Deploy via Cloud Build**:
   ```bash
   gcloud builds submit
   ```

## 🔒 Environment Variables

### Backend (.env)
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `RAILS_MASTER_KEY`: Master key for encrypted credentials (production).
- `RAILS_ENV`: Set to `production` or `development`.

### Frontend
- `VITE_BACKEND_URL`: URL of the running Rails API (injected during build in CI/CD).

## 📝 API Documentation

### `POST /convert`
Uploads a file (PDF or Image) and returns the extracted LaTeX content.
- **Parameters**: `file` (Multipart Form)
- **Response**: `{ "latex": "..." }`

### `POST /compile`
Compiles a LaTeX string into a PDF document.
- **Parameters**: `latex` (String)
- **Response**: PDF file binary (served as `application/pdf`)

## 📄 License

This project is licensed under the MIT License.
