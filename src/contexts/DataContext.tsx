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
  topBarrierScore: number;
  smartphonePct: number;
  laptopPct: number;
  tabletPct: number;
  desktopPct: number;
  goodInternetPct: number;
  topPowerSource: string;
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
    const careerAwarenessScore = Math.round(calculateCareerAwarenessScore(dataset));
    const employmentReadinessIndex = Math.round(calculateEmploymentReadiness(dataset));
    const aiReadinessIndex = Math.round(calculateAIReadinessIndex(dataset));
    const digitalAccessIndex = Math.round(calculateDigitalAccessIndex(dataset));
    const barrierMetrics = getBarrierMetrics(dataset);
    const topBarrier = barrierMetrics.length > 0 ? barrierMetrics[0].name : 'Unknown';
    const topBarrierScore = barrierMetrics.length > 0 ? barrierMetrics[0].score : 0;

    const smartphonePct = Math.round((dataset.filter(d => d.ownsSmartphone).length / totalRespondents) * 100);
    const laptopPct = Math.round((dataset.filter(d => d.ownsLaptop).length / totalRespondents) * 100);
    const tabletPct = Math.round((dataset.filter(d => d.hasTabletAccess).length / totalRespondents) * 100);
    const desktopPct = Math.round((dataset.filter(d => d.hasDesktopAccess).length / totalRespondents) * 100);

    const goodInternetCount = dataset.filter(d => {
      const rel = String(d.electricityReliability || '').toLowerCase();
      return rel.includes('good') || rel.includes('excellent');
    }).length;
    const goodInternetPct = Math.round((goodInternetCount / totalRespondents) * 100);
    
    // Determine top power source
    const powerSources = dataset.reduce((acc, curr) => {
      const ps = curr.powerSource || 'Unknown';
      acc[ps] = (acc[ps] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topPowerSource = Object.entries(powerSources).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return {
      totalRespondents,
      communitiesReached,
      aiAdoptionRate,
      remoteWorkInterest,
      digitalAccessIndex,
      digitalSkillsReadiness: digitalSkillsScore,
      aiReadinessIndex,
      careerAwarenessScore,
      employmentReadinessIndex,
      topBarrier,
      topBarrierScore,
      smartphonePct,
      laptopPct,
      tabletPct,
      desktopPct,
      goodInternetPct,
      topPowerSource
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
