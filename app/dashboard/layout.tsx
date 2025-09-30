import type React from "react"
import { NavigationHeader } from "@/components/navigation-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
