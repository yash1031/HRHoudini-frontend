// utils/pdfGenerator.ts
// ============================================
// ENHANCED PDF GENERATION WITH PROPER FORMATTING
// ============================================

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PDFGenerationOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Capture a specific element and return canvas
 */
const captureElement = async (
  elementId: string,
  options: { scale?: number } = {}
): Promise<HTMLCanvasElement | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: options.scale || 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure all elements are visible in cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.display = 'block';
        }
      }
    });
    return canvas;
  } catch (error) {
    console.error(`Failed to capture element "${elementId}":`, error);
    return null;
  }
};

/**
 * Add canvas to PDF as a full page with proper margins
 */
const addPageToPDF = (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  isFirstPage: boolean = false
) => {
  if (!isFirstPage) {
    pdf.addPage();
  }

  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Calculate image dimensions to fit page
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Center vertically if image is smaller than page
  const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
  
  // Add image to PDF
  pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, Math.min(imgHeight, pageHeight));
};

/**
 * Generate comprehensive PDF with properly formatted pages
 */
export const generateComprehensivePDF = async (
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    filename = 'HR_Houdini_Report.pdf',
    scale = 2
  } = options;

  try {
    console.log('Starting PDF generation...');

    // Initialize PDF with A4 format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    let pageCount = 0;

    // STEP 1: Capture First Page (Header + KPI Cards)
    console.log('Capturing page 1 (header + KPI cards)...');
    const page1Canvas = await captureElement('pdf-page-1', { scale });
    
    if (page1Canvas) {
      addPageToPDF(pdf, page1Canvas, pageCount === 0);
      pageCount++;
      console.log(`Page 1 added successfully`);
    } else {
      console.warn('Failed to capture page 1');
    }

    // STEP 2: Capture each chart page (Main Chart + Drilldown)
    console.log('Capturing chart pages...');
    let chartIdx = 0;
    
    while (true) {
      const chartPageId = `pdf-chart-${chartIdx}`;
      const chartElement = document.getElementById(chartPageId);
      
      if (!chartElement) {
        console.log(`No more chart pages found (checked ${chartPageId})`);
        break;
      }
      
      console.log(`Capturing chart page ${chartIdx + 1}...`);
      const chartCanvas = await captureElement(chartPageId, { scale });
      
      if (chartCanvas) {
        addPageToPDF(pdf, chartCanvas, pageCount === 0);
        pageCount++;
        console.log(`Chart page ${chartIdx + 1} added successfully`);
      } else {
        console.warn(`Failed to capture chart page ${chartIdx}`);
      }
      
      chartIdx++;
      
      // Safety limit to prevent infinite loops
      if (chartIdx > 50) {
        console.warn('Safety limit reached (50 charts)');
        break;
      }
    }

    // STEP 3: Save PDF
    console.log(`PDF generation complete. Total pages: ${pageCount}`);
    
    if (pageCount === 0) {
      throw new Error('No pages were captured. Please check if the printable dashboard is rendered correctly.');
    }
    
    pdf.save(filename);
    console.log(`PDF saved as: ${filename}`);
    
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error(error instanceof Error ? error.message : 'PDF generation failed. Please try again.');
  }
};

/**
 * Alternative: Generate PDF by capturing entire printable dashboard at once
 * (Use this if sequential capture has issues)
 */
export const generateSingleCapturePDF = async (
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    filename = 'HR_Houdini_Report.pdf',
    scale = 2
  } = options;

  try {
    console.log('Starting single-capture PDF generation...');
    
    const element = document.getElementById('printable-dashboard');
    if (!element) {
      throw new Error('Printable dashboard element not found');
    }

    // Capture entire dashboard
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Initialize PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
      compress: true
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    
    // Split into A4 pages
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = Math.ceil(canvas.height / pageHeight);
    
    console.log(`Splitting into ${totalPages} pages...`);
    
    // Create proper pages
    const finalPdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    let currentPage = 0;
    
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) finalPdf.addPage();
      
      const sourceY = i * pageHeight;
      const sourceHeight = Math.min(pageHeight, canvas.height - sourceY);
      
      // Create temporary canvas for this page
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sourceHeight;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        finalPdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
    }
    
    finalPdf.save(filename);
    console.log(`PDF saved as: ${filename}`);
    
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error(error instanceof Error ? error.message : 'PDF generation failed. Please try again.');
  }
};

/**
 * Simple single-page PDF generation (for testing)
 */
export const generateSimplePDF = async (
  elementId: string = 'printable-dashboard',
  filename: string = 'dashboard.pdf'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);
    
  } catch (error) {
    console.error('Failed to generate simple PDF:', error);
    throw error;
  }
};