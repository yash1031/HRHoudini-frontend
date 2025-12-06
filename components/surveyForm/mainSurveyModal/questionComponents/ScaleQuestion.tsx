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
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-1">
        {question.options?.map((option: QuestionOption) => (
          <label 
            key={option.id}
            className={`flex items-center px-2.5 py-1.5 rounded-md cursor-pointer transition-all border ${
              answer?.value === option.value
                ? 'bg-blue-50 border-blue-300'
                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.value}
              checked={answer?.value === option.value}
              onChange={() => onChange(option.value)}
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:outline-none"
            />
            <span className={`ml-2 text-xs ${
              answer?.value === option.value 
                ? 'text-blue-700 font-medium' 
                : 'text-gray-700'
            }`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}