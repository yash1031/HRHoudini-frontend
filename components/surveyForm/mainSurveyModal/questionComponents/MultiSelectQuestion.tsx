'use client';

import { useState, useEffect } from 'react';
import type { Question, QuestionOption } from '@/types/survey-modal';

interface MultiSelectQuestionProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function MultiSelectQuestion({ question, index, answer, onChange }: MultiSelectQuestionProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(answer?.value || []);
  const [otherText, setOtherText] = useState<string>(answer?.text || '');

  // Get min/max from metadata
  const minSelections = question.metadata?.min_selections || 0;
  const maxSelections = question.metadata?.max_selections || null;

  useEffect(() => {
    // Sync with parent component
    onChange(selectedValues, otherText);
  }, [selectedValues, otherText]);

  const handleCheckboxChange = (optionValue: string) => {
    setSelectedValues(prev => {
      const isSelected = prev.includes(optionValue);
      
      if (isSelected) {
        // Deselect
        return prev.filter(v => v !== optionValue);
      } else {
        // Select (check max limit)
        if (maxSelections && prev.length >= maxSelections) {
          return prev; // Don't add if max reached
        }
        return [...prev, optionValue];
      }
    });
  };

  const isMaxReached = maxSelections && selectedValues.length >= maxSelections;
  const isMinMet = selectedValues.length >= minSelections;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Selection constraints hint */}
      {(minSelections > 0 || maxSelections) && (
        <p className="text-xs text-gray-500">
          {minSelections > 0 && maxSelections && (
            `Select ${minSelections}-${maxSelections} options`
          )}
          {minSelections > 0 && !maxSelections && (
            `Select at least ${minSelections} option${minSelections > 1 ? 's' : ''}`
          )}
          {!minSelections && maxSelections && (
            `Select up to ${maxSelections} option${maxSelections > 1 ? 's' : ''}`
          )}
        </p>
      )}

      <div className="space-y-2">
        {question.options?.map((option: QuestionOption) => {
          const isSelected = selectedValues.includes(option.value);
          const isDisabled = (!isSelected && isMaxReached) || false;

          return (
            <div key={option.id}>
              <label 
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  isDisabled 
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                    : 'border-gray-300 hover:bg-gray-50'
                } ${isSelected ? 'bg-blue-50 border-blue-500' : ''}`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(option.value)}
                  disabled={isDisabled}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className={`ml-3 ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
              
              {/* "Other" option with text input */}
              {option.has_text_input && isSelected && (
                <div className="mt-2 ml-7">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    placeholder={option.text_input_placeholder || 'Please specify...'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation message */}
      {isMaxReached && (
        <p className="text-xs text-orange-600">
          Maximum {maxSelections} option{maxSelections! > 1 ? 's' : ''} selected. Uncheck one to select another.
        </p>
      )}
      {question.is_required && !isMinMet && selectedValues.length > 0 && (
        <p className="text-xs text-red-600">
          Please select at least {minSelections} option{minSelections > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}