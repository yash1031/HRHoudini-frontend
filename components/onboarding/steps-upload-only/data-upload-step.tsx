"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, FileText, CheckCircle } from "lucide-react"
import { useOnboarding } from "../onboarding-template"
import { FileUpload } from "@/components/file-upload"

export function DataUploadStep() {
  const { setStep, uploadedFile, setUploadedFile, finishOnboarding } = useOnboarding()

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleNext = () => {
    finishOnboarding(false)
  }

  const handleSkip = () => {
    finishOnboarding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your HR Data</CardTitle>
        <CardDescription>
          Upload a representative, sanitized CSV file to help demonstrate HR Houdini's capabilities with your data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Section */}
          <FileUpload
            onFileUpload={handleFileUpload}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 h-40"
          />

          {/* File Status */}
          {uploadedFile && (
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">File uploaded successfully</p>
                <p className="text-sm text-green-700">{uploadedFile.name}</p>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Recommended file format</p>
                <p className="text-sm text-blue-800 mt-1">
                  Upload a CSV file with HR data such as employee records, performance data, or recruiting information.
                  Make sure all sensitive information has been removed or anonymized.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button onClick={handleNext}>
                <span>Complete Setup</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
