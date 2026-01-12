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
    // Detect if this is a page refresh vs browser navigation
    const navEntries = performance.getEntriesByType('navigation')
    const navEntry = navEntries[0] as PerformanceNavigationTiming | undefined
    const navigationType = navEntry?.type
    
    // If it's a page refresh, clear all upload state
    if (navigationType === 'reload') {
      // Clear all upload-related state on refresh
      setUploadedFileState(null)
      setProcessedFile(false)
      setIsUploaded(false)
      setFileDropped(false)
      setError(null)
      setUploadProgress(0)
      
      // Clear localStorage
      localStorage.removeItem("upload_file_metadata")
      localStorage.removeItem("upload_processed")
      localStorage.removeItem("upload_is_uploaded")
      localStorage.removeItem("upload_file_dropped")
      return // Don't restore state on refresh
    }
    
    // Only restore state for browser back/forward navigation
    const savedFile = localStorage.getItem("upload_file_metadata")
    const savedProcessed = localStorage.getItem("upload_processed")
    const savedUploaded = localStorage.getItem("upload_is_uploaded")
    const savedFileDropped = localStorage.getItem("upload_file_dropped")
    
    if (savedFile) {
      try {
        const parsed = JSON.parse(savedFile)
        // Note: File object can't be serialized, so we only restore metadata
        // This is for browser back/forward navigation
        if (parsed.metadata) {
          setUploadedFileState({ file: new File([], parsed.metadata.name), metadata: parsed.metadata })
          // If file exists, set fileDropped to true (file was dropped/selected)
          if (savedFileDropped === "true") {
            setFileDropped(true)
          } else {
            // Auto-set fileDropped if file exists (for backward compatibility)
            setFileDropped(true)
          }
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

  useEffect(() => {
    if (fileDropped) {
      localStorage.setItem("upload_file_dropped", "true")
    } else {
      localStorage.removeItem("upload_file_dropped")
    }
  }, [fileDropped])

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
