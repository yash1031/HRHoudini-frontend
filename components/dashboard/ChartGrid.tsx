// components/dashboard/ChartGrid.tsx
// ============================================
// CHART GRID COMPONENT WITH DRILLDOWN STATE SUPPORT
// ============================================

"use client";

import React from 'react';
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
import { Loader2, MousePointerClick, XCircle } from 'lucide-react';
import type { ChartConfig, ChartDataItem } from '@/types/dashboard';

interface ChartGridProps {
  charts: ChartConfig[];
  onChartClick?: (chart: ChartConfig) => void;
  drilldownsState?: Record<string, { loading: boolean; error: boolean }>;
}

/**
 * Get Lucide icon component by name
 */
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
 * Generate unique colors for pie chart segments
 */
const generatePieColors = (count: number): string[] => {
  const colors: string[] = [];
  const step = 360 / count;
  for (let i = 0; i < count; i++) {
    const hue = (step * i + Math.random() * 30) % 360;
    colors.push(`hsl(${hue}, 70%, 75%)`);
  }
  return colors;
};

// Create a separate component for pie charts
const PieChartRenderer: React.FC<{ chartData: ChartDataItem[]; chartConfig: ChartConfig }> = ({ 
  chartData, 
  chartConfig 
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    
    // Process data to show top 10 + Others
    const processedChartData = React.useMemo(() => {
      const TOP_N = 5;
      
      // Sort by value descending
      const sortedData = [...chartData].sort((a, b) => 
        (b[chartConfig.valueKey || 'value'] || 0) - (a[chartConfig.valueKey || 'value'] || 0)
      );
      
      if (sortedData.length <= TOP_N) {
        return sortedData;
      }
      
      // Take top 10
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

/**
 * Render individual chart based on type
 */
const renderChart = (
  chartData: ChartDataItem[], 
  chartConfig: ChartConfig
): React.ReactNode => {
  
  // PIE CHART
  if (chartConfig.type === 'pie') {
    return <PieChartRenderer chartData={chartData} chartConfig={chartConfig} />;
  }

  // LINE CHART

  if (chartConfig.type === 'line') {
    const dataPointCount = chartData.length;
    const shouldShowDots = dataPointCount <= 10;
    const shouldSkipLabels = dataPointCount > 50; // Skip labels if more than 50 points
    
    return (
      <LineChart 
        data={chartData}
        margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

        {/* X-Axis with arrow indicator */}
        <XAxis 
          dataKey={chartConfig.xDataKey || 'name'} 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={{ stroke: '#cbd5e1' }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
          ticks={shouldSkipLabels ? chartData
            .map((_, idx) => idx)
            .filter((_, idx) => idx === 0 || idx % Math.ceil(dataPointCount / 10) === 0 || idx === dataPointCount - 1)
            .map(idx => chartData[idx][chartConfig.xDataKey || 'name'])
            : undefined}
          label={{ 
            value: `${chartConfig.xLabel || ''}${chartConfig.xUnit ? ` (${chartConfig.xUnit})` : ''}`,
            position: 'insideBottom',
            offset: -10,
            style: { fill: '#475569', fontSize: 13, fontWeight: 600 }
          }}
        />

        {/* Y-Axis with arrow indicator */}
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={{ stroke: '#cbd5e1' }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
          label={{ 
            value: `${chartConfig.yLabel || ''}${chartConfig.yUnit ? ` (${chartConfig.yUnit})` : ''}`,
            angle: -90, 
            position: 'insideLeft',
            offset: 5,
            style: { fill: '#475569', fontSize: 13, fontWeight: 600, textAnchor: 'middle' }
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
          stroke={chartConfig.color || '#f59e0b'}
          strokeWidth={shouldShowDots ? 2 : 2.5}
          dot={shouldShowDots ? { 
            r: 5, 
            fill: chartConfig.color || '#f59e0b',
            strokeWidth: 2,
            stroke: '#fff'
          } : false}
          activeDot={!shouldShowDots ? { 
            r: 6, 
            fill: chartConfig.color || '#f59e0b',
            stroke: '#fff',
            strokeWidth: 2
          } : { r: 7 }}
          name={chartConfig.lineName || chartConfig.yLabel || 'Value'}
        />
      </LineChart>
    );
  }
  // BAR CHART (default)
  const isHorizontal = chartConfig.layout === 'horizontal' || 
                       chartConfig.type === 'horizontalBar';
  
  return (
    <BarChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            type="category" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            width={100} 
          />
        </>
      ) : (
        <>
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        </>
      )}
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px' 
        }} 
      />
      <Bar
        dataKey="value"
        fill={chartConfig.color || '#3b82f6'}
        radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
      />
    </BarChart>
  );
};

/**
 * Chart Grid Component
 * Displays a responsive grid of charts with optional click handlers
 * Now supports drilldown state (loading/error)
 */
export const ChartGrid: React.FC<ChartGridProps> = ({ 
  charts, 
  onChartClick,
  drilldownsState = {}
}) => {
  if (!charts || charts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {charts.map((chart, idx) => {
        const Icon = getIcon(chart.icon);
        const hasInteraction = chart.drillDownData || chart.drillDown;
        const chartData = chart.data || [];
        
        // Get drilldown state for this chart
        const chartId = chart.id || chart.semantic_id || `chart-${idx}`;
        const drilldownState = drilldownsState[chartId];
        const isDrilldownLoading = drilldownState?.loading || false;
        const isDrilldownError = drilldownState?.error || false;



        return (
          <div
            key={idx}
            className={`
              bg-white rounded-lg shadow-md p-6 
              ${hasInteraction ? 'cursor-pointer hover:shadow-lg' : ''} 
              transition-shadow
            `}
            onClick={() => hasInteraction && onChartClick?.(chart)}
          >
            {/* Chart Header */}
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Icon 
                  className="w-5 h-5 mr-2" 
                  style={{ color: chart.color || '#3b82f6' }} 
                />
                {chart.title}
              </div>
              
              {/* Drilldown Status Badge - Right aligned */}
              <div className="ml-auto">
                {/* Has drilldown data - ready to view */}
                {hasInteraction && !isDrilldownLoading && !isDrilldownError && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors text-xs flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    View drill downs
                  </Badge>
                )}
                
                {/* Loading drilldown */}
                {isDrilldownLoading && (
                  <Badge className="bg-amber-100 text-amber-700 text-xs flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Drill downs Prepared
                  </Badge>
                )}
                
                {/* Drilldown error */}
                {isDrilldownError && (
                  <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Drill downs not available
                  </Badge>
                )}
                
                {/* No drilldown expected yet */}
                {!hasInteraction && !isDrilldownLoading && !isDrilldownError && (
                  <Badge className="bg-slate-100 text-slate-600 text-xs flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Preparing drill downs
                  </Badge>
                )}
              </div>
            </h3>

            {/* Chart Content */}
            <ResponsiveContainer width="100%" height={chart.height || 350}>
              {renderChart(chartData, chart)}
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
};