// app/dashboard/page.tsx
// ============================================
// MAIN DASHBOARD PAGE (SIMPLIFIED)
// ============================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from 'lucide-react';
import Script from 'next/script';
import { ChatInterface } from "@/components/chat-interface";
import { useDashboard } from '@/contexts/DashboardContext';
import Generated_Dashboard from './generated_dashboard';
import sample_dashboard_data from "@/public/sample_dashboard_data";
import { apiFetch } from "@/lib/api/client";
import { closeWebSocket } from '@/lib/ws';
import type { ConfigurableDashboardProps } from "@/types/dashboard";

/**
 * Main Dashboard Page Component
 * Handles data loading and WebSocket updates
 */
export default function DashboardPage() {
  const searchParams = useSearchParams();
  
  // Context state
  const { 
    dashboard_data, 
    setDashboard_data, 
    isLoading, 
    setIsLoading, 
    errorDash, 
    setErrorDash 
  } = useDashboard();

  // Local state
  const [config, setConfig] = useState<ConfigurableDashboardProps | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileRowCount, setFileRowCount] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
  const [chatHeight, setChatHeight] = useState(400);
  const kpiGridRef = useRef<HTMLDivElement>(null);

  // ============================================
  // INITIALIZATION & DATA LOADING
  // ============================================

  useEffect(() => {
    // Check if it's a demo/sample upload
    const fileUploaded = searchParams.get("hasFile");
    
    if (fileUploaded === "false") {
      // Use sample data
      handleSampleData();
      return;
    }

    // Load real data from session
    handleRealData();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Unmounting dashboard component");
      setDashboard_data(null);
      closeWebSocket();
    };
  }, []);

  /**
   * Handle sample/demo data
   */
  const handleSampleData = () => {
    setFileName("SharpMedian.csv");
    setFileRowCount("512");
    setDashboard_data(sample_dashboard_data);
    setWelcomeMessage(
      `Great! I can see you've successfully uploaded SharpMedian.csv with 512 employee records. ` +
      `I'm ready to help you analyze this data and generate insights for your HR initiatives. ` +
      `What would you like to explore first?`
    );
  };

  /**
   * Handle real data from session
   */
  const handleRealData = () => {
    const sessionId = localStorage.getItem("session_id");
    const storedFileName = localStorage.getItem("file_name");
    const storedRowCount = localStorage.getItem("file_row_count");
    const storedQuestions = localStorage.getItem("sample_questions");

    // Set welcome message
    if (storedFileName && storedRowCount) {
      setWelcomeMessage(
        `Great! I can see you've successfully uploaded ${storedFileName} with ${storedRowCount} employee records. ` +
        `I'm ready to help you analyze this data and generate insights for your HR initiatives. ` +
        `What would you like to explore first?`
      );
    }

    // Set sample questions
    if (storedQuestions) {
      try {
        setSampleQuestions(JSON.parse(storedQuestions));
      } catch (e) {
        console.error("Failed to parse sample questions:", e);
      }
    }

    // Fetch dashboard data from history
    // if (sessionId) {
    //   setIsLoading(true);
    //   fetchFileUploadHistory(sessionId);
    // } else {
    //   setErrorDash("Session not found");
    // }
  };

  /**
   * Fetch dashboard data from upload history
   */
  const fetchFileUploadHistory = async (sessionId: string) => {
    try {
      console.log("📡 Fetching file upload history for session:", sessionId);
      
      const response = await apiFetch("/api/insights/fetch-all-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
        }),
      });

      const dashboardHistoryData = response?.data?.data;
      
      if (!dashboardHistoryData) {
        throw new Error("No history data received");
      }

      console.log("📊 Dashboard history data:", dashboardHistoryData);

      // Find matching session
      const matchingSession = dashboardHistoryData.find(
        (data: any) => data.session_id === sessionId
      );

      if (matchingSession) {
        console.log("✅ Found matching session:", sessionId);
        setIsLoading(false);
        setErrorDash(null);
        setDashboard_data(matchingSession?.analytical_json_output || null);
        setFileName(matchingSession?.analytical_json_output?.metadata?.filename);
        setFileRowCount(matchingSession?.analytical_json_output?.metadata?.totalRows);
      } else {
        console.warn("⚠️ No matching session found for:", sessionId);
        setIsLoading(false);
        setErrorDash("Dashboard not found");
      }
    } catch (error) {
      console.error("❌ Failed to fetch dashboard history:", error);
      setIsLoading(false);
      setErrorDash("Failed to load dashboard");
    }
  };

  // ============================================
  // TRANSFORM DASHBOARD DATA TO PROPS
  // ============================================

  useEffect(() => {
    if (!dashboard_data) return;

    const { cards, charts, metadata } = dashboard_data;

    // Color mapping
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

    // Transform cards
    const kpiCards = cards.map((card: any) => ({
      label: card.title,
      icon: card.icon,
      color: colorMap[card.color] || '#3b82f6',
      description: card.field || '',
      // calculationType: 'custom' as const,
      // calculate: () => card.value,
      value: card.value,
      drillDownData: card.drillDownData // Attach drilldown if exists
    }));

    // Transform charts
    const chartConfigs = charts.map((chart: any) => ({
      id: chart.id,
      title: chart.title,
      icon: chart.icon,
      type: chart.type === 'horizontalBar' ? 'bar' : chart.type,
      color: chart.colors?.[0] || '#3b82f6',
      colors: chart.colors,
      dataKey: chart.field,
      field: chart.field,
      layout: chart.type === 'horizontalBar' ? 'horizontal' : 
              chart.type === 'bar' ? 'vertical' : undefined,
      height: 400,
      data: chart.data || [],
      customDataGenerator: chart.data ? () => chart.data : undefined,
      drillDownData: chart.drillDownData // Attach drilldown if exists
    }));

    // Create config
    const newConfig: ConfigurableDashboardProps = {
      kpiCards,
      charts: chartConfigs,
      filename: metadata?.filename || "",
      rowCount: String(metadata?.totalRows) || "",
      colors: charts?.[0]?.colors || [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'
      ]
    };

    setConfig(newConfig);
  }, [dashboard_data]);

  // ============================================
  // CHAT HEIGHT CALCULATION
  // ============================================

  const calculateChatHeight = () => {
    if (kpiGridRef.current) {
      const kpiGridRect = kpiGridRef.current.getBoundingClientRect();
      const kpiGridBottom = kpiGridRect.bottom;
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - kpiGridBottom - 40;
      const minHeight = 450;
      const maxHeight = 700;
      const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight));
      setChatHeight(calculatedHeight);
    }
  };

  useEffect(() => {
    calculateChatHeight();
    window.addEventListener("resize", calculateChatHeight);
    const timer = setTimeout(calculateChatHeight, 100);

    return () => {
      window.removeEventListener("resize", calculateChatHeight);
      clearTimeout(timer);
    };
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Load Babel for JSX transformation */}
      <Script 
        src="https://unpkg.com/@babel/standalone/babel.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('✅ Babel loaded')}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          
          {/* Dashboard */}
          { !errorDash && config && (
            <div ref={kpiGridRef}>
              <Generated_Dashboard {...config} />
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600">
                  Loading your dashboard... Meanwhile, you can interact with the chatbot below.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorDash && !isLoading && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium">{errorDash}</p>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="w-full mt-8">
            <ChatInterface
              context={{}}
              height={chatHeight}
              placeholder="Ask about your uploaded data insights..."
              welcomeMessage={welcomeMessage}
              suggestedQueries={sampleQuestions}
              inputProps={{ "data-chat-input": true }}
            />
          </div>
        </div>
      </div>
    </>
  );
}