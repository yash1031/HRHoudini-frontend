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
import { useUserContext } from "@/contexts/user-context" 
// import { ScenarioBuilder } from "@/components/scenario-builder"
// import { ScenarioTile } from "@/components/scenario-tile"
import LoginPage from "./login/page"

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

export default function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [personas, setPersonas] = useState<Persona[]>([])
  const [scenarios, setScenarios] = useState<DemoScenario[]>([])
  const [scenarioFilter, setScenarioFilter] = useState<"active" | "inactive" | "all">("active")
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const { isTokenValid, renewAccessToken, setAccessToken } = useUserContext()
  useEffect(() => {
    // fetchData()
    checkIfUserLoggedIn()
  }, [])


  const checkIfUserLoggedIn = async () =>{
    const access_token= localStorage.getItem("id_token");
    if(!access_token) console.log("access_token not available");

    if (isTokenValid(access_token)) {
      setIsUserLoggedIn(true);
      window.location.href= '/onboarding-upload-only'
      console.log("Token is valid, user logged in")
    } else {
        console.log("Token expired or invalid, attempting renewal...")
        const newToken = await renewAccessToken()
        if (newToken) {
          console.log("New token set successfully", newToken)
          setIsUserLoggedIn(true);
        } else {
          console.log("Token renewal failed, user needs to re-login")
        }
    }
  }

  return <LoginPage></LoginPage>
}
