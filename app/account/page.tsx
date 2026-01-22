"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  tokens_consumed: string
  subscription_name: string
  subscription_days_completed: number
  subscription_days_left: number
}

interface AccountDetailsResponse {
  success: boolean
  account_info: AccountInfo
  timestamp: string
}

// Token limits for each plan
const TOKEN_LIMITS: Record<string, number> = {
  Freemium: 250000,
  Starter: 1000000,
  Professional: 5000000,
  Enterprise: 10000000, 
}

export default function AccountPage() {
  const { user } = useUserContext()

  const [isEditing, setIsEditing] = useState(false)
  const [companyData, setCompanyData] = useState({
    companyName: user.company || "TechCorp Solutions",
    industry: user.company === "HealthServ Solutions" ? "Healthcare Services" : "Technology",
    size: user.company === "HealthServ Solutions" ? "120 employees" : "500-1000 employees",
    address:
      user.company === "HealthServ Solutions"
        ? "456 Healthcare Blvd, Boston, MA 02101"
        : "123 Business Ave, San Francisco, CA 94105",
  })

  // Account data state
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Delete account dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("")

  // Date filter state for tokens usage
  const [dateFilter, setDateFilter] = useState<"1d" | "7d" | "30d" | "custom">("30d")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  
  // Token consumption data state
  const [tokensUsageData, setTokensUsageData] = useState<Array<{ date: string; tokens: number }>>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)

  // Format date as DD/MM/YYYY for API
  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Fetch token consumption data
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
        // Check if it's hourly data (has 'hour' field) or daily data (has 'date' field)
        const isHourly = response.token_consumption.length > 0 && 'hour' in response.token_consumption[0]
        
        const formattedData = response.token_consumption.map((item) => {
          if (isHourly && item.hour) {
            // Parse hour format: "2026-01-20 07:00"
            const [datePart, timePart] = item.hour.split(' ')
            const [year, month, day] = datePart.split('-')
            const [hour] = timePart.split(':')
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour))
            return {
              date: date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
              tokens: item.tokens_consumed,
            }
          } else if (item.date) {
            // Daily data format: "2026-01-01"
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

  // Fetch account details
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

  // Fetch token consumption on mount and when filters change
  useEffect(() => {
    const today = new Date()
    let fromDate: Date
    let toDate: Date = today

    if (dateFilter === "1d") {
      // Last 24 hours - use today for both from and to to get hourly data
      fromDate = new Date(today)
      toDate = new Date(today)
    } else if (dateFilter === "7d") {
      // Last 7 days
      fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - 6) // Include today, so 6 days back
    } else if (dateFilter === "30d") {
      // Last 30 days
      fromDate = new Date(today)
      fromDate.setDate(fromDate.getDate() - 29) // Include today, so 29 days back
    } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to) {
      // Custom range
      fromDate = new Date(dateRange.from)
      toDate = new Date(dateRange.to)
    } else {
      // Default: First of current month to today
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1)
      toDate = today
    }

    fetchTokenConsumption(fromDate, toDate)
  }, [dateFilter, dateRange])

  // Calculate derived values
  const subscriptionName = accountInfo?.subscription_name || "Freemium"
  const isFreemium = subscriptionName === "Freemium"
  const daysLeft = accountInfo?.subscription_days_left || 0
  const daysCompleted = accountInfo?.subscription_days_completed || 0
  const totalDays = daysCompleted + daysLeft
  const progress = totalDays > 0 ? (daysCompleted / totalDays) * 100 : 0

  // Calculate tokens remaining
  const tokensConsumed = parseInt(accountInfo?.tokens_consumed || "0")
  const tokenLimit = TOKEN_LIMITS[subscriptionName] || TOKEN_LIMITS.Freemium
  const tokensRemaining = tokenLimit === -1 ? "Unlimited" : Math.max(0, tokenLimit - tokensConsumed).toLocaleString()

  // Get upgrade button info
  const getUpgradeInfo = () => {
    if (subscriptionName === "Starter") {
      return { text: "Upgrade to Professional - $249/month", href: "/dashboard/plans" }
    }
    if (subscriptionName === "Professional") {
      return { text: "Upgrade to Enterprise - $99/month", href: "/dashboard/plans" }
    }
    if (subscriptionName === "Enterprise") {
      return null // No upgrade button
    }
    // Freemium
    return { text: "Upgrade to Starter - $49/month", href: "/dashboard/plans" }
  }

  const upgradeInfo = getUpgradeInfo()

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmationText === "delete-account") {
      // TODO: Implement account deletion API call
      console.log("Account deletion confirmed")
      setIsDeleteDialogOpen(false)
      setDeleteConfirmationText("")
    }
  }

  // Handle date range selection (temporary state for calendar)
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    // If range is cleared or undefined, reset
    if (!range) {
      setTempDateRange(undefined)
      return
    }

    // If clicking the same start date again (when range is already set), reset the range
    if (range.from && tempDateRange?.from && tempDateRange?.to &&
        range.from.getTime() === tempDateRange.from.getTime() && 
        !range.to) {
      setTempDateRange(undefined)
      return
    }
    
    // If clicking a different date when range is already set, start a new range
    if (range.from && tempDateRange?.from && tempDateRange?.to &&
        range.from.getTime() !== tempDateRange.from.getTime() && 
        !range.to) {
      // Start a new range with the clicked date
      const startDate = new Date(range.from)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      setTempDateRange({
        from: range.from,
        to: endDate,
      })
      return
    }

    // If only start date is selected, automatically set end date to end of month
    if (range.from && !range.to) {
      const startDate = new Date(range.from)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0) // Last day of the month
      
      // Update temp range with auto end date for display
      setTempDateRange({
        from: range.from,
        to: endDate,
      })
    } else {
      // Both dates selected
      setTempDateRange(range)
    }
  }

  // Apply the selected date range
  const applyDateRange = () => {
    if (tempDateRange?.from) {
      let finalRange = tempDateRange
      
      // If only start date is selected, default to end of that month
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

  // Handle quick filter buttons
  const handleQuickFilter = (filter: "1d" | "7d" | "30d") => {
    setDateFilter(filter)
    setDateRange(undefined)
    setTempDateRange(undefined)
  }


  // Format date range for custom filter display
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
        {/* <p className="text-gray-600 mt-2">Manage your company information, billing, and subscription</p> */}
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
        ) : (
          <Card className={isFreemium ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className={`h-5 w-5 ${isFreemium ? "text-orange-600" : "text-gray-600"}`} />
                  <div>
                    <CardTitle className={isFreemium ? "text-orange-900" : "text-gray-900"}>
                      {isFreemium ? "Free Trial" : subscriptionName}
                    </CardTitle>
                    <CardDescription className={isFreemium ? "text-orange-700" : "text-gray-700"}>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isFreemium ? "text-orange-700" : "text-gray-700"}>
                    {isFreemium ? "Trial Progress" : "Plan Progress"}
                  </span>
                  <span className={isFreemium ? "text-orange-700" : "text-gray-700"}>
                    {daysCompleted} of {totalDays} days used
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="flex gap-3">
                {upgradeInfo && (
                  <Button 
                    className={isFreemium ? "bg-orange-600 hover:bg-orange-700" : "bg-gray-600 hover:bg-gray-700"}
                    asChild
                  >
                    <Link href={upgradeInfo.href}>{upgradeInfo.text}</Link>
                  </Button>
                )}
                {/* <Button 
                  variant="outline" 
                  className={isFreemium ? "border-orange-300 text-orange-700 bg-transparent" : "border-gray-300 text-gray-700 bg-transparent"} 
                  asChild
                >
                  <Link href="/dashboard/plans">View All Plans</Link>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        )}

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
                <CardDescription>
                  {isFreemium 
                    ? "Monitor your current usage during the trial period"
                    : "Monitor your current usage"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading usage data...</div>
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
                    <span className="font-medium">
                      {tokensRemaining === "Unlimited" ? "Unlimited" : `${tokensRemaining} tokens`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {tokenLimit === -1 
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Members</span>
                    <span className="font-medium">1 member</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {isFreemium ? "Single user during trial" : "Team management available"}
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
                      // Initialize temp range when opening
                      setTempDateRange(dateRange)
                    } else {
                      // Reset temp range when closing without applying
                      setTempDateRange(dateRange)
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
                      selected={tempDateRange || dateRange}
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
                          setTempDateRange(dateRange) // Reset to original
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
                      label={{ value: "Tokens", angle: -90, position: "insideLeft", style: { fill: "#475569", fontSize: 13, fontWeight: 600 } }}
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
                {/* <Trash2 className="h-4 w-4 mr-2" /> */}
                Delete Account
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-900">Delete Account</DialogTitle>
            <DialogDescription className="text-gray-600">
            Deleting your account is permanent. You will have no way of recovering your account or associated data.
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
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeleteConfirmationText("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmationText !== "delete-account"}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
