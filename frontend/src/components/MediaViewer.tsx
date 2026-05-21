import { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import './MediaViewer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface MediaViewerProps {
  fileUrl: string
  fileName: string
  file: File
}

export default function MediaViewer({ fileUrl, fileName, file }: MediaViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [blobUrl, setBlobUrl] = useState<string>(fileUrl)
  const containerRef = useRef<HTMLDivElement>(null)
  const isPDF = file?.type === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    // Create a fresh blob URL from the File object if available
    if (file) {
      const url = URL.createObjectURL(file)
      setBlobUrl(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

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

  return (
    <div className="media-viewer">
      <div className="media-header">
        <h3>{fileName}</h3>
      </div>
      <div className="media-content" ref={containerRef}>
        {isPDF ? (
          <Document
            file={blobUrl}
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
        ) : (
          <img
            src={fileUrl}
            alt={fileName}
            className="uploaded-image"
          />
        )}
      </div>
    </div>
  )
}
