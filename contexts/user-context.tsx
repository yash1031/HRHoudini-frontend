"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react"

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
  // New fields for KPI management
  kpis: KpiItem[];
  setKpis: React.Dispatch<React.SetStateAction<KpiItem[]>>;
}

// 1. Define a TypeScript interface for your KPI items
interface KpiItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType; // since you're storing component references like TrendingDown
  category: string;
}

// 2. Define your available KPIs as a typed constant
const AVAILABLE_KPIS: KpiItem[] = [
  {
    id: "turnover-rate",
    label: "Turnover Rate",
    description: "Monthly/quarterly employee turnover",
    icon: TrendingDown,
    category: "retention",
  },
  {
    id: "employee-productivity",
    label: "Employee Productivity Rate",
    description: "Output per employee metrics",
    icon: TrendingUp,
    category: "performance",
  },
  {
    id: "salary-increase",
    label: "Salary Increase Rate",
    description: "Compensation growth trends",
    icon: DollarSign,
    category: "compensation",
  },
  {
    id: "engagement-score",
    label: "Employee Engagement Score",
    description: "Survey-based engagement metrics",
    icon: Users,
    category: "engagement",
  },
  {
    id: "training-cost",
    label: "Training Cost Per Employee",
    description: "L&D investment per person",
    icon: Award,
    category: "development",
  },
  {
    id: "revenue-per-employee",
    label: "Revenue Per Employee",
    description: "Business impact per person",
    icon: DollarSign,
    category: "business",
  },
  {
    id: "cost-per-hire",
    label: "Cost Per Hire",
    description: "Total recruiting investment",
    icon: Briefcase,
    category: "recruiting",
  },
  {
    id: "absenteeism-rate",
    label: "Absenteeism Rate",
    description: "Unplanned absence tracking",
    icon: Calendar,
    category: "wellness",
  },
  {
    id: "offer-acceptance",
    label: "Offer Acceptance Rate",
    description: "Recruiting conversion success",
    icon: Target,
    category: "recruiting",
  },
  {
    id: "time-to-fill",
    label: "Time to Fill",
    description: "Days to fill open positions",
    icon: Clock,
    category: "recruiting",
  },
];


const UserContext = createContext<UserContextType | undefined>(undefined)


export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextData>({
    name: "",
    email: "",
    company: "", 
    role: "",
    persona: "",
    avatar: "",
    isLoading: true,
  })

  const [kpis, setKpis] = useState<KpiItem[]>(AVAILABLE_KPIS);
  

  const updateUser = (updates: Partial<UserContextData>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      return updated
    })
  }

  return <UserContext.Provider value={{ 
      user, 
      updateUser, 
      kpis,
      setKpis  }}>
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
