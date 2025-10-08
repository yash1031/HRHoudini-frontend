"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HRGeneralistUploadOnlyOnboarding } from "@/components/onboarding/scenarios/hr-generalist-upload-only-onboarding"
import {getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
// import Hub  from 'aws-amplify';
import Image from "next/image"
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

export default function OnboardingUploadOnlyPage() {
  const router = useRouter()
  const [userContext, setUserContext] = useState<UserContext | null>(null)

  useEffect(() => {
    
    onboardingFun()
  }, [])

    // Helper function to decode JWT payload  
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const onboardingFun1 = async () => {
    // Hub.listen('auth', (data: any) => {
    //       console.log("🔊 AUTH EVENT:", data.payload.event, data.payload);
    //     });
        // Fetch user attributes (includes Google data)
        const attributes = await fetchUserAttributes();
        console.log("attributes", attributes);
        // Get current authenticated user
        const currentUser = await getCurrentUser();
      const userDetails = {
        // userId: currentUser.userId, // Cognito sub
        // username: currentUser.username,
        email: attributes.email,
        // name: attributes.name,
        // picture: attributes.picture,
        // emailVerified: attributes.email_verified === 'true'
      };
      console.log("userDetails", userDetails);
  }

  const onboardingFun = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash.substring(1); // Remove #
    const params = new URLSearchParams(hash);
    const idToken = params?.get('id_token');

    if (idToken) {
      console.log("Logging in with Google, hash params are: ", params);
      try {
        let payload;
        if(idToken){
         payload = decodeJWT(idToken);
        }
        const userEmail = payload?.email;
        console.log('User email from Cognito:', userEmail);
          const res = await fetch("/api/auth/sign-in/socials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail  })
          });
          const data = await res.json();
          console.log("data.success", data.success, "res.ok", res.ok)

          if (res.ok && data.success) {
            console.log("Creating tokens is successful, data is:", JSON.stringify(data), "res status:", res.status)
            localStorage.setItem("access_token", data.access_token)
            localStorage.setItem("user_id", data.user_id)
            localStorage.setItem("user_name", `${data.first_name} ${data.last_name}`)

            const context = { name:  `${data.first_name} ${data.last_name}`, email: userEmail, company: "HealthServ Solutions", role: "hr-generalist---upload-only" };
            setUserContext(context);
          } else {
            console.log("Error setting up access token")
          }
      } catch (error) {
        console.error('Error parsing state:', error);
      }
    }
    else {
      console.log("State not present, inside else block")
      const name = urlParams.get("name")
      const email = urlParams.get("email")
      const company = urlParams.get("company")
      const role = urlParams.get("role")

      if (name && email && company && role) {
        const context = { name, email, company, role }
        setUserContext(context)
      }
    }
  }

  if (!userContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/hr-houdini-final.png" alt="HR Houdini Logo" width={100} height={100} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  return <HRGeneralistUploadOnlyOnboarding userContext={userContext} />
}
