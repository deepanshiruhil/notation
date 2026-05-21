import { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { UploadData, ConvertResponse } from '../types'
import './UploadForm.css'

interface UploadFormProps {
  onUploadSuccess: (data: UploadData) => void
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Try env var first, fallback to Cloud Run backend URL for production
  // then fallback to localhost for development
  const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return 'https://notation-backend-914600374296.us-central1.run.app'
    }
    return 'http://localhost:3000'
  }
  const BACKEND_URL = getBackendUrl()
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf']

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG image or PDF file.')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first.')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post<ConvertResponse>(`${BACKEND_URL}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const fileBlob = selectedFile
      const fileUrl = URL.createObjectURL(fileBlob)

      onUploadSuccess({
        file: fileBlob,
        fileUrl: fileUrl,
        fileName: selectedFile.name,
        latex: response.data.latex
      })
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      setError(error.response?.data?.error || 'Failed to convert file. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="upload-form-container">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📄</div>
          <h2>Upload Your Handwritten Notes</h2>
          <p>Drag and drop your image or PDF here, or click to select</p>
          <input
            type="file"
            id="file-input"
            onChange={handleFileInput}
            accept=".png,.jpg,.jpeg,.pdf"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="file-input-label">
            Choose File
          </label>
        </div>
      </div>

      {selectedFile && (
        <div className="file-info">
          <p>Selected: <strong>{selectedFile.name}</strong></p>
          <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? 'Converting...' : 'Convert to LaTeX'}
      </button>
    </div>
  )
}
