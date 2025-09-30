"use client";
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserContextProvider } from "@/contexts/user-context"
// import { AmplifyProvider } from "@/components/AmplifyProvider"
import { Amplify, ResourcesConfig } from 'aws-amplify';
import amplifyConfig from '../lib/amplify-config';

const inter = Inter({ subsets: ["latin"] })

// export const metadata: Metadata = {
//   title: "HR Houdini - Insights & Analytics",
//   description: "Transform your HR data into actionable insights",
//   generator: "v0.dev",
// }




export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  Amplify.configure(amplifyConfig as ResourcesConfig)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <AmplifyProvider> */}
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <UserContextProvider>{children}</UserContextProvider>
          </ThemeProvider>
        {/* </AmplifyProvider> */}
      </body>
    </html>
  )
}
