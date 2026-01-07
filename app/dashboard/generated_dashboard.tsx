// app/dashboard/generated_dashboard.tsx
// ============================================
// MAIN GENERATED DASHBOARD COMPONENT WITH GRANULAR LOADING/ERROR
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, FileText, Bot, Zap, Brain } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import type { ConfigurableDashboardProps, ModalState, KPICard, ChartConfig } from '@/types/dashboard';
import { KPICards } from "@/components/dashboard/KPICards";
import { ChartGrid } from "@/components/dashboard/ChartGrid";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { HTMLDashboardModal } from "@/components/dashboard/HTMLDashboardModal"
import { apiFetch } from '@/lib/api/client';
import { CardsGridSkeleton, ChartsGridSkeleton, SkeletonStyles } from "@/components/dashboard/Skeletons";
import { CardsError, ChartsError, SectionError, CompleteFailure } from "@/components/dashboard/ErrorStates";
import { addListener } from '@/lib/ws';

interface GeneratedDashboardProps extends ConfigurableDashboardProps {
  // Section states
  cardsLoading?: boolean;
  cardsError?: string | null;
  chartsLoading?: boolean;
  chartsError?: string | null;
  drilldownsState?: Record<string, { loading: boolean; error: boolean }>;
}

/**
 * Generated Dashboard Component
 * Main dashboard view with KPI cards and charts
 * Supports granular loading/error states per section
 */
const Generated_Dashboard: React.FC<GeneratedDashboardProps> = ({
  kpiCards = [],
  charts = [],
  rowCount,
  filename,
  cardsLoading = false,
  cardsError = null,
  chartsLoading = false,
  chartsError = null,
  drilldownsState = {}
}) => {
  // Modal state for drilldown
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: ''
  });

  // State for available dashboards
  const [availableDashboards, setAvailableDashboards] = useState<Array<{
    button_title: string;
    report_title: string;
    report_description: string;
    html_content: string;
  }>>([]);
  const [dashboardsLoading, setDashboardsLoading] = useState(false);
  let handler: (msg: any) => void = () => {};

  // HTML Report Modal state
  const [htmlReportModal, setHtmlReportModal] = useState({
    isOpen: false,
    htmlContent: '',
    reportTitle: '',
    reportDescription: '',
    isLoading: false,
    error: null as string | null
  });


  /**
   * Handle KPI card click - open drilldown modal
   */
  const handleKPIClick = (kpi: KPICard): void => {
    if (!kpi?.drillDownData && !kpi?.drillDown) return;
    
    setModal({
      isOpen: true,
      title: `${kpi.title || kpi.label} - Detailed Analysis`,
      drillDownData: kpi.drillDownData || kpi.drillDown
    });
  };

  /**
   * Handle chart click - open drilldown modal
   */
  const handleChartClick = (chart: ChartConfig): void => {
    if (!chart?.drillDownData && !chart?.drillDown) return;

    setModal({
      isOpen: true,
      title: `${chart.title} - Detailed Analysis`,
      drillDownData: chart.drillDownData || chart.drillDown
    });
  };

  /**
   * Close drilldown modal
   */
  const closeModal = (): void => {
    setModal({ isOpen: false, title: '' });
  };

  const fetchAvailableDashboards = async () => {
    const userIdFromStorage = localStorage.getItem('user_id');
    const sessionIdFromStorage = localStorage.getItem('session_id');

    if (!userIdFromStorage || !sessionIdFromStorage) {
      return;
    }

    setDashboardsLoading(true);
    try {
      const response = await apiFetch('/api/fetch-agentic-dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userIdFromStorage,
          session_id: sessionIdFromStorage
        })
      }).catch((error) => {
        console.error('Error fetching dashboards:', error);
        return null;
      });

      if (response && response.success && response.reports && response.reports.length > 0) {
        setAvailableDashboards(response.reports);
      }
    } catch (error) {
      console.error('Error fetching available dashboards:', error);
    } finally {
      setDashboardsLoading(false);
    }
  };

  // Fetch available dashboards on component mount
  useEffect(() => {
    fetchAvailableDashboards();
    handler = async (msg: any) => {
        console.log('[WS] message received', msg);
        if(msg.event==="agent_dashboard.stored"){
          fetchAvailableDashboards();
        }
    };
    addListener(handler!, "agentic-dashboard-handler");
  }, []);

  /**
   * Handle individual dashboard generation
   */
  const handleGenerateDashboard = async (report: {
    button_title: string;
    report_title: string;
    report_description: string;
    html_content: string;
  }): Promise<void> => {
    setHtmlReportModal({
      isOpen: true,
      htmlContent: '',
      reportTitle: report.report_title,
      reportDescription: report.report_description,
      isLoading: true,
      error: null
    });

    try {
      // Simulate loading if needed, or directly set content
      setTimeout(() => {
        setHtmlReportModal(prev => ({
          ...prev,
          htmlContent: report.html_content,
          isLoading: false
        }));
      }, 500);
    } catch (error) {
      console.error('Error opening dashboard:', error);
      setHtmlReportModal(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard'
      }));
    }
  };

  /**
   * Close HTML report modal
   */
  const closeHtmlReportModal = (): void => {
    setHtmlReportModal({
      isOpen: false,
      htmlContent: '',
      reportTitle: '',
      reportDescription: '',
      isLoading: false,
      error: null
    });
  };

  // Extract summary data from first few cards (only if cards loaded)
  const [card1, card2, card3] = kpiCards;
  const hasCards = kpiCards.length > 0;

  return (
    <>
      <SkeletonStyles />

      {/* Agentic Dashboards Section - Modern Minimal with Subtle Animation */}
      {availableDashboards.length > 0 && (
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="max-w-7xl mx-auto px-12 py-6">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Clean minimal with accent */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-xl font-bold text-slate-800">
                      Explore Specialized Agentic Reports
                    </h2>
                  </div>
                </div>
              </div>
              
              {/* Right: Vibrant buttons */}
              <div className="flex flex-wrap gap-3">
                {availableDashboards.map((dashboard, index) => (
                  <button
                    key={index}
                    onClick={() => handleGenerateDashboard(dashboard)}
                    className="group relative flex items-center space-x-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 transform hover:-translate-y-1"
                  >
                    <span className="font-bold text-sm">{dashboard.button_title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl mb-6">
            <div className="px-8 py-6">
              {/* Title Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">HR Houdini</h1>
                    <p className="text-blue-100">
                      Your AI workforce analyst - Ready to dive deeper into {filename} data
                    </p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2 text-white">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">{filename}</span>
                      <span className="text-blue-200">•</span>
                      <span className="text-blue-200">{rowCount} records</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Insights Summary - Only show if cards loaded */}
              {/* {hasCards && (
                <div className="bg-white/10 rounded-xl p-4">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Key Metrics Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {card1 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="font-medium text-white">
                          {card1.title || card1.label}
                        </span>
                        <span className="text-blue-100">{card1.value}</span>
                      </div>
                    )}
                    {card2 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-white">
                          {card2.title || card2.label}
                        </span>
                        <span className="text-blue-100">{card2.value}</span>
                      </div>
                    )}
                    {card3 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                        <span className="font-medium text-white">
                          {card3.title || card3.label}
                        </span>
                        <span className="text-blue-100">{card3.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Partial Success Messages or complete failure*/}
          {/* {!cardsLoading && cardsError && !chartsLoading && !chartsError && charts.length > 0 && (
            <SectionError message="KPI cards could not be generated, but charts are available and you can intercat with chatbot below" />
          )}
          {!chartsLoading && chartsError && !cardsLoading && !cardsError && kpiCards.length > 0 && (
            <SectionError message="Some charts could not be generated, but KPI cards are available and you can intercat with chatbot below" />
          )}
          {!cardsLoading && !chartsLoading && cardsError && chartsError && (
            <CompleteFailure message="Error generating the dashboard but you can still interact with chatbot below" />
          )} */}

          {/* KPI Cards Section */}
          <div className={hasCards ? 'mb-6' : ''}>
            {cardsLoading && <CardsGridSkeleton />}
            {/* {cardsError && !cardsLoading && <CardsError message={cardsError} />} */}
            {!cardsLoading && !cardsError && kpiCards.length > 0 && (
              <KPICards cards={kpiCards} onCardClick={handleKPIClick} />
            )}
          </div>

          {/* Charts Section */}
          <div className={charts.length > 0 ? 'mt-6' : ''}>
            {chartsLoading && <ChartsGridSkeleton />}
            {/* {chartsError && !chartsLoading && <ChartsError message={chartsError} />} */}
            {!chartsLoading && !chartsError && charts.length > 0 && (
              <ChartGrid 
                charts={charts} 
                onChartClick={handleChartClick}
                drilldownsState={drilldownsState}
              />
            )}
          </div>
        </div>

        {/* Drilldown Modal */}
        <DrillDownModal modal={modal} onClose={closeModal} />

        {/* HTML Report Modal */}
        <HTMLDashboardModal
          isOpen={htmlReportModal.isOpen}
          onClose={closeHtmlReportModal}
          htmlContent={htmlReportModal.htmlContent}
          reportTitle={htmlReportModal.reportTitle}
          reportDescription={htmlReportModal.reportDescription}
          isLoading={htmlReportModal.isLoading}
          error={htmlReportModal.error}
        />
      </div>
    </>
  );
};

export default Generated_Dashboard;