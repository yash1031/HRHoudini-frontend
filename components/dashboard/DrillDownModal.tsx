// components/dashboard/DrillDownModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from 'lucide-react';
import type { ModalState, ChartConfig, ChartDataItem, FilterOption, FilterState } from '@/types/dashboard';
import { DynamicQueryBuilder } from '@/utils/queryBuilder';
import { executeBatchQueries } from '@/utils/parquetLoader';
import { FilterControls } from "./FilterControls";

interface DrillDownModalProps {
  modal: ModalState;
  onClose: () => void;
}

const getIcon = (iconName: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Users: LucideIcons.Users,
    BarChart: LucideIcons.BarChart3,
    TrendingUp: LucideIcons.TrendingUp,
    Globe: LucideIcons.Globe,
    Briefcase: LucideIcons.Briefcase,
    PieChart: LucideIcons.PieChart
  };
  return iconMap[iconName] || LucideIcons.BarChart3;
};

/**
 * Light color palette for bar/line charts
 * (single color per chart, different charts get different colors)
 */
const LIGHT_CHART_COLORS = [
  '#3b82f6', // darker blue (was light blue)
  '#10b981', // darker green (was light green)
  '#f97316', // darker orange (was light orange)
  '#8b5cf6', // darker purple (was light purple)
  '#0ea5e9', // darker sky blue (was light sky)
  '#ef4444', // darker red (was light red)
  '#f59e0b', // darker amber (was light amber)
  '#0284c7', // darker blue (was very light blue)
  '#059669', // darker green (was very light green)
  '#ec4899'  // darker pink (was light pink)
];

/**
 * Deterministically get a light color for a chart so it stays
 * consistent between renders and across dashboard / PDF views.
 */
const getChartColor = (): string => {
  const idx= Math.floor(Math.random()*(LIGHT_CHART_COLORS.length));
  return LIGHT_CHART_COLORS[idx];
};

/**
 * Generate unique colors for pie chart segments
 */
const generatePieColors = (count: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(getChartColor());
  }
  return colors;
};


// Create a separate component for pie charts
const PieChartRenderer: React.FC<{ chartData: ChartDataItem[]; chartConfig: Partial<ChartConfig> }> = ({ 
  chartData, 
  chartConfig 
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    
    // Process data to show top 5 + Others
    const processedChartData = React.useMemo(() => {
      const TOP_N = 5;
      
      // Sort by value descending
      const sortedData = [...chartData].sort((a, b) => 
        (b[chartConfig.valueKey || 'value'] || 0) - (a[chartConfig.valueKey || 'value'] || 0)
      );
      
      if (sortedData.length <= TOP_N) {
        return sortedData;
      }
      
      // Take top 5
      const topData = sortedData.slice(0, TOP_N);
      
      // Combine remaining into "Others"
      const othersData = sortedData.slice(TOP_N);
      const othersValue = othersData.reduce((sum, item) => 
        sum + (item[chartConfig.valueKey || 'value'] || 0), 0
      );
      
      // Calculate percentage for Others
      const totalValue = sortedData.reduce((sum, item) => 
        sum + (item[chartConfig.valueKey || 'value'] || 0), 0
      );
      const othersPercentage = (othersValue / totalValue) * 100;
      
      // Add Others slice
      topData.push({
        [chartConfig.nameKey || 'name']: `Others (${othersData.length} items)`,
        [chartConfig.valueKey || 'value']: othersValue,
        percentage: othersPercentage,
        isOthers: true,
        othersCount: othersData.length,
        othersItems: othersData
      });
      
      return topData;
    }, [chartData, chartConfig.valueKey, chartConfig.nameKey]);

    const pieColors = generatePieColors(processedChartData.length);
    const totalValue = processedChartData.reduce((sum, d) => sum + (d[chartConfig.valueKey || 'value'] || 0), 0);

    // Custom legend
    const CustomLegend = ({ payload }: any) => {
      return (
        <div className="grid grid-cols-2 gap-2 mt-4 px-4">
          {payload.map((entry: any, index: number) => (
            <div 
              key={`legend-${index}`}
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 truncate flex-1" title={entry.value}>
                {entry.value}
              </span>
              <span className="text-gray-500 text-[10px]">
                {((entry.payload.value / totalValue) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      );
    };

    // Custom tooltip for "Others" slice
    const CustomTooltip = ({ active, payload }: any) => {
      if (!active || !payload || !payload.length) return null;
      
      const data = payload[0].payload;
      const name = data[chartConfig.nameKey || 'name'];
      const value = data[chartConfig.valueKey || 'value'];
      const percentage = ((value / totalValue) * 100).toFixed(1);
      
      if (data.isOthers) {
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
            <p className="font-semibold text-gray-900 mb-2">
              Others ({data.othersCount} items)
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Total: {value.toFixed(2)} ({percentage}%)
            </p>
            <div className="border-t border-gray-200 mt-2 pt-2 max-h-40 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-1">Included items:</p>
              {data.othersItems?.slice(0, 10).map((item: any, idx: number) => (
                <div key={idx} className="text-xs text-gray-600 flex justify-between gap-2">
                  <span className="truncate">{item[chartConfig.nameKey || 'name']}</span>
                  <span className="text-gray-500">
                    {item[chartConfig.valueKey || 'value']?.toFixed(2)}
                  </span>
                </div>
              ))}
              {data.othersItems && data.othersItems.length > 10 && (
                <p className="text-xs text-gray-400 mt-1">
                  + {data.othersItems.length - 10} more...
                </p>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">
            {value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    };

    return (
      <PieChart width={400} height={350} margin={{ top: 60, bottom: 5, left: 70 }}> 
        <Pie
          data={processedChartData}
          cx="50%"
          cy="45%" 
          innerRadius={80}
          outerRadius={130}
          fill="#8884d8"
          dataKey={chartConfig.valueKey || 'value'}
          label={false}
          activeIndex={activeIndex !== null ? activeIndex : undefined}
          activeShape={{
            outerRadius: 140,
            strokeWidth: 2,
            stroke: '#fff'
          }}
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {processedChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isOthers ? '#94a3b8' : pieColors[index]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          content={<CustomLegend />}
          verticalAlign="bottom"
          height={80} 
        />
      </PieChart>
    );

}

const renderChart = (
  chartData: ChartDataItem[], 
  chartConfig: Partial<ChartConfig>
): React.ReactNode => {
  
  if (chartConfig.type === 'pie') {
    return <PieChartRenderer chartData={chartData} chartConfig={chartConfig} />;
  }

  if (chartConfig.type === 'line') {
      const dataPointCount = chartData.length;
      const shouldShowDots = dataPointCount <= 10;
      const maxXTicks = 12;
      const shouldSkipLabels = dataPointCount > maxXTicks;

      const xTickStyle: any = {
        fill: '#64748b',
        fontSize: 12
      };

      // Always incline category labels for line charts so
      // appearance is consistent regardless of number of data points.
      xTickStyle.angle = -50;
      xTickStyle.textAnchor = 'end';

      // Calculate maximum length of x-axis data point strings for proportional offset
      const maxLabelLength = chartData.length > 0
        ? Math.max(...chartData.map(item => {
            const label = String(item[chartConfig.xDataKey || 'name'] || '');
            return label.length;
          }))
        : 0;

      // Calculate proportional offset: base offset + (maxLength * multiplier)
      // Longer labels need more space, so offset becomes more negative
      const xAxisLabelOffset = Math.min(-80, -80 - (maxLabelLength * 0.75));

      const xLabelText = `${chartConfig.xLabel || ''}${chartConfig.xUnit ? ` (${chartConfig.xUnit})` : ''}`.trim();
      const yLabelText = `${chartConfig.yLabel || ''}${chartConfig.yUnit ? ` (${chartConfig.yUnit})` : ''}`.trim();

      const ticks = shouldSkipLabels
        ? chartData
            .map((_, idx) => idx)
            .filter((_, idx) => {
              const step = Math.ceil(dataPointCount / maxXTicks);
              return idx === 0 || idx % step === 0 || idx === dataPointCount - 1;
            })
            .map(idx => chartData[idx][chartConfig.xDataKey || 'name'])
        : undefined;

      const lineColor = getChartColor();
      
      return (
        <LineChart 
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 130, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
  
          {/* X-Axis with arrow indicator */}
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={xTickStyle}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            ticks={ticks}
            label={ { 
              value: xLabelText? xLabelText: "X-Axis-Label",
              position: 'insideBottom',
              offset: xAxisLabelOffset,
              style: { fill: '#64748b', fontSize: 16 }
            }}
          />
  
          {/* Y-Axis with arrow indicator */}
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={ { 
              value: yLabelText ? yLabelText: "Y-Axis-Label",
              angle: -90, 
              position: 'insideLeft',
              offset: 0,
              style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
            }}
          />
  
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any) => {
              if (chartConfig.yUnit) {
                return [value + ' ' + chartConfig.yUnit, chartConfig.yLabel || 'Value'];
              }
              return [value, chartConfig.yLabel || 'Value'];
            }}
          />
  
          <Line
            type="monotone"
            dataKey={chartConfig.yDataKey || 'value'}
            stroke={lineColor}
            strokeWidth={shouldShowDots ? 2 : 2.5}
            dot={shouldShowDots ? { 
              r: 5, 
              fill: lineColor,
              strokeWidth: 2,
              stroke: '#fff'
            } : false}
            activeDot={!shouldShowDots ? { 
              r: 6, 
              fill: lineColor,
              stroke: '#fff',
              strokeWidth: 2
            } : { r: 7 }}
            name={chartConfig.lineName || chartConfig.yLabel || 'Value'}
          />
        </LineChart>
      );
  }

  const isHorizontal = chartConfig.layout === 'horizontal' || 
                       chartConfig.type === 'horizontalBar';

  const dataPointCount = chartData.length;
  const maxXTicks = 12;
  const maxYTicks = 6;
  const shouldSkipLabels = !isHorizontal && dataPointCount > maxXTicks;
  const shouldSkipYLabels = isHorizontal && dataPointCount > maxYTicks;

  const xTickStyle: any = {
    fill: '#64748b',
    fontSize: 12
  };

  // Always incline category labels for vertical bar charts so
  // appearance is consistent regardless of number of data points.
  if (!isHorizontal) {
    xTickStyle.angle = -50;
    xTickStyle.textAnchor = 'end';
  }

  // Calculate maximum length of x-axis data point strings for proportional offset
  const maxLabelLength = chartData.length > 0
    ? Math.max(...chartData.map(item => {
        const label = String(item[chartConfig.xDataKey || 'name'] || '');
        return label.length;
      }))
    : 0;

  // Calculate proportional offset for vertical bar charts: base offset + (maxLength * multiplier)
  // Longer labels need more space, so offset becomes more negative
  const xAxisLabelOffset = !isHorizontal
    ? Math.min(-80, -80 - (maxLabelLength * 0.75))
    : -5;

  // For horizontal bar charts, adjust Y-axis width proportionally to label length
  const yAxisWidth = isHorizontal
    ? Math.max(80, Math.min(150, 80 + (maxLabelLength * 4)))
    : undefined;

  // Adjust left margin for horizontal charts based on yAxisWidth
  const leftMargin = isHorizontal 
    ? Math.max(60, Math.min(120, 60 + (maxLabelLength * 3)))
    : 10;

  const xLabelText = `${chartConfig.xLabel }`;
  const yLabelText = `${chartConfig.yLabel }`;

  const barColor = getChartColor();

  return (
    <BarChart 
      data={chartData}
      layout={isHorizontal ? "vertical" : "horizontal"} 
      margin={{
        top: 20,
        right: 30,
        bottom: isHorizontal ? 30 : 130,
        left: 60
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis 
            type="number" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={
              {
                value: xLabelText? xLabelText: "X-Axis-Label",
                position: 'insideBottom',
                offset: xAxisLabelOffset,
                style: { fill: '#64748b', fontSize: 16 }
              }
            }
          />
          <YAxis 
            dataKey={'name'} 
            type="category" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            interval={shouldSkipYLabels ? Math.max(Math.ceil(dataPointCount / maxYTicks) - 1, 0) : 0}
            label={ {
              value: yLabelText? yLabelText: "Y-Axis-Label",
              angle: -90,
              position: 'insideLeft',
              offset: -30,
              style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
            } }
          />
        </>
      ) : (
        <>
          <XAxis 
            dataKey={'name'} 
            tick={xTickStyle} 
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            interval={shouldSkipLabels ? Math.max(Math.ceil(dataPointCount / maxXTicks) - 1, 0) : 0}
            label={
              {
                value: xLabelText? xLabelText: "X-Axis-Label",
                position: 'insideBottom',
                offset: xAxisLabelOffset,
                style: { fill: '#64748b', fontSize: 16 }}
            }
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={ {
              value: yLabelText? yLabelText: "Y-Axis-Label",
              angle: -90,
              position: 'insideLeft',
              offset: 15,
              style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
            } }
          />
        </>
      )}
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px' 
        }} 
        formatter={(value: any) => {
          if (chartConfig.yUnit) {
            return [value + ' ' + chartConfig.yUnit, chartConfig.yLabel || 'Value'];
          }
          return [value, isHorizontal ? chartConfig.xLabel || 'Value' : chartConfig.yLabel || 'Value'];
        }}
      />
      <Bar 
        dataKey="value" 
        fill={barColor} 
        radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} 
      />
    </BarChart>
  );
};

/** Order filters: date_range first, then by relevance to drilldown charts (filter label/field in chart title/field first) */
function orderFiltersByDrilldownRelevance(
  filters: FilterOption[],
  charts: Array<{ title?: string; field?: string }>
): FilterOption[] {
  if (!filters?.length) return [];
  const chartText = (charts || [])
    .map((c) => `${(c.title || '').toLowerCase()} ${(c.field || '').toLowerCase()}`)
    .join(' ');
  const score = (f: FilterOption): number => {
    if (f.type === 'date_range') return 1000;
    const label = (f.label || '').toLowerCase();
    const field = (f.field || '').toLowerCase();
    const relevance = [label, field].filter((t) => t && chartText.includes(t)).length;
    return relevance > 0 ? 500 + relevance : 0;
  };
  return [...filters].sort((a, b) => score(b) - score(a));
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ modal, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [chartData, setChartData] = useState<Record<number, any[]>>({});
  const [originalChartData, setOriginalChartData] = useState<Record<number, any[]>>({});
  const [dateFilter, setDateFilter] = useState<FilterOption | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState<{ start: string; end: string } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(true); // collapsible filters section, open by default

  const orderedFilters = orderFiltersByDrilldownRelevance(
    modal.drillDownData?.filters || [],
    modal.drillDownData?.charts || []
  );

  // Store original data on first load and extract date filter
  useEffect(() => {
    if (modal.isOpen && modal.drillDownData?.charts) {
      const initial: Record<number, any[]> = {};
      modal.drillDownData.charts.forEach((chart, idx) => {
        initial[idx] = chart.data || [];
      });
      setChartData(initial);
      setOriginalChartData(initial);
      setActiveFilters({});
      
      // Extract date filter from filters array
      console.log("[DRILLDOWN] Available filters:", modal.drillDownData.filters);
      const dateFilterOption = modal.drillDownData.filters?.find((f: FilterOption) => f.type === "date_range");
      console.log("[DRILLDOWN] Date filter found:", dateFilterOption);
      
      if (dateFilterOption) {
        setDateFilter(dateFilterOption);
        // Extract current date range from default or bounds
        const defaultRange = dateFilterOption.default;
        if (defaultRange?.start && defaultRange?.end) {
          console.log("[DRILLDOWN] Using default date range:", defaultRange);
          setCurrentDateRange({ start: defaultRange.start, end: defaultRange.end });
        } else if (dateFilterOption.bounds) {
          console.log("[DRILLDOWN] Using bounds date range:", dateFilterOption.bounds);
          setCurrentDateRange({ 
            start: dateFilterOption.bounds.min || '', 
            end: dateFilterOption.bounds.max || '' 
          });
        } else {
          console.warn("[DRILLDOWN] Date filter found but no default or bounds");
        }
      } else {
        console.log("[DRILLDOWN] No date filter found in filters array");
        setDateFilter(null);
        setCurrentDateRange(null);
      }
    }
  }, [modal.isOpen]);

  // Handle filter changes
  const handleFilterChange = async (filters: FilterState) => {
    console.log("Filters received in handleFilterChange", filters)
    if (!modal.drillDownData?.charts) return;
    
    setLoading(true);
    setLoadError(null);
    
    try {
      const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
      console.log('Using filters directly:', filters);
    
      // Build queries with filters
      const queries = modal.drillDownData.charts.map(chart => {
            if (!chart.queryObject) return '';
            const query = DynamicQueryBuilder.buildSQL(chart.queryObject as any, filters);
            console.log('Generated query with filters:', query); 
            return query;
      });

      console.log('Built queries:', queries);
      
      const validQueries = queries.filter(q => q !== '');

      console.log('Built validQueries:', validQueries);
      
      if (validQueries.length === 0) {
        setLoadError('No valid queries');
        setLoading(false);
        return;
      }
      
      // Execute queries
      const results = await executeBatchQueries(validQueries);
      
      // Update chart data
      const newChartData: Record<number, any[]> = {};
      let validQueryIndex = 0;
      
      queries.forEach((query, idx) => {
        if (query !== '') {
          const data = results[validQueryIndex] || [];
          const total = data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
          
          newChartData[idx] = data.map((item: any) => ({
            name: item.name,
            value: item.value || 0,
            percentage: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
          }));
          validQueryIndex++;
        } else {
          newChartData[idx] = [];
        }
      });
      
      setChartData(newChartData);
      setActiveFilters(filters);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to apply filters:', error);
      setLoadError('Failed to apply filters');
      setLoading(false);
    }
  };

  // Clear filters - restore original data and reset date range to default
  const handleClearFilters = () => {
    setChartData(originalChartData);
    setActiveFilters({});
    if (dateFilter) {
      const defaultRange = dateFilter.default;
      if (defaultRange?.start && defaultRange?.end) {
        setCurrentDateRange({ start: defaultRange.start, end: defaultRange.end });
      } else if (dateFilter.bounds) {
        setCurrentDateRange({
          start: dateFilter.bounds.min || '',
          end: dateFilter.bounds.max || ''
        });
      }
    }
  };

  const handleRemoveFilterValue = async (filterField: string, valueToRemove: string) => {
    const updatedFilters = { ...activeFilters };
    
    if (updatedFilters[filterField]?.operator === 'IN') {
      // Remove specific value from array
      const currentValues = updatedFilters[filterField].value as string[];
      const newValues = currentValues.filter(v => v !== valueToRemove);
      
      if (newValues.length === 0) {
        // If no values left, remove entire filter
        delete updatedFilters[filterField];
      } else {
        updatedFilters[filterField].value = newValues;
      }
    } else {
      // For non-array filters (BETWEEN, =, etc.), remove entire filter
      delete updatedFilters[filterField];
    }
    
    // Re-apply filters
    await handleFilterChange(updatedFilters);
  };

  // Handle date filter changes - update query_obj.where and re-run queries
  const handleDateChange = async (start: string, end: string) => {
    if (!dateFilter || !modal.drillDownData?.charts) return;
    
    setLoading(true);
    setLoadError(null);
    setCurrentDateRange({ start, end });
    
    try {
      const parquetUrl = localStorage.getItem("presigned-parquet-url") || "";
      
      // Update query_obj.where for all drilldown charts
      const updatedCharts = modal.drillDownData.charts.map((chart: any) => {
        const queryObj = JSON.parse(JSON.stringify(chart.query_obj || chart.queryObject));
        
        // Find and update the date filter condition in where array
        if (queryObj.where && Array.isArray(queryObj.where)) {
          queryObj.where = queryObj.where.map((w: any) => {
            const condition = w.condition || '';
            
            // Check if this condition contains the date field
            if (condition.includes(dateFilter.field) || condition.includes('BETWEEN DATE')) {
              // Extract the date expression (everything before BETWEEN)
              const betweenMatch = condition.match(/^(.+?)\s+BETWEEN\s+DATE/);
              if (betweenMatch) {
                const dateExpr = betweenMatch[1].trim();
                // Wrap in TRY_CAST to ensure DATE type
                const castedDateExpr = `TRY_CAST(${dateExpr} AS DATE)`;
                return {
                  condition: `${castedDateExpr} BETWEEN DATE '${start}' AND DATE '${end}'`
                };
              } else {
                // Fallback: construct proper date expression
                const fieldName = `"${dateFilter.field}"`;
                const dateExpr = `COALESCE(TRY_CAST(${fieldName} AS DATE), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%Y-%m-%d'), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%m/%d/%Y'), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%d/%m/%Y'), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%Y/%m/%d'), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%m-%d-%Y'), TRY_STRPTIME(CAST(${fieldName} AS VARCHAR), '%d-%m-%Y'))`;
                const castedDateExpr = `TRY_CAST(${dateExpr} AS DATE)`;
                return {
                  condition: `${castedDateExpr} BETWEEN DATE '${start}' AND DATE '${end}'`
                };
              }
            }
            return w;
          });
        }
        
        return {
          ...chart,
          query_obj: queryObj,
          queryObject: queryObj
        };
      });
      
      // Build and execute queries
      const queries = updatedCharts.map((chart: any) => {
        if (!chart.queryObject) return '';
        const query = DynamicQueryBuilder.buildSQL(chart.queryObject, activeFilters);
        return query;
      });
      
      const validQueries = queries.filter(q => q !== '');
      if (validQueries.length === 0) {
        setLoadError('No valid queries');
        setLoading(false);
        return;
      }
      
      // Execute queries
      const results = await executeBatchQueries(validQueries);
      
      // Update chart data
      const newChartData: Record<number, any[]> = {};
      let validQueryIndex = 0;
      
      queries.forEach((query: string, idx: number) => {
        if (query !== '') {
          const data = results[validQueryIndex] || [];
          const total = data.reduce((sum: number, item: any) => sum + (item.value || 0), 0);
          
          newChartData[idx] = data.map((item: any) => ({
            name: item.name,
            value: item.value || 0,
            percentage: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
          }));
          validQueryIndex++;
        } else {
          newChartData[idx] = [];
        }
      });
      
      setChartData(newChartData);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to update date filter:', error);
      setLoadError('Failed to update date filter');
      setLoading(false);
    }
  };

  if (!modal.isOpen || !modal.drillDownData) return null;

  const drillDownData = modal.drillDownData as NonNullable<typeof modal.drillDownData>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col" style={{ maxHeight: 'calc(100vh - 64px)' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
          <button onClick={onClose} className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            
            {/* Collapsible Filters section - open by default */}
            <div className="border border-slate-200 rounded-lg bg-slate-50/50">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-600" />
                  {filtersOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  Filters
                </span>
                {Object.keys(activeFilters).length > 0 && (
                  <span className="text-sm font-normal text-slate-500">
                    {Object.keys(activeFilters).length} active
                  </span>
                )}
              </button>
              {filtersOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-200">
                  {/* Single Filters section: date + other filters, ordered by drilldown relevance */}
                  {orderedFilters.length > 0 && (
                    <FilterControls
                      filters={orderedFilters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      currentFilters={activeFilters}
                      dateRange={currentDateRange}
                      onDateChange={dateFilter ? handleDateChange : undefined}
                    />
                  )}

                  {/* Active Filters Display */}
                  {Object.keys(activeFilters).length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-700 flex items-center">
                          Active Filters ({Object.keys(activeFilters).length})
                        </h4>
                        <button 
                          onClick={handleClearFilters} 
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(activeFilters).map(([field, filter]) => (
                          <div key={field} className="flex items-start gap-2">
                            <span className="text-sm font-medium text-slate-600 min-w-[100px] capitalize">
                              {field}:
                            </span>
                            <div className="flex flex-wrap gap-2 flex-1">
                              {filter.operator === 'IN' && Array.isArray(filter.value) ? (
                                filter.value.map((val: string, idx: number) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                    {val}
                                    <X 
                                      className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                      onClick={() => handleRemoveFilterValue(field, val)}
                                    />
                                  </Badge>
                                ))
                              ) : filter.operator === 'BETWEEN' ? (
                                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                  {filter.value.min} - {filter.value.max}
                                  <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => handleRemoveFilterValue(field, '')}
                                  />
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                                  {String(filter.value)}
                                  <X 
                                    className="w-3 h-3 cursor-pointer hover:text-red-600" 
                                    onClick={() => handleRemoveFilterValue(field, '')}
                                  />
                                </Badge>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                const updatedFilters = { ...activeFilters };
                                delete updatedFilters[field];
                                await handleFilterChange(updatedFilters);
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

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Applying filters...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{loadError}</p>
                </div>
              </div>
            )}

            {/* Charts */}
            {!loading && drillDownData.charts && drillDownData.charts.length > 0 && (
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(drillDownData.charts.length, 2)}, 1fr)` }}>
                {drillDownData.charts.map((chart, idx) => {
                  const Icon = getIcon(chart.icon);
                  const data = chartData[idx] || [];
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                        {chart.title}
                        {data.length > 0 && (
                          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                            {data.length} records
                          </Badge>
                        )}
                      </h3>
                      {data.length > 0 ? (
                        <ResponsiveContainer width="100%" height={chart.height || 450}>
                          {(() => {
                            const content = renderChart(data, chart);
                            return React.isValidElement(content) ? content : <div>No chart available</div>;
                          })()}
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                          <div className="text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Insights */}
            {!loading && drillDownData.insights && (drillDownData.insights.critical_issues?.length > 0 || drillDownData.insights.recommended_actions?.length > 0) && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-md p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <LucideIcons.Lightbulb className="w-6 h-6 mr-2 text-amber-500" />
                  Key Insights & Recommendations
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Critical Issues */}
                  {drillDownData.insights.critical_issues && drillDownData.insights.critical_issues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                        Critical Issues:
                      </h4>
                      <ul className="space-y-2">
                        {drillDownData.insights.critical_issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-700">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Recommended Actions */}
                  {drillDownData.insights.recommended_actions && drillDownData.insights.recommended_actions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                        <LucideIcons.CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                        Recommended Actions:
                      </h4>
                      <ul className="space-y-2">
                        {drillDownData.insights.recommended_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-700">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};