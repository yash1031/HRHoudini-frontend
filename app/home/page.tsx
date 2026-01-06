"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { UploadProvider } from "@/contexts/upload-context"
import { UploadLayout } from "@/components/upload/layout/upload-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, BarChart3, Clock, Lock, CheckCircle, MessageSquare, Brain } from "lucide-react"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

export default function HomePage() {
  const router = useRouter()
  const [userContext, setUserContext] = useState<UserContext | null>(null)

  useEffect(() => {
    const name = localStorage.getItem("user_name") || ""
    const email = localStorage.getItem("user_email") || ""
    const company = localStorage.getItem("user_company") || ""
    const role = localStorage.getItem("user_role") || ""
    console.log("In home page", "name", name, "email", email, "company", company, "role", role)
    const context = { name, email, company, role }
    setUserContext(context)
  }, [])

  if (!userContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/hr-houdini-final.png" alt="HR Houdini Logo" width={100} height={100} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  const handleFileUploadClick = () => {
    router.push("/upload/choose")
  }

  return (
    <UploadProvider>
      <UploadLayout userContext={userContext} showWelcome={true}>
        <Card>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
              <div className="flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">Enterprise-Grade Security & Instant Insights</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center space-x-3 p-5 bg-white rounded-lg shadow-sm">
                  <Lock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank-Level Security</p>
                    <p className="text-xs text-gray-600">SOC 2 compliant encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-5 bg-white rounded-lg shadow-sm">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Instant Processing</p>
                    <p className="text-xs text-gray-600">Results in under 10 seconds</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-5 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Smart Detection</p>
                    <p className="text-xs text-gray-600">Auto-identifies data types</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">See what your uploaded files become:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">RECRUITMENT FUNNEL</span>
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="h-28 bg-gradient-to-r from-blue-50 to-indigo-50 rounded p-3">
                      <svg width="100%" height="100%" viewBox="0 0 240 80">
                        <defs>
                          <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                          </linearGradient>
                          <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                          </linearGradient>
                        </defs>
                        <rect x="10" y="12" width="5" height="16" fill="#3b82f6" rx="2" />
                        <rect x="10" y="32" width="5" height="12" fill="#8b5cf6" rx="2" />
                        <rect x="10" y="48" width="5" height="8" fill="#06b6d4" rx="2" />
                        <path
                          d="M15 20 Q70 20 120 28"
                          stroke="url(#flowGradient1)"
                          strokeWidth="10"
                          fill="none"
                          opacity="0.7"
                        />
                        <path
                          d="M15 38 Q70 38 120 36"
                          stroke="url(#flowGradient2)"
                          strokeWidth="8"
                          fill="none"
                          opacity="0.7"
                        />
                        <path d="M15 52 Q70 52 120 44" stroke="#06b6d4" strokeWidth="6" fill="none" opacity="0.7" />
                        <rect x="120" y="26" width="8" height="20" fill="#4f46e5" rx="4" />
                        <path d="M128 30 Q170 24 210 18" stroke="#10b981" strokeWidth="8" fill="none" opacity="0.8" />
                        <path d="M128 42 Q170 48 210 54" stroke="#ef4444" strokeWidth="10" fill="none" opacity="0.6" />
                        <rect x="210" y="14" width="5" height="10" fill="#10b981" rx="2" />
                        <rect x="210" y="50" width="5" height="16" fill="#ef4444" rx="2" />
                        <text x="22" y="24" fontSize="9" fill="#374151">
                          Applications
                        </text>
                        <text x="135" y="40" fontSize="9" fill="#374151">
                          Screened
                        </text>
                        <text x="220" y="20" fontSize="9" fill="#10b981">
                          Hired
                        </text>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Candidate flow analysis</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">SATISFACTION TRENDS</span>
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="h-28 bg-gradient-to-r from-purple-50 to-pink-50 rounded p-3">
                      <svg width="100%" height="100%" viewBox="0 0 240 80">
                        <defs>
                          <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                          </linearGradient>
                          <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        <path d="M10 55 Q60 45 120 40 Q180 35 230 38 L230 70 L10 70 Z" fill="url(#areaGradient1)" />
                        <path d="M10 62 Q60 60 120 54 Q180 50 230 52 L230 70 L10 70 Z" fill="url(#areaGradient2)" />
                        <path d="M10 55 Q60 45 120 40 Q180 35 230 38" stroke="#8b5cf6" strokeWidth="3" fill="none" />
                        <path d="M10 62 Q60 60 120 54 Q180 50 230 52" stroke="#ec4899" strokeWidth="3" fill="none" />
                        <circle cx="120" cy="40" r="3" fill="#8b5cf6" />
                        <circle cx="230" cy="38" r="3" fill="#8b5cf6" />
                        <circle cx="120" cy="54" r="3" fill="#ec4899" />
                        <circle cx="230" cy="52" r="3" fill="#ec4899" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Engagement over time</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">COMPENSATION ANALYSIS</span>
                      <BarChart3 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="h-28 bg-gradient-to-r from-emerald-50 to-teal-50 rounded p-3">
                      <svg width="100%" height="100%" viewBox="0 0 240 80">
                        <defs>
                          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                        <rect x="25" y="45" width="15" height="25" fill="url(#barGradient)" rx="3" opacity="0.8" />
                        <rect x="50" y="35" width="15" height="35" fill="url(#barGradient)" rx="3" opacity="0.9" />
                        <rect x="75" y="40" width="15" height="30" fill="url(#barGradient)" rx="3" opacity="0.7" />
                        <rect x="100" y="30" width="15" height="40" fill="url(#barGradient)" rx="3" opacity="1" />
                        <rect x="125" y="38" width="15" height="32" fill="url(#barGradient)" rx="3" opacity="0.8" />
                        <path
                          d="M32 57 L57 52 L82 55 L107 50 L132 54"
                          stroke="#065f46"
                          strokeWidth="3"
                          fill="none"
                          strokeDasharray="3,3"
                        />
                        <text x="32" y="18" fontSize="8" fill="#374151" textAnchor="middle">
                          ENG
                        </text>
                        <text x="57" y="18" fontSize="8" fill="#374151" textAnchor="middle">
                          SALES
                        </text>
                        <text x="82" y="18" fontSize="8" fill="#374151" textAnchor="middle">
                          MKT
                        </text>
                        <text x="107" y="18" fontSize="8" fill="#374151" textAnchor="middle">
                          HR
                        </text>
                        <text x="132" y="18" fontSize="8" fill="#374151" textAnchor="middle">
                          OPS
                        </text>
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Pay equity insights</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center mb-2">
                  <Brain className="h-5 w-5 text-purple-600 mr-2" />
                  <strong className="text-sm text-gray-900">Powered by HR Houdini AI</strong>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Once your data is uploaded, chat with our specialized HR AI to uncover insights instantly. Ask
                  questions like:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    "What's our turnover rate by department?"
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    "Show me compensation gaps"
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleFileUploadClick}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>File Upload</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </UploadLayout>
    </UploadProvider>
  )
}
