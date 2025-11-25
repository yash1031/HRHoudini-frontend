'use client';

import type { Question, QuestionOption } from '@/types/survey-modal';

interface YesNoQuestionProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function YesNoQuestion({ question, index, answer, onChange }: YesNoQuestionProps) {
  const showFollowUp = question.metadata?.show_follow_up && answer?.value !== undefined;
  
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-3">
        {question.options?.map((option: QuestionOption) => (
          <button
            key={option.id}
            onClick={() => onChange(option.value, answer?.text || '')}
            className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
              answer?.value === option.value
                ? option.value === 'true'
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-red-600 text-white border-red-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showFollowUp && (
        <div className="mt-3">
          <label className="block text-sm text-gray-600 mb-2">
            {question.metadata?.follow_up_text || 'Please explain (Optional)'}
          </label>
          <textarea
            value={answer?.text || ''}
            onChange={(e) => onChange(answer?.value, e.target.value)}
            placeholder="Tell us more..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      )}
    </div>
  );
}