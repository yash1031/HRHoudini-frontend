"use client"
import type React from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { useEffect, useState } from "react";

export default function DashboardUO1Layout({
  children,
}: {
  children: React.ReactNode
}) {
    const [userName, setUserName] = useState<string>("")
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const storedName = localStorage.getItem("user_name")
        setUserName(storedName || "")
      }
    }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userName={userName || ""} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
