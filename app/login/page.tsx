"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BarChart3, TrendingUp, Users, MessageCircle, CloudCog } from "lucide-react"
import { fetchAuthSession, signInWithRedirect} from 'aws-amplify/auth';
import { useUserContext } from "@/contexts/user-context"
import GoogleIcon from "@/public/google-icon"
import { useRouter } from "next/navigation"
import { setTokens } from "@/lib/auth/tokens";



export default function LoginPage() {
  const [email, setEmail] = useState<string>("")
  const [requestingToken, setRequestingToken] = useState<boolean>(false)
  const [creatingAccount, setCreatingAccount] = useState<boolean>(false)
  const [googleSignInInProgress, setGoogleSignInInProgress] = useState<boolean>(false)
  const [isSignup, setIsSignup] = useState<boolean>(false)
  const [magicCodeRequested, setMagicCodeRequested] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [verifyTokenError, setVerifyTokenError] = useState<string | null>(null);
  const [accountCreationError, setAccountCreationError] = useState<string | null>(null);
  const [tokenRequestError, setTokenRequestError] = useState<string | null>(null);
  const [agreedToTermsAndPrivacyPolicy, setAgreedToTermsAndPrivacyPolicy] = useState<boolean>(false);
  const [newsLetterSubscribed, setNewsLetterSubscribed] = useState<boolean>(false);
  const {updateUser} = useUserContext()
  const restrictAccountCreation= false

  useEffect(() => {
    const is_google_logged_in= localStorage.getItem("is-google-logged-in")==="true"?true: false;
    if(is_google_logged_in) {
      setGoogleSignInInProgress(true)
      handleGoogleAuthComplete()
    }
    window.addEventListener('unload', () => {});
  }, [])

  const handleGoogleAuthComplete = async () => {
    // try {
      const session = await fetchAuthSession()
      const idToken= session?.tokens?.idToken
      const idTokenPayload = session?.tokens?.idToken?.payload
      const accessToken = session?.tokens?.accessToken // Add this line
      const exp = idTokenPayload?.exp; // Get expiration times (Unix timestamp in seconds)
      // const refreshToken = session?.tokens?.refreshToken // Add this line
      console.log("Expiry received after google sign-in", exp)
      console.log("session", JSON.stringify(session))
      console.log("idToken", JSON.stringify(idToken))
      console.log("accessToken", JSON.stringify(accessToken))
      // Convert to seconds remaining from now      

      if (!idTokenPayload) {
        console.log("idTokenPayload empty")
        console.log("User is not logged in yet, removing is-google-logged-in")
        localStorage.removeItem("is-google-logged-in")
        setGoogleSignInInProgress(false)
        return;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      const secondsUntilExpiry = exp ? exp - nowInSeconds : 0;

      console.log('Expires in:', secondsUntilExpiry, 'seconds'); // e.g., 285 seconds

      const email= String(idTokenPayload?.email) 

      // Set access_token as secure HTTP-only cookie for middleware auth
      await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: String(accessToken),
          expiresIn: secondsUntilExpiry,
        }),
      });
      
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email  })
      });
      const data = await res.json();
      console.log("data.success", data.success, "res.ok", res.ok)
      if (res.ok && data.success) {
        console.log("Creating tokens is successful, data is:", JSON.stringify(data), "res status:", res.status)
        setTokens({
          accessToken: accessToken? String(accessToken) : "",         // from your backend
          idToken: idToken ? String(idToken) : "",// from Amplify session
          // If your sign-in returns expires_in (seconds), pass it:
          exp: secondsUntilExpiry
        });
        localStorage.setItem("user_id", data.user_id)
        localStorage.setItem("user_name", `${data.full_name}`)
        localStorage.setItem("user_email", email)
        window.location.href = `/onboarding-upload-only`;
      } else {
        console.log("Error setting up access token")
      }
      setGoogleSignInInProgress(false)

    // } catch (error) {
    //   console.error('Error fetching user after Google sign-in:', error)
    //   console.log('Removing is-google-logged-in')
    //   localStorage.removeItem("is-google-logged-in")
    //   setGoogleSignInInProgress(false)
    // }
  }

  
  const [formData, setFormData] = useState({
    name: "",
    companyEmail: "",
    newsLetterSubscribed: false,
    company: "",
    role: "",
  })

  const switchToAccountCreation = () => {
    setIsSignup(true)
  }

  const switchToLogin = () => {
    setIsSignup(false)
  }

  const switchToLoginFromTokenVerification = () => {
    setMagicCodeRequested(false);
    setEmail("");
    setCode("");
    setVerifyTokenError(null);
  };

  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingAccount(true)
    
    try {
      const responseCreateAccount = await fetch("/api/auth/sign-up/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({
          full_name: formData.name,          // state variable from form input
          company_email: formData.companyEmail,  // state variable from form input
          newsletter_subscribed: formData.newsLetterSubscribed
        }),
      });

      const dataCreateAccount = await responseCreateAccount.json();
      const createAccountData= await dataCreateAccount.data

      if (responseCreateAccount.ok) {
        console.log("user_id after account creation", createAccountData?.user?.user_id)
        // localStorage.setItem("user_id", createAccountData?.user?.user_id)
        console.log("Account created successfully:", createAccountData);
        setEmail(formData.companyEmail)
        //Redirect to login or dashboard if needed
        setIsSignup(false)
        setCreatingAccount(false)
        // setIsLoading(false)
      } else {
        console.log("Error creating the account", createAccountData);
        // setIsLoading(false)
        setCreatingAccount(false)
        setAccountCreationError(createAccountData.error.message);
        setTimeout(() => {
          setAccountCreationError(null);
        }, 5000)
        console.error("Signup error:", createAccountData.error.message);
        return;
      }
      console.log("Data returned by create-user API", createAccountData)
    } catch (err) {
        setAccountCreationError("Unknow Error. Please try again");
        setTimeout(() => {
          setAccountCreationError(null);
        }, 5000)
        setCreatingAccount(false)
        console.error("Unexpected error:", err);
    }

  }

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault()
    // setIsLoading(true)
    setRequestingToken(true)

    try{
      
      const res = await fetch("/api/auth/sign-in/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data= await res.json();
        console.log("Session is", data?.session)
        localStorage.setItem("user-session", data?.session)
        setMagicCodeRequested(true)
        // setIsLoading(false)
        setRequestingToken(false)
        console.log("Magic code sent successfully")
      } else {
        const data= await res.json();
        console.log("Eror recieved while sending code is", data)
        // setIsLoading(false)
        setRequestingToken(false)
        setTokenRequestError(data.error);
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          setTokenRequestError(null);
        }, 5000)
        console.error("Sign-in error: Account does not exists");
      }
    }catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  const handleVerifyCode = async () => {
    try {
      setIsVerifying(true);
      const res = await fetch("/api/auth/sign-in/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          code: code,
          session: localStorage.getItem("user-session"),
        }),
        credentials: "include",
      });
      console.log(`code entered is ${code}`)
      const data = await res.json();

      if (res.ok) {
      // if (res.ok && data.success) {
        console.log("HandleVerifyCode is successful, data is:", JSON.stringify(data))
        localStorage.removeItem("user-session")
        const expRaw = Number(data.expires_in); // you already store this as 'access_token_expiry'
        setTokens({
          accessToken: data.access_token,
          idToken: data.id_token,
          exp: isFinite(expRaw) ? expRaw : undefined, // supports either 'expires_in' or absolute 'exp'
        });

        const resSignIn = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email  })
        });
        const dataSignIn = await resSignIn.json();
        console.log( "resSignIn.ok", resSignIn.ok)
        console.log("full_name", dataSignIn.full_name, "user_email", email)
        if (resSignIn.ok ) {
          console.log("Login Successfuly:", JSON.stringify(dataSignIn), "res status:", resSignIn.status)
          localStorage.setItem("user_id", dataSignIn.user_id)
          localStorage.setItem("user_name", `${dataSignIn.full_name}`)
          localStorage.setItem("user_email", email)
          window.location.href = `/onboarding-upload-only`;
          setIsVerifying(false);
          console.log("User Logged In Successfully")
        } else {
          setIsVerifying(false);
          setVerifyTokenError("Failed To Login")
          setTimeout(() => {
            // Check if this is a persona login that should go to onboarding
            setVerifyTokenError(null);
          }, 5000)
          console.log("Error logging in")
        }
        
      } else {
        console.log("The code is incorrect. Please check your email.")
        setIsVerifying(false);
        setVerifyTokenError(data.error);
        setTimeout(() => {
          // Check if this is a persona login that should go to onboarding
          setVerifyTokenError(null);
        }, 5000)
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerifyTokenError("Something went wrong. Try again.")
    }
  };

    
  const handleGoogleSignUp = async () => {
    // Amplify.configure(amplifyConfig as ResourcesConfig)
    try {
      localStorage.setItem("is-google-logged-in","true");
      setGoogleSignInInProgress(true)
      console.log("Redirecting to Home Page")
      await signInWithRedirect({
        provider: 'Google',
        customState: JSON.stringify({ action: 'signup' })
      });
      
    } catch (error) {
      console.error('Error signing in:', error);
      
    }
  };
   
  const handleGoogleSignIn = async () => {
    // Amplify.configure(amplifyConfig as ResourcesConfig)
    try {
      localStorage.setItem("is-google-logged-in","true");
      setGoogleSignInInProgress(true)
      console.log("Redirecting to Home Page")
      await signInWithRedirect({
        provider: 'Google',
        customState: JSON.stringify({ action: 'signin' })
      });
      
    } catch (error) {
      console.error('Error signing in:', error);
      
    }
  };

  return (
    // <div className="relative min-h-screen" style={{ backgroundColor: "#488AF4" }}>
    <div className="relative min-h-screen flex flex-col" style={{ backgroundColor: "#488AF4" }}>
      {/* Floating Logo Pill */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white rounded-full px-7 py-4 shadow-lg border border-gray-200">
          <img src="/hr-houdini-final.png" alt="HR HOUDINI - Powered by PredictiveHR" className="h-10" />
        </div>
      </div>

      {/* Header - now just the colored bar */}

      {/* <div className="flex items-center justify-center min-h-screen px-6 py-12"> */}
      <div className="flex items-center justify-center flex-1 px-6 py-12 pb-48">
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

              {/* <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-lg p-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Role-Based Dashboards</h3>
                  <p className="text-sm text-blue-100">Customized views for CHROs, HR managers, and recruiters</p>
                </div>
              </div> */}
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
                    <form className="space-y-4">
                    {/* <form onSubmit={handleRequestToken} className="space-y-4"> */}
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

                      {tokenRequestError && <p className="text-red-500 text-sm mt-3 text-center">{tokenRequestError}</p>}


                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={requestingToken || !email || googleSignInInProgress}
                        onClick={handleRequestToken}
                      >
                        {requestingToken ? "Signing In..." : "Sign In"}
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
                      <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                        disabled={restrictAccountCreation || requestingToken|| googleSignInInProgress}
                      >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        {googleSignInInProgress? 'Signing in..': 'Continue with Google'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                        onClick={switchToAccountCreation}
                        disabled={restrictAccountCreation || requestingToken || googleSignInInProgress}
                      >
                        Create Account
                      </Button>
                      
                      {restrictAccountCreation && <p className="text-red-500 text-sm mt-3 text-center">Account creation is temporarily restricted</p>}
                      </>
                    </form>

                    {/* <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">New to HR Houdini?</p>
                        <Button variant="outline" className="w-full bg-transparent mb-4">
                          Request Demo
                        </Button>
                      </div>
                    </div> */}

                    {/* <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div> */}
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
                        Enter the 6-digit verification token from your email
                        {/* Enter the 10-digit verification code from your email (format: XXX-XXX-XXXX) */}
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
                                maxLength={6}
                                className="w-20 h-12 text-center border border-gray-300 rounded-md text-lg font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="XXXXXX"
                                value={code.slice(0, 6)}
                                onChange={(e) => {
                                  const newValue = e.target.value.replace(/\D/g, '');
                                  setCode(newValue + code.slice(6));
                                }}
                              />
                            </div>
                            {/* <span className="text-gray-400 font-bold">-</span>
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
                            </div> */}
                          </div>
                          
                          {/* <p className="text-xs text-gray-500 text-center mb-4">
                            Enter the 10-digit code from your email (format: XXX-XXX-XXXX)
                          </p> */}
                        </div>

                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={switchToLoginFromTokenVerification}
                            disabled={isVerifying}
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

                        {verifyTokenError && <p className="text-red-500 text-sm mt-3 text-center">{verifyTokenError}</p>}
                        
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
                                Please check your inbox. You would have receive a sign-in token. 
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                )}

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
                    <form onSubmit={handleAccountCreation} className="space-y-4">
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

                      {/* <div className="space-y-2">
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
                      )} */}
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="termsAndPolicy"
                          checked={agreedToTermsAndPrivacyPolicy}
                          onChange={(e) => setAgreedToTermsAndPrivacyPolicy(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          required
                        />
                        <label htmlFor="termsAndPolicy" className="text-sm text-gray-600">
                          By creating an account, you agree to our{" "}
                          <Link
                            href="/login/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/login/privacy-policy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="subscribeToNewsLetter"
                          checked={newsLetterSubscribed}
                          onChange={(e) => 
                            {
                              setNewsLetterSubscribed(e.target.checked)
                              setFormData({ ...formData, newsLetterSubscribed: e.target.checked})
                            }}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"    
                        />
                        <label htmlFor="subscribeToNewsLetter" className="text-sm text-gray-600">
                          Subscribe to our newsletter
                        </label>
                      </div>
                      {accountCreationError && <p className="text-red-500 text-sm mt-3 text-center">{accountCreationError}</p>}

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={creatingAccount|| googleSignInInProgress || !agreedToTermsAndPrivacyPolicy}
                      >
                        {creatingAccount ? "Creating Account..." : "Create Account"}
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
                        disabled={restrictAccountCreation || creatingAccount || googleSignInInProgress || !agreedToTermsAndPrivacyPolicy}
                      >
                        <GoogleIcon className="w-5 h-5 mr-3" />
                        {googleSignInInProgress? 'Signing up..': 'Sign up with Google'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full mt-3 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                        onClick={switchToLogin}
                        disabled={creatingAccount || googleSignInInProgress}
                      >
                        Back to Sign In
                      </Button>
                    </form>

                    {/* <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        By creating an account, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div> */}
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
