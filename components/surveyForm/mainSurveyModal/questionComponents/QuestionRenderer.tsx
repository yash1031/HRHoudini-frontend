'use client';

import type { Question } from '@/types/survey-modal';
import ScaleQuestion from './ScaleQuestion';
import YesNoQuestion from './YesNoQuestion'
import TextQuestion from './TextQuestion';
import MCQQuestion from './MCQQuestion';
import MultiSelectQuestion from './MultiSelectQuestion';

interface QuestionRendererProps {
  question: Question;
  index: number;
  answer: any;
  onChange: (value: any, text?: string) => void;
}

export default function QuestionRenderer({ question, index, answer, onChange }: QuestionRendererProps) {
  switch (question.question_type) {
    case 'scale':
      return <ScaleQuestion question={question} index={index} answer={answer} onChange={onChange} />;
    
    case 'yes_no':
      return <YesNoQuestion question={question} index={index} answer={answer} onChange={onChange} />;
    
    case 'text':
      return <TextQuestion question={question} index={index} answer={answer} onChange={onChange} />;
    
    case 'mcq':
      return <MCQQuestion question={question} index={index} answer={answer} onChange={onChange} />;
    
    case 'multi_select':
      return <MultiSelectQuestion question={question} index={index} answer={answer} onChange={onChange} />;
    
    default:
      console.warn(`Unknown question type: ${question.question_type}`);
      return null;
  }
}