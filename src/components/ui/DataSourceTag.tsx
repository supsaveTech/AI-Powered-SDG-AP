"use client";

import React, { useState } from 'react';
import { SURVEY_QUESTIONS } from '@/types/surveyQuestions';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface DataSourceTagProps {
  questionNumbers?: number[];
  className?: string;
}

export default function DataSourceTag({ questionNumbers, className = '' }: DataSourceTagProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!questionNumbers || questionNumbers.length === 0) {
    return null;
  }

  const sources = questionNumbers.map(num => SURVEY_QUESTIONS.find(q => q.questionNumber === num)).filter(Boolean);

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
      >
        <Info className="w-3 h-3" />
        <span>Source Data {sources.length > 1 ? `(${sources.length} Questions)` : `(Q${sources[0]?.questionNumber})`}</span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isExpanded && (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-700 space-y-1">
          {sources.map(source => (
            <div key={source!.questionNumber} className="flex space-x-2">
              <span className="font-semibold shrink-0">Q{source!.questionNumber}:</span>
              <span className="italic">&quot;{source!.questionText}&quot;</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
