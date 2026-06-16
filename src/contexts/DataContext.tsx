"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SurveyResponse } from '@/types';
import { dataService, DataDiagnostics } from '@/services/dataService';
import {
  calculateDigitalSkillsReadiness,
  calculateCareerAwarenessScore,
  calculateEmploymentReadiness,
  calculateAIReadinessIndex,
  calculateDigitalAccessIndex,
  getAIAwarenessMetrics,
  getBarrierMetrics
} from '@/utils/dataAggregation';

export interface AnalyticsContextType {
  totalRespondents: number;
  communitiesReached: number;
  aiAdoptionRate: number;
  remoteWorkInterest: number;
  digitalAccessIndex: number;
  digitalSkillsReadiness: number;
  aiReadinessIndex: number;
  careerAwarenessScore: number;
  employmentReadinessIndex: number;
  topBarrier: string;
}

interface DataContextState {
  data: SurveyResponse[];
  analytics: AnalyticsContextType | null;
  diagnostics: DataDiagnostics | null;
  isInitializing: boolean;
  isSyncing: boolean;
  refreshData: (force?: boolean) => Promise<void>;
  uploadCsv: (csvContent: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SurveyResponse[]>([]);
  const [diagnostics, setDiagnostics] = useState<DataDiagnostics | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const computeAnalytics = (dataset: SurveyResponse[]): AnalyticsContextType | null => {
    if (dataset.length === 0) return null;

    const totalRespondents = dataset.length;
    const communitiesReached = new Set(dataset.map(d => d.location)).size;
    const aiAdoptionRate = getAIAwarenessMetrics(dataset).aiAdoptionRate;

    const remoteInterestCount = dataset.filter(d => {
      const interest = String(d.interestInRemoteWork).toLowerCase();
      return interest.includes('agree') || interest.includes('strongly agree') || interest.includes('yes');
    }).length;
    const remoteWorkInterest = Math.round((remoteInterestCount / (totalRespondents || 1)) * 100);

    const digitalSkillsScore = Math.round(calculateDigitalSkillsReadiness(dataset));
    const techInterestScore = Math.round(calculateCareerAwarenessScore(dataset));
    const employmentReadinessScore = Math.round(calculateEmploymentReadiness(dataset));
    const aiReadinessScore = Math.round(calculateAIReadinessIndex(dataset));
    const digitalAccessScore = Math.round(calculateDigitalAccessIndex(dataset));
    
    const barrierMetrics = getBarrierMetrics(dataset);
    const topBarrier = barrierMetrics.length > 0 ? barrierMetrics[0].name : "Unknown";

    return {
      totalRespondents,
      communitiesReached,
      aiAdoptionRate,
      remoteWorkInterest,
      digitalAccessIndex: digitalAccessScore,
      digitalSkillsReadiness: digitalSkillsScore,
      aiReadinessIndex: aiReadinessScore,
      careerAwarenessScore: techInterestScore,
      employmentReadinessIndex: employmentReadinessScore,
      topBarrier
    };
  };

  const refreshData = useCallback(async (force: boolean = false) => {
    setIsSyncing(true);
    try {
      const newData = await dataService.fetchData(force);
      setData(newData);
      setDiagnostics(dataService.getDiagnostics());
    } catch (e) {
      console.error("Failed to refresh data", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const uploadCsv = useCallback(async (csvContent: string): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const success = await dataService.uploadCsvData(csvContent);
      if (success) {
        const newData = await dataService.fetchData(); // Will get uploaded CSV since we just set it
        setData(newData);
      }
      setDiagnostics(dataService.getDiagnostics());
      return success;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial immediate restore from local storage/cache (fast render)
    dataService.fetchData(false).then(cachedData => {
      setData(cachedData);
      setDiagnostics(dataService.getDiagnostics());
      setIsInitializing(false);

      // 2. Silent background sync to check if newer data exists
      if (dataService.getDataStatus().syncStatus !== 'uploaded-csv') {
        refreshData(true);
      }
    });
  }, [refreshData]);

  const analytics = React.useMemo(() => computeAnalytics(data), [data]);

  return (
    <DataContext.Provider value={{
      data,
      analytics,
      diagnostics,
      isInitializing,
      isSyncing,
      refreshData,
      uploadCsv
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
