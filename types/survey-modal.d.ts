
export interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; 
}

export interface QuestionOption {
  id: number;
  value: string;
  label: string;
  display_order: number;
  has_text_input: boolean;
  text_input_placeholder: string | null;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'scale' | 'yes_no' | 'text' | 'mcq' | 'multi_select';
  is_required: boolean;
  display_order: number;
  max_length: number | null;
  metadata: {
    placeholder?: string;
    rows?: number;
    show_follow_up?: boolean;
    follow_up_text?: string;
    description?: string;
    min_selections?: number;
    max_selections?: number;
  };
  options?: QuestionOption[];
}

export interface FormAnswer {
  question_id: number;
  answer_text: string;
}