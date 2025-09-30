import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, AlertCircle, BarChart3, Users, FileText, TrendingUp } from "lucide-react"

export interface ScenarioScreenProps {
  scenarioId: number
  step: number
  company: string
  persona: string
}

// Screen configurations - Add new screens here
export const scenarioScreens: Record<string, React.ComponentType<ScenarioScreenProps>> = {
  // Maya's Leadership Prep Workflow
  "1_0": ({ company, persona }) => (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Upload HR Data</h1>
          <p className="text-slate-600">Upload your HRIS-exported spreadsheet to get started with insights</p>
          <div className="mt-2 text-sm text-slate-500">
            Logged in as: <span className="font-medium">{persona}</span> at{" "}
            <span className="font-medium">{company}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Drag and drop your file here</h3>
          <p className="text-slate-600 mb-4">or click to browse</p>
          <Button className="bg-blue-600 hover:bg-blue-700">Choose File</Button>

          <div className="mt-6 text-xs text-slate-500">Supported formats: .xlsx, .csv, .xls | Max file size: 10MB</div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">Employee Data</h4>
            <p className="text-sm text-slate-600">Names, departments, roles, hire dates</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">Compensation</h4>
            <p className="text-sm text-slate-600">Salaries, bonuses, equity information</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-2">Performance</h4>
            <p className="text-sm text-slate-600">Reviews, ratings, goal completion</p>
          </div>
        </div>
      </div>
    </div>
  ),

  "1_1": ({ company, persona }) => (
    <div className="flex-1 bg-slate-100">
      <div className="bg-green-100 border-b border-green-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 font-medium">Data uploaded successfully! Generating insights...</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{company} - HR Dashboard</h1>
          <p className="text-slate-600">Viewing as: {persona}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm text-slate-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Turnover Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">1.75%</div>
              <div className="text-sm text-green-600">↓ 0.3% from last quarter</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm text-slate-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Engagement Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">7.6/10</div>
              <div className="text-sm text-green-600">↑ 0.4 from last quarter</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm text-slate-600 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Open Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">4</div>
              <div className="text-sm text-blue-600">2 critical roles</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Insights Ready</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your dashboard has been automatically configured with key metrics. Ready to dive deeper with AI-powered
                analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  // Add more screens here as needed
  "1_2": ({ company, persona }) => (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">AI-Powered Risk Analysis</h1>
        <p className="text-slate-600 mb-8">Ask questions about your workforce to uncover insights</p>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Ready for Analysis</h3>
            <p className="text-slate-600">Try asking: "Who is most at risk of leaving in Q3?"</p>
          </div>
        </div>
      </div>
    </div>
  ),

  // Default fallback screen
  default: ({ scenarioId, step, company, persona }) => (
    <div className="flex-1 flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Scenario {scenarioId} - Step {step + 1}
        </h2>
        <p className="text-slate-600 mb-4">
          {company} | {persona}
        </p>
        <p className="text-slate-500">This scenario screen is under construction</p>
      </div>
    </div>
  ),
}

// Helper function to get the right screen component
export function getScenarioScreen(scenarioId: number, step: number): React.ComponentType<ScenarioScreenProps> {
  const screenKey = `${scenarioId}_${step}`
  return scenarioScreens[screenKey] || scenarioScreens.default
}
