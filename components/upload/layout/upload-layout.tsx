"use client"

import { useCallback, useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Menu, Building, ChevronDown } from "lucide-react"
import FileUploadHistory from "@/components/onboarding/FileUploadHistory"
import { apiFetch } from "@/lib/api/client"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { signOut } from "aws-amplify/auth"
import { closeWebSocket } from "@/lib/ws"
import { signOutUser } from '@/lib/auth/sign-out'

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface UploadLayoutProps {
  children: React.ReactNode
  userContext: UserContext
  showWelcome?: boolean
}

export function UploadLayout({ children, userContext, showWelcome = true }: UploadLayoutProps) {
  const router = useRouter()
  const [fileUploadHistoryData, setFileUploadHistoryData] = useState<any>([])
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const sidePanelRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState<string>("")
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  // Close side panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
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

  useEffect(() => {
    console.log("Starting the connection")
    fetchFileUploadHistory()
    setDisplayName(localStorage.getItem("user_name") || "")
  }, [])

  const fetchFileUploadHistory = useCallback(async () => {
    setIsHistoryLoading(true)

    try {
      let resFetchFileUploadHistory
      try {
        resFetchFileUploadHistory = await apiFetch("/api/insights/fetch-all-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
          }),
        })
        const dataFileUploadHistory = await resFetchFileUploadHistory.data.sessions

        console.log("All user files are fetched successfully")

        let fileUploadData: any = []
        dataFileUploadHistory.map((data: any, id: any) => {
          console.log("In upload-layout, ai_suggested_questions received is", data.ai_suggested_questions)
          fileUploadData.push({
            id: id,
            session_id: data.session_id,
            name: data.file_name,
            timestamp: data.created_at,
            isFavorite: false,
            cardsQueries: data.cards,
            chartsQueries: data.charts,
            parquetUrl: data.presigned_url,
            aiSuggestedQuestions: data.ai_suggested_questions,
            rowCount: data.row_count,
          })
        })
        console.log("fileUploadData is", fileUploadData)
        setFileUploadHistoryData(fileUploadData)
      } catch (error) {
        console.error("In upload-layout, unable to fetch all fileUpload sessions for the user")
        return
      }
    } catch (error) {
      console.error("Received Error", error)
      return
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  const memoizedFileUploadHistoryData = useMemo(() => fileUploadHistoryData, [fileUploadHistoryData])

  const handleCloseSidePanel = useCallback(() => {
    setIsSidePanelOpen(false)
  }, [])

  // const handleSignOut = async () => {
  //   try {
  //     closeWebSocket()
  //     const user_id = localStorage.getItem("user_id")
  //     const is_google_logged_in = localStorage.getItem("is-google-logged-in") === "true"

  //     await fetch("/api/auth/sign-out", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ user_id, is_google: is_google_logged_in }),
  //       credentials: "include",
  //     }).catch((err) => console.error("Sign-out request failed:", err))

  //     if (is_google_logged_in) {
  //       console.log("User is getting google signed out")
  //       signOut().catch((err) => console.error("Google sign-out failed:", err))
  //     }

  //     localStorage.clear()
  //     sessionStorage.clear()

  //     window.location.href = "/"
  //   } catch (error) {
  //     console.error("Sign out failed:", error)
  //     localStorage.clear()
  //     sessionStorage.clear()
  //     window.location.href = "/"
  //   }
  // }

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
      {isSidePanelOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity" />}

      {/* Side Panel */}
      <div
        ref={sidePanelRef}
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <FileUploadHistory
          fileUploadHistoryData={memoizedFileUploadHistoryData}
          isLoading={isHistoryLoading}
          onClose={handleCloseSidePanel}
        />
      </div>

      {/* User Dropdown Menu - Top Right */}
      <div className="fixed top-6 right-6 z-40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50 border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <div className="flex flex-col items-end text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{displayName}</span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href={`/profile`} className="flex items-center w-full">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              {/* <Link href={`/account?${searchParams.toString()}`} className="flex items-center w-full"> */}
              <Link href={`/account`} className="flex items-center w-full">
                <Building className="h-4 w-4 mr-2" />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => signOutUser('/')}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header - Only show if showWelcome is true */}
        {showWelcome && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to HR Houdini, {userContext.name.split(" ")[0]}!
            </h1>
            <p className="text-lg text-gray-600">Let's transform your data into strategic HR insights</p>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
