"use client"

import type React from "react"
import { useCallback,useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Menu, X  } from "lucide-react"
// import type { OnboardingScenarioConfig } from "@/lib/demo-config"
import FileUploadHistory from './FileUploadHistory'
import { useUserContext } from "@/contexts/user-context"
import { apiFetch } from "@/lib/api/client";
import Link from "next/link"
import { Settings, User, Building, LogOut, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {signOut } from 'aws-amplify/auth';
import { connectWebSocket, addListener, removeListener, closeWebSocket } from '@/lib/ws';

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface OnboardingTemplateProps {
  userContext: UserContext
  // scenarioConfig: OnboardingScenarioConfig
  children: React.ReactNode
  useLabels?: boolean
  stepLabels?: string[]
  totalSteps?: number
  hideProgress?: boolean
}

export function OnboardingTemplate({
  userContext,
  // scenarioConfig,
  children,
  useLabels = false,
  stepLabels = [],
  totalSteps = 5,
  hideProgress = false,
}: OnboardingTemplateProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [fileUploadHistoryData, setFileUploadHistoryData] = useState<any>([])
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName]= useState<String>("")
  
  // Close side panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (sidePanelRef.current && !sidePanelRef.current.contains(target)) {
        setIsSidePanelOpen(false)
      }
    }

    if (isSidePanelOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSidePanelOpen])

  useEffect(()=>{
    console.log("Starting the connection")
    fetchFileUploadHistory()
    setDisplayName(localStorage.getItem("user_name")||"")
  },[])

  const fetchFileUploadHistory = useCallback(async () =>{
    try{
     // Store file upload history
      
      // let access_token= await getValidIdToken()
      // let access_token= localStorage.getItem("id_token")
      // if(!access_token) console.log("access_token not available")
      // console.log("access_token in /api/insights/fetch-all-sessions", access_token)
      // const resFetchFileUploadHistory = await apiFetch("/api/insights/fetch-all-sessions", {
      let resFetchFileUploadHistory;
      try{
        resFetchFileUploadHistory = await apiFetch("/api/insights/fetch-all-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                  user_id: localStorage.getItem("user_id"),
            }),
        });
        const dataFileUploadHistory= await resFetchFileUploadHistory.data.sessions
        
        console.log("All user files are fetched successfully");

        console.log("FileUploadHistoryData", dataFileUploadHistory)

        let fileUploadData: any =[];
        dataFileUploadHistory.map((data:any, id:any)=>{
          // // Step 1: Extract the filename (after the last '/')
          // const fileNameWithExt = data.s3_location.split("/").pop() || ""; // → "SharpMedian_V1.csv"

          // // Step 2: Remove the extension (everything after the last '.')
          // const fileNameWithoutExt = fileNameWithExt.split(".").slice(0, -1).join("."); // → "SharpMedian_V1"
          fileUploadData.push({id: id, session_id: data.session_id, name: data.file_name + " " + data.created_at, timestamp: data.created_at, isFavorite: false, cardsQueries: data.cards, chartsQueries: data.charts, parquetUrl: data.presigned_url})
        })
        console.log("fileUploadData is", fileUploadData)
        setFileUploadHistoryData(fileUploadData)
      }catch (error) {
        // If apiFetch throws, the request failed
        console.error("In onboarding-template, unable to fetch all fileUpload sessions for the user")
        return;
      }
      // const dataFetchFileUploadHistory= await resFetchFileUploadHistory.data
        
      // console.log("All user files are fetched successfully");
      // const dashboardHistoryData= await dataFetchFileUploadHistory.data;
      // let fileUploadData: any =[];
      // dashboardHistoryData.map((data:any, id:any)=>{
      //   // Step 1: Extract the filename (after the last '/')
      //   const fileNameWithExt = data.s3_location.split("/").pop() || ""; // → "SharpMedian_V1.csv"

      //   // Step 2: Remove the extension (everything after the last '.')
      //   const fileNameWithoutExt = fileNameWithExt.split(".").slice(0, -1).join("."); // → "SharpMedian_V1"
      //   fileUploadData.push({id: id, session_id: data.session_id, name: fileNameWithoutExt + " " + data.created_at, timestamp: data.created_at, isFavorite: false, dashboardJSON: data.analytical_json_output})
      // })
      // console.log("fileUploadData is", fileUploadData)
      // setFileUploadHistoryData(fileUploadData)
    }catch (error) {
      // If apiFetch throws, the request failed
      console.error("Received Error", error);
      return;
    }

  },[])

  // Inside the component, memoize the file upload data
  const memoizedFileUploadHistoryData = useMemo(() => fileUploadHistoryData, [fileUploadHistoryData])

  // Memoize the close handler
  const handleCloseSidePanel = useCallback(() => {
    setIsSidePanelOpen(false)
  }, [])

  const contextValue = {
    step,
    setStep,
    uploadedFile,
    setUploadedFile,
    userContext,
  }

  const handleSignOut = async () => {
      try {
        const user_id = localStorage.getItem('user_id');
        const is_google_logged_in = localStorage.getItem("is-google-logged-in") === "true";
  
        // Fire-and-forget request with keepalive
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id, is_google: is_google_logged_in}),
          credentials: 'include',
          // keepalive: true, // Keeps request alive even after page unload
        }).catch(err => console.error('Sign-out request failed:', err));
  
        // Handle Google sign-out (this is fast)
        if (is_google_logged_in) {
          console.log("User is getting google signed out")
          signOut().catch(err => console.error('Google sign-out failed:', err));
        }
  
        // Clear localStorage
        localStorage.clear();
        
        // Redirect immediately
        window.location.href = '/';
        
      } catch (error) {
        console.error('Sign out failed:', error);
        localStorage.clear();
        window.location.href = '/';
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsSidePanelOpen(true)}
        className="fixed top-6 left-6 z-40 p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Side Panel Overlay */}
      {isSidePanelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity" />
      )}

      {/* Side Panel */}
      <div
        ref={sidePanelRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <FileUploadHistory 
          fileUploadHistoryData={memoizedFileUploadHistoryData} 
          onClose={handleCloseSidePanel} 
        />
      </div>
      {/* User Dropdown Menu - Top Right */}
      <div className="fixed top-6 right-6 z-40">
      <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50  border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="flex flex-col items-end text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{displayName}</span>
                      {/* <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          planInfo.className,
                        )}
                      >
                        {planInfo.label}
                      </span> */}
                    </div>
                    {/* <span className="text-xs text-gray-500">{displayCompany}</span> */}
                  </div>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* <DropdownMenuItem className="opacity-50 cursor-not-allowed"> */}
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/profile`} className="flex items-center w-full">   
                {/* <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed"> */}
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild>
                  <Link href={`/dashboard/account`} className="flex items-center w-full">
                    <Building className="h-4 w-4 mr-2" />
                    Account
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => {
                  // Your sign out logic here
                  handleSignOut();
                }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HR Houdini, {userContext.name.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-600">Let's transform your data into strategic HR insights</p>

          {!hideProgress && (
            <>
              {useLabels ? (
                <div className="flex justify-center mt-6 space-x-12">
                  {stepLabels.slice(0, totalSteps).map((label, index) => {
                    const stepNum = index + 1
                    const isActive = step === stepNum
                    const isCompleted = step > stepNum

                    return (
                      <div key={stepNum} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                        <div className={`mt-2 text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                          {label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Numbered Steps Design (Original)
                <div className="flex justify-center mt-6 space-x-4">
                  {Array.from({ length: totalSteps }, (_, index) => index + 1).map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                      </div>
                      {stepNum < totalSteps && (
                        <div className={`w-12 h-0.5 ml-4 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Step Content */}
        <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>
      </div>
    </div>
  )
}

// Context for sharing state between steps
import { createContext, useContext } from "react"

interface OnboardingContextType {
  step: number
  setStep: (step: number) => void
  uploadedFile: any
  setUploadedFile: (file: any) => void
  userContext: UserContext
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingTemplate")
  }
  return context
}
