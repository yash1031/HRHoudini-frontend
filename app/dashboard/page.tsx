// app/dashboard/page.tsx
// ============================================
// MAIN DASHBOARD PAGE WITH GRANULAR STATE MANAGEMENT
// ============================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Script from 'next/script';
import { ChatInterface } from "@/components/chat-interface";
import { useDashboard } from '@/contexts/dashboard-context';
import Generated_Dashboard from './generated_dashboard';
import sample_dashboard_data from "@/public/sample_dashboard_data";
import { apiFetch } from "@/lib/api/client";
import { closeWebSocket } from '@/lib/ws';
import { DashboardToasts, ToastStyles } from "@/components/dashboard/StatusToast";
import type { ConfigurableDashboardProps } from "@/types/dashboard";

/**
 * Main Dashboard Page Component
 * Handles data loading and WebSocket updates with granular state management
 */
export default function DashboardPage() {
  const searchParams = useSearchParams();
  
  // Context state - now using granular states
  const { 
    cardsState,
    setCardsState,
    chartsState, 
    setChartsState,
    drilldownsState,
    setDrilldownsState,
    metadata,
    setMetadata,
    setDashboard_data
  } = useDashboard();

  // Local state
  const [config, setConfig] = useState<ConfigurableDashboardProps | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileRowCount, setFileRowCount] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
  const [chatHeight, setChatHeight] = useState(400);
  const kpiGridRef = useRef<HTMLDivElement>(null);
  const { athenaCreated, setAthenaCreated} = useDashboard();

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
      setAthenaCreated(true)
    };
  }, []);

  /**
   * Handle sample/demo data
   */
  const handleSampleData = () => {
    setFileName("SharpMedian.csv");
    setFileRowCount("512");
    
    // Set sample data directly without loading states (instant load)
    setCardsState({
      loading: false,
      error: null,
      data: sample_dashboard_data.cards
    });
    
    setChartsState({
      loading: false,
      error: null,
      data: sample_dashboard_data.charts
    });
    
    setMetadata(sample_dashboard_data.metadata);
    
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
  };

  // ============================================
  // TRANSFORM DASHBOARD DATA TO PROPS
  // ============================================

  useEffect(() => {
    const hasData = cardsState.data.length > 0 || chartsState.data.length > 0;
    if (!hasData && !metadata) return;

    const { data: cards } = cardsState;
    const { data: charts } = chartsState;

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
      value: card.value,
      drillDownData: card.drillDownData
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
      drillDownData: chart.drillDownData
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
  }, [cardsState.data, chartsState.data, metadata]);

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
  // HANDLERS FOR TOAST DISMISSAL
  // ============================================

  const handleDismissCardsError = () => {
    setCardsState(prev => ({ ...prev, error: null }));
  };

  const handleDismissChartsError = () => {
    setChartsState(prev => ({ ...prev, error: null }));
  };

  // ============================================
  // RENDER
  // ============================================

  const isAnyLoading = cardsState.loading || chartsState.loading;
  const hasAnyError = cardsState.error || chartsState.error;

  return (
    <>
      {/* Load Babel for JSX transformation */}
      <Script 
        src="https://unpkg.com/@babel/standalone/babel.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Babel loaded')}
      />
      
      <ToastStyles />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          
          {/* Status Toasts - Below header, above dashboard */}
          <DashboardToasts
            cardsLoading={cardsState.loading}
            cardsError={cardsState.error}
            chartsLoading={chartsState.loading}
            chartsError={chartsState.error}
            onDismissCardsError={handleDismissCardsError}
            onDismissChartsError={handleDismissChartsError}
          />

          {/* Dashboard with granular states */}
          <div ref={kpiGridRef}>
            <Generated_Dashboard 
              {...config}
              cardsLoading={cardsState.loading}
              cardsError={cardsState.error}
              chartsLoading={chartsState.loading}
              chartsError={chartsState.error}
              drilldownsState={drilldownsState}
            />
          </div>

          {/* Chat Interface */}
          {athenaCreated && (<div className="w-full mt-8">
            <ChatInterface
              placeholder="Ask about your uploaded data insights..."
              welcomeMessage={welcomeMessage}
              suggestedQueries={sampleQuestions}
            />
          </div>)}
        </div>
      </div>
    </>
  );
}