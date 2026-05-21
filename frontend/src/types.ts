// Shared type definitions for the application

export interface UploadData {
  file: File
  fileUrl: string
  fileName: string
  latex: string
}

export interface ConvertResponse {
  latex: string
}

export interface CompileErrorResponse {
  error: string
}
