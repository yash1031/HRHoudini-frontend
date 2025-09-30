"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { personas } from "@/lib/demo-config"

interface UserContextData {
  name: string
  email: string
  company: string
  role: string
  persona: string
  avatar: string
  isLoading: boolean
}

interface UserContextType {
  user: UserContextData
  updateUser: (updates: Partial<UserContextData>) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  isUserGoogleLoggedIn: boolean
  setIsUserGoogleLoggedIn: (token: boolean) => void
  renewAccessToken: () => Promise<string | null>
  isTokenValid: (token: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Persona to role title mapping
const PERSONA_ROLE_MAPPING: { [key: string]: string } = {
  "hr-generalist": "HR Generalist",
  "hr-business-partner": "HR Business Partner",
  "talent-acquisition": "Senior Recruiter",
  chro: "CHRO",
  "people-ops": "People Operations",
  "compensation-analyst": "Compensation Analyst",
  "diversity-inclusion": "Diversity & Inclusion",
  "hr-analyst": "HR Analyst",
  recruiter: "Recruiter",
  sourcer: "Sourcer",
  "recruiting-coordinator": "Recruiting Coordinator",
  "team-lead": "Team Lead",
  manager: "Manager",
  director: "Director",
  vp: "VP",
  ceo: "CEO",
}

// Function to get user name from persona and company
function getUserFromPersonaAndCompany(persona: string, company: string): { name: string; role: string } {
  // First try to find in personas object
  if (company && personas[company]) {
    const companyPersonas = personas[company]

    // Map persona key to role title for matching
    const roleTitle = PERSONA_ROLE_MAPPING[persona]
    if (roleTitle) {
      const matchingPersona = companyPersonas.find((p) => p.role === roleTitle)
      if (matchingPersona) {
        return { name: matchingPersona.name, role: matchingPersona.role }
      }
    }
  }

  // Fallback to persona role mapping
  const roleTitle = PERSONA_ROLE_MAPPING[persona] || persona.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Default names for common personas if not found in company data
  const defaultNames: { [key: string]: string } = {
    "hr-generalist": "Maya Jackson",
    "talent-acquisition": "Sasha Kim",
    "team-lead": "James Patel",
    chro: "Dr. Patricia Williams",
  }

  const name = defaultNames[persona] || "Demo User"

  return { name, role: roleTitle }
}

// Function to generate avatar initials
function generateAvatarInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Function to decode JWT and check if it's expired
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error decoding token:", error)
    return true // Consider invalid tokens as expired
  }
}

// Function to validate token format and expiration
function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  
  // Check if it's a valid JWT format (3 parts separated by dots)
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  // Check if token is not expired
  return !isTokenExpired(token)
}

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextData>({
    name: "Demo User",
    email: "",
    company: "Demo Company",
    role: "User",
    persona: "",
    avatar: "DU",
    isLoading: true,
  })
  const [isUserGoogleLoggedIn, setIsUserGoogleLoggedIn]= useState(true);

  const pathname = usePathname()
  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] UserContext pathname:", pathname)

    const isUploadOnlyScenario =
      pathname === "/dashboard-upload-only" ||
      (pathname.startsWith("/dashboard/") && localStorage.getItem("upload-only-scenario") === "true")

    if (pathname === "/dashboard-upload-only") {
      localStorage.setItem("upload-only-scenario", "true")
    }

    if (isUploadOnlyScenario) {
      console.log("[v0] Setting Upload-Only user data")
      setUser({
        name: "Maya Jackson",
        email: "maya.jackson@healthserv.com",
        company: "HealthServ Solutions",
        role: "HR Generalist",
        persona: "hr-generalist---upload-only",
        avatar: "MJ",
        isLoading: false,
      })
      return
    }

    if (!pathname.startsWith("/dashboard")) {
      localStorage.removeItem("upload-only-scenario")
    }

    // Parse URL params from the current location string
    const params = new URLSearchParams(window.location.search)

    const persona = params.get("persona")
    const company = params.get("company")

    let userData: Partial<UserContextData> = {}

    // Try to load from localStorage first
    try {
      const savedOnboarding = localStorage.getItem("hr-houdini-onboarding")
      if (savedOnboarding) {
        const onboardingData = JSON.parse(savedOnboarding)
        if (onboardingData.userContext) {
          userData = {
            name: onboardingData.userContext.name || "",
            email: onboardingData.userContext.email || "",
            company: onboardingData.userContext.company || "",
            role: onboardingData.userContext.role || "",
            persona: onboardingData.userContext.role?.toLowerCase().replace(" ", "-") || "",
          }
        }
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error)
    }

    // Override with URL params if available
    if (persona || company) {
      const personaKey = persona || userData.persona || "hr-generalist"
      const companyName = company || userData.company || "HealthServ Solutions"

      const { name, role } = getUserFromPersonaAndCompany(personaKey, companyName)

      userData = {
        ...userData,
        name,
        company: companyName,
        role,
        persona: personaKey,
      }
    }

    // Generate avatar initials
    const avatar = userData.name ? generateAvatarInitials(userData.name) : "DU"

    // Set final user data
    const finalUser = {
      name: userData.name || "Demo User",
      email: userData.email || "",
      company: userData.company || "Demo Company",
      role: userData.role || "User",
      persona: userData.persona || "",
      avatar,
      isLoading: false,
    }

    console.log("[v0] Setting final user data:", finalUser)
    setUser(finalUser)
  }, [pathname])

    // Initialize access token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token")
    if (savedToken && validateToken(savedToken)) {
      setAccessTokenState(savedToken)
    } else if (savedToken) {
      // Remove invalid token from localStorage
      localStorage.removeItem("access_token")
    }
  }, [])

  const updateUser = (updates: Partial<UserContextData>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      // Regenerate avatar if name changed
      if (updates.name) {
        updated.avatar = generateAvatarInitials(updates.name)
      }
      return updated
    })
  }

  // Function to set access token (updates both state and localStorage)
  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token)
    if (token) {
      localStorage.setItem("access_token", token)
    } else {
      localStorage.removeItem("access_token")
    }
  }

    // Function to check if token is valid
  const isTokenValid = (token: string): boolean => {
    return validateToken(token)
  }

  // Function to renew access token, need to add syntax for Authorization header into it
  const renewAccessToken = async (): Promise<string | null> => {
    try {
      console.log("Attempting to renew access token...")
      
      const response = await fetch("/api/auth/sign-in/renew-tokens", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: "include", // Include cookies (refresh_token)
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.access_token && validateToken(data.access_token)) {
          setAccessToken(data.access_token)
          console.log("Access token renewed successfully")
          return data.access_token
        } else {
          console.error("Invalid access token received from renewal")
          setAccessToken(null)
          return null
        }
      } else {
        console.error("Failed to renew access token:", response.status)
        setAccessToken(null)
        return null
      }
    } catch (error) {
      console.error("Error renewing access token:", error)
      setAccessToken(null)
      return null
    }
  }

  return <UserContext.Provider value={{ user, 
      updateUser, 
      accessToken, 
      setAccessToken, 
      renewAccessToken, 
      isTokenValid,
      isUserGoogleLoggedIn,
      setIsUserGoogleLoggedIn  }}>
        {children}
      </UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider")
  }
  return context
}
