"use client";
import type React from "react"
import { useState } from "react";
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { UserContextProvider } from "@/contexts/user-context"
import { Amplify, ResourcesConfig } from 'aws-amplify';
import amplifyConfig from '../lib/amplify-config';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { BfcacheHandler } from '@/components/BfcacheHandler';
import SurveySuccessModal from '@/components/surveyForm/SurveySuccessModal'; // ADD THIS
import DynamicSurveyModal from '@/components/surveyForm/mainSurveyModal/DynamicSurveyModal'; // UPDATED
import { useSurveyModal } from "@/hooks/use-survey-modal";
import { SurveyErrorBoundary } from "@/components/surveyForm/surveyErrorHandler/SurveyErrorBoundary"; // ADD THIS
import SurveyErrorFallback from '@/components/surveyForm/surveyErrorHandler/SurveyErrorFallback';

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
  const { showSurvey, closeSurvey } = useSurveyModal();
  const [showSuccess, setShowSuccess] = useState(false);
  Amplify.configure(amplifyConfig as ResourcesConfig)
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
          <BfcacheHandler />
          <SurveyErrorBoundary>
            <DynamicSurveyModal 
              isOpen={showSurvey} 
              onClose={closeSurvey} 
              onSuccess={() => setShowSuccess(true)}/>
            {/* Success Modal - Separate, controlled by layout */}
            <SurveySuccessModal 
              isOpen={showSuccess} 
              onClose={() => setShowSuccess(false)} 
            />
          </SurveyErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <UserContextProvider>
              <DashboardProvider>{children}</DashboardProvider></UserContextProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
