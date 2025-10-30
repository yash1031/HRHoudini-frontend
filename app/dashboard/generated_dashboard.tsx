"use client"
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, Rectangle, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Users, UserCheck, TrendingUp, Globe, MapPin, X, AlertTriangle, CheckCircle, Info, DollarSign, Activity, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
// import { loadParquetData } from '@/utils/parquetLoader';
import { DynamicQueryBuilder } from '@/utils/queryBuilder';
import { executeQuery, executeBatchQueries } from '@/utils/parquetLoader';

interface QueryColumn {
  expression: string;
  alias: string;
}

interface QueryFrom {
  type: string;
  source: string;
}

interface QueryWhere {
  field: string;
  operator: string;
  type: string;
  value?: any;
}

interface QueryOrderBy {
  field: string;
  direction: string;
}

interface QueryObject {
  select: {
    columns: QueryColumn[];
  };
  from: QueryFrom;
  where: QueryWhere[];
  groupBy: string[];
  orderBy: QueryOrderBy[];
  limit: number | null;
  parameters?: Record<string, any>;
  union?: QueryObject[];
}

interface WhereClause {
  field: string;
  operator: string;
  paramNames: string[];
  type: string;
}

interface FilterOption {
  field: string;
  label: string;
  type: 'multiselect' | 'select' | 'range';
  options?: string[];
  min?: number;
  max?: number;
  whereClause?: WhereClause;
}

// Filter state interface
interface FilterState {
  [key: string]: any;
}

// Type Definitions
interface DataItem {
  [key: string]: any;
}

interface ChartDataItem {
  name?: string;
  value?: number;
  [key: string]: any;
}

// UPDATED: New insights structure
interface Insight {
  critical_issues: string[];
  recommended_actions: string[];
}

interface DrillDownData {
  filters?: FilterOption[];
  cards: KPICard[];
  charts: ChartConfig[];
  insights?: Insight; // UPDATED: Changed from InsightItem[] to Insights
}

interface KPICard {
  label: string;
  icon: string;
  color: string;
  description?: string;
  calculationType: 'count' | 'average' | 'distinct' | 'custom';
  dataKey?: string;
  extractValue?: (item: DataItem) => number;
  format?: (value: number) => string | number;
  filterCondition?: (item: DataItem) => boolean;
  calculate?: (data: DataItem[]) => string | number;
  drillDownData?: DrillDownData;
}

interface ChartConfig {
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'line';
  color: string;
  dataKey?: string;
  xDataKey?: string;
  yDataKey?: string;
  valueKey?: string;
  layout?: 'vertical' | 'horizontal';
  height?: number;
  sort?: 'asc' | 'desc';
  lineName?: string;
  customDataGenerator?: (data: DataItem[]) => ChartDataItem[];
  drillDownData?: DrillDownData;
  queryObject?: QueryObject;
}

interface TableColumn {
  label: string;
  dataKey: string;
  className?: string;
  render?: (value: any, row: DataItem) => React.ReactNode;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  drillDownData?: DrillDownData;
}

interface ConfigurableDashboardProps {
  title?: string;
  subtitle?: string;
  data?: DataItem[];
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
  };
}

const FilterControls: React.FC<{
  filters: FilterOption[];
  onFilterChange: (filters: FilterState) => void;
  currentFilters?: FilterState;
}> = ({ filters, onFilterChange, currentFilters = {} }) => {
  const [filterValues, setFilterValues] = useState<FilterState>(currentFilters);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  React.useEffect(() => {
    setFilterValues(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filterValues, [field]: value };
    setFilterValues(newFilters);
  };

  const handleMultiSelectToggle = (field: string, option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const current = filterValues[field] || [];
    const newValue = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleFilterChange(field, newValue);
  };

  const toggleDropdown = (field: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdowns(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSearch = (field: string, term: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [field]: term
    }));
  };

  const getFilteredOptions = (filter: FilterOption) => {
    const searchTerm = searchTerms[filter.field]?.toLowerCase() || '';
    return filter.options?.filter(option =>
      option.toLowerCase().includes(searchTerm)
    ) || [];
  };

  const selectAll = (filter: FilterOption, event: React.MouseEvent) => {
    event.stopPropagation();
    handleFilterChange(filter.field, filter.options || []);
  };

  const deselectAll = (field: string, event: React.MouseEvent) => {
    event.stopPropagation();
    handleFilterChange(field, []);
  };

  const applyFilters = () => {
    onFilterChange(filterValues);
  };

  const clearAllFilters = (event: React.MouseEvent) => {
    event.stopPropagation();
    const emptyFilters = {};
    setFilterValues(emptyFilters);
    setOpenDropdowns({});
    setSearchTerms({});
    onFilterChange(emptyFilters);
  };

  // Count active filters for display
  const activeFilterCount = Object.keys(filterValues).filter(key => {
    const value = filterValues[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      // For range filters {min, max}
      return value.min !== undefined || value.max !== undefined;
    }
    if (value === null || value === undefined || value === '') return false;
    return true;
  }).length;

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case 'multiselect':
        const selectedCount = (filterValues[filter.field] || []).length;
        const totalCount = filter.options?.length || 0;
        const isOpen = openDropdowns[filter.field];
        const filteredOptions = getFilteredOptions(filter);

        return (
          <div
            key={filter.field}
            className="space-y-1.5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="text-xs font-medium text-slate-700">
              {filter.label}
            </label>

            {/* Dropdown Trigger - Compact */}
            <div
              onClick={(e) => toggleDropdown(filter.field, e)}
              className={`w-full px-3 py-2 border rounded-lg bg-white cursor-pointer transition-all ${isOpen
                  ? 'border-indigo-500 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {selectedCount > 0
                      ? `${selectedCount} selected`
                      : `Select...`}
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Dropdown Menu - Compact */}
            {isOpen && (
              <div
                className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Bar - Compact */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`Search...`}
                      value={searchTerms[filter.field] || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSearch(filter.field, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <svg
                      className="absolute left-2 top-2 w-3 h-3 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Select All / Clear - Compact */}
                <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {filteredOptions.length} {filteredOptions.length === 1 ? 'option' : 'options'}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => selectAll(filter, e)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      All
                    </button>
                    <span className="text-slate-300 text-[10px]">|</span>
                    <button
                      onClick={(e) => deselectAll(filter.field, e)}
                      className="text-[10px] text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Options List - Compact */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredOptions.length > 0 ? (
                    <div className="p-1">
                      {filteredOptions.map((option) => {
                        const isSelected = (filterValues[filter.field] || []).includes(option);
                        return (
                          <div
                            key={option}
                            onClick={(e) => handleMultiSelectToggle(filter.field, option, e)}
                            className={`px-2 py-1.5 rounded-md cursor-pointer transition-colors flex items-center space-x-2 ${isSelected
                                ? 'bg-indigo-50 hover:bg-indigo-100'
                                : 'hover:bg-slate-50'
                              }`}
                          >
                            {/* Checkbox - Smaller */}
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${isSelected
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-slate-300'
                                }`}
                            >
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              )}
                            </div>

                            {/* Option Text - Smaller */}
                            <span className={`text-xs flex-1 ${isSelected
                                ? 'text-indigo-900 font-medium'
                                : 'text-slate-700'
                              }`}>
                              {option}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <AlertTriangle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">No options found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Items Display - Inline & Compact */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap gap-1">
                {(filterValues[filter.field] || []).slice(0, 3).map((item: string) => (
                  <div
                    key={item}
                    className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-medium rounded-full"
                  >
                    <span>{item}</span>
                    <button
                      onClick={(e) => handleMultiSelectToggle(filter.field, item, e)}
                      className="hover:bg-indigo-700 rounded-full transition-colors"
                    >
                      <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                {selectedCount > 3 && (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-medium rounded-full">
                    +{selectedCount - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div
            key={filter.field}
            className="space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="text-xs font-medium text-slate-700">{filter.label}</label>
            <select
              value={filterValues[filter.field] || ''}
              onChange={(e) => {
                e.stopPropagation();
                handleFilterChange(filter.field, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-slate-700 hover:border-slate-300"
            >
              <option value="">All</option>
              {filter.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'range':
        // ✅ FIXED: Use object {min, max} instead of array
        const currentRange = filterValues[filter.field] || {};
        const minVal = currentRange.min !== undefined ? currentRange.min : filter.min;
        const maxVal = currentRange.max !== undefined ? currentRange.max : filter.max;
        const range = (filter.max || 100) - (filter.min || 0);

        return (
          <div
            key={filter.field}
            className="space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">{filter.label}</label>
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-semibold rounded-full">
                {minVal} - {maxVal}
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Minimum Slider - Compact */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Min</span>
                  <span className="font-semibold text-slate-700">{minVal}</span>
                </div>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={minVal}
                  onChange={(e) => {
                    e.stopPropagation();
                    // ✅ Store as object {min, max}
                    handleFilterChange(filter.field, {
                      min: parseInt(e.target.value),
                      max: maxVal,
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((minVal - (filter.min || 0)) / range) * 100}%, #e2e8f0 ${((minVal - (filter.min || 0)) / range) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>

              {/* Maximum Slider - Compact */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Max</span>
                  <span className="font-semibold text-slate-700">{maxVal}</span>
                </div>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={maxVal}
                  onChange={(e) => {
                    e.stopPropagation();
                    // ✅ Store as object {min, max}
                    handleFilterChange(filter.field, {
                      min: minVal,
                      max: parseInt(e.target.value),
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((maxVal - (filter.min || 0)) / range) * 100}%, #e2e8f0 ${((maxVal - (filter.min || 0)) / range) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-800">Filters</h4>
          {activeFilterCount > 0 && (
            <Badge className="bg-indigo-100 text-indigo-800 text-[10px]">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 text-[10px] font-medium rounded-md border border-red-200 hover:border-red-300 transition-all flex items-center space-x-1"
          >
            <X className="w-2.5 h-2.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filters.map(renderFilter)}
      </div>

      {/* Apply Filters Button */}
      <div className="pt-1.5 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} selected` : 'No filters applied'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            applyFilters();
          }}
          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded transition-all flex items-center space-x-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
};

const Generated_Dashboard: React.FC<ConfigurableDashboardProps> = ({
  title = "Employee Analytics Dashboard",
  subtitle = "Interactive insights and analytics",
  data = [],
  kpiCards = [],
  charts = [],
  rowCount,
  filename,
  tableColumns = [],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'],
  parquetDataUrl,
  columns,
  metadataFields
}) => {

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: ''
  });

  const [card1, card2, card3, card4] = kpiCards;

  const calculateKPI = (kpi: KPICard): string | number => {
    if (kpi?.calculationType === 'custom' && kpi?.calculate) {
      return kpi.calculate(data);
    }

    switch (kpi?.calculationType) {
      case 'count':
        if (kpi?.filterCondition) {
          return data.filter(kpi.filterCondition).length;
        }
        return data?.length;

      case 'average':
        if (kpi?.dataKey) {
          const values = data.map(item => {
            const val = kpi.extractValue ? kpi.extractValue(item) : item[kpi.dataKey!];
            return parseFloat(val) || 0;
          });
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          return kpi.format ? kpi.format(avg) : avg.toFixed(1);
        }
        return 0;

      case 'distinct':
        if (kpi?.dataKey) {
          const uniqueValues = new Set(data.map(item => item[kpi.dataKey!]));
          return uniqueValues.size;
        }
        return 0;

      default:
        return 0;
    }
  };

  const generateChartData = (chart: ChartConfig): ChartDataItem[] => {
    if (chart.customDataGenerator) {
      return chart.customDataGenerator(data);
    }

    const groups: Record<string, number> = {};
    data.forEach(item => {
      const key = item[chart.dataKey!];
      groups[key] = (groups[key] || 0) + 1;
    });

    let chartData = Object.entries(groups).map(([name, value]) => ({
      name,
      value,
      [chart.valueKey || 'value']: value
    }));

    if (chart.sort === 'desc') {
      chartData.sort((a, b) => (b.value || 0) - (a.value || 0));
    } else if (chart.sort === 'asc') {
      chartData.sort((a, b) => (a.value || 0) - (b.value || 0));
    }

    return chartData;
  };

  const closeModal = (): void => {
    setModal({ isOpen: false, title: '' });
  };

  const handleKPIClick = (kpi: KPICard): void => {
    if (!kpi.drillDownData) return;
    setModal({
      isOpen: true,
      title: `${kpi.label} - Detailed Analysis`,
      drillDownData: kpi.drillDownData
    });
  };

  const handleChartClick = (chart: ChartConfig): void => {
    if (!chart.drillDownData) return;

    setModal({
      isOpen: true,
      title: `${chart.title} - Detailed Analysis`,
      drillDownData: chart.drillDownData
    });
  };

  const getIcon = (iconName: string): React.ComponentType<any> => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Users, UserCheck, TrendingUp, Globe, MapPin, AlertTriangle, CheckCircle, Info, DollarSign, Activity
    };
    return iconMap[iconName] || Users;
  };

  const getRandomLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 75%)`;
  };

  // Generate unique light colors for pie chart segments
  const generatePieColors = (count: number): string[] => {
    const colors: string[] = [];
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = (step * i + Math.random() * 30) % 360;
      colors.push(`hsl(${hue}, 70%, 75%)`);
    }
    return colors;
  };

  const renderChart = (chartData: ChartDataItem[], chartConfig: Partial<ChartConfig>): React.ReactNode => {

    if (chartConfig.type === 'pie') {
      const pieColors = generatePieColors(chartData.length);

      const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 50; 
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        const textAnchor = x > cx ? 'start' : 'end';

        const isLongLabel = name.length > 15;

        if (isLongLabel) {
          return (
            <g>
              <text
                x={x}
                y={y - 8}
                fill="#64748b"
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="12px"
                fontWeight="500"
              >
                {name}
              </text>
              <text
                x={x}
                y={y + 8}
                fill="#64748b"
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize="11px"
              >
                {`${value} (${(percent * 100).toFixed(0)}%)`}
              </text>
            </g>
          );
        } else {
          return (
            <text
              x={x}
              y={y}
              fill="#64748b"
              textAnchor={textAnchor}
              dominantBaseline="central"
              fontSize="12px"
            >
              {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
          );
        }
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
              <Cell
                key={`cell-${index}`}
                fill={pieColors[index]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      );
    }

    if (chartConfig.type === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={chartConfig.xDataKey || 'name'} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
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

    const barColor = getRandomLightColor();
    return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        {chartConfig.layout === 'horizontal' ? (
          <>
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis dataKey={chartConfig.xDataKey || 'name'} type="category" tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey={chartConfig.xDataKey || 'name'} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
          </>
        )}
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
        <Bar
          dataKey={'value'}
          fill={barColor}
          radius={chartConfig.layout === 'horizontal' ? [0, 8, 8, 0] : [8, 8, 0, 0]}
        />
      </BarChart>
    );
  };

  // UPDATED: New InsightsSection component matching the image format
  const InsightsSection: React.FC<{ insights: Insight }> = ({ insights }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Key Insights & Recommendations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Critical Issues Section */}
          <div>
            <h4 className="text-md font-semibold text-slate-800 mb-4">Critical Issues:</h4>
            {insights.critical_issues && insights.critical_issues.length > 0 ? (
              <ul className="space-y-2">
                {insights.critical_issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No critical issues identified</p>
            )}
          </div>

          {/* Recommended Actions Section */}
          <div>
            <h4 className="text-md font-semibold text-slate-800 mb-4">Recommended Actions:</h4>
            {insights.recommended_actions && insights.recommended_actions.length > 0 ? (
              <ul className="space-y-2">
                {insights.recommended_actions.map((action, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No recommended actions</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DrillDownModal: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [chartData, setChartData] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    if (!modal.isOpen || !modal.drillDownData?.charts) {
      return;
    }

    const executeChartQueries = async () => {
      // ✅ Show transition overlay instead of full loading screen for filter changes
      if (Object.keys(chartData).length === 0) {
        setLoading(true); // First time loading
      } else {
        setIsTransitioning(true); // Subsequent filter changes
      }
      
      setLoadError(null);

      try {
        const filterValues = DynamicQueryBuilder.buildFilterValues(
          modal.drillDownData?.filters || [],
          activeFilters
        );

        const queries = modal.drillDownData.charts.map((chart, idx) => {
          if (!chart.queryObject) return '';
          // ✅ Pass numeric fields as third parameter (optional)
          return DynamicQueryBuilder.buildSQL(
            chart.queryObject, 
            filterValues,
            ['age', 'salary', 'years_experience'] // Add your numeric fields here
          );
        });

        const validQueries = queries.filter(q => q !== '');
        
        if (validQueries.length === 0) {
          setLoadError('No valid queries found');
          setLoading(false);
          setIsTransitioning(false);
          return;
        }

        const results = await executeBatchQueries(validQueries);

        const newChartData: Record<number, any[]> = {};
        let validQueryIndex = 0;
        
        queries.forEach((query, idx) => {
          if (query !== '') {
            newChartData[idx] = results[validQueryIndex] || [];
            validQueryIndex++;
          } else {
            newChartData[idx] = [];
          }
        });

        // ✅ Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 150));

        setChartData(newChartData);
        setLoading(false);
        setIsTransitioning(false);
      } catch (error) {
        console.error('❌ Failed to execute queries:', error);
        setLoadError('Failed to load chart data: ' + (error as Error).message);
        setLoading(false);
        setIsTransitioning(false);
      }
    };

    executeChartQueries();
  }, [modal.isOpen, modal.drillDownData, activeFilters]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  if (!modal.isOpen || !modal.drillDownData) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl my-8 flex flex-col"
        style={{ maxHeight: 'calc(100vh - 64px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-slate-800">{modal.title}</h2>
          <button 
            onClick={closeModal} 
            className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-white hover:bg-red-500 transition-all rounded-lg border-2 border-slate-300 hover:border-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Full loading screen only on initial load */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading data...</p>
                </div>
              </div>
            )}

            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 font-medium">{loadError}</p>
                </div>
              </div>
            )}

            {!loading && (
              <>
                {/* Filters Section */}
                {modal.drillDownData.filters && modal.drillDownData.filters.length > 0 && (
                  <FilterControls 
                    filters={modal.drillDownData.filters} 
                    onFilterChange={handleFilterChange}
                    currentFilters={activeFilters}
                  />
                )}

                {/* Charts with smooth transition */}
                <div className="relative">
                  {/* ✅ Smooth transition overlay */}
                  {isTransitioning && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl transition-all duration-300">
                      <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-xl shadow-lg border border-slate-200 animate-fade-in">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-indigo-100"></div>
                        </div>
                        <span className="text-sm text-slate-700 font-medium">Updating charts...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Charts Row */}
                  {modal.drillDownData.charts && modal.drillDownData.charts.length > 0 && (
                    <div 
                      className={`grid gap-6 transition-all duration-300 ${isTransitioning ? 'opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}
                      style={{ gridTemplateColumns: `repeat(${Math.min(modal.drillDownData.charts.length, 2)}, 1fr)` }}
                    >
                      {modal.drillDownData.charts.map((chart, idx) => {
                        const Icon = getIcon(chart.icon);
                        const dynamicChartData = chartData[idx] || [];
                        
                        return (
                          <div key={idx} className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                              <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                              {chart.title}
                              {!chart.queryObject && (
                                <Badge className="ml-2 bg-red-100 text-red-800 text-xs">
                                  No Query
                                </Badge>
                              )}
                              {chart.queryObject && dynamicChartData.length > 0 && (
                                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                                  {dynamicChartData.length} records
                                </Badge>
                              )}
                            </h3>
                            {chart.queryObject && dynamicChartData.length > 0 ? (
                              <ResponsiveContainer width="100%" height={chart.height || 300}>
                                {renderChart(dynamicChartData, chart)}
                              </ResponsiveContainer>
                            ) : (
                              <div className="flex items-center justify-center h-64 text-slate-400">
                                <div className="text-center">
                                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                  <p className="font-medium">
                                    {!chart.queryObject 
                                      ? 'No query object available' 
                                      : 'No data available'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Insights Row */}
                {modal.drillDownData.insights && (
                  <InsightsSection insights={modal.drillDownData.insights} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-12">
      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl mb-6">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">HR Houdini</h1>
                  <p className="text-blue-100">
                    Your AI workforce analyst - Ready to dive deeper into {filename} data
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-white/20 text-white border-white/30">Analysis Completed</Badge>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2 text-white">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{filename}</span>
                    {/* <span className="font-medium">{localStorage.getItem("file_name")}</span> */}
                    <span className="text-blue-200">•</span>
                    <span className="text-blue-200">{rowCount} records</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-white mb-3">3 Critical Insights Found</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  {/* <span className="font-medium text-white">Turnover:</span>
                  <span className="text-blue-100">{"24.3%"} rate</span> */}
                  <span className="font-medium text-white">{card2?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="font-medium text-white">{card3?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card3)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="font-medium text-white">{card4?.label}</span>
                  <span className="text-blue-100">{calculateKPI(card4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {kpiCards.length > 0 && (
          <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${Math.min(kpiCards.length, 4)}, 1fr)` }}>
            {kpiCards.map((kpi, idx) => {
              const Icon = getIcon(kpi.icon);
              const value = calculateKPI(kpi);

              return (
                <div
                  key={idx}
                  onClick={() => kpi.drillDownData && handleKPIClick(kpi)}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${kpi.drillDownData ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
                  style={{ borderLeftColor: kpi.color || '#3b82f6' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-slate-800">{value}</p>
                      {kpi.description && (
                        <p className="text-xs mt-1" style={{ color: kpi.color || '#3b82f6' }}>
                          {kpi.description}
                        </p>
                      )}
                    </div>
                    <Icon className="w-12 h-12 opacity-80" style={{ color: kpi.color || '#3b82f6' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {charts.map((chart, idx) => {
            const chartData = generateChartData(chart);
            const Icon = getIcon(chart.icon);

            return (
              <div
                key={idx}
                className={`bg-white rounded-lg shadow-md p-6 ${chart.drillDownData ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`}
                onClick={() => chart.drillDownData && handleChartClick(chart)}
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <Icon className="w-5 h-5 mr-2" style={{ color: chart.color || '#3b82f6' }} />
                  {chart.title}
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  {renderChart(chartData, chart)}
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Dashboard generated from {rowCount} total records</p>
        </div>

      </div>

      <DrillDownModal />
    </div>
  );
};

export default Generated_Dashboard;