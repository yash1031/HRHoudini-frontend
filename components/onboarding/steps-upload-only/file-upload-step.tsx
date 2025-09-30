"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, BarChart3, Download, FileText, Users, Building2 } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { useOnboarding } from "../onboarding-template"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function FileUploadStep() {
  const { step, setStep, uploadedFile, setUploadedFile, userContext, scenarioConfig } = useOnboarding()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<"upload" | "sample" | null>(null)
  const [hasBrowsedFiles, setHasBrowsedFiles] = useState(false)

  const handleFileUpload = (file: File, metadata: any) => {
    setUploadedFile({ file, metadata })
  }

  const handleSampleFileSelect = () => {
    const sampleMetadata = {
      name: "SharpMedian.csv",
      size: 245760, // Approximate size
      type: "text/csv",
      lastModified: Date.now(),
      rowCount: 1247,
      columns: [
        "Employee ID",
        "Employee Status",
        "Employee Type",
        "Employee Name",
        "Original Hire Date",
        "Last Hire Date",
        "Seniority Date",
        "Termination Date",
        "Termination Reason",
        "Company",
        "Organization",
        "Department",
        "Job Title",
        "Supervisor Name",
        "Location",
        "Region",
        "Salary or Hourly",
        "Annual Salary",
        "Gender",
        "Ethnicity",
        "Email Address",
      ],
      dataType: "headcount",
      isSample: true,
    }

    const sampleFile = new File(["sample"], "SharpMedian.csv", { type: "text/csv" })
    setUploadedFile({ file: sampleFile, metadata: sampleMetadata })

    setStep(3)
  }

  const downloadSampleFile = () => {
    const link = document.createElement("a")
    link.href = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-tZH0AS0loyXmDGJmWhyKxY7i9oD9SR.csv"
    link.download = "SharpMedian.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const skipToStep = (targetStep: number) => {
    setStep(targetStep)
  }

  const handleContinue = () => {
    const params = new URLSearchParams({
      persona: userContext?.persona || "hr-generalist",
      company: userContext?.company || "default",
      hasFile: "true",
      onboarding: "completed",
      showWelcome: "true",
    })

    let dashboardUrl
    if (uploadedFile?.metadata?.isSample) {
      params.set("sampleFile", "true")
      params.set("company", "Sharp Median")
      dashboardUrl = `/dashboard-uo-2?${params.toString()}`
    } else {
      params.set("company", "HealthServ")
      dashboardUrl = `/dashboard-uo-1?${params.toString()}`
    }

    router.push(dashboardUrl)
  }

  const resetSelection = () => {
    setSelectedOption(null)
    setUploadedFile(null)
    setHasBrowsedFiles(false)
  }

  const handleBrowseFiles = () => {
    setHasBrowsedFiles(true)
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
        {!selectedOption && !uploadedFile && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                onClick={() => setSelectedOption("upload")}
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
                onClick={() => setSelectedOption("sample")}
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
        )}

        {selectedOption === "upload" && !uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upload Your HR Data</h3>
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                ← Back to options
              </Button>
            </div>
            <FileUpload
              onFileUpload={handleFileUpload}
              onboardingMode={true}
              userContext={userContext}
              scenarioConfig={scenarioConfig}
              onBrowseFiles={handleBrowseFiles}
            />
          </div>
        )}

        {selectedOption === "sample" && !uploadedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Sharp Median Sample Dataset</h3>
              <Button variant="ghost" size="sm" onClick={resetSelection}>
                ← Back to options
              </Button>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">Sharp Median Retail Company</h4>
                    <p className="text-sm text-green-800 mb-4">
                      A comprehensive HR dataset from a mid-sized retail organization with diverse departments,
                      locations, and employee demographics. Perfect for exploring workforce analytics capabilities.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <strong>Records:</strong> 1,247 employees
                        </div>
                        <div>
                          <strong>Departments:</strong> Customer Service, Retail Operations, Management
                        </div>
                        <div>
                          <strong>Locations:</strong> Multiple regions (Midwest, etc.)
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <strong>Data includes:</strong> Demographics, compensation, tenure
                        </div>
                        <div>
                          <strong>Time period:</strong> Current workforce snapshot
                        </div>
                        <div>
                          <strong>File format:</strong> CSV (245KB)
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSampleFile}
                        className="flex items-center space-x-2 bg-transparent"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download to Review</span>
                      </Button>
                      <Button
                        onClick={handleSampleFileSelect}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                      >
                        <span>Use This Sample</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {uploadedFile && (
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
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          {!(selectedOption === "sample" && !uploadedFile) && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => skipToStep(3)}>
                Skip file upload
              </Button>
              <Button
                onClick={handleContinue}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                disabled={!uploadedFile && !hasBrowsedFiles}
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
