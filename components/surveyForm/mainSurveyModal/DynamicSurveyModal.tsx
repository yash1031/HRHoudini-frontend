'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { SurveyModalProps, Question, FormAnswer } from '@/types/survey-modal';
import QuestionRenderer from './questionComponents/QuestionRenderer';
import { apiFetch } from "@/lib/api/client";

export default function DynamicSurveyModal({ isOpen, onClose, onSuccess }: SurveyModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFatalError, setHasFatalError] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fetch questions when modal opens
  useEffect(() => {
    if (isOpen) {
      // Uncomment to test error boundary
      // throw new Error('Test error boundary - survey modal crashed!');
      fetchQuestions();
      setAnswers({});
      setNeverShowAgain(false);
      setError(null);
    }
  }, [isOpen]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);

      // Uncomment to test api failure
      // throw new Error('Failed to connect to survey API');

      // Call Next.js API route
      const response = await apiFetch('/api/survey/questions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      }).catch((error) => {
        const parsedError = JSON.parse(error.message);
        console.error('Failed to fetch questions', parsedError);
        return;
      });

      if(response){
        console.log("data received from /api/survey/questions", response)
        setQuestions(response.questions || []);
      }
      
    } catch (err) {
      console.error("Error in fetching survey questions", err)
      // Set fatal error - this will hide the modal content
      setHasFatalError(true);
      setError(err instanceof Error ? err.message : 'Failed to load survey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any, text?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { value, text }
    }));
  };

  const prepareAnswersForSubmission = (): FormAnswer[] => {
    return questions.map(q => {
      const answer = answers[q.id];
      
      if (!answer) {
        return { question_id: q.id, answer_text: '' };
      }

      // Handle different question types
      if (q.question_type === 'yes_no') {
        // Store as JSON: {"value": "true/false", "text": "optional"}
        return {
          question_id: q.id,
          answer_text: JSON.stringify({
            value: answer.value,
            text: answer.text || ''
          })
        };
      } else if (q.question_type === 'multi_select') {
        // Store array as JSON string
        return {
          question_id: q.id,
          answer_text: JSON.stringify(answer.value || [])
        };
      } else if (q.question_type === 'mcq') {
        // MCQ with optional "Other" text
        if (answer.text) {
          // If there's text (from "Other" option), store as JSON
          return {
            question_id: q.id,
            answer_text: JSON.stringify({
              value: answer.value,
              text: answer.text
            })
          };
        } else {
          // Plain value
          return {
            question_id: q.id,
            answer_text: String(answer.value || '')
          };
        }
      } else {
        // Scale, Text - store as plain string
        return {
          question_id: q.id,
          answer_text: String(answer.value || '')
        };
      }
    }).filter(a => a.answer_text !== ''); // Only include answered questions
  };

  const validateAnswers = (): boolean => {
    for (const question of questions) {
      if (question.is_required) {
        const answer = answers[question.id];
        if (!answer || !answer.value) {
          setError(`Please answer: ${question.question_text}`);
          return false;
        }
        
        // Additional validation for multi_select
        if (question.question_type === 'multi_select') {
          const selectedValues = answer.value || [];
          const minSelections = question.metadata?.min_selections || 0;
          
          if (selectedValues.length < minSelections) {
            setError(`Please select at least ${minSelections} option${minSelections > 1 ? 's' : ''} for: ${question.question_text}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    //Check if compulsory questions are answered
    if (!validateAnswers()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const preparedAnswers = prepareAnswersForSubmission();

      // For testing api failure
      // throw new Error('Error connecting to api for submit survey');

      const response = await apiFetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          answers: preparedAnswers,
          never_show_again: neverShowAgain,
        }),
      }).catch((error) => {
        const parsedError = JSON.parse(error.message);
        console.error('Failed to submit survey', parsedError);
        return;
      });

      // Close survey modal
      onClose();
      
      // Trigger success modal via callback after brief delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 400); // Wait for survey modal close animation
      }
      
    } catch (err) {
      console.error("Error received", error)
      onClose();
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      
      if (neverShowAgain) {
        const userId = localStorage.getItem('user_id');

        // For testing api failure
        // throw new Error('Error connecting to api for submit survey');
        
        if (userId) {
          const response = await apiFetch('/api/survey/preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              never_show_again: true,
            }),
          }).catch((error) => {
            const parsedError = JSON.parse(error.message);
            console.error('Failed to store user preference', parsedError);
            return;
          });
        }
      }
      
      onClose();
    } catch (err) {
      console.error("Error in skip the survey form")
      onClose()
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || hasFatalError) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl h-[95vh] flex flex-col bg-white rounded-xl shadow-2xl m-2"
        // className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Help Us Improve HR Houdini
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Your feedback helps us make HR Houdini better for everyone
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading survey...</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                index={index}
                answer={answers[question.id]}
                onChange={(value, text) => handleAnswerChange(question.id, value, text)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Don't show this again
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}