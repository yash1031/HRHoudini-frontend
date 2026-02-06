// app/dashboard/generated_dashboard.tsx
// ============================================
// MAIN GENERATED DASHBOARD COMPONENT WITH GRANULAR LOADING/ERROR
// ============================================

"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, FileText, Bot, Zap, Brain, Download, Loader2, AlertCircle, ChevronDown, ChevronRight, X, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import type { ConfigurableDashboardProps, ModalState, KPICard, ChartConfig, FilterOption, FilterState } from '@/types/dashboard';
import { KPICards } from "@/components/dashboard/KPICards";
import { ChartGrid } from "@/components/dashboard/ChartGrid";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { HTMLReportModal } from "@/components/dashboard/HTMLReportModal";
import { PrintableDashboard } from "@/components/dashboard/PrintableDashboard";
import { PrintStyles } from "@/components/dashboard/PrintStyles";
import { FilterControls } from "@/components/dashboard/FilterControls";
import { apiFetch } from '@/lib/api/client';
import { CardsGridSkeleton, ChartsGridSkeleton, SkeletonStyles } from "@/components/dashboard/Skeletons";
import { CardsError, ChartsError, SectionError, CompleteFailure } from "@/components/dashboard/ErrorStates";
import { addListener, removeListener } from '@/lib/ws';
import { generateComprehensivePDF } from '@/utils/pdfGenerator';

interface GeneratedDashboardProps extends ConfigurableDashboardProps {
  // Section states
  cardsLoading?: boolean;
  cardsError?: string | null;
  chartsLoading?: boolean;
  chartsError?: string | null;
  drilldownsState?: Record<string, { loading: boolean; error: boolean }>;
  // Main dashboard filters (from kpi.main.ready)
  mainFilters?: FilterOption[];
  mainDateFilter?: FilterOption | null;
  mainDateRange?: { start: string; end: string } | null;
  onMainDateRangeChange?: (range: { start: string; end: string } | null) => void;
  onMainFilterChange?: (filters: FilterState) => void;
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
  drilldownsState = {},
  mainFilters = [],
  mainDateFilter = null,
  mainDateRange = null,
  onMainDateRangeChange,
  onMainFilterChange,
}) => {
  // Modal state for drilldown
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: ''
  });

  const [availableReports, setAvailableReports] = useState<Array<{
    report_id?: string;
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

  // PDF generation states
  const [showPrintable, setShowPrintable] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Main dashboard filter state (for FilterControls display)
  const [mainFiltersOpen, setMainFiltersOpen] = useState(true);
  const [mainFiltersActive, setMainFiltersActive] = useState<FilterState>({});

  const handleMainFilterChange = (filters: FilterState) => {
    setMainFiltersActive(filters);
    onMainFilterChange?.(filters);
  };

  const handleClearMainFilters = () => {
    setMainFiltersActive({});
    onMainFilterChange?.({});
  };

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

  /**
   * Fetch all reports for the current session
   */
  const fetchAvailableReports = async () => {
    const sessionIdFromStorage = localStorage.getItem('session_id');

    if (!sessionIdFromStorage) {
      return;
    }

    setDashboardsLoading(true);
    try {
      const response = await apiFetch(
        `/api/ai-agents/reports?session_id=${encodeURIComponent(sessionIdFromStorage)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      ).catch((error) => {
        console.error('Error fetching dashboards:', error);
        return null;
      });

      if (response && response.reports && Array.isArray(response.reports) && response.reports.length > 0) {
        setAvailableReports(response.reports);
      } else {
        // When No reports are found for the session_id, we don't want to show the dashboard
        console.log('No reports found for session_id:', sessionIdFromStorage);
      }
    } catch (error) {
      console.error('Error fetching available dashboards:', error);
    } finally {
      setDashboardsLoading(false);
    }
  };

  /**
   * Fetch a single report by report_id
   */
  const fetchReportById = async (report_id: string) => {
    if (!report_id) {
      console.error('No report_id provided');
      return;
    }

    try {
      const response = await apiFetch(
        `/api/ai-agents/reports/${report_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      ).catch((error) => {
        console.error('Error fetching report by ID:', error);
        return null;
      });

      if (response) {
        // Normalize the response - handle different response structures
        // The API might return the report directly, or wrapped in an object
        const report = response.report;
        
        // Ensure all required fields are present
        const normalizedReport = {
          report_id: report.report_id || report_id,
          button_title: report.button_title || report.report_title || 'New Report',
          report_title: report.report_title || report.title || '',
          report_description: report.report_description || report.description || '',
          html_content: report.html_content || report.html || ''
        };

        console.log('[Dashboard] Fetched report:', normalizedReport);

        // Check if report already exists to avoid duplicates
        setAvailableReports(prev => {
          const exists = prev.some(d => d.report_id === report_id);
          if (exists) {
            // Update existing report
            return prev.map(d => 
              d.report_id === report_id ? normalizedReport : d
            );
          } else {
            // Append new report
            return [...prev, normalizedReport];
          }
        });
      }
    } catch (error) {
      console.error('Error fetching report by ID:', error);
    }
  };

  useEffect(() => {
    // Fetch all reports when component mounts (for history view)
    fetchAvailableReports();
    
    // Set up WebSocket listener for new reports
    handler = async (msg: any) => {
      console.log('[WS] message received', msg);
      if (msg.event === "agentic_report.stored") {
        // Check if report_id is available in the message payload
        // Try multiple possible locations for report_id
        const report_id = msg.payload?.report_id || msg.report_id || msg.payload?.data?.report_id;
        
        console.log('[WS] agent_dashboard.stored event, report_id:', report_id);
        
        if (report_id) {
          // Fetch the specific report by ID
          await fetchReportById(report_id);
        } else {
          console.warn('[WS] No report_id found in message, falling back to fetch all');
          // Fallback: fetch all reports if report_id is not available
          fetchAvailableReports();
        }
      }
    };
    
    addListener(handler!, "agentic-reports-handler");
    
    // Cleanup: remove listener on unmount
    return () => {
      removeListener("agentic-reports-handler");
    };
  }, []);

  /**
   * Handle individual dashboard generation
   */
  const handleGenerateReport = async (report: {
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

  // /** 
  //  * Close HTML report modal
  //  */
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

  /**
   * Handle PDF generation with progress tracking
   */
  const handleGeneratePDF = async (): Promise<void> => {
    setPdfGenerating(true);
    setPdfError(null);
    setPdfProgress('Preparing dashboard for export...');

    try {
      // Show printable version
      setShowPrintable(true);
      
      // Wait for render to complete (increased timeout for complex dashboards)
      setPdfProgress('Rendering all charts and data...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate PDF
      setPdfProgress('Generating PDF document...');
      await generateComprehensivePDF({
        filename: `${filename}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        scale: 2,
        chartQty: charts.length
      });
      
      setPdfProgress('PDF generated successfully!');
      
      // Hide printable version
      setTimeout(() => {
        setShowPrintable(false);
        setPdfGenerating(false);
        setPdfProgress('');
      }, 1000);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF');
      setShowPrintable(false);
      setPdfGenerating(false);
      setPdfProgress('');
    }
  };

  // Extract summary data from first few cards (only if cards loaded)
  // const [card1, card2, card3] = kpiCards;
  const hasCards = kpiCards.length > 0;
  const isDashboardReady = !cardsLoading && !chartsLoading && (kpiCards.length > 0 || charts.length > 0);

  // Keep only ONE date_range filter (the primary Date Range) in the main filters UI
  const dateFilters = (mainFilters || []).filter(f => f.type === "date_range");
  const primaryDateFilterOption = dateFilters[0] || null;
  const nonDateFilters = (mainFilters || []).filter(f => f.type !== "date_range");

  const visibleMainFilters = primaryDateFilterOption
    ? [primaryDateFilterOption, ...nonDateFilters]
    : nonDateFilters;


  return (
    <>
      <SkeletonStyles />
      
      {availableReports.length > 0 && (
        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="max-w-7xl mx-auto px-12 py-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Title Section */}
              <div className="flex items-center gap-4 flex-shrink-0">
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
              
              {/* Buttons Container - Right aligned, with smart wrapping */}
              <div className="flex-1 flex justify-end min-w-0">
                <div className="flex flex-wrap justify-end items-start gap-3 max-w-full w-full">
                  {availableReports.map((reports, index) => (
                    <button
                      key={index}
                      onClick={() => handleGenerateReport(reports)}
                      className="group relative flex items-center space-x-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 whitespace-nowrap flex-shrink-0"
                    >
                      <span className="font-bold text-sm">{reports.button_title}</span>
                    </button>
                  ))}
                </div>
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
                  {/* Generate PDF Button */}
                  <button
                    onClick={handleGeneratePDF}
                    disabled={pdfGenerating || !isDashboardReady}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed"
                  >
                    {pdfGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span className="font-medium">Download PDF Report</span>
                      </>
                    )}
                  </button>

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

          {/* PDF Progress Message */}
          {pdfGenerating && pdfProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-blue-900 font-medium">{pdfProgress}</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Please wait while we prepare your comprehensive report...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PDF Error Message */}
          {pdfError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-900 font-medium">PDF Generation Error</p>
                  <p className="text-red-700 text-sm mt-1">{pdfError}</p>
                  <button
                    onClick={() => setPdfError(null)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium mt-2 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards Section */}
          <div className={hasCards ? 'mb-6' : ''}>
            {cardsLoading && <CardsGridSkeleton />}
            {/* {cardsError && !cardsLoading && <CardsError message={cardsError} />} */}
            {!cardsLoading && !cardsError && kpiCards.length > 0 && (
              <KPICards cards={kpiCards} onCardClick={handleKPIClick} />
            )}
          </div>

          {/* Main dashboard filters - same Filters section as drilldown modal */}
          {!chartsLoading && !chartsError && charts.length > 0 && mainFilters.length > 0 && (() => {
            // Keep only ONE date_range filter (the primary Date Range) in the main filters UI
            const dateFilters = (mainFilters || []).filter(f => f.type === 'date_range');
            const primaryDateFilterOption = dateFilters[0] || null;
            const nonDateFilters = (mainFilters || []).filter(f => f.type !== 'date_range');

            const visibleMainFilters = primaryDateFilterOption
              ? [primaryDateFilterOption, ...nonDateFilters]
              : nonDateFilters;

            return (
              <div className="mb-6 border border-slate-200 rounded-lg bg-slate-50/50">
              <button
                type="button"
                onClick={() => setMainFiltersOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-600" />
                  {mainFiltersOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  Filters
                </span>
                {Object.keys(mainFiltersActive).length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    {Object.keys(mainFiltersActive).length} active
                  </span>
                )}
              </button>
              {mainFiltersOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-200">
                  <FilterControls
                    filters={visibleMainFilters}
                    onFilterChange={handleMainFilterChange}
                    onClearFilters={handleClearMainFilters}
                    currentFilters={mainFiltersActive}
                    dateRange={undefined}  // Always start empty for main dashboard
                    // For main dashboard, updating date range should ONLY update state;
                    // actual chart re-query (if any) should happen when Apply is clicked.
                    onDateChange={
                      mainDateFilter && onMainDateRangeChange
                        ? (start, end) => onMainDateRangeChange({ start, end })
                        : undefined
                    }
                    // If you later want main charts to re-query based on date,
                    // pass a handler here that uses mainDateRange + filters.
                    onApplyDateRange={undefined}
                    autoSelectDateDefault={false}
                  />

                    {/* Active Filters - same as drilldown: Clear All + per-filter Clear */}
                    {Object.keys(mainFiltersActive).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-700 flex items-center">
                            Active Filters ({Object.keys(mainFiltersActive).length})
                          </h4>
                          <button
                            onClick={handleClearMainFilters}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(mainFiltersActive).map(([field, filter]) => (
                            <div key={field} className="flex items-start gap-2">
                              <span className="text-sm font-medium text-slate-600 min-w-[100px] capitalize">
                                {field.replace(/_/g, ' ')}:
                              </span>
                              <div className="flex flex-wrap gap-2 flex-1">
                                {filter?.operator === 'IN' && Array.isArray(filter?.value) ? (
                                  filter.value.map((val: string, idx: number) => (
                                    <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                      {val}
                                      <X
                                        className="w-3 h-3 cursor-pointer hover:text-red-600"
                                        onClick={() => {
                                          const updated = { ...mainFiltersActive };
                                          const arr = (updated[field]?.value || []).filter((v: string) => v !== val);
                                          if (arr.length === 0) delete updated[field];
                                          else updated[field] = { ...updated[field], value: arr };
                                          handleMainFilterChange(updated);
                                        }}
                                      />
                                    </Badge>
                                  ))
                                ) : filter?.operator === 'BETWEEN' && filter?.value ? (
                                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                    {filter.value.min} - {filter.value.max}
                                    <X
                                      className="w-3 h-3 cursor-pointer hover:text-red-600"
                                      onClick={() => {
                                        const updated = { ...mainFiltersActive };
                                        delete updated[field];
                                        handleMainFilterChange(updated);
                                      }}
                                    />
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                    {String(filter?.value ?? '')}
                                    <X
                                      className="w-3 h-3 cursor-pointer hover:text-red-600"
                                      onClick={() => {
                                        const updated = { ...mainFiltersActive };
                                        delete updated[field];
                                        handleMainFilterChange(updated);
                                      }}
                                    />
                                  </Badge>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  const updated = { ...mainFiltersActive };
                                  delete updated[field];
                                  handleMainFilterChange(updated);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 font-medium ml-2"
                              >
                                Clear
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

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
        <HTMLReportModal
          isOpen={htmlReportModal.isOpen}
          onClose={closeHtmlReportModal}
          htmlContent={htmlReportModal.htmlContent}
          reportTitle={htmlReportModal.reportTitle}
          reportDescription={htmlReportModal.reportDescription}
          isLoading={htmlReportModal.isLoading}
          error={htmlReportModal.error}
        />

        {/* Hidden Printable Dashboard for PDF Generation */}
        {showPrintable && (
          <PrintableDashboard
            kpiCards={kpiCards}
            charts={charts}
            filename={filename|| ""}
            rowCount={Number(rowCount)}
          />
        )}
      </div>
    </>
  );
};

export default Generated_Dashboard;