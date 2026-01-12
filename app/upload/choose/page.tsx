"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Building2 } from "lucide-react"
import { useUpload } from "@/contexts/upload-context"

export default function ChoosePage() {
  const router = useRouter()
  const { setProcessedFile, setIsUploaded, setUploadedFile, setFileDropped, setError } = useUpload()

  const handleUploadClick = () => {
    // Clear any previous state when starting a new upload
    setProcessedFile(false)
    setIsUploaded(false)
    setUploadedFile(null)
    setFileDropped(false)
    setError(null)
    localStorage.removeItem("upload_processed")
    localStorage.removeItem("upload_is_uploaded")
    localStorage.removeItem("upload_file_metadata")
    router.push("/upload/upload-file")
  }

  const handleSampleClick = () => {
    router.push("/upload/sample-file")
  }

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
          <div className="grid md:grid-cols-2 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
              onClick={handleUploadClick}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Your Own File</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload your organization's HR data to get personalized insights specific to your workforce
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• CSV, Excel files supported</div>
                  <div>• Your actual data, your insights</div>
                  <div>• Secure and confidential</div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200"
              onClick={handleSampleClick}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Try Sample Data</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore the platform using our sample dataset from Sharp Median, a retail company
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• 1,247 employee records</div>
                  <div>• Complete HR dataset</div>
                  <div>• Perfect for exploration</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/home")}>
            Back
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard?hasFile=false&showWelcome=false")}>
            Skip file upload
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
