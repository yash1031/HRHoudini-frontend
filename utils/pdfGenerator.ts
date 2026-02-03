// utils/pdfGenerator.ts
// ============================================
// ENHANCED PDF GENERATION WITH PARALLEL PROCESSING
// ============================================

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PDFGenerationOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Wait for an element to be fully rendered (especially for Recharts)
 */
const waitForElementReady = async (
  element: HTMLElement,
  maxWait: number = 5000
): Promise<boolean> => {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const checkReady = () => {
      // Check if element has SVG content (for Recharts)
      const svgs = element.querySelectorAll('svg');
      const hasContent = svgs.length > 0 || element.scrollHeight > 0;
      
      // Check if SVGs are fully rendered (have width/height)
      let allSvgsReady = true;
      svgs.forEach((svg) => {
        if (!svg.getAttribute('width') || !svg.getAttribute('height')) {
          allSvgsReady = false;
        }
      });
      
      if (hasContent && (svgs.length === 0 || allSvgsReady)) {
        // Additional wait for any animations/transitions
        setTimeout(() => resolve(true), 200);
        return;
      }
      
      if (Date.now() - startTime > maxWait) {
        console.warn(`Element ${element.id} not ready after ${maxWait}ms`);
        resolve(false);
        return;
      }
      
      requestAnimationFrame(checkReady);
    };
    
    checkReady();
  });
};

/**
 * Capture a specific element and return canvas with retry logic
 */
const captureElement = async (
  elementId: string,
  options: { scale?: number; retries?: number } = {}
): Promise<HTMLCanvasElement | null> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
    return null;
  }

  const retries = options.retries || 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Wait for element to be ready
      console.log(`Waiting for ${elementId} to be ready (attempt ${attempt}/${retries})...`);
      await waitForElementReady(element, 5000);
      
      // Ensure element is visible and has proper dimensions
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn(`${elementId} has zero dimensions, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth || rect.width,
        windowHeight: element.scrollHeight || rect.height,
        width: element.scrollWidth || rect.width,
        height: element.scrollHeight || rect.height,
        onclone: (clonedDoc) => {
          // Ensure all elements are visible in cloned document
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.visibility = 'visible';
            clonedElement.style.opacity = '1';
            clonedElement.style.overflow = 'visible';
            
            // Ensure all child SVGs are visible
            const svgs = clonedElement.querySelectorAll('svg');
            svgs.forEach((svg) => {
              svg.style.display = 'block';
              svg.style.visibility = 'visible';
              svg.style.overflow = 'visible';
            });
            
            // Ensure all text elements are visible
            const texts = clonedElement.querySelectorAll('text');
            texts.forEach((text) => {
              text.style.visibility = 'visible';
            });
          }
        }
      });
      
      // Validate canvas
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has zero dimensions');
      }
      
      console.log(`✓ Successfully captured ${elementId} (${canvas.width}x${canvas.height})`);
      return canvas;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt}/${retries} failed for ${elementId}:`, lastError.message);
      
      if (attempt < retries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error(`Failed to capture ${elementId} after ${retries} attempts:`, lastError);
  return null;
};

/**
 * Process canvas into image data with dimensions (CPU-intensive part)
 */
const processCanvasForPDF = (canvas: HTMLCanvasElement) => {
  // Convert to image data (CPU-intensive operation)
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Calculate image dimensions to fit page
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Center vertically if image is smaller than page
  const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
  
  return {
    imgData,
    imgWidth,
    imgHeight: Math.min(imgHeight, pageHeight),
    yOffset
  };
};

/**
 * Add pre-processed image data to PDF on a specific page
 */
const addImageToPDF = (
  pdf: jsPDF,
  imageData: ReturnType<typeof processCanvasForPDF>,
  pageNumber: number
) => {
  pdf.setPage(pageNumber);
  pdf.addImage(
    imageData.imgData,
    'PNG',
    0,
    imageData.yOffset,
    imageData.imgWidth,
    imageData.imgHeight
  );
};

/**
 * Generate comprehensive PDF with parallel processing
 */
export const generateComprehensivePDF = async (
  options: PDFGenerationOptions & { chartQty?: number } = {}
): Promise<void> => {
  const {
    filename = 'HR_Houdini_Report.pdf',
    scale = 2,
    chartQty = 50 
  } = options;

  console.log(`Chart quantity: ${chartQty}`);

  try {
    console.log('Starting PDF generation...');

    // Calculate total pages needed (1 for header + KPI cards, chartQty for charts)
    const totalPages = chartQty + 1;
    console.log(`Initializing PDF with ${totalPages} pages...`);

    // Initialize PDF with A4 format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Add all pages upfront
    for (let i = 1; i < totalPages; i++) {
      pdf.addPage();
    }

    // STEP 1: Capture and process first page (Header + KPI Cards)
    console.log('Capturing page 1 (header + KPI cards)...');
    const page1Canvas = await captureElement('pdf-page-1', { scale, retries: 3 });
    
    if (!page1Canvas) {
      console.warn('Failed to capture page 1');
      throw new Error('Failed to capture header page');
    }

    const page1Data = processCanvasForPDF(page1Canvas);
    addImageToPDF(pdf, page1Data, 1);
    console.log('Page 1 added successfully');

    // STEP 2: Collect all chart element IDs
    console.log('Collecting chart elements...');
    const chartElements = [];
    let chartIdx = 0;
    
    while (chartIdx < chartQty) {
      const chartPageId = `pdf-chart-${chartIdx}`;
      const chartElement = document.getElementById(chartPageId);
      
      if (!chartElement) {
        console.log(`No more chart pages found (checked ${chartPageId})`);
        break;
      }
      
      chartElements.push({ id: chartPageId, index: chartIdx });
      chartIdx++;
      
      // Safety limit to prevent infinite loops
      if (chartIdx > 50) {
        console.warn('Safety limit reached (50 charts)');
        break;
      }
    }

    console.log(`Found ${chartElements.length} chart pages. Processing with staggered capture...`);

    // STEP 3: Capture and process all charts with staggered start
    // Stagger the start of each capture by 100ms to avoid overwhelming the browser
    // and ensure charts have time to render
    const processPromises: any = chartElements.map(async ({ id, index }, arrayIndex) => {
      // Stagger the start of each capture by 100ms to avoid race conditions
      await new Promise(resolve => setTimeout(resolve, arrayIndex * 100));
      
      console.log(`Capturing and processing chart page ${index + 1}...`);
      const chartCanvas = await captureElement(id, { scale, retries: 3 });
      
      if (!chartCanvas) {
        console.warn(`Failed to capture chart page ${index}`);
        return null;
      }
      
      // Process canvas to image data (CPU-intensive, done in parallel)
      const imageData = processCanvasForPDF(chartCanvas);
      
      console.log(`Chart page ${index + 1} processed successfully`);
      
      return {
        imageData,
        index,
        targetPage: index + 2 // Page 1 is header, charts start at page 2
      };
    });

    // Wait for all parallel processing to complete
    const processedCharts = (await Promise.all(processPromises)).filter(Boolean);

    console.log(`Adding ${processedCharts.length} charts to PDF...`);

    // STEP 4: Add all processed images to PDF sequentially (fast operation)
    let pageCount = 1; // Already added page 1
    
    processedCharts.forEach(({ imageData, index, targetPage }) => {
      addImageToPDF(pdf, imageData, targetPage);
      pageCount++;
      console.log(`Chart page ${index + 1} added to PDF page ${targetPage}`);
    });

    // STEP 5: Save PDF
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