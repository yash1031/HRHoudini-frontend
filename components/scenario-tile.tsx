"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Building2,
  Users,
  Edit,
  Trash2,
  ArrowRight,
  Copy,
  ChevronDown,
  ChevronRight,
  Target,
  BarChart3,
  Users2,
} from "lucide-react"
import Link from "next/link"
import { ScenarioBuilder } from "@/components/scenario-builder"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"

interface Company {
  id: string
  name: string
  industry: string
  size: string
  description: string
}

interface Persona {
  id: string
  name: string
  role: string
  company_size: string
  description: string
}

interface DemoScenario {
  id: string
  name: string
  description: string
  company_id: string
  target_personas: string[]
  config: any
  is_active: boolean
  company_name?: string
  company?: Company
  persona?: Persona
  core_needs?: any
  user_journey?: any
  value_delivered?: any
  url?: string
}

interface ScenarioTileProps {
  scenario: DemoScenario
  companies: Company[]
  personas: Persona[]
  onDelete: (id: string) => void
  onScenarioChange: () => void
  isFirstTile?: boolean // Add prop to identify first tile
}

export function ScenarioTile({
  scenario,
  companies,
  personas,
  onDelete,
  onScenarioChange,
  isFirstTile = false,
}: ScenarioTileProps) {
  const [fullUrl, setFullUrl] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (scenario.url && typeof window !== "undefined") {
      const baseUrl = window.location.origin
      const constructedUrl = scenario.url.startsWith("/") ? `${baseUrl}${scenario.url}` : scenario.url

      setFullUrl(constructedUrl)
    }
  }, [scenario.url])

  const handleDuplicateScenario = async () => {
    setIsDuplicating(true)
    try {
      const duplicateData = {
        name: `${scenario.name} Duplicate`,
        description: scenario.description,
        company_id: scenario.company_id,
        target_personas: scenario.target_personas,
        core_needs: scenario.core_needs || [],
        user_journey: scenario.user_journey || [],
        value_delivered: scenario.value_delivered || [],
        url: scenario.url,
        config: scenario.config || {},
        is_active: false,
      }

      const response = await fetch("/api/demo/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicateData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Scenario duplicated successfully",
        })
        onScenarioChange()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to duplicate scenario")
      }
    } catch (error) {
      console.error("Error duplicating scenario:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate scenario",
        variant: "destructive",
      })
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleToggleActive = async () => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/demo/scenarios/${scenario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !scenario.is_active }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Scenario ${!scenario.is_active ? "activated" : "deactivated"} successfully`,
        })
        onScenarioChange()
      } else {
        throw new Error("Failed to update scenario status")
      }
    } catch (error) {
      console.error("Error updating scenario status:", error)
      toast({
        title: "Error",
        description: "Failed to update scenario status",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getCompanyInfo = (companyId: string) => {
    return companies.find((c) => c.id === companyId)
  }

  const companyInfo = getCompanyInfo(scenario.company_id)

  const getScenarioTypeInfo = () => {
    const name = scenario.name.toLowerCase()
    if (name.includes("onboarding") || name.includes("upload")) {
      return {
        type: "Onboarding",
        icon: Users2,
        color: "bg-green-50 border-green-200",
        badgeColor: "bg-green-100 text-green-800 border-green-200",
        description: "Quick setup and data upload workflow",
      }
    } else if (name.includes("analysis") || name.includes("insight")) {
      return {
        type: "Analysis",
        icon: BarChart3,
        color: "bg-blue-50 border-blue-200",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
        description: "Deep dive analytics and reporting",
      }
    } else {
      return {
        type: "General",
        icon: Target,
        color: "bg-purple-50 border-purple-200",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        description: "Comprehensive HR workflow",
      }
    }
  }

  const scenarioTypeInfo = getScenarioTypeInfo()
  const TypeIcon = scenarioTypeInfo.icon

  const getPrimaryBusinessValue = () => {
    if (Array.isArray(scenario.value_delivered) && scenario.value_delivered.length > 0) {
      const firstValue = scenario.value_delivered[0]
      return typeof firstValue === "object" ? firstValue.description : firstValue
    }
    return "Streamline HR processes and gain actionable insights"
  }

  return (
    <Card className={`${scenarioTypeInfo.color} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <TypeIcon className="w-4 h-4 text-gray-600" />
              <Badge className={`${scenarioTypeInfo.badgeColor} text-xs`}>{scenarioTypeInfo.type}</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={isUpdatingStatus}
              className={`text-xs px-2 py-1 h-6 ${
                scenario.is_active
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600 border-gray-300"
              }`}
            >
              {scenario.is_active ? "Active" : "Inactive"}
            </Button>
          </div>

          {isExpanded && (
            <div className="flex items-center space-x-1 ml-2">
              <ScenarioBuilder
                companies={companies}
                personas={personas}
                onScenarioChange={onScenarioChange}
                editingScenario={scenario}
                triggerButton={
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-6 bg-transparent">
                    <Edit className="w-3 h-3" />
                  </Button>
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicateScenario}
                disabled={isDuplicating}
                className="text-xs px-2 py-1 h-6 bg-transparent"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(scenario.id)}
                className="text-xs px-2 py-1 h-6"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {scenario.name}
                </CardTitle>
                <div className="text-gray-400">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>

              <div className="bg-white/70 rounded-md p-2 mb-2 border border-gray-200">
                <div className="flex items-start gap-2">
                  <Target className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 leading-relaxed">{getPrimaryBusinessValue()}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{scenario.company_name || companyInfo?.name || "Unknown Company"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{scenario.target_personas?.[0] || "Unknown"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {isClient && fullUrl ? (
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7">
                  <Link href={fullUrl}>
                    Run
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              ) : (
                <Button
                  disabled
                  size="sm"
                  className="bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed text-xs px-3 py-1 h-7"
                >
                  Run
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <CardDescription className="text-gray-600 mb-4">{scenario.description}</CardDescription>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-300 text-xs">
              {Array.isArray(scenario.core_needs) ? scenario.core_needs.length : 0} Core Needs
            </Badge>
            <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-300 text-xs">
              {Array.isArray(scenario.user_journey) ? scenario.user_journey.length : 0} Journey Steps
            </Badge>
            <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-300 text-xs">
              {Array.isArray(scenario.value_delivered) ? scenario.value_delivered.length : 0} Value Points
            </Badge>
          </div>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer mb-3 hover:bg-white/50 p-3 rounded-lg transition-colors border border-gray-200">
                <h4 className="font-medium text-gray-900">Detailed Specifications</h4>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 bg-white/30 p-4 rounded-lg border border-gray-200">
              {Array.isArray(scenario.core_needs) && scenario.core_needs.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2 text-sm">Core Needs</h5>
                  <div className="flex flex-wrap gap-2">
                    {scenario.core_needs.map((need: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        {need}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h5 className="font-medium text-gray-800 mb-3 text-sm">User Journey</h5>
                {Array.isArray(scenario.user_journey) && scenario.user_journey.length > 0 ? (
                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${scenario.user_journey.length}, 1fr)` }}
                  >
                    {scenario.user_journey.map((step: any, index: number) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 w-full text-center min-h-[80px] flex flex-col justify-center">
                          <div className="text-xs font-medium text-gray-600 mb-1">Step {index + 1}</div>
                          <div className="text-sm text-gray-800 font-medium leading-tight">
                            {typeof step === "string" ? step : step.title || `Step ${index + 1}`}
                          </div>
                          {typeof step === "object" && step.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{step.description}</div>
                          )}
                        </div>
                        {index < scenario.user_journey.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No user journey steps defined</div>
                )}
              </div>

              {Array.isArray(scenario.value_delivered) && scenario.value_delivered.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2 text-sm">Value Delivered</h5>
                  <div className="space-y-2">
                    {scenario.value_delivered.map((value: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {typeof value === "object" ? value.category : "Value"}
                        </Badge>
                        <span className="text-sm text-gray-700 flex-1">
                          {typeof value === "object" ? value.description : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  )
}
