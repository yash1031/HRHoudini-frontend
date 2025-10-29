"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { apiFetch } from "@/lib/api/client";

function VerifyContent() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [verified, setVerified] = useState<string|null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const token: string|null = searchParams.get("token")
        if(!token){
            setIsLoading(false)
            setError("Token Not available")
            return
        }
        const user_id: string|null = searchParams.get("user_id")
        if(!user_id){
            setIsLoading(false)
            setError("UserId Not available")
            return
        }
        verifyEmail(token, user_id)
    }, [searchParams])

    const verifyEmail = async (token: string, user_id: string) => {
        try{
            const responseVerifyEmail = await fetch("/api/auth/sign-up/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token,
                    user_id: user_id,
                }),
            })

            const dataVerifyEmail = await responseVerifyEmail.json()
            const verifyEmailData = await dataVerifyEmail.data
            console.log("verifyEmailData", verifyEmailData)

            if(!responseVerifyEmail.ok){
                if(verifyEmailData.error === "Email Already Verified"){
                    setIsLoading(false)
                    setVerified("Email Already Verified")
                    console.error("Email Already Verified")
                }
                else{
                    setIsLoading(false)
                    setError(verifyEmailData.error || "Could not verify Email")
                    console.error("Error verifying user email")
                }
                return
            }
            console.log("Email verified successfully")
            
            if (dataVerifyEmail.redirectUrl) {
                window.location.href = dataVerifyEmail.redirectUrl
            } else {
                router.push('/')
            }
        } catch (err) {
            setIsLoading(false)
            setError("An unexpected error occurred. Please try again.")
            console.error("Verification error:", err)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center max-w-md mx-auto p-6">
                {isLoading ? (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600 text-lg">Verifying your email...</p>
                    </>
                ) : error ? (
                    <>
                        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Verification Failed</h2>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Home
                        </button>
                    </>
                ) : verified ? (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Verification Succeeded</h2>
                        <p className="text-slate-600 mb-4">{verified}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </button>
                    </>
                ) : (
                    <>
                        {/* <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" /> */}
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">Email Verification in progress..</h2>
                        {/* <p className="text-slate-600">Redirecting to login...</p> */}
                    </>
                )}
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">Loading...</p>
                </div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    )
}