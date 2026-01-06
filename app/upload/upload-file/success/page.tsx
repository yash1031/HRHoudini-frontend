"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useUpload } from "@/contexts/upload-context"
import { checkProcessedFileGuard } from "@/lib/utils/route-guards"

export default function UploadSuccessPage() {
  const router = useRouter()
  const { uploadedFile, setProcessedFile, setIsUploaded, setUploadedFile } = useUpload()

  // Route guard: redirect if file not processed
  useEffect(() => {
    if (!checkProcessedFileGuard()) {
      router.push("/upload/upload-file")
    }
  }, [router])

  const handleContinue = () => {
    router.push("/upload/select-kpis")
  }

  const handleBack = () => {
    // Clear processed state so user can upload a new file or choose sample
    setProcessedFile(false)
    setIsUploaded(false)
    setUploadedFile(null)
    localStorage.removeItem("upload_processed")
    localStorage.removeItem("upload_is_uploaded")
    localStorage.removeItem("upload_file_metadata")
    // Navigate back to choose screen
    router.push("/upload/choose")
  }

  if (!uploadedFile) {
    return null // Will redirect via useEffect
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                {uploadedFile.metadata.isSample ? "Sample file loaded successfully!" : "File processed successfully!"}
              </span>
            </div>
            <div className="text-sm text-green-700">
              <strong>{uploadedFile.metadata.rowCount?.toLocaleString()} records</strong> analyzed •
              <strong> {uploadedFile.metadata.dataType}</strong> data detected
              {uploadedFile.metadata.isSample && (
                <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">SAMPLE DATA</span>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              onClick={handleContinue}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
