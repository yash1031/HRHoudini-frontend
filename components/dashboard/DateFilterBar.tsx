// components/dashboard/DateFilterBar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DatePreset {
  id: string;
  label: string;
  start?: string;
  end?: string;
}

interface DateFilter {
  field: string;
  label: string;
  type: "date_range";
  bounds: {
    min: string;
    max: string;
  };
  presets: DatePreset[];
  default: {
    preset: string;
    start: string;
    end: string;
  };
}

interface DateFilterBarProps {
  dateFilter: DateFilter | null;
  onDateChange: (start: string, end: string) => void;
  currentStart?: string;
  currentEnd?: string;
  autoSelectDefault?: boolean;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateFilter,
  onDateChange,
  currentStart,
  currentEnd,
  autoSelectDefault = true,  // default = true (for drilldowns)
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Initialize from dateFilter defaults
  useEffect(() => {
    if (dateFilter) {
      if (autoSelectDefault) {
        // Current behavior: use backend default or currentStart/currentEnd
        const defaultPreset = dateFilter.default.preset;
        const defaultStart = currentStart || dateFilter.default.start;
        const defaultEnd = currentEnd || dateFilter.default.end;
        
        setSelectedPreset(defaultPreset);
        setCustomStart(defaultStart);
        setCustomEnd(defaultEnd);
      } else {
        // New behavior: start with "no selection"
        // If parent passes currentStart/currentEnd explicitly, respect them; otherwise blank.
        setSelectedPreset("");
        setCustomStart(currentStart || "");
        setCustomEnd(currentEnd || "");
      }
    }
  }, [dateFilter, currentStart, currentEnd, autoSelectDefault]);

  if (!dateFilter) {
    return null;
  }

  // Helper to build quarterly presets (Q1–Q4) for ALL years in the bounds range
  const buildQuarterPresets = (): DatePreset[] => {
    const minBoundStr = dateFilter.bounds?.min;
    const maxBoundStr = dateFilter.bounds?.max;

    if (!minBoundStr || !maxBoundStr) {
      return [];
    }

    const minYear = new Date(minBoundStr).getFullYear();
    const maxYear = new Date(maxBoundStr).getFullYear();

    const toISODate = (year: number, month: number, day: number): string => {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    };

    const quarters: DatePreset[] = [];

    for (let year = minYear; year <= maxYear; year++) {
      quarters.push(
        {
          id: `q1-${year}`,
          label: `Q1 ${year}`,
          start: toISODate(year, 1, 1),
          end: toISODate(year, 3, 31),
        },
        {
          id: `q2-${year}`,
          label: `Q2 ${year}`,
          start: toISODate(year, 4, 1),
          end: toISODate(year, 6, 30),
        },
        {
          id: `q3-${year}`,
          label: `Q3 ${year}`,
          start: toISODate(year, 7, 1),
          end: toISODate(year, 9, 30),
        },
        {
          id: `q4-${year}`,
          label: `Q4 ${year}`,
          start: toISODate(year, 10, 1),
          end: toISODate(year, 12, 31),
        },
      );
    }

    // Clamp each quarter to the overall min/max bounds
    return quarters
      .map((q) => {
        const start = q.start! < minBoundStr ? minBoundStr : q.start!;
        const end = q.end! > maxBoundStr ? maxBoundStr : q.end!;
        return { ...q, start, end };
      })
      // Filter out any "empty" or inverted ranges
      .filter((q) => q.start! <= q.end!);
  };

  // Ensure "Custom Range" exists and is always FIRST so it's visible without scrolling.
  // Replace backend presets with quarterly options (Q1–Q4) for every year in the bounds.
  const customEntry: DatePreset = { id: 'custom', label: 'Custom Range' };
  const quarterPresets = buildQuarterPresets();
  const presets = [customEntry, ...quarterPresets];

  const handlePresetSelect = (preset: DatePreset) => {
    if (preset.start && preset.end) {
      setSelectedPreset(preset.id);
      setCustomStart(preset.start);
      setCustomEnd(preset.end);
      setShowPresets(false);
      onDateChange(preset.start, preset.end);
    } else if (preset.id === "custom") {
      setSelectedPreset("custom");
      setShowPresets(false);
      setShowCustomPicker(true);
    }
  };

  const handleCustomDateApply = () => {
    if (customStart && customEnd) {
      // Validate dates are within bounds (guard if bounds missing)
      const minDate = dateFilter.bounds?.min ?? customStart;
      const maxDate = dateFilter.bounds?.max ?? customEnd;
      
      let start = customStart;
      let end = customEnd;
      
      // Clamp to bounds
      if (start < minDate) start = minDate;
      if (start > maxDate) start = maxDate;
      if (end < minDate) end = minDate;
      if (end > maxDate) end = maxDate;
      
      // Ensure start <= end
      if (start > end) {
        [start, end] = [end, start];
      }
      
      setCustomStart(start);
      setCustomEnd(end);
      setShowCustomPicker(false);
      onDateChange(start, end);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const currentPreset = presets.find((p: DatePreset) => p.id === selectedPreset);

  const getPresetRangeLabel = (preset: DatePreset): string => {
    if (preset.start && preset.end) {
      return `${formatDate(preset.start)} - ${formatDate(preset.end)}`;
    }
    return preset.label;
  };

  const displayText = currentPreset
    ? currentPreset.id !== 'custom'
      ? getPresetRangeLabel(currentPreset)
      : currentPreset.label
    : (customStart && customEnd
        ? `${formatDate(customStart)} - ${formatDate(customEnd)}`
        : 'Select range');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{dateFilter.label}:</span>
          {/* Preset Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-700 transition-colors"
            >
              <span>{displayText}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
            </button>

            {showPresets && (
              <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[240px] max-h-[320px] overflow-y-auto">
                <div className="p-2">
                  {presets.map((preset: DatePreset) => {
                    if (preset.id === "custom") {
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md text-sm text-slate-700"
                        >
                          {preset.label}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 rounded-md text-sm ${
                          selectedPreset === preset.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          {preset.start && preset.end
                            ? `${formatDate(preset.start)} - ${formatDate(preset.end)}`
                            : preset.label}
                        </div>
                        {preset.label && preset.start && preset.end && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {preset.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Custom Date Picker (shown when custom is selected) */}
          {showCustomPicker && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md p-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                min={dateFilter.bounds?.min}
                max={dateFilter.bounds?.max}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={dateFilter.bounds?.min}
                max={dateFilter.bounds?.max}
                className="text-xs px-2 py-1 border border-slate-300 rounded"
              />
              <Button
                onClick={handleCustomDateApply}
                size="sm"
                className="h-7 px-2 text-xs"
              >
                Apply
              </Button>
              <button
                onClick={() => setShowCustomPicker(false)}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          )}
        </div>

        {/* Date Range Display */}
        {dateFilter.bounds?.min && dateFilter.bounds?.max && (
          <div className="text-xs text-slate-500">
            Range: {formatDate(dateFilter.bounds.min)} - {formatDate(dateFilter.bounds.max)}
          </div>
        )}
      </div>

      {/* Close dropdowns on outside click */}
      {showPresets && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPresets(false)}
        />
      )}
    </div>
  );
};
