"use client"

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react"

interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  rowCount?: number
  columns?: string[]
  dataType?: string
  isSample?: boolean
}

interface UploadedFile {
  file: File
  metadata: FileMetadata
}

interface UploadContextType {
  uploadedFile: UploadedFile | null
  setUploadedFile: (file: UploadedFile | null) => void
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  processedFile: boolean
  setProcessedFile: (value: boolean) => void
  isUploaded: boolean
  setIsUploaded: (value: boolean) => void
  uploadProgress: number
  setUploadProgress: (value: number) => void
  error: string | null
  setError: Dispatch<SetStateAction<string | null>>
  fileDropped: boolean
  setFileDropped: (value: boolean) => void
}

const UploadContext = createContext<UploadContextType | null>(null)

export function UploadProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage for persistence
  const [uploadedFile, setUploadedFileState] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [processedFile, setProcessedFile] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileDropped, setFileDropped] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedFile = localStorage.getItem("upload_file_metadata")
    const savedProcessed = localStorage.getItem("upload_processed")
    const savedUploaded = localStorage.getItem("upload_is_uploaded")
    
    if (savedFile) {
      try {
        const parsed = JSON.parse(savedFile)
        // Note: File object can't be serialized, so we only restore metadata
        // The file will need to be re-uploaded if page refreshes
        if (parsed.metadata) {
          setUploadedFileState({ file: new File([], parsed.metadata.name), metadata: parsed.metadata })
        }
      } catch (e) {
        console.error("Failed to restore upload state:", e)
      }
    }
    
    if (savedProcessed === "true") setProcessedFile(true)
    if (savedUploaded === "true") setIsUploaded(true)
  }, [])

  // Persist state to localStorage
  const setUploadedFile = (file: UploadedFile | null) => {
    setUploadedFileState(file)
    if (file) {
      localStorage.setItem("upload_file_metadata", JSON.stringify({ metadata: file.metadata }))
    } else {
      localStorage.removeItem("upload_file_metadata")
    }
  }

  useEffect(() => {
    if (processedFile) {
      localStorage.setItem("upload_processed", "true")
    } else {
      localStorage.removeItem("upload_processed")
    }
  }, [processedFile])

  useEffect(() => {
    if (isUploaded) {
      localStorage.setItem("upload_is_uploaded", "true")
    } else {
      localStorage.removeItem("upload_is_uploaded")
    }
  }, [isUploaded])

  return (
    <UploadContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        isUploading,
        setIsUploading,
        processedFile,
        setProcessedFile,
        isUploaded,
        setIsUploaded,
        uploadProgress,
        setUploadProgress,
        error,
        setError,
        fileDropped,
        setFileDropped,
      }}
    >
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error("useUpload must be used within UploadProvider")
  }
  return context
}
