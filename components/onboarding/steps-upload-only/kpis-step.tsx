"use client"

import { useState, useRef } from "react"
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
import { useDashboard } from '@/contexts/dashboard-context';
import { apiFetch } from "@/lib/api/client";
import { connectWebSocket, addListener, removeListener, closeWebSocket } from '@/lib/ws';
import {generateChartsFromParquet } from "@/utils/parquetLoader"
// import {attachDrilldownToParent} from "@/utils/drilldownHelpers"
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
  const { 
    chartsState,
    setChartsState,
    setDrilldownsState, 
    setMessages
  } = useDashboard();
  const router = useRouter()
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    ROLE_KPI_RECOMMENDATIONS[userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS] || [],
  )
  // State to hold full info (label + description)
  const [selectedKPIWithDesc, setSelectedKPIWithDesc] = useState<SelectedKPIInfo[]>([]);

  const mainChartTimeout = useRef<NodeJS.Timeout | null>(null);
  const drilldownTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

      // Start 20s timeout for main charts
      console.log("[TIMEOUT] Setting timeout for main charts")
      const timeout = setTimeout(() => {
        setChartsState({
          loading: false,
          error: "Timeout generating charts.",
          data: []
        });
        console.error("[TIMEOUT] No main charts received within 20 seconds");
      }, 30000);
      mainChartTimeout.current = timeout;

      try{
        // Store selected KPIs in localStorage
        localStorage.setItem("hr-houdini-selected-kpis", JSON.stringify(selectedKPIs))
        localStorage.setItem("hr-houdini-selected-kpis-with-desc", JSON.stringify(selectedKPIWithDesc))
        setChartsState({
          data: [],
          loading: false,
          error: null
        })
        setMessages([])
        sessionStorage.removeItem("chats")
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
          
        // setIsLoading(true)

        const user_id= localStorage.getItem("user_id")
        const session_id= localStorage.getItem("session_id")
        
        // Insights Dashboard Generation by Parts
        setChartsState(prev => ({ ...prev, loading: true, error: null }));
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
          // setIsLoading(false)
          // setErrorDash("Failed to created Dashboard");
          console.log("Unable to create dashboard")
        }
        handler = async (msg: any) => {
           try {
          
            // ============================================
            // MAIN CHARTS HANDLER
            // ============================================
            if (msg.event === "kpi.main.ready") {
              console.log("[STEP 2] Main Charts received");
              // console.log("Message from websockets:", msg);
              
              const mainChartsQueries = JSON.parse(msg?.payload?.charts?.text).charts;
              console.log("Queries received for charts generation:", mainChartsQueries);
              
              const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
              
              generateChartsFromParquet(mainChartsQueries, parquetUrl)
                .then((result: any) => {
                  console.log("Result for generateChartsFromParquet:", JSON.stringify(result, null, 2));

                  console.log("[TIMEOUT] mainChartTimeout is", mainChartTimeout.current)

                  // Clear main chart timeout
                  if (mainChartTimeout.current) {
                    console.log("[TIMEOUT] Main charts received, timeout cleared")
                    clearTimeout(mainChartTimeout.current);
                    mainChartTimeout.current = null;
                  }
                  
                  // Success - update charts data in granular state
                  setChartsState(prev => ({
                    loading: false,
                    error: null,
                    data: [...prev.data, ...result]  // ← Append new charts to existing
                  }));

                  // Start 20s timeout for each chart's drilldown
                  result.forEach((chart: any) => {
                    const chartId = chart.id || chart.semantic_id;
                    console.log("[TIMEOUT] Setting timout for drilldown of chartId", chartId)
                    const timeout = setTimeout(() => {
                      setDrilldownsState(prev => ({
                        ...prev,
                        [chartId]: { loading: false, error: true }
                      }));
                      console.error(`[TIMEOUT] No drilldown received for chart ${chartId} within 20 seconds`);
                      drilldownTimeouts.current.delete(chartId);
                    }, 30000);
                    
                    drilldownTimeouts.current.set(chartId, timeout);
                  });
                })
                .catch((error) => {
                  console.error("Failed to generate charts:", error);
                  
                  // Error - set error state
                  if(mainChartTimeout.current){
                    setChartsState({
                      loading: false,
                      error: "Failed to generate analytical charts",
                      data: []
                    });
                  }
                });
            }
            
            // ============================================
            // CHARTS ERROR HANDLER
            // ============================================
            if (msg.event === "kpi.main.error") {
              console.error("Backend error in chart generation:", msg.payload);
              
              if(mainChartTimeout.current){
                setChartsState({
                  loading: false,
                  error: msg.payload?.message || "Backend error generating charts",
                  data: []
                });
              }
            }

            // ============================================
            // DRILLDOWN ERROR HANDLER
            // ============================================
            if (msg.event === "drilldown_charts.ready") {
              console.log("[STEP 3] Drill down received");

              const drilldownPayload = msg?.payload;
              const parentChartId = drilldownPayload?.parent_chart_id;
              const drilldownCharts = drilldownPayload?.charts || [];
              const drilldownFilters = drilldownPayload?.filters || [];
              const kpiId = drilldownPayload?.kpi_id;

              // Clear drilldown timeout for this chart
              if (parentChartId && drilldownTimeouts.current.has(parentChartId)) {
                console.log("[TIMEOUT] Drilldown charts received, timeout cleared for", parentChartId)
                clearTimeout(drilldownTimeouts.current.get(parentChartId)!);
                drilldownTimeouts.current.delete(parentChartId);
              }
              
              const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
              
              (async () => {
                try {
                  // Transform filters
                  const transformedFilters = drilldownFilters.map((filter: any) => ({
                    field: filter.field,
                    label: filter.label,
                    type: filter.type === 'select' ? 'multiselect' : filter.type,
                    options: filter.options || [],
                    whereClause: filter.whereClause
                  }));
                  
                  // Prepare queries
                  const drilldownQueries = {
                    charts: drilldownCharts.map((chart: any) => {
                      const queryObjWithUrl = JSON.parse(JSON.stringify(chart.query_obj));
                      
                      if (queryObjWithUrl.from) {
                        queryObjWithUrl.from.source = parquetUrl;
                      } else {
                        queryObjWithUrl.from = { type: 'parquet', source: parquetUrl };
                      }
                      
                      return {
                        ...chart,
                        query: buildQueryFromQueryObj(queryObjWithUrl, parquetUrl),
                        queryObject: queryObjWithUrl
                      };
                    })
                  };
                  
                  const chartDataResults = await generateDrilldownChartsData(
                    drilldownQueries.charts, 
                    parquetUrl
                  );
                  
                  console.log("Drilldown charts generated:", chartDataResults);
                  
                  // Update drilldown state
                  if (parentChartId) {
                    setDrilldownsState(prev => ({
                      ...prev,
                      [parentChartId]: { loading: false, error: false }
                    }));
                  }
                  
                  // UPDATED: Merge with existing insights if present
                  setChartsState(prev => {
                    const currentCharts = [...prev.data];

                    console.log("[DRILLDOWN] received chartsState", currentCharts);
                    
                    // Find the parent chart by ID
                    const chartIndex = currentCharts.findIndex(
                      chart => (chart.id || chart.semantic_id) === parentChartId
                    );
                    
                    if (chartIndex === -1) {
                      console.warn("Parent chart not found:", parentChartId);
                      return prev;
                    }

                    const targetChart = currentCharts[chartIndex];
                    
                    // Preserve existing drillDownData if it exists (especially insights)
                    const existingDrillDownData = targetChart.drillDownData;
                    
                    // Merge: keep existing insights if present, add new filters and charts
                    currentCharts[chartIndex] = {
                      ...targetChart,
                      drillDownData: {
                        filters: transformedFilters,
                        charts: chartDataResults,
                        ...(existingDrillDownData?.insights && { insights: existingDrillDownData.insights })
                      }
                    };
                    
                    console.log("[DRILLDOWN] Attached to chart:", parentChartId);
                    if (existingDrillDownData?.insights) {
                      console.log("[DRILLDOWN] Preserved existing insights:", existingDrillDownData.insights);
                    }
                    console.log("[DRILLDOWN] Updated chartsState", currentCharts);
                    
                    return {
                      ...prev,
                      data: currentCharts
                    };
                  });
                  
                } catch (error) {
                  console.error("Failed to process drilldown:", error);
                  
                  if (parentChartId) {
                    // setDrilldownsState(prev => ({
                    //   ...prev,
                    //   [parentChartId]: { loading: false, error: true }
                    // }));
                    console.error(`Converting queries to data failed for chart: ${parentChartId}`);
                  }
                }
              })();
            }

            // ============================================
            // DRILLDOWN ERROR HANDLER
            // ============================================
            if (msg.event === "drilldown_charts.error") {
              console.error("Backend error in drilldown generation:", msg.payload);
              
              const parentChartId = msg.payload?.parent_chart_id;
              if (parentChartId) {
                // setDrilldownsState(prev => ({
                //   ...prev,
                //   [parentChartId]: { loading: false, error: true }
                // }));
                // Optional: Track insight errors if needed
                console.error(`[DRILLDOWN] Failed for chart: ${parentChartId}`);
              }
            }

            // Add this handler in your WebSocket message processing, alongside drilldown.ready

            // ============================================
            // INSIGHTS HANDLER
            // ============================================
            if (msg.event === "drilldown_insights.ready") {
              console.log("[INSIGHTS] Insights received");

              const insightsPayload = msg?.payload;
              const parentChartId = insightsPayload?.parent_chart_id;
              const insights = insightsPayload?.insights;

              // Clear drilldown timeout for this chart
              if (parentChartId && drilldownTimeouts.current.has(parentChartId)) {
                console.log("[TIMEOUT] Insights received, timeout cleared for", parentChartId)
                clearTimeout(drilldownTimeouts.current.get(parentChartId)!);
                drilldownTimeouts.current.delete(parentChartId);
              }

              if (!parentChartId || !insights) {
                console.warn("[INSIGHTS] Missing parent_chart_id or insights data");
                return;
              }

              // Update chartsState - find chart and attach/merge insights
              setChartsState(prev => {
                const currentCharts = [...prev.data];
                // Find the parent chart by ID
                const chartIndex = currentCharts.findIndex(
                  chart => (chart.id || chart.semantic_id) === parentChartId
                );

                console.log("[INSIGHTS] received chart:", currentCharts[chartIndex]);

                if (chartIndex === -1) {
                  console.warn("[INSIGHTS] Parent chart not found:", parentChartId);
                  return prev;
                }

                const targetChart = currentCharts[chartIndex];

                // Case A: drillDownData already exists - merge insights
                if (targetChart.drillDownData) {
                  currentCharts[chartIndex] = {
                    ...targetChart,
                    drillDownData: {
                      ...targetChart.drillDownData,
                      insights: insights
                    }
                  };
                  console.log("[INSIGHTS] Merged with existing drillDownData for:", parentChartId);
                } 
                // Case B: drillDownData doesn't exist yet - create new structure with insights only
                else {
                  currentCharts[chartIndex] = {
                    ...targetChart,
                    drillDownData: {
                      filters: [],
                      charts: [],
                      insights: insights
                    }
                  };
                  console.log("[INSIGHTS] Created new drillDownData with insights for:", parentChartId);
                }

                console.log("[INSIGHTS] Updated chart:", currentCharts[chartIndex]);

                return {
                  ...prev,
                  data: currentCharts
                };
              });
            }

            // // // ============================================
            // // // INSIGHTS ERROR HANDLER
            // // // ============================================
            if (msg.event === "drilldown_insights.error") {
              console.error("[INSIGHTS] Backend error in insights generation:", msg.payload);
              
              const parentChartId = msg.payload?.parent_chart_id;
              if (parentChartId) {
                // Optional: Track insight errors if needed
                console.error(`[INSIGHTS] Failed for chart: ${parentChartId}`);
              }
              
            }

          } catch (e) {
            console.error("WebSocket handler error:", e);
            closeWebSocket();
          }
        };
        console.log("Adding handler")
        addListener(handler, "charts-generator");
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
        {/* To select all KPIs at once */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const allKpiIds = kpis.map(kpi => kpi.id);
              setSelectedKPIs(allKpiIds);
              
              const allKpiDetails = kpis.map(({ id, label, description, category }) => ({ 
                kpi_id: id,
                label,
                description, 
                category 
              }));
              setSelectedKPIWithDesc(allKpiDetails);
            }}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Select All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedKPIs([]);
              setSelectedKPIWithDesc([]);
            }}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Clear All
          </Button>
        </div>
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
