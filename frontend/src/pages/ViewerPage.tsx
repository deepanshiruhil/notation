import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Info, Github, Download, Copy, FileText, File, ExternalLink } from 'lucide-react'
import MediaViewer from '../components/MediaViewer'
import LaTeXViewer from '../components/LaTeXViewer'
import AboutModal from '../components/AboutModal'
import { UploadData } from '../types'
import './ViewerPage.css'

export default function ViewerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const data = location.state as UploadData | null
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pinnedItem, setPinnedItem] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false)

  const pdfUrlRef = useRef<string | null>(null)

  const handlePdfUrlChange = (url: string | null) => {
    pdfUrlRef.current = url
  }

  const handleCopyLatex = () => {
    if (data?.latex) {
      navigator.clipboard.writeText(data.latex)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleDownloadPDF = () => {
    if (pdfUrlRef.current) {
      const link = document.createElement('a')
      link.href = pdfUrlRef.current
      link.download = 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadTeX = () => {
    if (data?.latex) {
      const element = document.createElement('a')
      const file = new Blob([data.latex], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = 'document.tex'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      URL.revokeObjectURL(element.href)
    }
  }

  const handleOpenInOverleaf = () => {
    if (data?.latex) {
      // Use base64 data URL to avoid 414 request URI too large error
      const base64Latex = btoa(unescape(encodeURIComponent(data.latex)))
      const dataUrl = `data:application/x-tex;base64,${base64Latex}`
      const form = document.createElement('form')
      form.method = 'post'
      form.action = 'https://www.overleaf.com/docs'
      form.target = '_blank'
      
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'snip_uri'
      input.value = dataUrl
      
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
  }

  useEffect(() => {
    // Redirect to home if no data is available
    if (!data || !data.latex) {
      navigate('/')
    }
  }, [data, navigate])

  if (!data) {
    return null
  }

  return (
    <div className="viewer-page">
      <nav 
        className="viewer-nav-bar"
        onMouseLeave={() => setHoveredItem(null)}
      >
        <button 
          className={`nav-item ${hoveredItem === 'home' && !pinnedItem ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('home')}
          onClick={() => navigate('/')}
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
        <div className="nav-divider"></div>
        <div className="nav-item-group">
          <button 
            className={`nav-item ${hoveredItem === 'download' ? 'expanded' : ''}`}
            onMouseEnter={() => setHoveredItem('download')}
          >
            <Download size={20} />
            <span className="nav-text">Download</span>
          </button>
          {hoveredItem === 'download' && (
            <div className="download-menu">
              <button className="download-option" onClick={handleDownloadPDF}>
                <File size={16} />
                <span>PDF</span>
              </button>
              <button className="download-option" onClick={handleDownloadTeX}>
                <FileText size={16} />
                <span>TeX</span>
              </button>
            </div>
          )}
        </div>
        <button 
          className={`nav-item ${hoveredItem === 'copy' ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('copy')}
          onClick={handleCopyLatex}
        >
          <Copy size={20} />
          <span className="nav-text">{copySuccess ? 'Copied!' : 'Copy'}</span>
        </button>
        <button 
          className={`nav-item ${hoveredItem === 'overleaf' ? 'expanded' : ''}`}
          onMouseEnter={() => setHoveredItem('overleaf')}
          onClick={handleOpenInOverleaf}
        >
          <ExternalLink size={20} />
          <span className="nav-text">Overleaf</span>
        </button>
      </nav>

      <div className="viewer-content">
        <div className="viewer-panel left-panel">
          <MediaViewer 
            fileUrl={data.fileUrl} 
            fileName={data.fileName} 
            file={data.file} 
          />
        </div>
        <div className="viewer-panel right-panel">
          <LaTeXViewer latex={data.latex} onPdfUrlChange={handlePdfUrlChange} />
        </div>
      </div>

      <AboutModal isOpen={isAboutModalOpen} onClose={() => {
        setIsAboutModalOpen(false)
        setPinnedItem(null)
      }} />
    </div>
  )
}
