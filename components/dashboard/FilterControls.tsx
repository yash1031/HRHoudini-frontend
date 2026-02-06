// components/dashboard/FilterControls.tsx
"use client";

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DateFilterBar } from "./DateFilterBar";
import type { FilterOption, FilterState } from '@/types/dashboard';

interface FilterControlsProps {
  filters: FilterOption[];
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  currentFilters?: FilterState;
  /** When filters include date_range, pass current range and change handler so date is part of the same section */
  dateRange?: { start: string; end: string } | null;
  /**
   * Called by DateFilterBar when the user selects a preset or custom range.
   * This should ONLY update local date range state, not run heavy queries.
   */
  onDateChange?: (start: string, end: string) => void;
  /**
   * Called when the user clicks the main "Apply" button.
   * Use this to actually apply the current dateRange together with other filters.
   */
  onApplyDateRange?: (start: string, end: string) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  currentFilters = {},
  dateRange = null,
  onDateChange,
  onApplyDateRange,
}) => {
  const [filterValues, setFilterValues] = useState<FilterState>(currentFilters);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    // Pre-populate filterValues with currently applied filters
    const initialValues: Record<string, any> = {};
    
    Object.entries(currentFilters).forEach(([field, filterObj]) => {
      if (filterObj.operator === 'IN' && Array.isArray(filterObj.value)) {
        initialValues[field] = filterObj.value;
      }
    });
    setFilterValues(currentFilters);
  }, [currentFilters]);

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filterValues, [field]: value };
    setFilterValues(newFilters);
  };

  const handleMultiSelectToggle = (field: string, option: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // const current = filterValues[field] || [];
    const current = Array.isArray(filterValues[field]) ? filterValues[field] : [];
    const newValue = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleFilterChange(field, newValue);
  };

  const toggleDropdown = (field: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
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
    // Convert to query format that buildSQL expects
    // const queryFilters: Record<string, any> = {};
    const queryFilters: Record<string, any> = { ...currentFilters };
    
    Object.entries(filterValues).forEach(([field, value]) => {
        const filter = filters.find(f => f.field === field);
        if (!filter?.whereClause) return;
        
        // Ensure value exists and is not empty
        let finalValue = value;
        
        // For select/multiselect - ensure it's an array
        if (filter.type === 'select' || filter.type === 'multiselect') {
            if (typeof value === 'string' && value) {
                finalValue = [value]; // Convert string to array
            } else if (Array.isArray(value) && value.length === 0) {
                return; // Skip empty arrays
            } else if (!Array.isArray(value)) {
                return; // Skip if not array and not string
            }
            // MERGE LOGIC: Combine with existing values if filter already exists
            if (queryFilters[field]?.operator === 'IN' && Array.isArray(queryFilters[field].value)) {
              const existingValues = queryFilters[field].value as string[];
              const combinedValues = [...new Set([...existingValues, ...finalValue])];
              finalValue = combinedValues;
            }
        }
        
        // Build the filter object with operator and value
        queryFilters[field] = {
          operator: filter.whereClause.operator,
          value: finalValue
        };
    });
    
    console.log('Applying filters:', queryFilters);
    onFilterChange(queryFilters);

    // Apply the current date range together with other filters (if provided)
    if (onApplyDateRange && dateRange?.start && dateRange?.end) {
      onApplyDateRange(dateRange.start, dateRange.end);
    }
  };

  const clearAllFilters = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFilterValues({});
    setOpenDropdowns({});
    onClearFilters();
  };

  const activeFilterCount = Object.keys(filterValues).filter(key => {
    const value = filterValues[key];
    if (Array.isArray(value)) return value.length > 0;
    if (value === null || value === undefined || value === '') return false;
    return true;
  }).length;

  const renderFilter = (filter: FilterOption) => {
    // Date range: render inline in same Filters section
    if (filter.type === 'date_range' && onDateChange && dateRange) {
      return (
        <div key={filter.field} className="w-full col-span-full">
          <DateFilterBar
            dateFilter={filter as any}
            currentStart={dateRange.start}
            currentEnd={dateRange.end}
            onDateChange={onDateChange}
          />
        </div>
      );
    }
    if (filter.type === 'multiselect' || filter.type === 'select') {
      const selectedCount = Array.isArray(filterValues[filter.field]) 
        ? filterValues[filter.field].length 
        : 0;
      const totalCount = filter.options?.length || 0;
      const isOpen = openDropdowns[filter.field];

      return (
        <div key={filter.field} className="space-y-1.5 relative min-w-0" onClick={(e) => e.stopPropagation()}>
          <label className="text-xs font-medium text-slate-700 truncate block">{filter.label}</label>

          {/* Dropdown Trigger */}
          <div
            onClick={(e) => toggleDropdown(filter.field, e)}
            className={`w-full px-3 py-2 border rounded-lg bg-white cursor-pointer transition-all ${
              isOpen ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {selectedCount > 0 ? `${selectedCount} selected` : `Select...`}
              </span>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Select All / Clear */}
              <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{filter.options?.length || 0} options</span>
                <div className="flex items-center space-x-1.5">
                  <button onClick={(e) => selectAll(filter, e)} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium">
                    All
                  </button>
                  <span className="text-slate-300 text-[10px]">|</span>
                  <button onClick={(e) => deselectAll(filter.field, e)} className="text-[10px] text-slate-600 hover:text-slate-800 font-medium">
                    Clear
                  </button>
                </div>
              </div>

              {/* Options List - scrollable, but not clipped by parent cards */}
              <div className="max-h-72 overflow-y-auto">
                <div className="p-1">
                  {(filter.options || []).map((option) => {
                    // const isSelected = (filterValues[filter.field] || []).includes(option);
                    const isSelected = Array.isArray(filterValues[filter.field]) 
                                        ? filterValues[filter.field].includes(option)
                                        : filterValues[filter.field] === option;
                    return (
                      <div
                        key={option}
                        onClick={(e) => handleMultiSelectToggle(filter.field, option, e)}
                        className={`px-2 py-1.5 rounded-md cursor-pointer transition-colors flex items-center space-x-2 ${
                          isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-xs flex-1 ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                          {option}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Selected Items Display */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(filterValues[filter.field]) ? filterValues[filter.field] : [filterValues[filter.field]]).slice(0, 3).map((item: string) => (
                <div key={item} className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-medium rounded-full">
                  <span>{item}</span>
                  <button onClick={(e) => handleMultiSelectToggle(filter.field, item, e)} className="hover:bg-indigo-700 rounded-full transition-colors">
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
    }

    return null;
  };

  // Close dropdowns on outside click
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
    <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2 ml-auto">
          <button onClick={(e) => { e.stopPropagation(); applyFilters(); }} className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded transition-all flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply</span>
          </button>
          {activeFilterCount > 0 && (
            <button onClick={(e) => { e.stopPropagation(); clearAllFilters(e); }} className="px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 text-[11px] font-semibold rounded transition-all">
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 items-start">
        {filters.map((f) => renderFilter(f))}
      </div>
    </div>
  );
};