"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Building, Users, Calendar, Download } from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client";

export default function AccountPage() {
  const { user } = useUserContext()
  const [tokensRemaining, setTokensRemaining]= useState<String>('');
  const [fileUploads, setFileUploads]= useState<String>('');
  const [chatMessages, setChatMessages]= useState<String>('');
  const [isEditing, setIsEditing] = useState(false)
  const { checkIfTokenExpired } = useUserContext()

  // Mock trial data
  const trialDaysLeft = 3
  const trialProgress = ((30 - trialDaysLeft) / 30) * 100

  const handleSave = () => {
    setIsEditing(false)
  }
  useEffect(()=>{
    getUserTokens()
  },[])

  const getUserTokens = async () =>{
    try{
      console.log("CheckFileUploadQuotas Triggered")
      // let access_token= localStorage.getItem("id_token")
      // if(!access_token) console.log("access_token not available")
      // console.log("", access_token)
      let currentPlanRes
      try{
        currentPlanRes = await apiFetch("/api/billing/get-current-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                  user_id: localStorage.getItem("user_id")
            }),
          });
      }catch (error) {
      // If apiFetch throws, the request failed
        console.log("Unable to check remaining tokens")
        return;
      }


      // if(!currentPlanRes.ok){
      //   console.log("Unable to check remaining tokens")
      //   return;
      // }

      // const dataCurrentPlan = await currentPlanRes.json();
      // const currentPlanData= await dataCurrentPlan?.data
      const currentPlanData= await currentPlanRes?.data
      
      console.log("Successfully fetched user's current plan. Result is ", JSON.stringify(currentPlanData))
      setTokensRemaining(currentPlanData?.subscriptions[0]?.remaining_tokens)
      setChatMessages(currentPlanData?.subscriptions[0]?.usage_stats?.chat_messages)
      setFileUploads(currentPlanData?.subscriptions[0]?.usage_stats?.file_uploads)
      // if(currentPlanData.subscriptions[0].remaining_tokens<tokensNeeded){
      //   setError("File upload quotas are exhausted.")
      //   return;
      // }
    }catch (error) {
        // If apiFetch throws, the request failed
        console.error("Received Error ", error);
        return;
      }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your billing, and subscription</p>
        {/* <p className="text-gray-600 mt-2">Manage your company information, billing, and subscription</p> */}
      </div>

      <div className="space-y-6">
        {/* Current Plan & Trial Status */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <div>
                  <CardTitle className="text-orange-900">Free Trial</CardTitle>
                  <CardDescription className="text-orange-700">{trialDaysLeft} days remaining</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Trial Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-700">Trial Progress</span>
                <span className="text-orange-700">{30 - trialDaysLeft} of 30 days used</span>
              </div>
              <Progress value={trialProgress} className="h-2" />
            </div>
            <div className="flex gap-3">
              <Button disabled={true} className="bg-orange-600 hover:bg-orange-700">
              {/* <Button className="bg-orange-600 hover:bg-orange-700" asChild> */}
                <Link href="/dashboard/plans">Upgrade to Starter - $49/month</Link>
              </Button>
              <Button variant="outline" className="border-orange-300 text-orange-700 bg-transparent" asChild>
                <Link href="/dashboard/plans">View All Plans</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Update your organization details</CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? "Save Changes" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={companyData.industry}
                  onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Input
                  id="size"
                  value={companyData.size}
                  onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={companyData.address}
                onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Monitor your current usage during the trial period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Chat Messages</span>
                  <span className="font-medium">{chatMessages} used</span>
                </div>
                <div className="text-xs text-gray-500">Unlimited during trial</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">File Uploads</span>
                  <span className="font-medium">{fileUploads} uploaded</span>
                </div>
                <div className="text-xs text-gray-500">Unlimited during trial</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tokens remaining</span>
                  <span className="font-medium">{tokensRemaining} tokens</span>
                </div>
                <div className="text-xs text-gray-500">25,000 tokens in Freemium</div>
              </div>
              {/* <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reports Generated</span>
                  <span className="font-medium">8 reports</span>
                </div>
                <div className="text-xs text-gray-500">Unlimited during trial</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium">1 member</span>
                </div>
                <div className="text-xs text-gray-500">Single user during trial</div>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your invoices</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No billing history yet</p>
              <p className="text-xs text-gray-400 mt-1">Invoices will appear here after your first payment</p>
            </div>
          </CardContent>
        </Card> */}

        {/* Team Management */}
        {/* <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage team members and permissions</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Upgrade Required</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Team collaboration available on paid plans</p>
              <p className="text-xs text-gray-400 mt-1">Invite team members and manage permissions</p>
              <Button className="mt-4 bg-transparent" variant="outline">
                Learn More About Team Features
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
