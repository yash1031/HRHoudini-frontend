"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Building2, Users, Settings, Play, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ScenarioBuilder } from "@/components/scenario-builder"
import { ScenarioTile } from "@/components/scenario-tile"

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
}

export default function AdminDemoPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [scenarios, setScenarios] = useState<DemoScenario[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [companiesRes, personasRes, scenariosRes] = await Promise.all([
        fetch("/api/demo/companies"),
        fetch("/api/demo/personas"),
        fetch("/api/demo/scenarios"),
      ])

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(Array.isArray(companiesData) ? companiesData : companiesData.companies || [])
      }

      if (personasRes.ok) {
        const personasData = await personasRes.json()
        setPersonas(Array.isArray(personasData) ? personasData : personasData.personas || [])
      }

      if (scenariosRes.ok) {
        const scenariosData = await scenariosRes.json()
        setScenarios(Array.isArray(scenariosData) ? scenariosData : scenariosData.scenarios || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load demo data",
        variant: "destructive",
      })
    }
  }

  const handleDeleteScenario = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scenario?")) return

    try {
      const response = await fetch(`/api/demo/scenarios?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Demo scenario deleted successfully",
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete scenario")
      }
    } catch (error) {
      console.error("Error deleting scenario:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete demo scenario",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img src="/hr-houdini-final.png" alt="HR HOUDINI - Powered by PredictiveHR" className="h-16" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Administration</h1>
          <p className="text-xl text-gray-600 mb-6">Manage demo scenarios, companies, and personas</p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/dashboard/login">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="scenarios" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scenarios">Demo Scenarios</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Demo Scenarios</h2>
                <p className="text-gray-600">Create and manage demo scenarios for different use cases</p>
              </div>
              <ScenarioBuilder companies={companies} personas={personas} onScenarioChange={fetchData} />
            </div>

            <div className="grid gap-6">
              {scenarios.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Demo Scenarios</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first demo scenario to get started with HR Houdini.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                scenarios.map((scenario) => (
                  <ScenarioTile
                    key={scenario.id}
                    scenario={scenario}
                    companies={companies}
                    personas={personas}
                    onDelete={handleDeleteScenario}
                    onScenarioChange={fetchData}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Companies</h2>
              <p className="text-gray-600">Available company profiles for demo scenarios</p>
            </div>
            <div className="grid gap-4">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>{company.name}</span>
                      <Badge variant="outline">{company.industry}</Badge>
                      <Badge variant="outline">{company.size}</Badge>
                    </CardTitle>
                    <CardDescription>{company.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personas" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personas</h2>
              <p className="text-gray-600">Available user personas for demo scenarios</p>
            </div>
            <div className="grid gap-4">
              {personas.map((persona) => (
                <Card key={persona.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>{persona.name}</span>
                      <Badge variant="outline">{persona.role}</Badge>
                      <Badge variant="outline">{persona.company_size}</Badge>
                    </CardTitle>
                    <CardDescription>{persona.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-gray-600">Configure demo environment settings</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Demo Configuration</span>
                </CardTitle>
                <CardDescription>Adjust settings for the demo environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-refresh">Auto-refresh data</Label>
                    <p className="text-sm text-gray-500">Automatically refresh demo data every 5 minutes</p>
                  </div>
                  <Switch id="auto-refresh" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mock-responses">Mock AI responses</Label>
                    <p className="text-sm text-gray-500">Use pre-configured responses for demo purposes</p>
                  </div>
                  <Switch id="mock-responses" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}
