'use client';

import type { Question } from '@/types/survey-modal';

interface TextQuestionProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function TextQuestion({ question, index, answer, onChange }: TextQuestionProps) {
  const characterCount = answer?.value?.length || 0;
  const maxCharacters = question.max_length || 1000;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-900">
        {index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={answer?.value || ''}
        onChange={(e) => {
          if (e.target.value.length <= maxCharacters) {
            onChange(e.target.value);
          }
        }}
        placeholder={question.metadata?.placeholder || 'Type your answer...'}
        rows={question.metadata?.rows || 4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <p className="text-sm text-gray-500 text-right">
        {characterCount}/{maxCharacters} characters
      </p>
    </div>
  );
}