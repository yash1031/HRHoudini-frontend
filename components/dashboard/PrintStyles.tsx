// components/dashboard/PrintStyles.tsx
// ============================================
// PRINT OPTIMIZATION STYLES FOR PDF GENERATION
// ============================================

"use client";

import React from 'react';

/**
 * Component that injects global styles for PDF generation optimization
 * These styles ensure proper rendering when html2canvas captures the printable dashboard
 */
export const PrintStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* Print-specific optimizations for PDF generation */
      #printable-dashboard {
        /* Force GPU acceleration for smoother rendering */
        transform: translateZ(0);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Ensure all text is crisp and readable */
      #printable-dashboard * {
        text-rendering: optimizeLegibility;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Prevent content from being cut off */
      #printable-dashboard > div {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Ensure backgrounds are printed */
      #printable-dashboard .bg-gradient-to-r,
      #printable-dashboard .bg-gradient-to-br {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Optimize SVG rendering for charts */
      #printable-dashboard svg {
        shape-rendering: geometricPrecision;
      }

      /* Ensure proper text wrapping */
      #printable-dashboard p,
      #printable-dashboard span,
      #printable-dashboard li {
        word-wrap: break-word;
        overflow-wrap: break-word;
      }

      /* Prevent orphaned headings */
      #printable-dashboard h1,
      #printable-dashboard h2,
      #printable-dashboard h3,
      #printable-dashboard h4 {
        page-break-after: avoid;
        break-after: avoid;
      }

      /* Ensure images don't break across pages */
      #printable-dashboard img {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      /* Fix for rounded corners in PDF */
      #printable-dashboard [style*="border-radius"] {
        overflow: hidden;
      }

      /* Ensure proper spacing is maintained */
      #printable-dashboard [style*="gap"],
      #printable-dashboard [style*="grid-gap"] {
        display: grid;
      }

      /* Force display of hidden elements during capture */
      #printable-dashboard [style*="display: none"] {
        display: block !important;
      }

      /* Optimize chart rendering */
      #printable-dashboard .recharts-wrapper {
        display: inline-block !important;
        overflow: visible !important;
      }

      #printable-dashboard .recharts-surface {
        overflow: visible !important;
      }

      /* Prevent chart clipping - ensure pie charts have enough space */
      #printable-dashboard .recharts-pie {
        overflow: visible !important;
      }

      /* Ensure chart containers don't clip content */
      #printable-dashboard [id^="pdf-chart-"] {
        overflow: visible !important;
      }

      #printable-dashboard [id^="pdf-chart-"] > div {
        overflow: visible !important;
      }

      /* Ensure SVG elements are fully visible */
      #printable-dashboard svg {
        overflow: visible !important;
        max-width: none !important;
      }

      /* Ensure proper layering */
      #printable-dashboard {
        z-index: 9999;
        isolation: isolate;
      }

      /* Print-specific page breaks */
      @media print {
        #printable-dashboard > div {
          page-break-after: always;
        }

        #printable-dashboard > div:last-child {
          page-break-after: auto;
        }
      }

      /* Optimize performance during capture */
      #printable-dashboard * {
        will-change: auto !important;
        animation: none !important;
        transition: none !important;
      }

      /* Ensure shadows render properly */
      #printable-dashboard [style*="box-shadow"] {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
      }

      /* Fix for transparent backgrounds */
      #printable-dashboard {
        background-color: white !important;
      }

      /* Ensure proper font loading */
      #printable-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
                     "Helvetica Neue", Arial, sans-serif !important;
      }

      /* Optimize grid layouts for PDF */
      #printable-dashboard [style*="grid-template-columns"] {
        display: grid !important;
      }

      /* Fix for flex layouts */
      #printable-dashboard [style*="display: flex"] {
        display: flex !important;
      }

      /* Ensure visibility of all content */
      #printable-dashboard * {
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* Fix for absolute positioning in PDF context */
      #printable-dashboard [style*="position: absolute"] {
        position: absolute !important;
      }

      /* Optimize color rendering */
      #printable-dashboard {
        color-profile: sRGB;
        rendering-intent: perceptual;
      }

      /* Ensure borders render correctly */
      #printable-dashboard [style*="border"] {
        border-style: solid;
      }

      /* Fix for gradients in some browsers */
      #printable-dashboard [style*="gradient"] {
        background-attachment: scroll;
      }
    `}</style>
  );
};
