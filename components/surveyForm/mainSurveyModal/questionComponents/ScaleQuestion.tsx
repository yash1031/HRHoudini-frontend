'use client';

import type { Question, QuestionOption } from '@/types/survey-modal';

interface ScaleQuestionProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function ScaleQuestion({ question, index, answer, onChange }: ScaleQuestionProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {question.options?.map((option: QuestionOption) => (
          <button
            key={option.id}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              answer?.value === option.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}