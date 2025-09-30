"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, CheckCircle } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { useOnboarding } from "../onboarding-template"

export function FileUploadStep() {
  const { step, setStep, uploadedFile, setUploadedFile, userContext, scenarioConfig } = useOnboarding()

  const handleFileUpload = (file: File, metadata: any) => {
    setUploadedFile({ file, metadata })
  }

  const skipToStep = (targetStep: number) => {
    setStep(targetStep)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Upload your data to see instant insights</CardTitle>
        <CardDescription>{scenarioConfig.fileUploadConfig.uploadMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileUpload={handleFileUpload}
          onboardingMode={true}
          userContext={userContext}
          scenarioConfig={scenarioConfig}
        />

        {uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">File processed successfully!</span>
            </div>
            <div className="text-sm text-green-700">
              <strong>{uploadedFile.metadata.rowCount} records</strong> analyzed •
              <strong> {uploadedFile.metadata.type}</strong> data detected
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => skipToStep(4)}>
              Skip file upload
            </Button>
            <Button onClick={() => setStep(3)} disabled={!uploadedFile} className="flex items-center space-x-2">
              <span>Continue with insights</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
