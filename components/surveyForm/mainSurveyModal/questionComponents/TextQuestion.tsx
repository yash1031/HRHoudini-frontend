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
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-900">
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
        rows={5}
        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      <p className="text-[10px] text-gray-500 text-right">
        {characterCount}/{maxCharacters} characters
      </p>
    </div>
  );
}