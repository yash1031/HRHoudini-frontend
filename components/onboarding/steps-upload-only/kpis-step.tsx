"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useOnboarding } from "../onboarding-template"
import { useRouter } from "next/navigation"
import { useUserContext } from "@/contexts/user-context"
import { useDashboard } from '@/contexts/DashboardContext';

// Available KPI panels
const AVAILABLE_KPIS = [
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
]

interface SelectedKPIInfo {
  label: string;
  description: string;
}
interface KPI {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: string;
}
// Role-specific KPI recommendations
const ROLE_KPI_RECOMMENDATIONS = {
  "hr-generalist": ["turnover-rate", "engagement-score", "cost-per-hire", "absenteeism-rate", "salary-increase"],
  "talent-acquisition": ["time-to-fill", "cost-per-hire", "offer-acceptance", "revenue-per-employee"],
  "team-lead": ["engagement-score", "turnover-rate", "employee-productivity", "absenteeism-rate"],
}

export function KPIsStep() {
  
  const { setStep ,userContext, uploadedFile } = useOnboarding()
  const { setDashboard_data,setDashboardCode, setIsLoading, setErrorDash, wb } = useDashboard();
  const router = useRouter()
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    ROLE_KPI_RECOMMENDATIONS[userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS] || [],
  )
  // State to hold full info (label + description)
  const [selectedKPIWithDesc, setSelectedKPIWithDesc] = useState<SelectedKPIInfo[]>([]);
  const { checkIfTokenExpired } = useUserContext()

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs((prev) => (prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]))
    setSelectedKPIWithDesc((prev) => {
    // Get currently selected KPIs after toggle
    const updatedSelected =
      selectedKPIs.includes(kpiId)
        ? selectedKPIs.filter((id) => id !== kpiId)
        : [...selectedKPIs, kpiId];

    // Build detail objects from global kpis array
    const selectedDetails = updatedSelected
      .map((id) => kpis.find((kpi) => kpi.id === id))
      .filter((kpi) => !!kpi)
      .map(({ label, description }) => ({ label, description }));

    return selectedDetails;
  });
  }

  const { kpis } = useUserContext()

  const handleNext = async () => {
    try{
      

      // Store selected KPIs in localStorage
      localStorage.setItem("hr-houdini-selected-kpis", JSON.stringify(selectedKPIs))
      localStorage.setItem("hr-houdini-selected-kpis-with-desc", JSON.stringify(selectedKPIWithDesc))

      // Navigate to dashboard-upload-only with specified parameters
      const params = new URLSearchParams({
        hasFile: "true",
        showWelcome: "true",
      })

      localStorage.setItem("from_history","false")
      let dashboardUrl = `/dashboard?${params.toString()}`
      // let dashboardUrl = `/dashboard-uo-1?${params.toString()}`
      router.push(dashboardUrl)

      if(JSON.stringify(kpis) !== JSON.stringify(AVAILABLE_KPIS)){
        console.log("API Dashboard call is in progress")
        console.log("Selected KPIs are", selectedKPIs)
        
        setIsLoading(true)

        const user_id= localStorage.getItem("user_id")
        const session_id= localStorage.getItem("session_id")
        
        let access_token= localStorage.getItem("id_token")
        if(!access_token) console.log("access_token not available")

        // Insights Dashboard Generation
        const resCreateDash = await fetch("/api/create-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json", 
              "authorization": `Bearer ${access_token}` },
          body: JSON.stringify({
              // s3_file_key: localStorage.getItem("s3Key"),
              user_id: user_id,
              session_id: session_id,
              selected_kpis: selectedKPIWithDesc
            }),
        });
        wb.onmessage = async (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            console.log('[WS] message', msg);
            if(msg.event==="insight.ready"){

              console.log("[WS] message: Insight Dashboard is generated")
              console.log("event from websockets is", msg)
              // if(!resCreateDash.ok){
              //   console.log("Error generating dashboard. It needs to be resolved. From kpis-step")
              //   setIsLoading(false)
              //   setErrorDash('Failed to generate dashboard. Please try uploading file again');
              //   return;
              // }
              // const createDashboardData = await resCreateDash.json();
              // const dataCreateDashboard= await createDashboardData.data
              const dataCreateDashboard= await msg?.payload?.summary?.finalDashboard

              // console.log("dataCreateDashboard.success", dataCreateDashboard.success, "dataCreateDashboard.analytics", dataCreateDashboard.analytics)
            
              // if (dataCreateDashboard.success && dataCreateDashboard.analytics) {
              const consumed_tokens= dataCreateDashboard.tokens_used?.grand_total || 8000;
              console.log("Tokens to consume for insights dashboard generation",consumed_tokens)
              // THIS IS THE KEY LINE - Pass the code to context
              setIsLoading(false)
              // localStorage.setItem("dashboard_data", JSON.stringify(dataCreateDashboard.analytics))
              setErrorDash(null);
              setDashboard_data(dataCreateDashboard.analytics);

              access_token= localStorage.getItem("id_token")
              if(!access_token) console.log("access_token not available")
              
              const resConsumeTokens = await fetch("/api/billing/consume-tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json", 
                    "authorization": `Bearer ${access_token}`
                },
                body: JSON.stringify({
                      user_id: localStorage.getItem("user_id"),
                      action_name: "file_upload",
                      tokens_to_consume: consumed_tokens,
                      event_metadata: {file_size:uploadedFile.metadata.size,file_name:uploadedFile.metadata.name, timestamp: new Date(Date.now())}
                }),
              });
              // const currentPlanRes = await resCurrentPlan;
              if(!resConsumeTokens.ok){
                console.error("Unable to update dashboard creation tokens for the user")
                return;
              }
              const consumeTokensData = await resConsumeTokens.json();
              const dataConsumeTokens= await consumeTokensData.data
              access_token= localStorage.getItem("id_token")
              if(!access_token) console.log("access_token not available")
              console.log("Dashboard creation token updation for user is successful for chat message", JSON.stringify(dataConsumeTokens));
              const resStoreDash = await fetch("/api/insights/store", {
                method: "POST",
                headers: { "Content-Type": "application/json", 
                  "authorization": `Bearer ${access_token}`
                },
                body: JSON.stringify({
                    user_id: localStorage.getItem("user_id"),
                    session_id: localStorage.getItem("session_id"),
                    s3_location: localStorage.getItem("s3Key"),
                    analytical_json_output: dataCreateDashboard.analytics
                  }),
              });
              // const currentPlanRes = await resCurrentPlan;
              if(!resStoreDash.ok){
                console.error("Unable to store dashboard for this session")
                return;
              }
              const storeDashData = await resStoreDash.json();
              const dataStoreDash= await storeDashData.data
              console.log("Successfully stored dashboard data", JSON.stringify(dataStoreDash));
            }
            // QUICK TEST: show a banner/toast
            // e.g., set some local state to display msg.event
          } catch (e) {
            console.log('[WS] raw', evt.data);
          }
        };
        // const currentPlanRes = await resCurrentPlan;
        // if(!resCreateDash.ok){
        //   console.log("Error generating dashboard. It needs to be resolved. From kpis-step")
        //   setIsLoading(false)
        //   setErrorDash('Failed to generate dashboard. Please try uploading file again');
        //   return;
        // }
        // const createDashboardData = await resCreateDash.json();
        // const dataCreateDashboard= await createDashboardData.data

        // console.log("dataCreateDashboard.success", dataCreateDashboard.success, "dataCreateDashboard.analytics", dataCreateDashboard.analytics)
        
        // // if (dataCreateDashboard.success && dataCreateDashboard.analytics) {
        // const consumed_tokens= dataCreateDashboard.tokens_used?.grand_total || 8000;
        // console.log("Tokens to consume for insights dashboard generation",consumed_tokens)
        // // THIS IS THE KEY LINE - Pass the code to context
        // setIsLoading(false)
        // // localStorage.setItem("dashboard_data", JSON.stringify(dataCreateDashboard.analytics))
        // setErrorDash(null);
        // setDashboard_data(dataCreateDashboard.analytics);
        
        // const resConsumeTokens = await fetch("/api/billing/consume-tokens", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //         user_id: localStorage.getItem("user_id"),
        //         action_name: "file_upload",
        //         tokens_to_consume: consumed_tokens,
        //         event_metadata: {file_size:uploadedFile.metadata.size,file_name:uploadedFile.metadata.name, timestamp: new Date(Date.now())}
        //       }),
        // });
        // // const currentPlanRes = await resCurrentPlan;
        // if(!resConsumeTokens.ok){
        //   console.error("Unable to update dashboard creation tokens for the user")
        //   return;
        // }
        // const consumeTokensData = await resConsumeTokens.json();
        // const dataConsumeTokens= await consumeTokensData.data
        
        // console.log("Dashboard creation token updation for user is successful for chat message", JSON.stringify(dataConsumeTokens));
        // const resStoreDash = await fetch("/api/insights/store", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //       user_id: localStorage.getItem("user_id"),
        //       session_id: localStorage.getItem("session_id"),
        //       s3_location: localStorage.getItem("s3Key"),
        //       analytical_json_output: dataCreateDashboard.analytics
        //     }),
        // });
        // // const currentPlanRes = await resCurrentPlan;
        // if(!resStoreDash.ok){
        //   console.error("Unable to store dashboard for this session")
        //   return;
        // }
        // const storeDashData = await resStoreDash.json();
        // const dataStoreDash= await storeDashData.data
        // console.log("Successfully stored dashboard data", JSON.stringify(dataStoreDash));
      }

      // router.push(`/dashboard-upload-only?${params.toString()}`)
    }catch(error){
      console.log("Error is", error)
    }
  }

  const groupedKPIs = kpis.reduce(
    (acc, kpi) => {
      if (!acc[kpi.category]) acc[kpi.category] = []
      acc[kpi.category].push(kpi)
      return acc
    },
    {} as Record<string, typeof kpis>,
  )

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Target className="h-6 w-6 text-blue-600 mr-2" />
          <CardTitle className="text-lg font-semibold text-blue-900">Which KPIs matter most to you?</CardTitle>
        </div>
        <CardDescription>
          Select all the metrics those you track regularly to get personalized insights and automated alerts when trends change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {Object.entries(groupedKPIs).map(([category, kpis]) => (
            <div key={category} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize text-center">{category}</h4>
              <div className="space-y-2">
                {kpis.map((kpi) => {
                  const IconComponent = kpi.icon
                  const isRecommended = ROLE_KPI_RECOMMENDATIONS[
                    userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS
                  ]?.includes(kpi.id)
                  return (
                    <div
                      key={kpi.id}
                      className={`flex items-start space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedKPIs.includes(kpi.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => handleKPIToggle(kpi.id)}
                    >
                      <Checkbox
                        checked={selectedKPIs.includes(kpi.id)}
                        onChange={() => handleKPIToggle(kpi.id)}
                        className="mt-0.5"
                      />
                      {/* <IconComponent className="h-4 w-4 text-gray-600 mt-0.5" /> */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{kpi.label}</p>
                          {isRecommended && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Selected:</strong> {selectedKPIs.length} of {kpis.length} KPIs. Your dashboard will show
            tiles for these metrics, and you can add or remove them later.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedKPIs.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
