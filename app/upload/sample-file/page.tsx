"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Users, BarChart3 } from "lucide-react"
import { useUpload } from "@/contexts/upload-context"
import { useDashboard } from "@/contexts/dashboard-context"

export default function SampleFilePage() {
  const router = useRouter()
  const { setUploadedFile } = useUpload()
  const { setCardsState, setChartsState, setMetadata, setMessages } = useDashboard()

  const handleSampleFileSelect = (showWelcome: string) => {
    const sampleMetadata = {
      name: "SharpMedian.csv",
      size: 245760,
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

    setCardsState({
      data: [],
      loading: false,
      error: null,
    })
    setChartsState({
      data: [],
      loading: false,
      error: null,
    })
    setMetadata({
      filename: "",
      totalRows: "",
    })
    setMessages([])
    sessionStorage.removeItem("chats")

    const sampleFile = new File(["sample"], "SharpMedian.csv", { type: "text/csv" })
    setUploadedFile({ file: sampleFile, metadata: sampleMetadata })

    const params = new URLSearchParams({
      hasFile: "false",
      showWelcome: showWelcome,
    })

    let dashboardUrl = `/dashboard?${params.toString()}`
    router.push(dashboardUrl)
  }

  const downloadSampleFile = () => {
    const link = document.createElement("a")
    link.href = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-tZH0AS0loyXmDGJmWhyKxY7i9oD9SR.csv"
    link.download = "SharpMedian.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Sharp Median Sample Dataset</h3>
            <Button variant="ghost" size="sm" onClick={() => router.push("/upload/choose")}>
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
                    A comprehensive HR dataset from a mid-sized retail organization with diverse departments, locations,
                    and employee demographics. Perfect for exploring workforce analytics capabilities.
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
                      onClick={() => handleSampleFileSelect("true")}
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

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => router.push("/upload/choose")}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
