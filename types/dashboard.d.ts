// types/dashboard.d.ts
// ============================================
// CENTRALIZED TYPE DEFINITIONS FOR DASHBOARD
// ============================================

import React from 'react';

// ============================================
// QUERY & DATA STRUCTURES
// ============================================

export interface QueryColumn {
  expression: string;
  alias: string;
}

export interface QueryFrom {
  type: 'parquet' | 'table';
  source: string;
}

export interface QueryWhere {
  field?: string;
  column?: string;
  operator?: string;
  type?: 'static' | 'dynamic';
  value?: any;
  condition?: string;
}

export interface QueryOrderBy {
  field?: string;
  column?: string;
  alias?: string;
  position?: number;
  direction?: 'ASC' | 'DESC';
}

export interface QueryObject {
  dialect?: string;
  select: {
    columns: QueryColumn[];
  };
  from: QueryFrom;
  where: QueryWhere[];
  groupBy: (string | number)[];
  orderBy: (string | QueryOrderBy)[];
  limit?: number | null;
  parameters?: Record<string, any>;
  union?: QueryObject[];
}

// ============================================
// FILTER STRUCTURES
// ============================================

export interface WhereClause {
  field: string;
  operator: string;
  paramNames: string[];
  type: string;
}

export interface FilterOption {
  field: string;
  label: string;
  type: 'multiselect' | 'select' | 'range' | 'date_range';
  options?: string[];
  min?: number;
  max?: number;
  whereClause?: WhereClause;
  // Date range specific properties
  bounds?: {
    min: string;
    max: string;
  };
  presets?: Array<{
    id: string;
    label: string;
    start?: string;
    end?: string;
  }>;
  default?: {
    preset?: string;
    start: string;
    end: string;
  };
}

export interface FilterState {
  [key: string]: any;
}

// ============================================
// CHART & DATA STRUCTURES
// ============================================

export interface ChartDataItem {
  name?: string;
  value?: number;
  percentage?: number;
  [key: string]: any;
}

export interface DataItem {
  [key: string]: any;
}

// ============================================
// INSIGHT STRUCTURES
// ============================================

export interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

// ============================================
// DRILLDOWN STRUCTURE
// ============================================

export interface DrillDownData {
  filters?: FilterOption[];
  cards?: KPICard[];
  charts?: ChartConfig[];
  insights?: Insight;
}

// ============================================
// KPI CARD STRUCTURE
// ============================================

export interface KPICard {
  // API format fields
  id?: string;
  title?: string;
  value?: string;
  field?: string;
  icon: string;
  color: string;
  note?: string;
  description?: string;
  
  // UI format fields (for dynamic calculation)
  label?: string;
  calculationType?: 'count' | 'average' | 'distinct' | 'custom';
  dataKey?: string;
  extractValue?: (item: DataItem) => number;
  format?: (value: number) => string | number;
  filterCondition?: (item: DataItem) => boolean;
  calculate?: (data: DataItem[]) => string | number;
  
  // Drilldown support (both formats)
  drillDown?: DrillDownData;
  drillDownData?: DrillDownData;
}

// ============================================
// CHART CONFIG STRUCTURE
// ============================================

export interface ChartConfig {
  // Identification
  id?: string;
  semantic_id?: string;
  
  // Display properties
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'line' | 'horizontalBar';
  color?: string;
  colors?: string[];
  description?: string;
  
  // Data keys
  field?: string;
  dataKey?: string;
  xDataKey?: string;
  yDataKey?: string;
  valueKey?: string;
  xLabel?: string;
  yLabel?: string;
  xUnit?: string;
  yUnit?: string;
  
  // Layout
  layout?: string;
  height?: number;
  sort?: 'asc' | 'desc';
  lineName?: string;
  
  // Data sources
  data?: ChartDataItem[];
  customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
  queryObject?: QueryObject;
  
  // Drilldown support (both formats)
  drillDown?: DrillDownData;
  drillDownData?: DrillDownData;
}

// ============================================
// METADATA STRUCTURE
// ============================================

export interface AnalyticsMetadata {
  totalRows: number;
  filename: string;
  totalColumns?: number;
  generatedAt?: string;
  numericFields?: number;
  categoricalFields?: number;
  parquetDataUrl?: string;
  columns?: string[];
  numericFieldsList?: string[];
  categoricalFieldsList?: string[];
  columnTypes?: Record<string, string>;
  tokenMapsUrl?: string;
}

// ============================================
// COMPLETE DASHBOARD DATA STRUCTURE
// ============================================

export interface DashboardData {
  cards: KPICard[];
  charts: ChartConfig[];
  metadata: AnalyticsMetadata;
}

// ============================================
// COMPONENT PROPS
// ============================================

export interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
  kpiCards?: KPICard[];
  charts?: ChartConfig[];
  rowCount?: string;
  filename?: string;
  colors?: string[];
  parquetDataUrl?: string;
  columns?: string[];
  metadataFields?: {
    numericFields: string[];
    categoricalFields: string[];
    tokenMapsUrl?: string;
  };
}

// ============================================
// MODAL STATE
// ============================================

export interface ModalState {
  isOpen: boolean;
  title: string;
  drillDownData?: DrillDownData;
}

// ============================================
// WEBSOCKET MESSAGE STRUCTURES
// ============================================

export interface WebSocketMessage {
  event: 'global_queries.ready' | 'kpi.main.ready' | 'drilldown.ready' | 'insights.ready';
  payload: any;
}

export interface DrilldownPayload {
  parent_chart_id: string | null;
  kpi_id: string | null;
  charts: Array<{
    id: string;
    title: string;
    type: string;
    icon: string;
    field: string;
    query_obj: QueryObject;
    description?: string;
  }>;
  filters: FilterOption[];
  insights?: Insight;
}