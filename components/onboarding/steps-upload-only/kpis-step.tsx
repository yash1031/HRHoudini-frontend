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
import { apiFetch } from "@/lib/api/client";
import { connectWebSocket, addListener, removeListener, closeWebSocket } from '@/lib/ws';
import {generateChartsFromParquet } from "@/utils/parquetLoader"
import {attachDrilldownToParent} from "@/utils/drilldownHelpers"
import {generateDrilldownChartsData, buildQueryFromQueryObj} from "@/utils/parquetLoader"


interface SelectedKPIInfo {
  kpi_id: string;      // Added: KPI identifier
  label: string;
  description: string;
  category: string;    // Added: KPI category
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
  
  const { setStep ,userContext } = useOnboarding()
  const { dashboard_data, setDashboard_data, setIsLoading, setErrorDash, wb } = useDashboard();
  const router = useRouter()
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    ROLE_KPI_RECOMMENDATIONS[userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS] || [],
  )
  // State to hold full info (label + description)
  const [selectedKPIWithDesc, setSelectedKPIWithDesc] = useState<SelectedKPIInfo[]>([]);

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs((prev) => (prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]))
    setSelectedKPIWithDesc((prev) => {
    // Get currently selected KPIs after toggle
    const updatedSelected =
      selectedKPIs.includes(kpiId)
        ? selectedKPIs.filter((id) => id !== kpiId)
        : [...selectedKPIs, kpiId];

    // Build detail objects from global kpis array with all four fields
    const selectedDetails = updatedSelected
      .map((id) => kpis.find((kpi) => kpi.id === id))
      .filter((kpi) => !!kpi)
      .map(({ id, label, description, category }) => ({ 
        kpi_id: id,        // Map id to kpi_id
        label, 
        description, 
        category 
      }));

    return selectedDetails;
  });
  }

  const { kpis } = useUserContext()

  const handleNext = async () => {
      let handler: (msg: any) => void = () => {};
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
        router.push(dashboardUrl)

        console.log("API Dashboard call is in progress")
        console.log("Selected KPIs are", selectedKPIs)
          
        setIsLoading(true)

        const user_id= localStorage.getItem("user_id")
        const session_id= localStorage.getItem("session_id")
        const idempotency_key= localStorage.getItem("idempotency_key")
        
        // Insights Dashboard Generation
        // let resCreateDash
        // try{
        //   resCreateDash = await apiFetch("/api/create-dashboard", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json"},
        //     body: JSON.stringify({
        //         user_id: user_id,
        //         session_id: session_id,
        //         selected_kpis: selectedKPIWithDesc,
        //         idempotency_key: idempotency_key
        //       }),
        //   });
        // }catch(error){
        //   setIsLoading(false)
        //   setErrorDash("Failed to created Dashboard");
        //   console.log("Unable to create dashboard")
        // }
        // Insights Dashboard Generation by Parts
        let resCreateDash
        try{
          resCreateDash = await apiFetch("/api/create-dashboard-by-parts", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                user_id: user_id,
                session_id: session_id,
                selected_kpis: selectedKPIWithDesc
              }),
          });
        }catch(error){
          setIsLoading(false)
          setErrorDash("Failed to created Dashboard");
          console.log("Unable to create dashboard")
        }
        handler = async (msg: any) => {
          try {
            console.log('[WS] message', msg);
            if(msg.event==="insight.ready"){
              console.log("[WS] message: Insight Dashboard is generated")
              console.log("event from websockets is", msg)
              const dataCreateDashboard= await msg?.payload?.summary?.finalDashboard
              console.log("Dashoboard data is", JSON.stringify(dataCreateDashboard.analytics))
              setIsLoading(false)
              setErrorDash(null);
              setDashboard_data(dataCreateDashboard.analytics);
              let resStoreDash
              try{
                resStoreDash = await apiFetch("/api/insights/store", {
                  method: "POST",
                  headers: { "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                      user_id: localStorage.getItem("user_id"),
                      session_id: localStorage.getItem("session_id"),
                      s3_location: localStorage.getItem("s3Key"),
                      analytical_json_output: dataCreateDashboard.analytics
                    }),
                });
              }catch (error) {
                  // If apiFetch throws, the request failed
                  console.error("Unable to store dashboard for this session")
                  
                  closeWebSocket();
                  return;
              }
              const dataStoreDash= await resStoreDash.data
              console.log("Successfully stored dashboard data", JSON.stringify(dataStoreDash));
              closeWebSocket();
            }
            if(msg.event==="kpi.main.ready"){
              console.log("[WS] message: Main Charts received")
              console.log("message from websockets is", msg)
              const mainChartsQueries= msg?.payload?.charts?.text
              console.log("Queries received for charts generation are", mainChartsQueries)
              const parquetUrl= localStorage.getItem("presigned-parquet-url") || ""
              generateChartsFromParquet(mainChartsQueries, parquetUrl)
              .then((result:any) => {
                console.log("Result for generateChartsFromParquet", JSON.stringify(result, null, 2))
                setIsLoading(false)
                setErrorDash(null);
                console.log("dashboard_data?.cards in kpi-step", dashboard_data?.cards)
                console.log("result from chart generation in kpi-step", result)
                setTimeout(() => {
                  setDashboard_data(prev => ({
                    cards: [...(prev?.cards || [])],           // NOW prev.cards has the data!
                    charts: [...(prev?.charts || []), ...result],
                    metadata: prev?.metadata || {}
                  }));
                }, 100);
              })
              .catch(console.error);
            }
            // if(msg.event==="drilldown.ready"){
            //   console.log("[WS] message: Drill down charts and filters are received")
            //   console.log("message from websockets is", msg)

            //   const drilldownPayload = msg?.payload;
            //   const parentChartId = drilldownPayload?.parent_chart_id;
            //   const drilldownCharts = drilldownPayload?.charts || [];
            //   const drilldownFilters = drilldownPayload?.filters || [];
            //   const kpiId = drilldownPayload?.kpi_id; // If it's for a KPI card
              
            //   // Generate data for drilldown charts
            //   const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
              
            //   try {

            //     // ✅ Transform filters BEFORE attaching
            //     const transformedFilters = drilldownFilters.map((filter: any) => ({
            //       field: filter.field,
            //       label: filter.label,
            //       type: filter.type === 'select' ? 'multiselect' : filter.type,
            //       options: filter.options || [],
            //       whereClause: filter.whereClause
            //     }));
            //     // ✅ FIX: Update queryObject to include actual Parquet URL in from.source
            //     const drilldownQueries = {
            //       charts: drilldownCharts.map((chart: any) => {
            //         // Deep clone query_obj to avoid mutations
            //         const queryObjWithUrl = JSON.parse(JSON.stringify(chart.query_obj));
                    
            //         // ✅ CRITICAL FIX: Set the actual Parquet URL in from.source
            //         if (queryObjWithUrl.from) {
            //           queryObjWithUrl.from.source = parquetUrl;
            //         } else {
            //           queryObjWithUrl.from = {
            //             type: 'parquet',
            //             source: parquetUrl
            //           };
            //         }
                    
            //         return {
            //           ...chart,
            //           query: buildQueryFromQueryObj(queryObjWithUrl, parquetUrl),
            //           queryObject: queryObjWithUrl  // ✅ Store the updated queryObject for dynamic filtering
            //         };
            //       })
            //     };
                
            //     // Execute queries and get data
            //     const chartDataResults = await generateDrilldownChartsData(
            //       drilldownQueries.charts, 
            //       parquetUrl
            //     );
                
            //     // Update dashboard_data with drilldown
            //     setDashboard_data(prev => {
            //       if (!prev) return prev;
                  
            //       // Find parent chart/card and attach drilldown
            //       return attachDrilldownToParent(
            //         prev,
            //         parentChartId,
            //         kpiId,
            //         {
            //           // filters: drilldownFilters,
            //           filters: transformedFilters,
            //           charts: chartDataResults,
            //           insights: drilldownPayload?.insights
            //         }
            //       );
            //     });
                
            //     console.log("✅ Drilldown data attached successfully");
            //   } catch (error) {
            //     console.error("❌ Failed to process drilldown:", error);
            //   }
            // }
          } catch (e) {
            closeWebSocket();
          }
        };
        console.log("Adding handler", handler)
        addListener(handler, "charts-generator");
        // wb.onmessage = async (evt: any) => {
        //   try {
        //     const msg = JSON.parse(evt.data);
        //     console.log('[WS] message', msg);
        //     if(msg.event==="insight.ready"){
        //       console.log("[WS] message: Insight Dashboard is generated")
        //       console.log("event from websockets is", msg)
        //       const dataCreateDashboard= await msg?.payload?.summary?.finalDashboard
        //       setIsLoading(false)
        //       setErrorDash(null);
        //       setDashboard_data(dataCreateDashboard.analytics);
        //       let resStoreDash
        //       try{
        //         resStoreDash = await apiFetch("/api/insights/store", {
        //           method: "POST",
        //           headers: { "Content-Type": "application/json"
        //           },
        //           body: JSON.stringify({
        //               user_id: localStorage.getItem("user_id"),
        //               session_id: localStorage.getItem("session_id"),
        //               s3_location: localStorage.getItem("s3Key"),
        //               analytical_json_output: dataCreateDashboard.analytics
        //             }),
        //         });
        //       }catch (error) {
        //           // If apiFetch throws, the request failed
        //           console.error("Unable to store dashboard for this session")
        //           if (wb.readyState === WebSocket.OPEN){
        //             wb.close()
        //             wb.onclose = () => console.log('[WS] disconnected');
        //             console.log("Web_Socket connection closed from kpi_step")
        //           }
        //           return;
        //       }
        //       const dataStoreDash= await resStoreDash.data
        //       console.log("Successfully stored dashboard data", JSON.stringify(dataStoreDash));
        //       if (wb.readyState === WebSocket.OPEN){
        //         wb.close()
        //         wb.onclose = () => console.log('[WS] disconnected');
        //         console.log("Web_Socket connection closed from kpi_step")
        //       }
        //     }
        //   } catch (e) {
        //     console.log('[WS] raw', evt.data);
        //     if (wb.readyState === WebSocket.OPEN){
        //       wb.close()
        //       wb.onclose = () => console.log('[WS] disconnected');
        //       console.log("Web_Socket connection closed from kpi_step")
        //     }
        //   }
        // };
      }catch(error){
        closeWebSocket();
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
