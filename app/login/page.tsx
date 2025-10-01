"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { Amplify, ResourcesConfig } from 'aws-amplify';
// import amplifyConfig from '../../lib/amplify-config';
import { BarChart3, TrendingUp, Users, MessageCircle, CloudCog } from "lucide-react"
import { signInWithRedirect, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { useUserContext } from "@/contexts/user-context" 

// Google Icon Component
const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [isSignup, setIsSignup] = useState(false)
  const [magicCodeRequested, setMagicCodeRequested] = useState(false);
  const [isCodeVerRequest, setIsCodeVerRequest] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailExistError, setEmailExistError] = useState("");
  const [emailNotExistError, setEmailNotExistError] = useState("");
  const { setIsUserGoogleLoggedIn } = useUserContext()

  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyEmail: "",
    company: "",
    role: "",
  })

  const demoPersonas = [
    { name: "Maya J.", email: "maya.jackson@healthserv.com", role: "HR Generalist" },
    { name: "Maya J.", email: "maya.jackson@healthserv.com", role: "HR Generalist - Upload Only" },
    { name: "James P.", email: "james.patel@techcorp.com", role: "Customer Success" },
    { name: "Sasha K.", email: "sasha.kim@techflow.com", role: "Recruiter" },
  ]

  const paramsDemoPerson = new URLSearchParams({
          name: "Maya Jackson",
          email: "maya.jackson@healthserv.com",
          company: "HealthServ Solutions",
          role: "hr-generalist---upload-only",
          onboarding: "true",
        })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try{
      // Simulate login process
      if(formData.companyEmail === 'maya.jackson@healthserv.com'){
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          if (selectedPersona && formData.name && formData.companyEmail && formData.company) {
            const params = new URLSearchParams({
              name: formData.name,
              email: formData.companyEmail,
              company: formData.company,
              role: formData.role || selectedPersona.toLowerCase().replace(/\s+/g, "-"),
              onboarding: "true",
            })

            if (selectedPersona === "HR Generalist - Upload Only") {
              window.location.href = `/onboarding-upload-only?${params.toString()}`
            } else {
              window.location.href = `/onboarding?${params.toString()}`
            }
          } else {
            // Regular login - go to dashboard
            window.location.href = "/dashboard"
          }
        }, 1500)
        return
      }  
      
      const res = await fetch("/api/auth/sign-in/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMagicCodeRequested(true)
        setIsLoading(false)
        console.log("Magic code sent successfully")
      } else {
        setIsLoading(false)
        setEmailNotExistError("Account does not exist. Enter valid email.");
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          setEmailNotExistError("");
        }, 5000)
        console.error("Sign-in error: Account does");
      }
    }catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  const handlePersonaSelect = (persona: (typeof demoPersonas)[0]) => {
    setEmail(persona.email)
    setSelectedPersona(persona.role)

    // If HR Generalist is selected, transition to signup and populate Maya's info
    if (persona.role === "HR Generalist" || persona.role === "HR Generalist - Upload Only") {
      setIsSignup(true)
      setFormData({
        name: "Maya Jackson",
        companyEmail: "maya.jackson@healthserv.com",
        company: "HealthServ Solutions",
        role: persona.role === "HR Generalist - Upload Only" ? "" : "hr-generalist",
      })
    }
  }

  const handleCreateAccount = () => {
    setIsSignup(true)
    // After a brief delay, animate back to login with persona email
    // setTimeout(() => {
    //   setIsSignup(false)
    //   // Keep the selected persona email if one was chosen
    //   if (selectedPersona) {
    //     // Email is already set from persona selection
    //   }
    // }, 2000)
  }

  const handleBackToLogin = () => {
    setIsSignup(false)
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate account creation process
      if(formData.companyEmail=== 'maya.jackson@healthserv.com' ){
        setTimeout(() => {
          // Animate back to login with the email populated
          setIsSignup(false)
          if (formData.companyEmail) {
            setEmail(formData.companyEmail)
          }
          setIsLoading(false)
          // Don't automatically redirect - wait for user to click Sign In
        }, 1500)
        return
      }
      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.name,          // state variable from form input
          company_email: formData.companyEmail,  // state variable from form input
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Account created successfully:", data);
        setEmail(formData.companyEmail)
        //Redirect to login or dashboard if needed
        setIsSignup(false)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        setEmailExistError("Email already exist. Please enter a valid email.");
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          setEmailExistError("");
        }, 5000)
        console.error("Signup error:", data.error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }

  }

  const handleVerifyCode = async () => {
    try {
      setIsVerifying(true);
      const res = await fetch("/api/auth/sign-in/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
        credentials: "include",
      });
      console.log(`code entered is ${code}`)
      const data = await res.json();

      if (res.ok && data.success) {
        console.log("HandleVerifyCode is successful, data is:", JSON.stringify(data), "res status:", res.status)
        localStorage.setItem("access_token", data.access_token)
        localStorage.setItem("user_id", data.user_id)
        localStorage.setItem("user_name", `${data.first_name} ${data.last_name}`)
        window.location.href = `/onboarding-upload-only?${paramsDemoPerson.toString()}`;
        setIsVerifying(false);
        console.log("Magic code verified successfully")
      } else {
        setIsVerifying(false);
        setErrorMessage("The code is incorrect. Please check your email.");
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          setErrorMessage("");
        }, 5000)
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage("Something went wrong. Try again.");
    }
  };

  const handleBackToLoginFromMagicCode = () => {
    setMagicCodeRequested(false);
    setIsCodeVerRequest(false);
    setEmail("");
    setCode("");
    setErrorMessage("");
  };

    // Google OAuth handlers
  const handleGoogleSignIn = async () => {
    // Amplify.configure(amplifyConfig as ResourcesConfig)
    try {
      setIsUserGoogleLoggedIn(true);
      await signInWithRedirect({
        provider: 'Google',
        customState: paramsDemoPerson.toString() 
      });
      
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    // Amplify.configure(amplifyConfig as ResourcesConfig)
    try {
      setIsUserGoogleLoggedIn(true);
      await signInWithRedirect({
        provider: 'Google',
        customState: paramsDemoPerson.toString() 
      });
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#488AF4" }}>
      {/* Floating Logo Pill */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-full px-7 py-4 shadow-lg border border-gray-200">
          <img src="/hr-houdini-final.png" alt="HR HOUDINI - Powered by PredictiveHR" className="h-10" />
        </div>
      </div>

      {/* Header - now just the colored bar */}

      <div className="flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Value Proposition */}
          <div className="text-white space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Transform Your HR Data Into Actionable Insights</h1>
              <div className="flex items-center justify-center lg:justify-start gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white font-semibold">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white font-semibold">Reliable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white font-semibold">Compliant</span>
                </div>
              </div>
              <p className="text-xl text-blue-100 leading-relaxed">
                Upload your HR data and get instant analytics, predictive insights, and natural language answers to your
                most important people questions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-blue-100">
                    Get instant insights from your HRIS, recruiting, and engagement data
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Predictive Insights</h3>
                  <p className="text-sm text-blue-100">
                    Identify at-risk employees and trends before they become problems
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Natural Language Queries</h3>
                  <p className="text-sm text-blue-100">Ask questions in plain English and get instant answers</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Role-Based Dashboards</h3>
                  <p className="text-sm text-blue-100">Customized views for CHROs, HR managers, and recruiters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white shadow-xl relative">
              <div className="relative w-full h-full">
                {/* Login Form - Front Side */}
                <div
                  className={`transition-all duration-700 ${isSignup || magicCodeRequested ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100"}`}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-600">
                      Sign in to access your HR analytics dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>

                      {emailNotExistError && <p className="text-red-500 text-sm mt-3 text-center">{emailNotExistError}</p>}


                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>

                      {/* OR Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      {/* Google Sign In Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                      >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Continue with Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                        onClick={handleCreateAccount}
                      >
                        Create Account
                      </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">New to HR Houdini?</p>
                        <Button variant="outline" className="w-full bg-transparent mb-4">
                          Request Demo
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </CardContent>
                </div>

                {/* --- Magic Code Entry --- */}
                {!isSignup && magicCodeRequested  && (
                  <div className="transition-all duration-700 opacity-100 scale-100">
                    <CardHeader className="text-center pb-2">
                      {/* Email icon */}
                      <div className="mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Magic Link Login</CardTitle>
                      <CardDescription className="text-gray-600">
                        Enter the 10-digit verification code from your email (format: XXX-XXX-XXXX)
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="w-full">
                      <div className="space-y-4">
                        <div>
                          {/* <Label htmlFor="verification-code" className="text-sm font-medium text-gray-700 block mb-2">
                            Verification Code
                          </Label> */}
                          
                          {/* Formatted code input display */}
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                maxLength={3}
                                className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="XXX"
                                value={code.slice(0, 3)}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(/\D/g, '');
                                  setCode(newValue + code.slice(3));
                                }}
                              />
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                maxLength={3}
                                className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="XXX"
                                value={code.slice(3, 6)}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(/\D/g, '');
                                  setCode(code.slice(0, 3) + newValue + code.slice(6));
                                }}
                              />
                            </div>
                            <span className="text-gray-400 font-bold">-</span>
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                maxLength={4}
                                className="w-16 h-12 text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="XXXX"
                                value={code.slice(6, 10)}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(/\D/g, '');
                                  setCode(code.slice(0, 6) + newValue);
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* <p className="text-xs text-gray-500 text-center mb-4">
                            Enter the 10-digit code from your email (format: XXX-XXX-XXXX)
                          </p> */}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={handleBackToLoginFromMagicCode}
                            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            Back
                          </Button>
                          <Button 
                            disabled={isVerifying}
                            onClick={handleVerifyCode} 
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-300"
                          >
                            {isVerifying ? "Verifying..." : "Verify"}
                          </Button>
                        </div>

                        {errorMessage && <p className="text-red-500 text-sm mt-3 text-center">{errorMessage}</p>}
                        
                        {/* Success message */}
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-2">
                              <p className="text-sm text-green-700">
                                If an account exists with this email, you will receive a login code shortly.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}

                {/* --- Success Screen --- */}
                {/* {!isSignup && magicCodeRequested && isCodeVerRequest && (
                  <div className="transition-all duration-700 opacity-100 scale-100">
                    <CardHeader className="text-center pb-2">
                      <div className="mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</CardTitle>
                      <CardDescription className="text-gray-600">
                        Welcome back, Yash Goyal!
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="w-full space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">User Information</p>
                            <p className="text-sm text-gray-600">Email: {email}</p>
                            <p className="text-sm text-gray-600">Session expires: 2025-09-27T14:46:35.526123</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-2">
                            <p className="text-sm text-green-700">
                              Your session is now securely stored and protected from XSS attacks.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={handleBackToLoginFromMagicCode}
                          className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleContinueToDashboard}
                          className="flex-1 bg-black hover:bg-gray-800 text-white"
                        >
                          Continue to Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                )} */}

                {/* Signup Form - Back Side */}
                <div
                  className={`transition-all duration-700 ${isSignup ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"}`}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create HR Houdini Account</CardTitle>
                    <CardDescription className="text-gray-600">
                      Join thousands of HR professionals using data-driven insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          required
                          className="w-full"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyEmail" className="text-sm font-medium text-gray-700">
                          Company Email
                        </Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          placeholder="Enter your company email"
                          required
                          className="w-full"
                          value={formData.companyEmail}
                          onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                          Company
                        </Label>
                        <Input
                          id="company"
                          type="text"
                          placeholder="Enter your company name"
                          required
                          className="w-full"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>

                      {selectedPersona !== "HR Generalist - Upload Only" && (
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                            Role
                          </Label>
                          <select
                            id="role"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          >
                            <option value="">Select your role</option>
                            <option value="hr-generalist">HR Generalist</option>
                            <option value="customer-success-manager">Customer Success Manager</option>
                            <option value="senior-recruiter">Senior Recruiter</option>
                          </select>
                        </div>
                      )}

                      {emailExistError && <p className="text-red-500 text-sm mt-3 text-center">{emailExistError}</p>}

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>

                      {/* OR Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>

                      {/* Google Sign Up Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignUp}
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                      >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        Sign up with Google
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                        onClick={handleBackToLogin}
                      >
                        Back to Sign In
                      </Button>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* <div className="absolute bottom-0 left-0 right-0 bg-blue-900 py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Quick Demo Access</h3>
            <p className="text-sm text-blue-100 mb-4">
              Experience HR Houdini instantly with pre-configured demo scenarios
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {demoPersonas.map((persona) => {
                const isDisabled = persona.role === "Customer Success" || persona.role === "Recruiter"

                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => !isDisabled && handlePersonaSelect(persona)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                        : selectedPersona === persona.role
                          ? "bg-blue-600 text-white shadow-lg transform scale-105"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{persona.role}</span>
                      <span className="text-xs opacity-75">{persona.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
}
