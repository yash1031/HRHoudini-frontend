// app/dashboard/generated_dashboard.tsx
// ============================================
// MAIN GENERATED DASHBOARD COMPONENT WITH GRANULAR LOADING/ERROR
// ============================================

"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle, FileText, Download, Loader2, AlertCircle} from 'lucide-react';
import type { ConfigurableDashboardProps, ModalState, KPICard, ChartConfig } from '@/types/dashboard';
import { KPICards } from "@/components/dashboard/KPICards";
import { ChartGrid } from "@/components/dashboard/ChartGrid";
import { DrillDownModal } from "@/components/dashboard/DrillDownModal";
import { HTMLDashboardModal } from "@/components/dashboard/HTMLDashboardModal"
import { PrintableDashboard } from "@/components/dashboard/PrintableDashboard";
import { PrintStyles } from "@/components/dashboard/PrintStyles";
import { apiFetch } from '@/lib/api/client';
import { CardsGridSkeleton, ChartsGridSkeleton, SkeletonStyles } from "@/components/dashboard/Skeletons";
import { generateComprehensivePDF } from '@/utils/pdfGenerator';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  // HTML Report Modal state
  const [htmlReportModal, setHtmlReportModal] = useState({
    isOpen: false,
    htmlContent: '',
    isLoading: false,
    error: null as string | null
  });

  // PDF generation states
  const [showPrintable, setShowPrintable] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  /*
   * Handle HTML report generation
   */
  const handleGenerateReport = async (): Promise<void> => {
    setHtmlReportModal({
      isOpen: true,
      htmlContent: '',
      isLoading: true,
      error: null
    });

    try {
      // Fetch values from localStorage
      const selectedKpisStr = localStorage.getItem('hr-houdini-selected-kpis-with-desc');
      const userIdFromStorage = localStorage.getItem('user_id');
      const sessionIdFromStorage = localStorage.getItem('session_id');
      const fileNameFromStorage = localStorage.getItem('file_name');

      // Validate required fields
      if (!userIdFromStorage || !sessionIdFromStorage || !fileNameFromStorage) {
        throw new Error('Missing required data in localStorage. Please refresh and try again.');
      }

      // Parse selected KPIs
      let selectedKpis = [];
      if (selectedKpisStr) {
        try {
          selectedKpis = JSON.parse(selectedKpisStr);
        } catch (e) {
          console.warn('Failed to parse selected KPIs from localStorage:', e);
          selectedKpis = [];
        }
      }

      const response = await apiFetch('/api/dashboard-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userIdFromStorage,
          session_id: sessionIdFromStorage,
          file_name: fileNameFromStorage,
          selected_kpis: selectedKpis
        })
      }).catch((error) => {
        const parsedError = JSON.parse(error.message);
        console.error('Error generating HTML report:', parsedError);
        throw new Error(parsedError.error || 'Failed to generate report');
      });

      if (response) {
        if (response.error) {
          throw new Error(response.error);
        }

        setHtmlReportModal(prev => ({
          ...prev,
          htmlContent: response.html_content,
          isLoading: false
        }));
      }

    } catch (error) {
      console.error('Error generating HTML report:', error);
      setHtmlReportModal(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate report'
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
      isLoading: false,
      error: null
    });
  };

  // const generatePDF = (elementId: string, filename: string = 'download.pdf') => {
  //   const input = document.getElementById(elementId);
  //   if (!input) {
  //     console.error('Target element not found!');
  //     return;
  //   }

  //   html2canvas(input, { logging: true, useCORS: true }) // Use useCORS for images
  //     .then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' portrait, 'mm' units, 'a4' format

  //       const imgWidth = 208; // A4 width in mm (approx)
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //       pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  //       pdf.save(filename); // Prompts the user to download
  //     });
  // };

  // const handleDownload = () => {
  //   generatePDF('dashboard-content', 'my-document.pdf');
  // };

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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate PDF
      setPdfProgress('Generating PDF document...');
      await generateComprehensivePDF({
        filename: `${filename}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        scale: 2
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
  const [card1, card2, card3] = kpiCards;
  const hasCards = kpiCards.length > 0;
  const isDashboardReady = !cardsLoading && !chartsLoading && (kpiCards.length > 0 || charts.length > 0);

  return (
    <>
      <SkeletonStyles />
      {/* <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12"> */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12">
        <div className="max-w-7xl mx-auto" id="dashboard-content"> 
          
          {/* Dashboard Header */}
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
                  {/* <Badge className="bg-white/20 text-white border-white/30">
                    Analysis Completed
                  </Badge> */}
                  {/* Generate Report Button */}
                  <button
                    onClick={handleGenerateReport}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20 hover:border-white/30"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Generate Detailed Dashboard</span>
                  </button>

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
        {/* <button onClick={handleDownload}>
          Download as PDF
        </button> */}

        {/* Drilldown Modal */}
        <DrillDownModal modal={modal} onClose={closeModal} />

        {/* HTML Report Modal */}
        <HTMLDashboardModal
          isOpen={htmlReportModal.isOpen}
          onClose={closeHtmlReportModal}
          htmlContent={htmlReportModal.htmlContent}
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