import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import './LaTeXViewer.css'
import { CompileErrorResponse } from '../types'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface LaTeXViewerProps {
  latex: string
  onPdfUrlChange?: (url: string | null) => void
}

type TabType = 'rendered' | 'raw'

export default function LaTeXViewer({ latex, onPdfUrlChange }: LaTeXViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rendered')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState<boolean>(false)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    compileLaTeX()
  }, [latex])

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const compileLaTeX = async () => {
    setIsCompiling(true)
    setCompileError(null)
    
    try {
      // Strip markdown code block if present
      let cleanLatex = latex.trim()
      if (cleanLatex.startsWith('```latex')) {
        cleanLatex = cleanLatex.replace(/^```latex\n?/, '').replace(/\n?```$/, '')
      } else if (cleanLatex.startsWith('```')) {
        cleanLatex = cleanLatex.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      
      const getBackendUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          return 'https://notation-backend-914600374296.us-central1.run.app'
        }
        return 'http://localhost:3000'
      }
      const BACKEND_URL = getBackendUrl()
      const response = await fetch(`${BACKEND_URL}/compile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: cleanLatex }),
      })

      if (!response.ok) {
        const errorData = await response.json() as CompileErrorResponse
        throw new Error(errorData.error || 'Failed to compile LaTeX')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      onPdfUrlChange?.(url)
    } catch (err) {
      console.error('LaTeX compilation error:', err)
      const error = err as Error
      setCompileError(error.message || 'Failed to compile LaTeX. Check the raw code for syntax errors.')
    } finally {
      setIsCompiling(false)
    }
  }

  return (
    <div className="latex-viewer">
      <div className="latex-header">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'rendered' ? 'active' : ''}`}
            onClick={() => setActiveTab('rendered')}
          >
            Rendered
          </button>
          <button
            className={`tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw Code
          </button>
        </div>
      </div>

      <div className="latex-content">
        {activeTab === 'rendered' ? (
          <div className="rendered-view" ref={containerRef}>
            {isCompiling && <p className="loading">Compiling LaTeX...</p>}
            {compileError && <p className="error">{compileError}</p>}
            {pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<p className="loading">Loading PDF...</p>}
                error={<p className="error">Failed to load PDF</p>}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={Math.min(containerWidth * 0.9, 800)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            )}
          </div>
        ) : (
          <div className="raw-view">
            <pre className="latex-code">
              <code>{latex}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
