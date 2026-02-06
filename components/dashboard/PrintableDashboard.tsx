// components/dashboard/PrintableDashboard.tsx
// ============================================
// PRINTABLE DASHBOARD - ENHANCED DESIGN & LAYOUT
// ============================================

"use client";

import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,Legend,
  LineChart, Line,
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import * as LucideIcons from 'lucide-react';
import type { KPICard, ChartConfig, ChartDataItem, DrillDownData } from '@/types/dashboard';

interface PrintableDashboardProps {
  kpiCards: KPICard[];
  charts: ChartConfig[];
  filename: string;
  rowCount: number;
}

// Utility: Get Lucide icon
const getIcon = (iconName: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    Users: LucideIcons.Users,
    UserCheck: LucideIcons.UserCheck,
    BarChart: LucideIcons.BarChart3,
    TrendingUp: LucideIcons.TrendingUp,
    TrendingDown: LucideIcons.TrendingDown,
    Globe: LucideIcons.Globe,
    Briefcase: LucideIcons.Briefcase,
    PieChart: LucideIcons.PieChart,
    MapPin: LucideIcons.MapPin,
    AlertTriangle: LucideIcons.AlertTriangle,
    CheckCircle: LucideIcons.CheckCircle,
    DollarSign: LucideIcons.DollarSign,
    Activity: LucideIcons.Activity,
    Clock: LucideIcons.Clock,
    Award: LucideIcons.Award,
  };
  return iconMap[iconName] || LucideIcons.BarChart3;
};

/**
 * Light color palette for bar/line charts
 * (single color per chart, different charts get different colors)
 */
const LIGHT_CHART_COLORS = [
  '#3b82f6', // darker blue
  '#10b981', // darker green
  '#f97316', // darker orange
  '#8b5cf6', // darker purple
  '#0ea5e9', // darker sky blue
  '#ef4444', // darker red
  '#f59e0b', // darker amber
  '#0284c7', // darker blue
  '#059669', // darker green
  '#ec4899'  // darker pink
];

/**
 * Deterministically get a light color for a chart so it stays
 * consistent between renders and across dashboard / PDF views.
 */
const getChartColor = (): string => {
  const idx = Math.floor(Math.random() * (LIGHT_CHART_COLORS.length));
  return LIGHT_CHART_COLORS[idx];
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

// Simplified Chart Renderer (optimized for PDF)
const renderStaticChart = (
  chartData: ChartDataItem[], 
  chartConfig: Partial<ChartConfig>,
  width: number = 330
): React.ReactNode => {
  
  // PIE CHART (DONUT STYLE)
  if (chartConfig.type === 'pie') {
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
        name: `Others (${othersData.length} items)`,
        [chartConfig.valueKey || 'value']: othersValue,
        percentage: othersPercentage,
        isOthers: true,
        othersCount: othersData.length,
        othersItems: othersData
      });
      
      return topData;
    }, [chartData, chartConfig.valueKey]);

    const pieColors = generatePieColors(processedChartData.length);
    const totalValue = processedChartData.reduce((sum, d) => sum + (d[chartConfig.valueKey || 'value'] || 0), 0);
    
    // Custom Legend Component
    const CustomLegend = ({ payload }: any) => {
      if (!payload || payload.length === 0) return null;
      
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginTop: '20px',
          paddingBottom: '10px',
          paddingLeft: '10px',
          paddingRight: '10px',
          fontSize: '12px',
          width: '100%'
        }}>
          {payload.map((entry: any, index: number) => {
            const value = entry.payload?.value || entry.value || 0;
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
            const label = entry.value || entry.name || 'Unknown';
            
            return (
              <div 
                key={`legend-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 0'
                }}
              >
                <div 
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '3px',
                    backgroundColor: entry.color || '#94a3b8',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
                <span style={{
                  color: '#1e293b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {label}
                </span>
                <span style={{
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: '600',
                  flexShrink: 0,
                  minWidth: '45px',
                  textAlign: 'right'
                }}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      );
    };
    
    // Calculate proper dimensions to prevent clipping
    // For drilldown charts (width ~330), use smaller dimensions
    // For main charts (width >= 600), use larger dimensions
    const isDrilldown = width < 400;
    const chartWidth = isDrilldown ? width : Math.max(width, 650);
    // Increased heights to accommodate legend at bottom
    const chartHeight = isDrilldown ? 380 : 480;
    // Adjust radius based on available space
    const outerRadius = isDrilldown ? 80 : 110;
    const innerRadius = isDrilldown ? 45 : 65; // Donut style
    
    return (
      <PieChart 
        width={chartWidth} 
        height={chartHeight}
        margin={isDrilldown 
          ? { top: 20, right: 20, bottom: 120, left: 20 }
          : { top: 30, right: 50, bottom: 140, left: 50 }
        }
      >
        <Pie 
          data={processedChartData} 
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8" 
          dataKey={chartConfig.valueKey || 'value'}
          paddingAngle={2}
          label={false}
          stroke="#ffffff"
          strokeWidth={2}
        >
          {processedChartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.isOthers ? '#94a3b8' : pieColors[index] || '#94a3b8'}
              stroke="#ffffff"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '11px',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          formatter={(value: any, name: string) => {
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
            return [`${value} (${percentage}%)`, name];
          }}
        />
        <Legend 
          content={<CustomLegend />}
          verticalAlign="bottom"
          height={80}
        />
      </PieChart>
    );
  }

  // LINE CHART
  if (chartConfig.type === 'line') {
    const dataPointCount = chartData.length;
    const shouldShowDots = dataPointCount <= 10;
    const maxXTicks = 12;
    const shouldSkipLabels = dataPointCount > maxXTicks;
    
    // Check if this is a drilldown chart (smaller width)
    const isDrilldown = width < 400;

    const xTickStyle: any = {
      fill: '#64748b',
      fontSize: 10
    };

    // Always incline category labels for line charts
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
    const xAxisLabelOffset = Math.min(-80, -80 - (maxLabelLength * 0.75));

    const xLabelText = `${chartConfig.xLabel || ''}`;
    const yLabelText = `${chartConfig.yLabel || ''}`;

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
        width={width}
        height={isDrilldown ? 350 : 280}
        margin={isDrilldown 
          ? { top: 10, right: 20, bottom: 130, left: 50 }
          : { top: 10, right: 20, bottom: 130, left: 10 }
        }
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey={chartConfig.xDataKey || 'name'} 
          tick={xTickStyle}
          tickLine={{ stroke: '#cbd5e1' }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
          ticks={ticks}
          label={xLabelText ? { 
            value: xLabelText, 
            position: 'insideBottom', 
            offset: xAxisLabelOffset,
            style: { fill: '#64748b', fontSize: 16 }
          } : undefined}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={{ stroke: '#cbd5e1' }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
          label={yLabelText ? { 
            value: yLabelText, 
            angle: -90, 
            position: 'insideLeft',
            offset: 15,
            style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
          } : undefined}
        />
        <Tooltip 
          formatter={(value: any) => {
            if (chartConfig.yUnit) {
              return [`${value} ${chartConfig.yUnit}`, chartConfig.yLabel || 'Value'];
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
            r: 3, 
            fill: lineColor
          } : false}
        />
      </LineChart>
    );
  }

  // BAR CHART (default)
  const isHorizontal = chartConfig.layout === 'horizontal' || 
                       chartConfig.type === 'horizontalBar';
  
  // Check if this is a drilldown chart (smaller width)
  const isDrilldown = width < 400;

  const dataPointCount = chartData.length;
  const maxXTicks = 12;
  const maxYTicks = 6;
  const shouldSkipLabels = !isHorizontal && dataPointCount > maxXTicks;
  const shouldSkipYLabels = isHorizontal && dataPointCount > maxYTicks;

  const xTickStyle: any = {
    fill: '#64748b',
    fontSize: 10
  };

  // Always incline category labels for vertical bar charts
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

  // Calculate proportional offset for vertical bar charts
  const xAxisLabelOffset = !isHorizontal
    ? Math.min(-80, -80 - (maxLabelLength * 0.75))
    : -5;

  // For horizontal bar charts, adjust Y-axis width proportionally to label length
  const yAxisWidth = isHorizontal
    ? Math.max(80, Math.min(150, 80 + (maxLabelLength * 4)))
    : undefined;

  // For horizontal bar charts, adjust left margin proportionally to label length
  const leftMargin = isHorizontal
    ? Math.max(60, Math.min(120, 60 + (maxLabelLength * 3)))
    : 10;

  const xLabelText = `${chartConfig.xLabel || ''}`;
  const yLabelText = `${chartConfig.yLabel || ''}`;

  const barColor = getChartColor();
  
  // Adjust height and margins for drilldown charts
  const chartHeight = 400;
  
  const chartMargin = isDrilldown
    ? {
        top: 10,
        right: 20,
        bottom: isHorizontal ? 30 : 130,
        left: isHorizontal ? Math.max(leftMargin, 80) : 50 // More left margin for Y-axis labels
      }
    : {
        top: 10,
        right: 20,
        bottom: isHorizontal ? 30 : 130,
        left: isHorizontal ? leftMargin : 10
      };
  
  return (
    <BarChart 
      data={chartData} 
      layout={isHorizontal ? "vertical" : "horizontal"}
      width={width} 
      height={chartHeight}
      margin={chartMargin}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis 
            type="number" 
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={xLabelText ? {
              value: xLabelText,
              position: 'insideBottom',
              offset: xAxisLabelOffset,
              style: { fill: '#64748b', fontSize: 16 }
            } : undefined}
          />
          <YAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            type="category" 
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            width={yAxisWidth}
            interval={shouldSkipYLabels ? Math.max(Math.ceil(dataPointCount / maxYTicks) - 1, 0) : 0}
            label={yLabelText ? {
              value: yLabelText,
              angle: -90,
              position: 'insideLeft',
              offset: -30,
              style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
            } : undefined}
          />
        </>
      ) : (
        <>
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={xTickStyle}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            interval={shouldSkipLabels ? Math.max(Math.ceil(dataPointCount / maxXTicks) - 1, 0) : 0}
            label={xLabelText ? {
              value: xLabelText,
              position: 'insideBottom',
              offset: xAxisLabelOffset,
              style: { fill: '#64748b', fontSize: 16 }
            } : undefined}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickLine={{ stroke: '#cbd5e1' }}
            axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            label={yLabelText ? {
              value: yLabelText,
              angle: -90,
              position: 'insideLeft',
              offset: 15,
              style: { fill: '#64748b', fontSize: 16, textAnchor: 'middle' }
            } : undefined}
          />
        </>
      )}
      <Tooltip 
        formatter={(value: any) => {
          if (chartConfig.yUnit) {
            return [value + ' ' + chartConfig.yUnit, chartConfig.yLabel || 'Value'];
          }
          return [value, isHorizontal ? chartConfig.xLabel || 'Value' : chartConfig.yLabel || 'Value'];
        }}
      />
      <Bar
        dataKey={chartConfig.yDataKey || chartConfig.valueKey || 'value'}
        fill={barColor}
        radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
      />
    </BarChart>
  );
};

/**
 * Static KPI Card (PDF optimized)
 */
const StaticKPICard: React.FC<{ card: KPICard }> = ({ card }) => {
  const Icon = getIcon(card.icon);
  const borderColor = card.color || '#ef4444';

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '20px',
        borderLeft: `4px solid ${borderColor}`,
        minHeight: '100px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ 
            fontSize: '13px', 
            color: '#64748b', 
            marginBottom: '8px', 
            fontWeight: 500,
            letterSpacing: '0.3px'
          }}>
            {card.title || card.label}
          </p>
          <p style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1e293b', 
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {card.value}
          </p>
        </div>
        <Icon 
          style={{ 
            width: '40px', 
            height: '40px', 
            opacity: 0.8, 
            color: borderColor 
          }} 
        />
      </div>
      {card.note && (
        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', margin: 0 }}>
          {card.note}
        </p>
      )}
    </div>
  );
};

/**
 * Static Drilldown Section
 */
const StaticDrilldown: React.FC<{ 
  drilldown: DrillDownData;
  parentTitle: string;
}> = ({ drilldown, parentTitle }) => {
  
  return (
    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '2px solid #e2e8f0' }}>
      <h3 style={{ 
        fontSize: '17px', 
        fontWeight: '700', 
        color: '#1e293b', 
        marginBottom: '24px',
        marginTop: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        letterSpacing: '0.2px'
      }}>
        {parentTitle} - Detailed Analysis
      </h3>
      
      {/* Drilldown Charts */}
      {drilldown.charts && drilldown.charts.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {drilldown.charts.map((chart, idx) => {
            const Icon = getIcon(chart.icon);
            const data = chart.data || [];
            
            return (
              <div 
                key={idx} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  padding: '18px',
                  width: '100%',
                  minWidth: 0, // Allow flex item to shrink below content size
                  overflow: 'hidden' // Prevent content from overflowing
                }}
              >
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '16px',
                  marginTop: 0,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.2px'
                }}>
                  <Icon 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      marginRight: '8px',
                      color: chart.color || '#3b82f6',
                      flexShrink: 0
                    }} 
                  />
                  <span>{chart.title}</span>
                </h4>
                {data.length > 0 ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    overflow: 'visible',
                    width: '100%',
                    minHeight: chart.type === 'pie' 
                      ? '380px' 
                      : chart.layout === 'horizontal' || chart.type === 'horizontalBar'
                        ? '400px' // More height for horizontal bar charts (Y-axis labels)
                        : '350px' // More height for vertical bar and line charts
                  }}>
                    {renderStaticChart(data, chart, 330)}
                  </div>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '200px',
                    color: '#94a3b8',
                    fontSize: '13px'
                  }}>
                    No data available
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Insights */}
      {drilldown.insights && (
        drilldown.insights.critical_issues?.length > 0 || 
        drilldown.insights.recommended_actions?.length > 0
      ) && (
        <div style={{
          background: 'linear-gradient(to bottom right, #f8fafc, #eff6ff)',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '22px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: '#1e293b', 
            marginBottom: '18px',
            marginTop: 0,
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.2px'
          }}>
            <LucideIcons.Lightbulb style={{ 
              width: '18px', 
              height: '18px', 
              marginRight: '8px', 
              color: '#f59e0b',
              flexShrink: 0
            }} />
            <span>Key Insights & Recommendations</span>
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px' }}>
            {/* Critical Issues */}
            {drilldown.insights.critical_issues && 
             drilldown.insights.critical_issues.length > 0 && (
              <div>
                <h5 style={{ 
                  fontWeight: '600', 
                  color: '#334155', 
                  marginBottom: '14px',
                  marginTop: 0,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.2px'
                }}>
                  <LucideIcons.AlertTriangle style={{ 
                    width: '14px', 
                    height: '14px', 
                    marginRight: '6px', 
                    color: '#ef4444',
                    flexShrink: 0
                  }} />
                  <span>Critical Issues:</span>
                </h5>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {drilldown.insights.critical_issues.map((issue, idx) => (
                    <li key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      fontSize: '12px', 
                      color: '#334155',
                      marginBottom: '10px',
                      lineHeight: '1.6',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        marginRight: '10px',
                        marginTop: '6px',
                        flexShrink: 0
                      }}></span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommended Actions */}
            {drilldown.insights.recommended_actions && 
             drilldown.insights.recommended_actions.length > 0 && (
              <div>
                <h5 style={{ 
                  fontWeight: '600', 
                  color: '#334155', 
                  marginBottom: '14px',
                  marginTop: 0,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.2px'
                }}>
                  <LucideIcons.CheckCircle style={{ 
                    width: '14px', 
                    height: '14px', 
                    marginRight: '6px', 
                    color: '#10b981',
                    flexShrink: 0
                  }} />
                  <span>Recommended Actions:</span>
                </h5>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {drilldown.insights.recommended_actions.map((action, idx) => (
                    <li key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      fontSize: '12px', 
                      color: '#334155',
                      marginBottom: '10px',
                      lineHeight: '1.6',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      <span style={{ 
                        display: 'inline-block',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        marginRight: '10px',
                        marginTop: '6px',
                        flexShrink: 0
                      }}></span>
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
  );
};

/**
 * Main Printable Dashboard Component
 */
export const PrintableDashboard: React.FC<PrintableDashboardProps> = ({
  kpiCards,
  charts,
  filename,
  rowCount
}) => {
  return (
    <div 
      id="printable-dashboard" 
      style={{ 
        position: 'absolute', 
        left: '-99999px',
        top: 0,
        width: '794px',
        backgroundColor: 'white',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1e293b'
      }}
    >
      {/* PAGE 1: HEADER + KPI CARDS */}
      <div 
        id="pdf-page-1" 
        style={{
          padding: '40px',
          minHeight: '1123px',
          backgroundColor: 'white',
          position: 'relative'
        }}
      >
        {/* HEADER SECTION */}
        <div 
          id="pdf-header" 
          style={{
            background: 'linear-gradient(to right, #2563eb, #1d4ed8, #4f46e5)',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '36px',
            padding: '32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{ height: '32px', width: '32px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '30px', 
                  fontWeight: '700', 
                  color: 'white',
                  margin: 0,
                  marginBottom: '6px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.3px'
                }}>
                  HR Houdini
                </h1>
                <p style={{ 
                  color: '#bfdbfe',
                  fontSize: '14px',
                  margin: 0,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.2px'
                }}>
                  Comprehensive Workforce Analysis Report
                </p>
              </div>
            </div>
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '14px 18px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: 'white', 
                fontSize: '13px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                <CheckCircle style={{ height: '16px', width: '16px', flexShrink: 0 }} />
                <span style={{ fontWeight: '500' }}>{filename}</span>
                <span style={{ color: '#bfdbfe' }}>•</span>
                <span style={{ color: '#bfdbfe' }}>{rowCount} records</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS SECTION */}
        {kpiCards.length > 0 && (
          <div id="pdf-kpi-cards">
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '20px',
              marginTop: 0,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.3px'
            }}>
              Key Performance Indicators
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(kpiCards.length, 4)}, 1fr)`,
              gap: '16px'
            }}>
              {kpiCards.map((card, idx) => (
                <StaticKPICard key={idx} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SUBSEQUENT PAGES: CHARTS WITH DRILLDOWNS */}
      {charts.map((chart, chartIdx) => (
        <div 
          key={chartIdx} 
          id={`pdf-chart-${chartIdx}`}
          style={{
            padding: '40px',
            minHeight: '1123px',
            backgroundColor: 'white',
            pageBreakBefore: 'always',
            position: 'relative'
          }}
        >
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '24px',
            marginTop: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.3px'
          }}>
            Analysis {chartIdx + 1}
          </h2>

          {/* Main Chart */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: chart.type === 'pie' ? '22px 10px' : '22px',
            marginBottom: '28px',
            overflow: 'visible',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ 
              fontSize: '15px', 
              fontWeight: '600', 
              color: '#1e293b', 
              marginBottom: '18px',
              marginTop: 0,
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.2px'
            }}>
              {(() => {
                const Icon = getIcon(chart.icon);
                return <Icon style={{ 
                  width: '16px', 
                  height: '16px', 
                  marginRight: '8px',
                  color: chart.color || '#3b82f6',
                  flexShrink: 0
                }} />;
              })()}
              <span>{chart.title}</span>
            </h3>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'visible',
              width: '100%',
              minHeight: chart.type === 'pie' ? '420px' : 'auto',
              padding: chart.type === 'pie' ? '20px 0' : '0',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '100%',
                maxWidth: chart.type === 'pie' ? '650px' : '100%',
                overflow: 'visible',
                position: 'relative'
              }}>
                {chart.type === 'pie' 
                  ? renderStaticChart(chart.data || [], chart, 650)
                  : renderStaticChart(chart.data || [], chart, 690)}
              </div>
            </div>
          </div>

          {/* Drilldown (if exists) */}
          {(() => {
            const drilldown = chart.drillDownData || chart.drillDown;
            return drilldown ? (
              <StaticDrilldown 
                drilldown={drilldown} 
                parentTitle={chart.title}
              />
            ) : null;
          })()}
        </div>
      ))}
    </div>
  );
};
