"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUserContext } from "@/contexts/user-context"
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
import { useEffect } from "react"

interface NavigationHeaderProps {
  /** Optional override for user name */
  userName?: string
  /** Optional override for company name */
  company?: string
}

/**
 * Global navigation header - shared across the entire app.
 * Matches the visual style of the production dashboard header.
 */
export function NavigationHeader({ userName, company }: NavigationHeaderProps = {}) {
  const pathname = usePathname()
  const { user, isUserGoogleLoggedIn, setIsUserGoogleLoggedIn } = useUserContext()

  const loggedInUser = new URLSearchParams({
          name: localStorage.getItem("user_name")||'',
          email: localStorage.getItem("user_email")||'',
          company: 'HealthServ',
          role: user.role,
          onboarding: "true",
  })

  console.log("[v0] NavigationHeader - pathname:", pathname)
  console.log("[v0] NavigationHeader - user from context:", user)
  console.log("[v0] NavigationHeader - userName prop:", userName)
  console.log("[v0] NavigationHeader - company prop:", company)

  const navItems = [
    // { label: "Dashboard", href: "/dashboard" },
    { label: "Dashboard", href: "/dashboard-uo-1" }, //added
    // { label: "Projects", href: "/projects" }, // Hidden
    // { label: "Reports", href: "/reports" }, // Hidden
  ]

  const isDashboardActive = (pathname: string, href: string) => {
    // Commented below if block
    // if (href === "/dashboard") {
    //   return pathname === "/dashboard" || pathname === "/dashboard-upload-only"
    // }
    // if block added
    if (href === "/dashboard-uo-1") {
      return pathname === "/dashboard" || pathname === "/dashboard-upload-only"
    }
    return pathname.startsWith(href)
  }

  const displayName = userName || user.name || "User"
  // const displayCompany = company || user.company || "Demo Company" //Commented
  const displayCompany = company || user.company || "HealthServ" //Added
  const displayAvatar = user.avatar || "DU"

  console.log("[v0] NavigationHeader - displayName:", displayName)
  console.log("[v0] NavigationHeader - displayCompany:", displayCompany)

  const trialDaysLeft = 3
  const isOnTrial = trialDaysLeft > 0
  const planType = isOnTrial ? "trial" : "starter" // trial, starter, professional, enterprise

  const getPlanInfo = () => {
    if (isOnTrial) {
      const urgency = trialDaysLeft <= 2 ? "urgent" : "normal"
      return {
        label: `${trialDaysLeft} days left`,
        className:
          urgency === "urgent"
            ? "bg-orange-100 text-orange-800 border border-orange-200"
            : "bg-blue-100 text-blue-800 border border-blue-200",
      }
    }

    switch (planType) {
      case "starter":
        return { label: "Starter Plan", className: "bg-blue-100 text-blue-700 border border-blue-200" }
      case "professional":
        return { label: "Pro Plan", className: "bg-purple-100 text-purple-800 border border-purple-200" }
      case "enterprise":
        return { label: "Enterprise", className: "bg-amber-100 text-amber-800 border border-amber-200" }
      default:
        return { label: "Free", className: "bg-gray-100 text-gray-800 border border-gray-200" }
    }
  }

  const planInfo = getPlanInfo()

  // Show loading state if context is still loading and no props provided
  if (user.isLoading && !userName && !company) {
    return (
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-6 shadow-sm border-b">
        {/* Logo */}
        <Link href={`/onboarding-upload-only?${loggedInUser.toString()}`} className="flex items-center">
          <Image
            src="/hr-houdini-final.png"
            alt="HR HOUDINI - Powered by PredictiveHR"
            width={200}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Primary nav */}
        <nav className="hidden md:flex gap-8">
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isDashboardActive(pathname, href)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Loading user area */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    )
  }

  const shouldShowManageTiles = pathname === "/dashboard" || pathname === "/dashboard-upload-only"

  const handleSignOut = async () => {
    try {
      // Get user_id from localStorage
      const user_id = localStorage.getItem('user_id');

      // Call the sign-out route
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
        credentials: 'include', // Important for HTTPOnly cookies
      });

      // Remove tokens from localStorage on success
      if (response.ok) {
        // localStorage.removeItem('user_id');
        // localStorage.removeItem('access_token');
        localStorage.clear()
        if(isUserGoogleLoggedIn){
          setIsUserGoogleLoggedIn(false);
          await signOut();
          console.log("Google User Signed out")
        }
        else{
          console.log("User Signed out")
        }
        // Redirect to login page
        window.location.href = '/';
      } else {
        // Even on API failure, clean up client-side for security
        console.error('Sign out API failed, but cleaning up client-side');
        // localStorage.removeItem('user_id');
        // localStorage.removeItem('access_token');
        // window.location.href = '/';
      }
      
    } catch (error) {
      console.error('Sign out failed:', error);
      
      // Always clean up client-side tokens for security
      // localStorage.removeItem('user_id');
      // localStorage.removeItem('access_token');
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-6 shadow-sm border-b">
      {/* Logo */}
      {/* <Link href="/" className="flex items-center"> */}
      <Link href={`/onboarding-upload-only?${loggedInUser.toString()}`} className="flex items-center">
        <Image
          src="/hr-houdini-final.png"
          alt="HR HOUDINI - Powered by PredictiveHR"
          width={200}
          height={40}
          priority
          className="h-8 w-auto"
        />
      </Link>

      {/* Primary nav */}
      <nav className="hidden md:flex gap-8">
        {navItems.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isDashboardActive(pathname, href)
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50">
            <div className="flex flex-col items-end text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{displayName}</span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                    planInfo.className,
                  )}
                >
                  {planInfo.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">{displayCompany}</span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <User className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/account" className="flex items-center w-full">
              <Building className="h-4 w-4 mr-2" />
              Account
            </Link>
          </DropdownMenuItem>
          {shouldShowManageTiles && (
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Manage Tiles
            </DropdownMenuItem>
          )}
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
    </header>
  )
}
