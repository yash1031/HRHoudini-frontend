"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUserContext } from "@/contexts/user-context"
import { useSearchParams } from "next/navigation"
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
import { useState, useEffect } from "react"

interface NavigationHeaderProps {
  /** Optional override for user name */
  userName?: string
  /** Optional override for company name */
  company?: string
}
interface LoggedUser {
  name: string,
  email: string,
  company: string,
  role: string,
  onboarding: string,
}

interface NavItem {
  label: string,
  href: string,
}

/**
 * Global navigation header - shared across the entire app.
 * Matches the visual style of the production dashboard header.
 */
export function NavigationHeader({ userName, company }: NavigationHeaderProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user} = useUserContext()
  const [navItems, setNavItems]= useState<NavItem[]>([]);

  useEffect(()=>{
    const fileUploaded: string = searchParams.get("hasFile") || "false";
    const params = new URLSearchParams({
        hasFile: fileUploaded,
        showWelcome: "false",
    })
    const href= `/dashboard?${params.toString()}`
    setNavItems([{ label: "Dashboard", href: href }])

  }, [])

  const isDashboardActive = (pathname: string, href: string) => {
    // Commented below if block
    return pathname.startsWith(href)
  }

  const displayName = userName || user.name || "User"

  // Show loading state if context is still loading and no props provided
  if (user.isLoading && !userName && !company) {
    return (
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-6 shadow-sm border-b">
        {/* Logo */}
        <Link href={`/onboarding-upload-only`} className="flex items-center">
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
            isDashboardActive(pathname, href) ? (
                <span className={cn("px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700")}>
                  {label}
                </span>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {label}
                </Link>
              )
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
        sessionStorage.clear();
        
        // Redirect immediately
        window.location.href = '/';
        
      } catch (error) {
        console.error('Sign out failed:', error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }
    };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-6 shadow-sm border-b">
      {/* Logo */}
      <Link href={`/onboarding-upload-only`} className="flex items-center">
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
          isDashboardActive(pathname, href) ? (
                <span className={cn("px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700")}>
                  {label}
                </span>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {label}
                </Link>
              )
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50">
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
            <Link href={`/dashboard/profile?${searchParams.toString()}`} className="flex items-center w-full">   
          {/* <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed"> */}
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link href={`/dashboard/account?${searchParams.toString()}`} className="flex items-center w-full">
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
    </header>
  )
}