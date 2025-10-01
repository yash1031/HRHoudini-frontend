"use client"
import type React from "react"
import { NavigationHeader } from "@/components/navigation-header"
import { useEffect } from "react";
import { useState } from "react";

export default function DashboardUploadOnlyLayout({
  children,
}: {
  children: React.ReactNode
}) {
    // const [userName, setUserName] = useState(localStorage.getItem("user_name"));
    // const [userName, setUserName] = useState("Maya Jackson");

  // useEffect(() => {
  //   // Runs only in the browser
  //   const storedName = localStorage.getItem("user_name");
  //   if (storedName) {
  //     setUserName(storedName);
  //   }
  // }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader userName={localStorage.getItem("user_name")|| "Maya Jackson"} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
