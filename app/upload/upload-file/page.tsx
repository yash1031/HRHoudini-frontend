"use client"

import { useState, useCallback, Dispatch, SetStateAction, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { useUpload } from "@/contexts/upload-context"
import { useFileProcessing } from "@/components/hooks/use-file-processing"
import { useDashboard } from "@/contexts/dashboard-context"
import { BarChart3 } from "lucide-react"

export default function UploadFilePage() {
  const router = useRouter()
  const {
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
  } = useUpload()

  // Track if cleanup has been run to prevent infinite loops
  const cleanupRunRef = useRef(false)
  
  // Handle stale state clearing - only clear if localStorage doesn't have processed state
  // Context handles state restoration, so we trust it and only clear inconsistent state
  // Run only once on mount to avoid infinite loops
  useEffect(() => {
    // Prevent multiple runs
    if (cleanupRunRef.current) return
    cleanupRunRef.current = true
    
    const savedProcessed = localStorage.getItem("upload_processed")
    const savedFile = localStorage.getItem("upload_file_metadata")
    
    // If localStorage doesn't have processed state, clear context state
    // This handles the case where user navigates from choose page (which clears localStorage)
    if (!savedProcessed || savedProcessed !== "true") {
      // localStorage was cleared (user starting fresh) - clear context state
      setProcessedFile(false)
      setIsUploaded(false)
      return
    }
    
    // If localStorage doesn't have file metadata but has processed state, that's inconsistent
    // Clear processed state (file metadata is required for processed state)
    if (!savedFile && (savedProcessed === "true")) {
      setProcessedFile(false)
      setIsUploaded(false)
      localStorage.removeItem("upload_processed")
      localStorage.removeItem("upload_is_uploaded")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - don't depend on state to avoid loops

  const [hasBrowsedFiles, setHasBrowsedFiles] = useState(false)
  const [fileUploadStarted, setFileUploadStarted] = useState(false)

  // Define callbacks before using them in hooks
  const hasFileUploadStarted = useCallback(
    (arg: boolean) => {
      console.log("hasFileUploadStarted, args:", arg)
      setFileUploadStarted(arg)
    },
    []
  )

  const hasFileDropped = useCallback(
    (args: boolean) => {
      console.log("Args received after selecting the file", args)
      setFileDropped(args)
    },
    [setFileDropped]
  )

  const handleBrowseFiles = useCallback(() => {
    setHasBrowsedFiles(true)
  }, [])

  // Wrap setError for useFileProcessing hook (expects simple function)
  const setErrorForProcessing = useCallback(
    (value: string | null) => {
      setError(value)
    },
    [setError]
  )

  const { processFile } = useFileProcessing(
    setIsUploading,
    setErrorForProcessing,
    setUploadProgress,
    setProcessedFile,
    setIsUploaded,
    hasFileUploadStarted
  )
  const { setMetadata } = useDashboard()

  // Don't auto-navigate to success page - show success message on this page instead

  const handleContinue = () => {
    if (processedFile && isUploaded) {
      // If already processed, navigate to select KPIs page
      router.push("/upload/select-kpis")
    } else {
      // Otherwise, start processing
      if (uploadedFile) {
        const { file, metadata } = uploadedFile
        processFile(file, metadata.columns || [], metadata.rowCount || 0)
      }
    }
  }

  const handleBack = () => {
    // If file is uploaded, clear state to show upload area again
    // If no file is uploaded, navigate back to choose page (same as "Back to options")
    if (uploadedFile) {
      setIsUploading(false)
      setFileDropped(false)
      setProcessedFile(false)
      setUploadedFile(null)
      setError(null)
      // Don't navigate - just reset state so user can upload again
    } else {
      // No file uploaded - navigate back to choose page
      router.push("/upload/choose")
    }
  }

  // Show success message on upload-file page before navigating to success page
  // Don't hide the page - let user see the success message

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
          <CardTitle className="text-lg font-semibold text-blue-900">
            Explore HR insights with your data or sample data
          </CardTitle>
        </div>
        <CardDescription>Choose how you'd like to get started with your HR analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!processedFile && (
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">Upload Your HR Data</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/upload/choose")}>
                ← Back to options
              </Button>
            </div>
          )}
          {processedFile && isUploaded && (
            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" onClick={() => router.push("/upload/choose")}>
                ← Back to options
              </Button>
            </div>
          )}
          <FileUpload
            hasFileUploadStarted={hasFileUploadStarted}
            onboardingMode={true}
            hasFileDropped={hasFileDropped}
            onBrowseFiles={handleBrowseFiles}
            isUploading={isUploading}
            error={error}
            setError={setError as Dispatch<SetStateAction<string | null>>}
            uploadProgress={uploadProgress}
            processedFile={processedFile}
            isUploaded={isUploaded}
          />
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            disabled={!(fileDropped && !isUploading) && !processedFile}
          >
            <span>{isUploading || processedFile ? "Continue" : "Upload"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
