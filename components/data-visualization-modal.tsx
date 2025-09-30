"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TrendingDown, Users, MapPin, AlertTriangle, Target } from "lucide-react"

interface DataVisualizationModalProps {
  isOpen: boolean
  onClose: () => void
  type: "turnover" | "workforce" | "locations" | null
  data: any
}

const COLORS = ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a", "#059669", "#0d9488"]

export function DataVisualizationModal({ isOpen, onClose, type, data }: DataVisualizationModalProps) {
  if (!type || !data) return null

  const renderTurnoverAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-900">Overall Turnover</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{data.turnoverRate}%</div>
          <p className="text-sm text-red-700">
            {data.terminatedEmployees} of {data.totalEmployees} employees
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-900">Voluntary Exits</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{data.terminationTypes?.Voluntary || 0}</div>
          <p className="text-sm text-orange-700">Most common reason</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-900">At Risk Depts</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {data.departmentChartData?.filter((d: any) => d.terminated / d.employees > 0.25).length || 0}
          </div>
          <p className="text-sm text-yellow-700">Above 25% turnover</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Turnover by Department</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === "terminated" ? "Terminated" : "Active"]} />
                <Legend />
                <Bar dataKey="active" fill="#16a34a" name="Active" />
                <Bar dataKey="terminated" fill="#dc2626" name="Terminated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Termination Types</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.terminationChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.terminationChartData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Key Insights & Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Critical Issues:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Turnover rate of {data.turnoverRate}% is significantly above industry average</li>
              <li>• {data.terminationTypes?.Voluntary || 0} voluntary terminations indicate retention issues</li>
              <li>• Customer Service department shows highest attrition</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Recommended Actions:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Conduct exit interviews to identify root causes</li>
              <li>• Review compensation and benefits packages</li>
              <li>• Implement retention programs for high-risk departments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWorkforceAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Total Workforce</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{data.totalEmployees}</div>
          <p className="text-sm text-blue-700">Active employees</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Departments</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{Object.keys(data.departments).length}</div>
          <p className="text-sm text-green-700">Active departments</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Locations</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{Object.keys(data.locations).length}</div>
          <p className="text-sm text-purple-700">Office locations</p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-indigo-900">Largest Dept</span>
          </div>
          <div className="text-lg font-bold text-indigo-600">
            {Object.entries(data.departments).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "N/A"}
          </div>
          <p className="text-sm text-indigo-700">
            {Object.entries(data.departments).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[1] || 0}{" "}
            employees
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Department Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.departmentChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="employees" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Workforce Composition</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.departmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="employees"
                >
                  {data.departmentChartData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Workforce Analysis Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Key Observations:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Customer Service represents the largest department</li>
              <li>• Workforce is distributed across {Object.keys(data.locations).length} locations</li>
              <li>
                • {data.activeEmployees} active employees across {Object.keys(data.departments).length} departments
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Strategic Insights:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Consider cross-training between departments</li>
              <li>• Evaluate span of control for large departments</li>
              <li>• Assess resource allocation across locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLocationAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Total Locations</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{Object.keys(data.locations).length}</div>
          <p className="text-sm text-green-700">Active office sites</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Largest Location</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {Object.entries(data.locations).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || "N/A"}
          </div>
          <p className="text-sm text-blue-700">
            {Object.entries(data.locations).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[1] || 0}{" "}
            employees
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Avg per Location</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(data.totalEmployees / Object.keys(data.locations).length)}
          </div>
          <p className="text-sm text-purple-700">Employees per site</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Employee Distribution by Location</h4>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.locationChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="employees" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Location Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Distribution Analysis:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Gateway location has the highest concentration of employees</li>
              <li>
                • Average of {Math.round(data.totalEmployees / Object.keys(data.locations).length)} employees per
                location
              </li>
              <li>• Consider workload balance across locations</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Optimization Opportunities:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Evaluate cost-effectiveness of smaller locations</li>
              <li>• Consider remote work options for distributed teams</li>
              <li>• Assess regional performance metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const getModalTitle = () => {
    switch (type) {
      case "turnover":
        return "Turnover Analysis - Sharp Median"
      case "workforce":
        return "Workforce Structure Analysis - Sharp Median"
      case "locations":
        return "Location Performance Analysis - Sharp Median"
      default:
        return "Data Analysis"
    }
  }

  const getModalContent = () => {
    switch (type) {
      case "turnover":
        return renderTurnoverAnalysis()
      case "workforce":
        return renderWorkforceAnalysis()
      case "locations":
        return renderLocationAnalysis()
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-blue-100 rounded-full p-2">
              {type === "turnover" && <TrendingDown className="h-5 w-5 text-blue-600" />}
              {type === "workforce" && <Users className="h-5 w-5 text-blue-600" />}
              {type === "locations" && <MapPin className="h-5 w-5 text-blue-600" />}
            </div>
            <span>{getModalTitle()}</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {data.totalEmployees} Records
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">{getModalContent()}</div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
