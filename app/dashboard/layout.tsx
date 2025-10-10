"use client"
import type React from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/user-context" 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

    // const [userName, setUserName] = useState<string>("")
    
  // const { user} = useUserContext()
  // let userName= user.name;
  //   useEffect(() => {
  //     if (typeof window !== "undefined") {
  //       // const storedName = localStorage.getItem("user_name")
  //       userName = user.name
  //       // setUserName(storedName || "Maya Jackson")
  //     }
  //   }, [])
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userName={"Maya Jackson"} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
