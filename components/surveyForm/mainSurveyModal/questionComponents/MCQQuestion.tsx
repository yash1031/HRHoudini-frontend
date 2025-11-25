'use client';

import type { Question, QuestionOption } from '@/types/survey-modal';

interface MCQQuestionProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function MCQQuestion({ question, index, answer, onChange }: MCQQuestionProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {question.options?.map((option: QuestionOption) => (
          <div key={option.id}>
            <label className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.value}
                checked={answer?.value === option.value}
                onChange={() => onChange(option.value)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
            
            {/* "Other" option with text input */}
            {option.has_text_input && answer?.value === option.value && (
              <div className="mt-2 ml-7">
                <input
                  type="text"
                  value={answer?.text || ''}
                  onChange={(e) => onChange(option.value, e.target.value)}
                  placeholder={option.text_input_placeholder || 'Please specify...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}