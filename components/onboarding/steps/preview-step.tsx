"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, Target, Users, Building2 } from "lucide-react"

interface PreviewStepProps {
  userContext: {
    name: string
    email: string
    company: string
    role: string
  }
  selectedChallenges: string[]
  uploadedFile?: {
    file: File
    metadata: any
  }
  onComplete: () => void
  onBack: () => void
}

export function PreviewStep({ userContext, selectedChallenges, uploadedFile, onComplete, onBack }: PreviewStepProps) {
  const challengeLabels: Record<string, string> = {
    "attrition-analysis": "Attrition Analysis",
    "compensation-equity": "Compensation Equity",
    "diversity-tracking": "Diversity Tracking",
    "performance-management": "Performance Management",
    "recruiting-optimization": "Recruiting Optimization",
    "engagement-surveys": "Engagement Surveys",
    "workforce-planning": "Workforce Planning",
    "compliance-reporting": "Compliance Reporting",
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started!</h2>
        <p className="text-gray-600">
          Review your setup below and click "Complete Setup" to access your personalized HR dashboard.
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Your Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-sm text-gray-700">Name:</span>
                <p className="text-gray-900">{userContext.name}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-700">Email:</span>
                <p className="text-gray-900">{userContext.email}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-700">Company:</span>
                <p className="text-gray-900">{userContext.company}</p>
              </div>
              <div>
                <span className="font-medium text-sm text-gray-700">Role:</span>
                <Badge variant="secondary" className="capitalize">
                  {userContext.role.replace("-", " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Your Focus Areas</span>
            </CardTitle>
            <CardDescription>We'll prioritize insights and recommendations for these areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedChallenges.map((challenge) => (
                <Badge key={challenge} variant="default">
                  {challengeLabels[challenge] || challenge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded File */}
        {uploadedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Your Data</span>
              </CardTitle>
              <CardDescription>Ready to analyze your HR data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{uploadedFile.file.name}</p>
                  <p className="text-sm text-green-700">
                    {uploadedFile.metadata.rowCount} records • {uploadedFile.metadata.type} data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Building2 className="h-5 w-5" />
              <span>What's Next?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Access your personalized dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Get AI-powered insights on your focus areas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Start analyzing your HR data immediately</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Receive proactive alerts and recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Complete Setup & Access Dashboard
        </Button>
      </div>
    </div>
  )
}
