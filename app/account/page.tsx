"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation";
import { getIdToken } from "@/lib/auth/tokens";
import { signOutUser } from "@/lib/auth/sign-out";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CreditCard, Building, Users, Calendar as CalendarIcon, Download, Trash2, Activity, ChevronDown } from "lucide-react"
import { useUserContext } from "@/contexts/user-context"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { apiFetch } from "@/lib/api/client"

interface AccountInfo {
  file_uploads_count: number
  chat_messages_count: number
  reports_count: number
  tokens_remaining: number
  subscription_name: string
  subscription_days_completed: number
  subscription_days_left: number
}

interface AccountDetailsResponse {
  success: boolean
  account_info: AccountInfo
  timestamp: string
}

const TOKEN_LIMITS: Record<string, number> = {
  Freemium: 250000,
  Starter: 1000000,
  Professional: 5000000,
  Enterprise: 10000000, 
}

export default function AccountPage() {
  const { user } = useUserContext()
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false)
  const [dateFilter, setDateFilter] = useState<"1d" | "7d" | "30d" | "custom">("30d")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [tokensUsageData, setTokensUsageData] = useState<Array<{ date: string; tokens: number }>>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const fetchTokenConsumption = async (fromDate: Date, toDate: Date) => {
    try {
      setIsLoadingTokens(true)
      const user_id = localStorage.getItem('user_id')
      if (!user_id) {
        console.error('User ID not found')
        setIsLoadingTokens(false)
        return
      }

      const from = formatDateForAPI(fromDate)
      const to = formatDateForAPI(toDate)

      const response = await apiFetch(
        `/api/account/token-consumption?user_id=${user_id}&from=${from}&to=${to}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ) as { success: boolean; token_consumption: Array<{ date?: string; hour?: string; tokens_consumed: number }> }

      if (response.success && response.token_consumption) {
        const isHourly = response.token_consumption.length > 0 && 'hour' in response.token_consumption[0]
        
        const formattedData = response.token_consumption.map((item) => {
          if (isHourly && item.hour) {
            const [datePart, timePart] = item.hour.split(' ')
            const [year, month, day] = datePart.split('-')
            const [hour] = timePart.split(':')
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour))
            return {
              date: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
              tokens: item.tokens_consumed,
            }
          } else if (item.date) {
            const date = new Date(item.date)
            return {
              date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              tokens: item.tokens_consumed,
            }
          }
          return { date: '', tokens: 0 }
        }).filter(item => item.date !== '')

        setTokensUsageData(formattedData)
      }
    } catch (error) {
      console.error('Error fetching token consumption:', error)
      setTokensUsageData([])
    } finally {
      setIsLoadingTokens(false)
    }
  }

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        setIsLoading(true)
        const user_id = localStorage.getItem('user_id')
        if (!user_id) {
          console.error('User ID not found')
          setIsLoading(false)
          return
        }

        const response = await apiFetch(
          `/api/account/get-details?user_id=${user_id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        ) as AccountDetailsResponse

        if (response.success && response.account_info) {
          setAccountInfo(response.account_info)
        }
      } catch (error) {
        console.error('Error fetching account details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountDetails()
  }, [])

  useEffect(() => {
    const today = new Date()
    let fromDate: Date
    let toDate: Date = today

    if (dateFilter === "1d") {
      fromDate = new Date(today)
      toDate = new Date(today)
    } else if (dateFilter === "7d") {
      fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - 6)
    } else if (dateFilter === "30d") {
      fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - 29)
    } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
      fromDate = new Date(dateRange.from)
      toDate = new Date(dateRange.to)
    } else {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
      toDate = today
    }

    fetchTokenConsumption(fromDate, toDate)
  }, [dateFilter, dateRange])

  const subscriptionName = accountInfo?.subscription_name
  const hasNoSubscription = subscriptionName === null || subscriptionName === undefined
  const isFreemium = subscriptionName === "Freemium"
  const daysLeft = accountInfo?.subscription_days_left ?? 0
  const daysCompleted = accountInfo?.subscription_days_completed ?? 0
  const totalDays = daysCompleted + daysLeft
  const progress = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0

  const tokenLimit = subscriptionName ? (TOKEN_LIMITS[subscriptionName] || TOKEN_LIMITS.Freemium) : 0
  const tokensRemainingNum = tokenLimit === -1 ? Infinity : accountInfo?.tokens_remaining || 0
  const tokensRemaining = tokenLimit === -1 ? "Unlimited" : tokensRemainingNum.toLocaleString()
  const hasNoTokens = !hasNoSubscription && tokensRemainingNum <= 0

  const getUpgradeInfo = () => {
    if (!subscriptionName) return null
    if (subscriptionName === "Starter") {
      return { text: "Upgrade to Professional - $99/month", href: "/plans" }
    }
    if (subscriptionName === "Professional") {
      return { text: "Upgrade to Enterprise - $249/month", href: "/plans" }
    }
    if (subscriptionName === "Enterprise") {
      return null
    }
    return { text: "Upgrade to Starter - $49/month", href: "/plans" }
  }

  const upgradeInfo = getUpgradeInfo()

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "delete-account") return;
  
    setIsDeletingAccount(true);
    
    try {
      const idToken = getIdToken();
      if (!idToken) {
        console.error("No id token found");
        setIsDeletingAccount(false);
        return;
      }
  
      await apiFetch(
        "/api/account/delete",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: idToken }),
        }
      );
  
      // Close dialog
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationText("");
  
      // Use signOutUser to properly clear all cookies (including rt) and storage
      // This will handle the sign-out API call, cookie deletion, and redirect
      await signOutUser("/account-deleted");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
      // Optionally show a toast/snackbar here
    }
  };
  

  // IMPROVED: Better date range selection logic
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range || !range.from) {
      setTempDateRange(undefined)
      return
    }

    const getEndOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0)
    }

    // If there's already a complete range selected
    if (tempDateRange?.from && tempDateRange?.to) {
      // If clicking on the start date again, reset
      if (range.from.getTime() === tempDateRange.from.getTime() && !range.to) {
        setTempDateRange(undefined)
        return
      }
      
      // If clicking on a new date, start a new range
      if (!range.to) {
        const endOfMonth = getEndOfMonth(range.from)
        setTempDateRange({
          from: range.from,
          to: endOfMonth,
        })
        return
      }
    }

    // If only start date (first click)
    if (range.from && !range.to && !tempDateRange?.from) {
      const endOfMonth = getEndOfMonth(range.from)
      setTempDateRange({
        from: range.from,
        to: endOfMonth,
      })
      return
    }

    // If user is selecting end date
    if (range.from && range.to && tempDateRange?.from) {
      setTempDateRange({
        from: range.from,
        to: range.to,
      })
      return
    }

    // Default case
    if (range.to) {
      setTempDateRange(range)
    } else {
      const endOfMonth = getEndOfMonth(range.from)
      setTempDateRange({
        from: range.from,
        to: endOfMonth,
      })
    }
  }

  const applyDateRange = () => {
    if (tempDateRange?.from) {
      let finalRange = tempDateRange
      
      if (!tempDateRange.to) {
        const startDate = new Date(tempDateRange.from)
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        finalRange = {
          from: tempDateRange.from,
          to: endDate,
        }
      }
      
      setDateRange(finalRange)
      setDateFilter("custom")
      setIsCalendarOpen(false)
    }
  }

  const handleQuickFilter = (filter: "1d" | "7d" | "30d") => {
    setDateFilter(filter)
    setDateRange(undefined)
    setTempDateRange(undefined)
  }

  const getDateRangeDisplay = () => {
    if (dateFilter === "custom" && dateRange?.from) {
      const startDate = dateRange.from
      const endDate = dateRange.to || new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }
    
    const today = new Date()
    const startDate = new Date(today)
    
    if (dateFilter === "1d") {
      startDate.setDate(startDate.getDate() - 1)
    } else if (dateFilter === "7d") {
      startDate.setDate(startDate.getDate() - 7)
    } else if (dateFilter === "30d") {
      startDate.setDate(startDate.getDate() - 30)
    }
    
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your billing, and subscription</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan & Trial Status */}
        {isLoading ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-900">Loading...</CardTitle>
                    <CardDescription className="text-orange-700">Fetching account details</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : hasNoSubscription ? (
          <Card className={"border-orange-200 bg-orange-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-900">No Active Plan</CardTitle>
                    <CardDescription className="text-orange-700">
                      You don't have an active subscription plan at the moment
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <p className="text-orange-900 text-sm font-medium mb-2">
                  Get started with a subscription plan
                </p>
                <p className="text-orange-700 text-sm">
                  Subscribe to one of our plans to access all features and start using the services.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  asChild
                >
                  <Link href="/plans">View Plans & Subscribe</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className={"border-orange-200 bg-orange-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className={`h-5 w-5 ${"text-orange-600"}`} />
                  <div>
                    <CardTitle className={"text-orange-900"}>
                      {isFreemium ? "Free Trial" : subscriptionName}
                    </CardTitle>
                    <CardDescription className={"text-orange-700"}>
                      {daysLeft > 0 ? `${daysLeft} days ${isFreemium ? "to renew" : "remaining"}` : "Expired"}
                    </CardDescription>
                  </div>
                </div>
                {isFreemium && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Trial Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasNoTokens && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 text-sm font-medium mb-2">
                    ⚠️ Tokens Exhausted
                  </p>
                  <p className="text-red-700 text-sm">
                    Your token balance has been fully consumed. Please subscribe to a plan to recharge your wallet and continue using the services.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={"text-orange-700"}>
                    {isFreemium ? "Trial Progress" : "Plan Progress"}
                  </span>
                  <span className={"text-orange-700"}>
                    {daysCompleted} of {totalDays} days used
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex gap-3">
                {upgradeInfo && (
                  <Button 
                    className={"bg-orange-600 hover:bg-orange-700"}
                    disabled = {true}
                  >
                    <Link href={upgradeInfo.href}>{upgradeInfo.text}</Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className={"border-orange-300 text-orange-700 bg-transparent"} 
                  asChild
                >
                  <Link href="/plans">View All Plans</Link>
                  {/* <Link href="/plans">View All Plans</Link> */}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>
                  {hasNoSubscription 
                    ? "Subscribe to a plan to start using HR Houdini services"
                    : isFreemium 
                    ? "Monitor your current usage during the trial period"
                    : "Monitor your current usage"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading usage data...</div>
            ) : hasNoSubscription ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No usage data available. Please subscribe to a plan to get started.</p>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700"
                  asChild
                >
                  <Link href="/plans">View Plans & Subscribe</Link>
                  {/* <Link href="/plans">View Plans & Subscribe</Link> */}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">AI Chat Messages</span>
                    <span className="font-medium">{accountInfo?.chat_messages_count || 0} used</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">File Uploads</span>
                    <span className="font-medium">{accountInfo?.file_uploads_count || 0} uploaded</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tokens remaining</span>
                    <span className={`font-medium ${hasNoTokens ? "text-red-600" : ""}`}>
                      {tokensRemaining === "Unlimited" ? "Unlimited" : `${tokensRemaining} tokens`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {hasNoSubscription 
                      ? "Subscribe to a plan to get tokens"
                      : tokenLimit === -1 
                      ? "Unlimited tokens in Enterprise"
                      : `${tokenLimit.toLocaleString()} tokens in ${subscriptionName}`}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reports Generated</span>
                    <span className="font-medium">{accountInfo?.reports_count || 0} reports</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Tokens Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <div>
                  <CardTitle>Daily Tokens Usage</CardTitle>
                  <CardDescription>Track your token consumption over time</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Popover 
                  open={isCalendarOpen} 
                  onOpenChange={(open) => {
                    setIsCalendarOpen(open)
                    if (open) {
                      setTempDateRange(undefined)
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {getDateRangeDisplay()}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={tempDateRange?.from || dateRange?.from}
                      selected={tempDateRange}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={1}
                      className="rounded-md border-0"
                    />
                    <div className="flex justify-end gap-2 p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsCalendarOpen(false)
                          setTempDateRange(undefined)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyDateRange}
                        disabled={!tempDateRange?.from}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1 bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs h-7 px-3 rounded-md ${dateFilter === "1d" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                    onClick={() => handleQuickFilter("1d")}
                  >
                    1d
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs h-7 px-3 rounded-md ${dateFilter === "7d" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                    onClick={() => handleQuickFilter("7d")}
                  >
                    7d
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs h-7 px-3 rounded-md ${dateFilter === "30d" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
                    onClick={() => handleQuickFilter("30d")}
                  >
                    30d
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingTokens ? (
              <div className="h-80 w-full flex items-center justify-center">
                <div className="text-gray-500">Loading token consumption data...</div>
              </div>
            ) : tokensUsageData.length === 0 ? (
              <div className="h-80 w-full flex items-center justify-center">
                <div className="text-gray-500">No token consumption data available</div>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tokensUsageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickLine={{ stroke: "#cbd5e1" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                      label={{  angle: -90, position: "insideLeft", style: { fill: "#475569", fontSize: 13, fontWeight: 600 } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} tokens`, "Tokens"]}
                    />
                    <Bar dataKey="tokens" fill="#ea580c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">Delete your account</CardTitle>
                  <CardDescription className="text-red-700">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        if (!isDeletingAccount) {
          setIsDeleteDialogOpen(open)
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-900">Delete Account</DialogTitle>
            <DialogDescription className="text-gray-600">
            Deleting your account is permanent. You will have no way of recovering it or associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium text-gray-700">
              To confirm, please type <span className="font-mono font-bold text-red-600">delete-account</span> below
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="delete-account"
              className="mt-2"
              disabled={isDeletingAccount}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeleteConfirmationText("")
              }}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== "delete-account" || isDeletingAccount}
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}