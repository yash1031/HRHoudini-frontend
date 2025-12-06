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

/**
 * Render individual chart based on type
 */
const renderChart = (
  chartData: ChartDataItem[], 
  chartConfig: ChartConfig
): React.ReactNode => {
  
  // PIE CHART
  if (chartConfig.type === 'pie') {
    const pieColors = generatePieColors(chartData.length);

    const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name, value }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + 50;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const textAnchor = x > cx ? 'start' : 'end';
      const isLongLabel = name?.length > 15;

      if (isLongLabel) {
        return (
          <g>
            <text
              x={x} y={y - 8}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="12px"
              fontWeight="500"
            >
              {name}
            </text>
            <text
              x={x} y={y + 8}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="11px"
            >
              {`${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
          </g>
        );
      }
      
      return (
        <text
          x={x} y={y}
          fill="#64748b"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize="12px"
        >
          {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
      );
    };

    return (
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={110}
          fill="#8884d8"
          dataKey={chartConfig.valueKey || 'value'}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    );
  }

  // LINE CHART
  if (chartConfig.type === 'line') {
    return (
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey={chartConfig.xDataKey || 'name'} 
          tick={{ fill: '#64748b', fontSize: 12 }} 
        />
        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px' 
          }} 
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={chartConfig.yDataKey || 'value'}
          stroke={chartConfig.color || '#f59e0b'}
          strokeWidth={3}
          dot={{ r: 6, fill: chartConfig.color || '#f59e0b' }}
          name={chartConfig.lineName || 'Value'}
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