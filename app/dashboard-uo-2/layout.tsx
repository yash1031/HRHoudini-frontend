"use client"
import type React from "react"
import { NavigationHeader } from "@/components/navigation-header"

export default function DashboardUO2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userName="Maya Jackson" />
      <main className="flex-1">{children}</main>
    </div>
  )
}
