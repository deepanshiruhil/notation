import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import Vara from 'vara'
import { Home, Info, Github } from 'lucide-react'
import { UploadData, ConvertResponse } from '../types'
import FloatingNote from '../components/FloatingNote'
import AboutModal from '../components/AboutModal'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const varaContainerRef = useRef<HTMLDivElement>(null)
  const varaInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pinnedItem, setPinnedItem] = useState<string | null>(null)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false)

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

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFile = async (file: File) => {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG image or PDF file.')
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post<ConvertResponse>(`${BACKEND_URL}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const fileBlob = file
      const fileUrl = URL.createObjectURL(fileBlob)

      navigate('/viewer', {
        state: {
          file: fileBlob,
          fileUrl: fileUrl,
          fileName: file.name,
          latex: response.data.latex
        } as UploadData
      })
    } catch (err) {
      const error = err as AxiosError<{ error: string }>
      setError(error.response?.data?.error || 'Failed to convert file. Please try again.')
      setIsLoading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  useEffect(() => {
    if (varaContainerRef.current && !varaInstanceRef.current) {
      // Clear any existing content
      varaContainerRef.current.innerHTML = ''

      varaInstanceRef.current = new Vara(
        '#vara-container',
        'https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json',
        [
          {
            text: 'upload note',
            fontSize: 28,
            strokeWidth: 1.5,
            color: '#000000',
            duration: 2000,
            textAlign: 'center'
          }
        ]
      )
    }

    return () => {
      // Cleanup on unmount
      if (varaContainerRef.current) {
        varaContainerRef.current.innerHTML = ''
      }
      varaInstanceRef.current = null
    }
  }, [])

  return (
    <div
      className="home-page"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Floating Notes */}
      <FloatingNote
        className="floating-note-1"
        delay={0.2}
        rotate={-7}
        imageSrc="/before1.jpg"
        imageAlt="Before conversion example 1"
      />
      <FloatingNote
        className="floating-note-2"
        delay={0.4}
        rotate={6}
        imageSrc="/after1.jpg"
        imageAlt="After conversion example 1"
      />
      <FloatingNote
        className="floating-note-3"
        delay={0.6}
        rotate={-5}
        imageSrc="/before2.jpg"
        imageAlt="Before conversion example 2"
      />
      <FloatingNote
        className="floating-note-4"
        delay={0.8}
        rotate={7}
        imageSrc="/after2.jpg"
        imageAlt="After conversion example 2"
      />

      <div className="content-wrapper">
        <h1 className="title">Notation</h1>

        <p className="subtitle">
          An interface to convert your handwritten math notes into formatted LaTeX code. Drop a file or click below to begin.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept=".png,.jpg,.jpeg,.pdf"
          style={{ display: 'none' }}
        />

        <div className="upload-area">
          <div
            ref={varaContainerRef}
            id="vara-container"
            className="upload-link-container"
            onClick={handleUploadClick}
            style={{ cursor: isLoading ? 'wait' : 'pointer', display: isLoading ? 'none' : 'flex' }}
          />

          {isLoading && (
            <div className="loading-text">
              processing
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <nav
        className="nav-bar"
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button
          className={`nav-item ${(!hoveredItem || hoveredItem === 'home') && !pinnedItem ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('home')}
        >
          <Home size={20} />
          <span className="nav-text">Home</span>
        </button>
        <button
          className={`nav-item ${pinnedItem === 'about' || hoveredItem === 'about' ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('about')}
          onClick={() => {
            setPinnedItem('about')
            setIsAboutModalOpen(true)
          }}
        >
          <Info size={20} />
          <span className="nav-text">About</span>
        </button>
        <a
          href="https://github.com/danielquzhao/notation"
          target="_blank"
          rel="noopener noreferrer"
          className={`nav-item ${hoveredItem === 'github' ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('github')}
        >
          <Github size={20} />
          <span className="nav-text">GitHub</span>
        </a>
      </nav>

      <AboutModal isOpen={isAboutModalOpen} onClose={() => {
        setIsAboutModalOpen(false)
        setPinnedItem(null)
      }} />
    </div>
  )
}
