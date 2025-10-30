"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {signOut } from 'aws-amplify/auth';
// import { personas } from "@/lib/demo-config"
import {
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react"
import { apiFetch } from "@/lib/api/client";

interface UserContextData {
  name: string
  email: string
  company: string
  role: string
  persona: string
  avatar: string
  isLoading: boolean
}

interface UserContextType {
  user: UserContextData
  updateUser: (updates: Partial<UserContextData>) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  isUserGoogleLoggedIn: boolean
  getValidIdToken: () => Promise<string | null>
  setIsUserGoogleLoggedIn: (token: boolean) => void
  // renewAccessToken: () => Promise<string | null>
  isTokenValid: (token: string) => boolean
  checkIfTokenExpired: () => string | null

  // New fields for KPI management
  kpis: KpiItem[];
  setKpis: React.Dispatch<React.SetStateAction<KpiItem[]>>;
}

// 1. Define a TypeScript interface for your KPI items
interface KpiItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType; // since you're storing component references like TrendingDown
  category: string;
}

// 2. Define your available KPIs as a typed constant
const AVAILABLE_KPIS: KpiItem[] = [
  {
    id: "turnover-rate",
    label: "Turnover Rate",
    description: "Monthly/quarterly employee turnover",
    icon: TrendingDown,
    category: "retention",
  },
  {
    id: "employee-productivity",
    label: "Employee Productivity Rate",
    description: "Output per employee metrics",
    icon: TrendingUp,
    category: "performance",
  },
  {
    id: "salary-increase",
    label: "Salary Increase Rate",
    description: "Compensation growth trends",
    icon: DollarSign,
    category: "compensation",
  },
  {
    id: "engagement-score",
    label: "Employee Engagement Score",
    description: "Survey-based engagement metrics",
    icon: Users,
    category: "engagement",
  },
  {
    id: "training-cost",
    label: "Training Cost Per Employee",
    description: "L&D investment per person",
    icon: Award,
    category: "development",
  },
  {
    id: "revenue-per-employee",
    label: "Revenue Per Employee",
    description: "Business impact per person",
    icon: DollarSign,
    category: "business",
  },
  {
    id: "cost-per-hire",
    label: "Cost Per Hire",
    description: "Total recruiting investment",
    icon: Briefcase,
    category: "recruiting",
  },
  {
    id: "absenteeism-rate",
    label: "Absenteeism Rate",
    description: "Unplanned absence tracking",
    icon: Calendar,
    category: "wellness",
  },
  {
    id: "offer-acceptance",
    label: "Offer Acceptance Rate",
    description: "Recruiting conversion success",
    icon: Target,
    category: "recruiting",
  },
  {
    id: "time-to-fill",
    label: "Time to Fill",
    description: "Days to fill open positions",
    icon: Clock,
    category: "recruiting",
  },
];

interface TokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const UserContext = createContext<UserContextType | undefined>(undefined)


function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error decoding token:", error)
    return true // Consider invalid tokens as expired
  }
}

// Function to validate token format and expiration
function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  
  // Check if it's a valid JWT format (3 parts separated by dots)
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  // Check if token is not expired
  return !isTokenExpired(token)
}

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextData>({
    name: "",
    email: "",
    company: "", 
    role: "",
    persona: "",
    avatar: "",
    isLoading: true,
  })

  const [kpis, setKpis] = useState<KpiItem[]>(AVAILABLE_KPIS);
  const [isUserGoogleLoggedIn, setIsUserGoogleLoggedIn]= useState(false);

  const pathname = usePathname()
  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  const handleSignOut = async () => {
      try {
        // Get user_id from localStorage
        const user_id = localStorage.getItem('user_id');
  
        localStorage.clear()
        
        // Redirect to login page
        window.location.href = '/';
        // router.push('/')
  
        // let access_token= localStorage.getItem("id_token")
        // if(!access_token) console.log("access_token not available")

        // Call the sign-out route
        const response =  apiFetch('/api/auth/sign-out', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id }),
          credentials: 'include', // Important for HTTPOnly cookies
        });

        const responseSignout= await response;
  
        // Remove data from local Storage on success
        if (responseSignout.ok) {
          if(isUserGoogleLoggedIn){
            setIsUserGoogleLoggedIn(false);
            await signOut();
            console.log("Google User Signed out")
          }
          else{
            console.log("User Signed out")
          }
        } else {
          // Even on API failure, clean up client-side for security
          console.error('Sign out API failed, but cleaning up client-side');
        }
        
      } catch (error) {
        console.error('Sign out failed:', error);
        window.location.href = '/';
      }
    };

  const checkIfTokenExpired= async () =>{
    console.log("checkIfTokenExpired triggered")
    const access_token_expiry= localStorage.getItem("access_token_expiry")
    const refresh_token_expiry= localStorage.getItem("refresh_token_expiry")
    //Check If access token expired
    let access_token;
    // let access_token= localStorage.getItem("id_token");
    const now = new Date();
    const isRefreshTokenExpired = refresh_token_expiry 
    ? new Date(refresh_token_expiry) < new Date(now.getTime() - (5.5 * 60 * 60 * 1000)) 
    : true;
    if(isRefreshTokenExpired){
      console.log("refreshToken expired")
      // handleSignOut()
      access_token= null
      return
    }
    const isAccessTokenExpired = access_token_expiry 
    ? new Date(access_token_expiry) < new Date(now.getTime() - (5.5 * 60 * 60 * 1000)) 
    : true;
    if(isAccessTokenExpired){
      console.log("isAccessTokenExpired true")
      console.log("accessToken expiry", access_token_expiry ? new Date(access_token_expiry) : 'null')
      console.log("time now is", new Date() )
      // const access_token= await renewAccessToken()
      // access_token= renewed_access_token
      console.log("new access_tokens is", access_token)
    }
    else{
      // access_token= accessToken
      console.log("isAccessTokenExpired no")
      access_token= localStorage.getItem("id_token")
    }
    return access_token;
  }
  
  useEffect(() => {
    const savedToken = localStorage.getItem("access_token")
    if (savedToken && validateToken(savedToken)) {
      setAccessTokenState(savedToken)
    } else if (savedToken) {
      // Remove invalid token from localStorage
      // localStorage.removeItem("access_token")
      // localStorage.removeItem("access_token_expiry")
      // localStorage.removeItem("refresh_token_expiry")

    }
  }, [])

  const updateUser = (updates: Partial<UserContextData>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      return updated
    })
  }

  // Function to set access token (updates both state and localStorage)
  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token)
    if (token) {
      localStorage.setItem("access_token", token)
    } else {
      // localStorage.removeItem("access_token")
      // localStorage.removeItem("access_token_expiry")
      // localStorage.removeItem("refresh_token_expiry")
    }
  }

    // Function to check if token is valid
  const isTokenValid = (token: string): boolean => {
    return validateToken(token)
  }

  // Function to renew access token, need to add syntax for Authorization header into it
  // const renewAccessToken = async (): Promise<string | null> => {
  //   try {
  //     console.log("Attempting to renew access token...")
  //     console.log("Attempting to renew access token access token ", accessToken)
      
  //     const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/auth/refresh-tokens`, {
  //     // const response = await apiFetch("/api/auth/sign-in/renew-tokens", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include", // Include cookies (refresh_token)
  //     })

  //     if (response.ok) {
  //       const data = await response.json()
  //       console.log("Could renew tokens")
  //       if (data.access_token && validateToken(data.access_token)) {
  //         setAccessToken(data.access_token)
  //         localStorage.setItem("access_token_expiry", data.access_token_expiry)
  //         localStorage.setItem("refresh_token_expiry", data.refresh_token_expiry)
  //         console.log("Access token renewed successfully")
  //         return data.access_token
  //       } else {
  //         console.error("Invalid access token received from renewal")
  //         // setAccessToken(null)
  //         return null
  //       }
  //     } else {
  //       console.error("Failed to renew access token:", response.status)
  //       // setAccessToken(null)
  //       // signout the user
  //       return null
  //     }
  //   } catch (error) {
  //     console.error("Error renewing access token:", error)
  //     // setAccessToken(null)
  //     return null
  //   }
  // }

  // utils/auth/tokenManager.ts



/**
 * Decode JWT token without verification (just to read payload)
 */
function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired or will expire in the next 60 seconds
 */
function isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp <= (currentTime + bufferSeconds);
}

/**
 * Get refresh token from cookies
 */
// function getRefreshTokenFromCookie(): string | null {
//   if (typeof document === 'undefined') return null;
  
//   const cookies = document.cookie.split(';');
//   for (const cookie of cookies) {
//     const [name, value] = cookie.trim().split('=');
//     if (name === 'rt') {
//       return value;
//     }
//   }
//   return null;
// }

/**
 * Call the refresh token API
 */
async function refreshTokens(): Promise<TokenResponse | null> {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/refresh-token`,
      // "/api/auth/sign-in/renew-tokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies (refresh_token)
      }
    );

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return null;
    }

    const data: TokenResponse = await response.json();
    
    // Store new tokens in localStorage
    if (data.id_token) {
      console.log("New id_token", data.id_token)
      localStorage.setItem('id_token', data.id_token);
    }
    if (data.access_token) {
      console.log("New access_token", data.access_token)
      localStorage.setItem('access_token', data.access_token);
    }
    
    return data;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return null;
  }
}

/**
 * Sign out the user
 */
async function signOut(): Promise<void> {
  // Clear localStorage tokens
  // handleSignOut()
  localStorage.clear()

  // localStorage.removeItem('id_token');
  // localStorage.removeItem('access_token');
  
  // Redirect to login page
  window.location.href = '/';
}

/**
 * Main function: Get valid ID token
 * Returns null if user needs to re-authenticate
 */
async function getValidIdToken(): Promise<string | null> {
  // 1. Try to get id_token from localStorage
  let idToken = localStorage.getItem('id_token');
  
  if (!idToken) {
    console.log('No id_token found in localStorage');
    // await signOut();
    return null;
  }

  // 2. Check if id_token is expired
  // if (!isTokenExpired(idToken)) {
  //   console.log("IdToken is not expired")
  //   // Token is still valid
  //   return idToken;
  // }

  console.log('id_token expired, attempting refresh...');

  // 3. Check if refresh_token exists in cookies
  // const refreshToken = getRefreshTokenFromCookie();
  
  // if (!refreshToken) {
  //   console.log('No refresh token found in cookies');
  //   // await signOut();
  //   return null;
  // }

  // 4. Refresh tokens
  const newTokens = await refreshTokens();
  
  if (!newTokens || !newTokens.id_token) {
    console.log('Failed to refresh tokens');
    // await signOut();
    return null;
  }

  // 5. Return new id_token
  return newTokens.id_token;
}

  return <UserContext.Provider value={{ 
      user, 
      updateUser, 
      accessToken, 
      setAccessToken, 
      // renewAccessToken, 
      isTokenValid,
      checkIfTokenExpired,
      getValidIdToken,
      isUserGoogleLoggedIn,
      setIsUserGoogleLoggedIn,
      kpis,
      setKpis  }}>
        {children}
      </UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider")
  }
  return context
}
