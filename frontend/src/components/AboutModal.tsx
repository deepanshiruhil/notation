import { X, Upload, Cpu, FileType, Download } from 'lucide-react'
import './AboutModal.css'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2>About Notation</h2>
        
        <div className="modal-section">
          <p>
            Convert handwritten math notes into clean LaTeX documents. Upload an image or PDF, 
            and AI transforms it into professional mathematical markup.
          </p>
        </div>

        <div className="modal-section">
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <Upload size={28} />
              </div>
              <div className="step-title">Upload</div>
              <div className="step-desc">Image or PDF</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-icon">
                <Cpu size={28} />
              </div>
              <div className="step-title">Extract</div>
              <div className="step-desc">AI Analysis</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-icon">
                <FileType size={28} />
              </div>
              <div className="step-title">Format</div>
              <div className="step-desc">Auto LaTeX</div>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-icon">
                <Download size={28} />
              </div>
              <div className="step-title">Export</div>
              <div className="step-desc">PDF or TeX</div>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h3>Features</h3>
          <ul>
            <li>AI-powered handwriting recognition</li>
            <li>Professional LaTeX formatting</li>
            <li>Side-by-side comparison and preview</li>
            <li>Export to PDF, TeX, or Overleaf</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
