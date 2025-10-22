"use client"

// import type React from "react"
import React, { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Script from 'next/script'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Clock,
  DollarSign,
  Briefcase,
  TrendingDown,
  FileText,
  BarChart3,
} from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
// import { HeroInsightsTile } from "@/components/hero-insights-tile"
// import { getDashboardConfig, saveDashboardConfig, getDefaultDashboardConfig } from "@/lib/dashboard-config"
import { useDashboard } from '@/contexts/DashboardContext';
import Generated_Dashboard from './generated_dashboard'
import { Loader2 } from 'lucide-react';
import * as Recharts from 'recharts'
import * as LucideIcons from 'lucide-react'
import sample_dashboard_data from "@/public/sample_dashboard_data"
import { useUserContext } from "@/contexts/user-context"

declare global {
  interface Window {
    React: typeof React;
    Recharts: typeof Recharts;
    LucideIcons: typeof LucideIcons;
  }
}

interface DataItem {
  [key: string]: any;
}

interface FilterConfig {
  key: string;
  label: string;
  dataKey: string;
  options: string[];
}

interface ChartDataItem {
  name?: string;
  value?: number;
  [key: string]: any;
}


interface KPICard {
  label: string;
  icon: string;
  color: string;
  description?: string;
  calculationType: 'count' | 'average' | 'distinct' | 'custom';
  dataKey?: string;
  extractValue?: (item: DataItem) => number;
  format?: (value: number) => string | number;
  filterCondition?: (item: DataItem) => boolean;
  calculate?: (data: DataItem[]) => string | number;
  // drillDownChart?: DrillDownChart;
  drillDownData?: DrillDownData;
}

interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

interface DrillDownData {
  cards: KPICard[];
  charts: ChartConfig[];
  insights?: Insight; // UPDATED: Changed from InsightItem[] to Insights
}

interface ChartConfig {
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'line';
  color: string;
  dataKey?: string;
  xDataKey?: string;
  yDataKey?: string;
  valueKey?: string;
  layout?: string;
  height?: number;
  sort?: 'asc' | 'desc';
  lineName?: string;
  customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
  // drillDown?: ChartDrillDown;
  drillDownData?: DrillDownData;
}

interface TableColumn {
  label: string;
  dataKey: string;
  className?: string;
  render?: (value: any, row: DataItem) => React.ReactNode;
}

interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
  filters?: FilterConfig[];
  kpiCards?: KPICard[];
  charts?: ChartConfig[];
  rowCount?: string,
  filename?: string,
  tableColumns?: TableColumn[];
  colors?: string[];
}

const FileProcessingTooltip = ({
  children,
  fileName,
  recordCount,
}: { children: React.ReactNode; fileName: string; recordCount: number }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">File Successfully Processed</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">File Size:</span>
              <span className="text-gray-600">2.4 MB</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Data Type:</span>
              <span className="text-gray-600">HRIS Export</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Records:</span>
              <span className="text-gray-600">{recordCount.toLocaleString()} analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Columns:</span>
              <span className="text-gray-600">12 detected</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
            Ready for Analysis
          </Badge>
        </div>
      )}
    </div>
  )
}

export default function DashboardUO1() {
  const searchParams = useSearchParams()
  const [dashboardConfig, setDashboardConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [chatHeight, setChatHeight] = useState(400)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const kpiGridRef = useRef<HTMLDivElement>(null)
  const { dashboard_data, setDashboard_data, isLoading, setIsLoading, errorDash, setErrorDash } = useDashboard();
  const [config, setConfig] = useState<ConfigurableDashboardProps | null>(null);
  const [fileName, setFileName]=  useState<string|null>(null)
  const [file_row_count, setFile_row_count]=  useState<string|null>(null)
  const [sample_questions, setSample_questions]=  useState<string|null>(null)
  const [welcomeMessage, setWelcomeMessage]=  useState<string>('')
  const { checkIfTokenExpired } = useUserContext()


  useEffect(() => {
    const showWelcome = searchParams.get("showWelcome")
    if (showWelcome === "true") {
      setShowWelcomeTour(true)
    }
    // const sample_questions= localStorage.getItem("sample_questions")
    const fileUploaded = searchParams.get("hasFile")
    console.log("fileUploaded", fileUploaded)
    if(fileUploaded=="false"){
      console.log("sample_dashboard_data", sample_dashboard_data)
      setFileName("SharpMedian.csv")
      setFile_row_count("512")
      setDashboard_data(sample_dashboard_data);
      setWelcomeMessage(`Great! I can see you've successfully uploaded SharpMedian.csv with 512 employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?`)
      return;
    }
    console.log("for welcome message, file_name", localStorage.getItem("file_name"), "row_count", localStorage.getItem("file_row_count"))
    setWelcomeMessage(`Great! I can see you've successfully uploaded ${localStorage.getItem("file_name")} with ${localStorage.getItem("file_row_count")} employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?`)
    setIsLoading(true)
    setSample_questions(localStorage.getItem("sample_questions"))
    const session_id= localStorage.getItem("session_id")
    console.log("session_id captured in dashboard-uo-1", session_id)
    if(session_id) fetchFileUploadHistory(session_id);
    else{
      setErrorDash("Failed to generate dashboard")
      console.log("didn't recieve session_id in dashboard-uo-1")
    }
  }, [])

  const fetchFileUploadHistory = async (session_id: string) =>{
       // Store file upload history
       
        let access_token= localStorage.getItem("id_token")
        if(!access_token) console.log("access_token not available")
        const resFetchFileUploadHistory = await fetch("/api/insights/fetch-all-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json", 
              "authorization": `Bearer ${access_token}`, },
            body: JSON.stringify({
                  user_id: localStorage.getItem("user_id"),
            }),
          });
          if(!resFetchFileUploadHistory.ok){
            console.error("Unable to fetch all fileUpload sessions for the user")
            return;
          }
          const fetchFileUploadHistoryData = await resFetchFileUploadHistory.json();
          const dataFetchFileUploadHistory= await fetchFileUploadHistoryData?.data
        console.log("All user files are fetched successfully", JSON.stringify(dataFetchFileUploadHistory.data));
        const dashboardHistoryData= await dataFetchFileUploadHistory?.data;
        dashboardHistoryData.map((data:any, id:any)=>{
          if(data.session_id=== session_id){ 
            console.log("Setting up dashboard data in fetchFileUploadHistory as", data?.analytical_json_output)
            setIsLoading(false)
            setErrorDash(null)
            setDashboard_data(data?.analytical_json_output|| null)
            console.log("for welcome message, file_name", localStorage.getItem("file_name"), "row_count", localStorage.getItem("file_row_count"))
            setWelcomeMessage(`Great! I can see you've successfully uploaded ${localStorage.getItem("file_name")} with ${localStorage.getItem("file_row_count")} employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?`)
            setFileName(data?.analytical_json_output?.metadata?.filename)
            setFile_row_count(data?.analytical_json_output?.metadata?.totalRows)
            
          }
        })
  
    }

  const calculateChatHeight = () => {
    if (kpiGridRef.current) {
      const kpiGridRect = kpiGridRef.current.getBoundingClientRect()
      const kpiGridBottom = kpiGridRect.bottom
      const windowHeight = window.innerHeight
      const availableHeight = windowHeight - kpiGridBottom - 40
      const minHeight = 450
      const maxHeight = 700
      const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight))
      setChatHeight(calculatedHeight)
    }
  }

  //Reset ChatBot Height
  useEffect(() => {
    calculateChatHeight()
    window.addEventListener("resize", calculateChatHeight)
    const timer = setTimeout(calculateChatHeight, 100)

    return () => {
      window.removeEventListener("resize", calculateChatHeight)
      clearTimeout(timer)
    }
  }, [])

  const recordCount = employeeData.length || 1247
  // const welcomeMessage= 
  //   `Great! I can see you've successfully uploaded ${fileName?fileName: "HRIS_Export_HealthServ_2024.csv"} with ${file_row_count?file_row_count: "1,247"} employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?`

  

  const suggestedQueries= sample_questions? JSON.parse(sample_questions): [
    "Show me a breakdown of our 1,247 employees by department",
    "What's our current turnover rate and which departments are most affected?",
    "Analyze salary distribution across different roles and levels",
    "Who are our highest-risk employees for attrition?",
    "Compare our headcount growth over the past quarters",
    "What insights can you provide for our next leadership meeting?",
  ]
  
  useEffect(() => {
    if (!dashboard_data) return;

    console.log("Dashboard data is", dashboard_data);

    const { cards, charts, metadata } = dashboard_data;

    // Color mapping for different color names
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      green: '#10b981',
      purple: '#8b5cf6',
      orange: '#f59e0b',
      teal: '#14b8a6',
      indigo: '#6366f1',
      red: '#ef4444',
      pink: '#ec4899'
    };

    // Transform cards into KPI cards with drill-down support
    const kpiCards = cards.map((card: any) => {
      const baseCard = {
        label: card.title,
        icon: card.icon,
        color: colorMap[card.color] || '#3b82f6',
        description: card.field || '',
        calculationType: 'custom' as const,
        calculate: () => card.value,
      };

      // Add drill-down data if available
      if (card.drillDown) {
        return {
          ...baseCard,
          drillDownData: {
            cards: card.drillDown.cards?.map((ddCard: any) => ({
              label: ddCard.title,
              icon: ddCard.icon,
              color: colorMap[ddCard.color] || '#3b82f6',
              description: ddCard.description || '',
              calculationType: 'custom' as const,
              calculate: () => ddCard.value,
            })) || [],
            charts: card.drillDown.charts?.map((ddChart: any) => {
              const chartType = ddChart.type === 'horizontalBar' ? 'bar' : ddChart.type;
              const layout = ddChart.type === 'horizontalBar' ? 'horizontal' : ddChart.type === 'bar' ? 'vertical' : undefined;

              return {
                title: ddChart.title,
                icon: ddChart.icon,
                type: chartType as 'bar' | 'pie' | 'line',
                color: ddChart.colors?.[0] || '#3b82f6',
                dataKey: ddChart.field,
                layout: layout,
                height: 300,
                customDataGenerator: () => ddChart.data.map((item: any) => ({
                  name: item.name,
                  value: item.value,
                  percentage: item.percentage
                })),
              };
            }) || [],
            // insights: card.drillDown.insights?.map((insight: any) => ({
            //   type: insight.type || 'info',
            //   title: insight.title,
            //   description: insight.description
            // })) || []
            insights: card.drillDown.insights ? {
              critical_issues: card.drillDown.insights.critical_issues || [],
              recommended_actions: card.drillDown.insights.recommended_actions || []
            } : undefined
          }
        };
      }

      return baseCard;
    });

    // Transform charts into chart configs with drill-down support
    const chartConfigs = charts.map((chart: any) => {
      const chartType = chart.type === 'horizontalBar' ? 'bar' : chart.type;
      const layout = chart.type === 'horizontalBar' ? 'horizontal' : chart.type === 'bar' ? 'vertical' : undefined;

      const baseChart = {
        title: chart.title,
        icon: chart.icon,
        // type: chartType as 'bar' | 'pie' | 'line',
        type: chartType,
        color: chart.colors?.[0] || '#3b82f6',
        dataKey: chart.field,
        layout: layout,
        height: 400,
        customDataGenerator: () => chart.data.map((item: any) => ({
          name: item.name,
          value: item.value,
          percentage: item.percentage
        })),
      };

      // Add drill-down data if available
      if (chart.drillDown) {
        return {
          ...baseChart,
          drillDownData: {
            cards: chart.drillDown.cards?.map((ddCard: any) => ({
              label: ddCard.title,
              icon: ddCard.icon,
              color: colorMap[ddCard.color] || '#3b82f6',
              description: ddCard.description || '',
              calculationType: 'custom' as const,
              calculate: () => ddCard.value,
            })) || [],
            charts: chart.drillDown.charts?.map((ddChart: any) => {
              const ddChartType = ddChart.type === 'horizontalBar' ? 'bar' : ddChart.type;
              const ddLayout = ddChart.type === 'horizontalBar' ? 'horizontal' : ddChart.type === 'bar' ? 'vertical' : undefined;

              return {
                title: ddChart.title,
                icon: ddChart.icon,
                type: ddChartType as 'bar' | 'pie' | 'line',
                color: ddChart.colors?.[0] || '#3b82f6',
                dataKey: ddChart.field,
                layout: ddLayout,
                height: 300,
                customDataGenerator: () => ddChart.data.map((item: any) => ({
                  name: item.name,
                  value: item.value,
                  percentage: item.percentage
                })),
              };
            }) || [],
            // insights: chart.drillDown.insights?.map((insight: any) => ({
            //   type: insight.type || 'info',
            //   title: insight.title,
            //   description: insight.description
            // })) || []
            insights: chart.drillDown.insights ? {
              critical_issues: chart.drillDown.insights.critical_issues || [],
              recommended_actions: chart.drillDown.insights.recommended_actions || []
            } : undefined
          }
        };
      }

      return baseChart;
    });

    console.log("filename received in page.tsx for dashboard-uo-1", metadata.filename)
    console.log("rowCount received in page.tsx for dashboard-uo-1", metadata.totalRows)


    // Create dashboard config
    const newConfig: ConfigurableDashboardProps = {
      title: "Analytics Dashboard",
      subtitle: "Interactive insights from your data",
      data: [], // No raw data needed since we're using custom generators
      filters: [],
      kpiCards,
      charts: chartConfigs,
      filename: metadata.filename,
      rowCount: String(metadata.totalRows),
      tableColumns: [], // Add if needed
      colors: charts[0]?.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1']
    };

    setConfig(newConfig);
  }, [dashboard_data]);

  return (
    <>
    <Script 
        src="https://unpkg.com/@babel/standalone/babel.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Babel loaded')}
      />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* DesignVersionToggle is hidden */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        { isLoading?
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600">While we load dashboard for you, please interact with chatbot below for possible queries on data</p>
              </div>
            </div>:
      

        errorDash?
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">{errorDash}</p>
              </div>
            </div>:

        // Pass the component code from API to GeneratedDashboard
        
        <Generated_Dashboard {...config} />
      }


        {/* Chat Interface */}
        <div className="w-full">
          <ChatInterface
            context={dashboardConfig?.context || {}}
            height={chatHeight}
            placeholder="Ask about your uploaded data insights..."
            welcomeMessage={welcomeMessage}
            suggestedQueries={suggestedQueries}
            inputProps={{ "data-chat-input": true }}
          />
        </div>
      </div>

      {/* Welcome Tour */}
      {showWelcomeTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Welcome to your personalized dashboard!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your dashboard shows insights from your uploaded data. We're ready to help you tackle your urgent
                  task!
                </p>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">File Upload Status</p>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    The file <span className="font-medium">{fileName}</span> has been successfully uploaded and is being
                    processed.
                  </p>
                  <p className="text-xs text-green-700">
                    Processing complete • {file_row_count} employee records analyzed • Ready for insights
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Your data insights:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• KPI tiles show real metrics from your HRIS data</li>
                    <li>• Chat with your data using natural language</li>
                    <li>• Ask about turnover, departments, or specific employees</li>
                    <li>• Get leadership meeting insights instantly</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowWelcomeTour(false)}>Got it, let's explore!</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </>
  )
}
