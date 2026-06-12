"use client";

import React, { useState } from 'react';
import { INDEX_METHODOLOGIES } from '@/utils/indexMethodology';
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react';

interface IndexMethodologyPanelProps {
  methodologyKey: string;
  className?: string;
}

export default function IndexMethodologyPanel({ methodologyKey, className = '' }: IndexMethodologyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const method = INDEX_METHODOLOGIES[methodologyKey];

  if (!method) {
    return null;
  }

  return (
    <div className={`mt-4 border-t border-slate-100 dark:border-slate-800 pt-3 ${className}`}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none w-full"
      >
        <Calculator className="w-4 h-4 mr-2" />
        <span className="font-medium">How This Score Is Calculated</span>
        <div className="ml-auto">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-slate-700 dark:text-slate-300 mb-2">{method.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400"><strong>Scale:</strong> {method.scale}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Contributing Indicators</h4>
            <ul className="space-y-2">
              {method.contributingIndicators.map((indicator, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                  <div className="text-slate-700 dark:text-slate-300">
                    <span className="font-medium">{indicator.label}</span>
                    <span className="text-xs text-slate-500 ml-2 block sm:inline">(Sources: Q{indicator.sourceQuestions.join(', Q')})</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 mt-1 sm:mt-0">{indicator.weight}%</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Formula</h4>
            <code className="block bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-300 overflow-x-auto">
              {method.formula}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
