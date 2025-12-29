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

// Utility: Generate pie colors
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
    const pieColors = generatePieColors(chartData.length);
    const totalValue = chartData.reduce((sum, d) => sum + (d[chartConfig.valueKey || 'value'] || 0), 0);
    
    // Custom Legend Component
    const CustomLegend = ({ payload }: any) => {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          marginTop: '20px',
          paddingBottom: '10px',
          fontSize: '11px'
        }}>
          {payload.map((entry: any, index: number) => {
            const value = entry.payload.value || 0;
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(0) : 0;
            
            return (
              <div 
                key={`legend-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: entry.color,
                    flexShrink: 0
                  }}
                />
                <span style={{
                  color: '#334155',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  fontSize: '11px'
                }}>
                  {entry.value}
                </span>
                <span style={{
                  color: '#64748b',
                  fontSize: '10px',
                  fontWeight: '500',
                  flexShrink: 0
                }}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      );
    };
    
    return (
      <PieChart width={width} height={340}>
        <Pie 
          data={chartData} 
          cx="50%" 
          cy="38%" 
          innerRadius={65}
          outerRadius={95}
          fill="#8884d8" 
          dataKey={chartConfig.valueKey || 'value'}
          paddingAngle={2}
          label={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '11px',
            padding: '8px'
          }}
          formatter={(value: any, name: string) => {
            const percentage = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
            return [`${value} (${percentage}%)`, name];
          }}
        />
        <Legend 
          content={<CustomLegend />}
          verticalAlign="bottom"
          height={100}
        />
      </PieChart>
    );
  }

  // LINE CHART
  if (chartConfig.type === 'line') {
    return (
      <LineChart 
        data={chartData}
        width={width}
        height={280}
        margin={{ top: 10, right: 20, bottom: 30, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey={chartConfig.xDataKey || 'name'} 
          tick={{ fill: '#64748b', fontSize: 10 }}
          label={chartConfig.xLabel ? { 
            value: chartConfig.xLabel, 
            position: 'insideBottom', 
            offset: -5,
            style: { fontSize: 11, fontWeight: 600 }
          } : undefined}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 10 }}
          label={chartConfig.yLabel ? { 
            value: chartConfig.yLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 11, fontWeight: 600 }
          } : undefined}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={chartConfig.yDataKey || 'value'}
          stroke={chartConfig.color || '#f59e0b'}
          strokeWidth={2}
          dot={{ r: 3, fill: chartConfig.color || '#f59e0b' }}
        />
      </LineChart>
    );
  }

  // BAR CHART (default)
  const isHorizontal = chartConfig.layout === 'horizontal' || 
                       chartConfig.type === 'horizontalBar';
  
  return (
    <BarChart 
      data={chartData} 
      width={width} 
      height={280}
      margin={{ top: 10, right: 20, bottom: 30, left: 10 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      {isHorizontal ? (
        <>
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            type="category" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            width={120} 
          />
        </>
      ) : (
        <>
          <XAxis 
            dataKey={chartConfig.xDataKey || 'name'} 
            tick={{ fill: '#64748b', fontSize: 10 }} 
          />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
        </>
      )}
      <Tooltip />
      <Bar
        dataKey="value"
        fill={chartConfig.color || '#3b82f6'}
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
                  padding: '18px'
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
                  <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
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
                  <LucideIcons.CheckCircle2 style={{ 
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
            padding: '22px',
            marginBottom: '28px'
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
            <div style={{ display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
              {chart.type === 'pie' 
                ? renderStaticChart(chart.data || [], chart, 400)
                : renderStaticChart(chart.data || [], chart, 690)}
            </div>
          </div>

          {/* Drilldown (if exists) */}
          {(chart.drillDownData || chart.drillDown) && (
            <StaticDrilldown 
              drilldown={chart.drillDownData || chart.drillDown} 
              parentTitle={chart.title}
            />
          )}
        </div>
      ))}
    </div>
  );
};