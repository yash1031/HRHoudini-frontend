//types/dashboard.d.ts
// export interface DataItem {
//   [key: string]: any;
// }

// export interface FilterConfig {
//   key: string;
//   label: string;
//   dataKey: string;
//   options: string[];
// }

// export interface ChartDataItem {
//   name?: string;
//   value?: number;
//   [key: string]: any;
// }


// export interface KPICard {
//   label: string;
//   icon: string;
//   color: string;
//   description?: string;
//   calculationType: 'count' | 'average' | 'distinct' | 'custom';
//   dataKey?: string;
//   extractValue?: (item: DataItem) => number;
//   format?: (value: number) => string | number;
//   filterCondition?: (item: DataItem) => boolean;
//   calculate?: (data: DataItem[]) => string | number;
//   // drillDownChart?: DrillDownChart;
//   drillDownData?: DrillDownData;
// }

// export interface Insight {
//   critical_issues: string[];
//   recommended_actions: string[];
// }

// // export interface DrillDownData {
// //   cards: KPICard[];
// //   charts: ChartConfig[];
// //   insights?: Insight; // UPDATED: Changed from InsightItem[] to Insights
// // }

// export interface ChartConfig {
//   title: string;
//   icon: string;
//   type: 'bar' | 'pie' | 'line';
//   color: string;
//   dataKey?: string;
//   xDataKey?: string;
//   yDataKey?: string;
//   valueKey?: string;
//   layout?: string;
//   height?: number;
//   sort?: 'asc' | 'desc';
//   lineName?: string;
//   customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
//   // drillDown?: ChartDrillDown;
//   drillDownData?: DrillDownData;
// }

// export interface TableColumn {
//   label: string;
//   dataKey: string;
//   className?: string;
//   render?: (value: any, row: DataItem) => React.ReactNode;
// }

// export interface ConfigurableDashboardProps {
//   title?: string;
//   subtitle?: string;
//   data?: DataItem[];
//   filters?: FilterConfig[];
//   kpiCards?: KPICard[];
//   charts?: ChartConfig[];
//   rowCount?: string;
//   filename?: string;
//   tableColumns?: TableColumn[];
//   colors?: string[];
//   parquetDataUrl?: string;
//   columns?: string[];
//   metadataFields?: {
//     numericFields: string[];
//     categoricalFields: string[];
//     tokenMapsUrl?: string;  
//   };
// }

// export interface QueryObject {
//   dialect: string;
//   select: {
//     columns: Array<{
//       expression: string;
//       alias: string;
//     }>;
//   };
//   where: Array<{
//     condition: string;
//   }>;
//   groupBy: (string | number)[];
//   orderBy: (string | number)[];
//   parameters?: Record<string, any>;
// }

// export interface FilterOption {
//   field: string;
//   label: string;
//   type: 'multiselect' | 'select' | 'range';
//   options?: string[];
//   min?: number;
//   max?: number;
//   whereClause?: {
//     field: string;
//     operator: string;
//     paramNames: string[];
//     type: string;
//   };
// }

// export interface DrillDownData {
//   filters?: FilterOption[];
//   cards?: KPICard[];
//   charts?: Array<ChartConfig & { queryObject?: QueryObject }>;
//   insights?: Insight;
// }

import React from 'react';

export interface DataItem {
  [key: string]: any;
}

export interface FilterConfig {
  key: string;
  label: string;
  dataKey: string;
  options: string[];
}

export interface ChartDataItem {
  name?: string;
  value?: number;
  percentage?: number;
  [key: string]: any;
}

// Query structure for dynamic data loading
export interface QueryObject {
  dialect: string;
  select: {
    columns: Array<{
      expression: string;
      alias: string;
    }>;
  };
  where: Array<{
    condition: string;
  }>;
  groupBy: (string | number)[];
  orderBy: (string | number)[];
  parameters?: Record<string, any>;
}

// Filter configuration for UI
export interface FilterOption {
  field: string;
  label: string;
  type: 'multiselect' | 'select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
  whereClause?: {
    field: string;
    operator: string;
    paramNames: string[];
    type: string;
  };
}

// Insight structure
export interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

// Forward declaration for circular reference
export interface DrillDownData {
  filters?: FilterOption[];
  cards?: KPICard[];
  charts?: Array<ChartConfig & { queryObject?: QueryObject }>;
  insights?: Insight;
}

// KPI Card - Unified structure supporting both API and UI needs
export interface KPICard {
  id?: string; // For matching drilldown to parent
  title?: string; // API format
  label?: string; // UI format
  value?: string; // API format (pre-calculated)
  field?: string;
  icon: string;
  color: string;
  note?: string;
  description?: string;
  // For dynamic calculation (UI format)
  calculationType?: 'count' | 'average' | 'distinct' | 'custom';
  dataKey?: string;
  extractValue?: (item: DataItem) => number;
  format?: (value: number) => string | number;
  filterCondition?: (item: DataItem) => boolean;
  calculate?: (data: DataItem[]) => string | number;
  // Drilldown data
  drillDown?: DrillDownData; // API format
  drillDownData?: DrillDownData; // UI format (keep both for compatibility)
}

// Chart Config - Unified structure
export interface ChartConfig {
  id?: string; // For matching drilldown to parent
  semantic_id?: string; // Alternative ID from API
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'line' | 'horizontalBar';
  color: string;
  colors?: string[];
  field?: string;
  dataKey?: string;
  xDataKey?: string;
  yDataKey?: string;
  valueKey?: string;
  layout?: 'vertical' | 'horizontal';
  height?: number;
  sort?: 'asc' | 'desc';
  lineName?: string;
  description?: string;
  // Data can be provided statically or generated dynamically
  data?: ChartDataItem[];
  customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
  // Query object for dynamic data loading
  queryObject?: QueryObject;
  // Drilldown data
  drillDown?: DrillDownData; // API format
  drillDownData?: DrillDownData; // UI format (keep both for compatibility)
}

export interface TableColumn {
  label: string;
  dataKey: string;
  className?: string;
  render?: (value: any, row: DataItem) => React.ReactNode;
}

// Analytics metadata
export interface AnalyticsMetadata {
  totalRows: number;
  filename: string;
  totalColumns: number;
  generatedAt: string;
  numericFields: number;
  categoricalFields: number;
  parquetDataUrl?: string;
  columns?: string[];
  numericFieldsList?: string[];
  categoricalFieldsList?: string[];
  columnTypes?: Record<string, string>;
  tokenMapsUrl?: string;
}

// Dashboard data structure (from API)
export interface DashboardData {
  cards: KPICard[];
  charts: ChartConfig[];
  metadata: AnalyticsMetadata;
}

// Props for Generated Dashboard component
export interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
  filters?: FilterConfig[];
  kpiCards?: KPICard[];
  charts?: ChartConfig[];
  rowCount?: string;
  filename?: string;
  tableColumns?: TableColumn[];
  colors?: string[];
  parquetDataUrl?: string;
  columns?: string[];
  metadataFields?: {
    numericFields: string[];
    categoricalFields: string[];
    tokenMapsUrl?: string;
  };
}