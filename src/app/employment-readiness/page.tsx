"use client";

import { useData } from "@/contexts/DataContext";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { Briefcase, AlertCircle } from "lucide-react";

export default function EmploymentReadinessPage() {
  const { data, analytics, isInitializing } = useData();

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A]"></div>
      </div>
    );
  }

  if (!data || data.length === 0 || !analytics) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employment Readiness</h1>
          <p className="text-slate-500 mt-2">Preferences for remote work, specialized fields, and overall job market preparedness.</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Survey Data Available</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            The platform is not currently connected to a valid Google Sheets data source, and no CSV data has been uploaded. 
          </p>
          <a href="/admin" className="px-6 py-2 bg-[#0F172A] text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  const remoteWorkDist = data.reduce((acc, curr) => {
    if (curr.interestInRemoteWork) acc[curr.interestInRemoteWork] = (acc[curr.interestInRemoteWork] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const remoteWorkData = Object.entries(remoteWorkDist).map(([name, value]) => ({ name, value }));

  const workTypeDist = data.reduce((acc, curr) => {
    if (curr.preferredWorkType) acc[curr.preferredWorkType] = (acc[curr.preferredWorkType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const workTypeData = Object.entries(workTypeDist).map(([name, value]) => ({ name, value }));

  const techFieldDist = data.reduce((acc, curr) => {
    if (curr.preferredTechField) acc[curr.preferredTechField] = (acc[curr.preferredTechField] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const techFieldData = Object.entries(techFieldDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const topSkillsDist = data.reduce((acc, curr) => {
    (curr.desiredSkills || []).forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const topSkillsData = Object.entries(topSkillsDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const readinessScore = analytics.employmentReadinessIndex;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employment Readiness</h1>
          <p className="text-slate-500 mt-2">
            Interest in remote work, preferred work setups, and aspirations for the digital economy.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Employment Readiness Index</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-blue-700">{readinessScore}</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="employmentReadiness" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Interest in Remote Work</h2>
          <div className="flex-1">
            <PieChartWrapper data={remoteWorkData} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[27]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Preferred Work Setup</h2>
          <div className="flex-1">
            <PieChartWrapper data={workTypeData} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[26]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Most Preferred Tech Field</h2>
          <div className="h-72">
            <BarChartWrapper data={techFieldData} xDataKey="name" yDataKey="value" fill="#8F1838" />
          </div>
          <DataSourceTag questionNumbers={[25]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Desired Skills to Learn</h2>
          <div className="h-72">
            <BarChartWrapper data={topSkillsData} xDataKey="name" yDataKey="value" fill="#14B8A6" />
          </div>
          <DataSourceTag questionNumbers={[28]} />
        </div>
      </div>

      <AIInsights data={data} analytics={analytics} pageName="Employment Readiness" />
    </div>
  );
}
