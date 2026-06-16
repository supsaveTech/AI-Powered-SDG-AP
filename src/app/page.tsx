"use client";

import { ImpactCounters } from "@/components/dashboard/ImpactCounters";
import { useData } from "@/contexts/DataContext";
import { generateInsights } from "@/utils/insightEngine";
import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { ReportGenerator } from "@/components/ai/ReportGenerator";
import { AIInsights } from "@/components/ai/AIInsights";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { AlertCircle } from "lucide-react";


export default function OverviewPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Project Overview</h1>
          <p className="text-slate-500 mt-2">Mapping Youth Readiness and Digital Career Awareness in Port Harcourt.</p>
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

  const dynamicInsights = generateInsights(data);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Project Overview</h1>
          <p className="text-slate-500 mt-2">
            Mapping Youth Readiness and Digital Career Awareness in Port Harcourt.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ReportGenerator />
          <ExportReportButton data={data} />
        </div>
      </div>

      <ImpactCounters 
        totalRespondents={analytics.totalRespondents}
        communitiesReached={analytics.communitiesReached}
        aiAdoptionRate={analytics.aiAdoptionRate}
        remoteWorkInterest={analytics.remoteWorkInterest}
        sdgsSupported={2} // SDG 8 & 9
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Digital Access Index</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 mt-2">{analytics.digitalAccessIndex}<span className="text-sm font-normal text-slate-500">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#0F172A] h-full rounded-full" style={{ width: `${analytics.digitalAccessIndex}%` }}></div>
          </div>
          <div className="mt-auto pt-4">
            <IndexMethodologyPanel methodologyKey="digitalAccess" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Digital Skills Readiness</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 mt-2">{analytics.digitalSkillsReadiness}<span className="text-sm font-normal text-slate-500">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#FD6925] h-full rounded-full" style={{ width: `${analytics.digitalSkillsReadiness}%` }}></div>
          </div>
          <div className="mt-auto pt-4">
            <IndexMethodologyPanel methodologyKey="digitalSkills" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-2">AI Readiness Index</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 mt-2">{analytics.aiReadinessIndex}<span className="text-sm font-normal text-slate-500">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#8F1838] h-full rounded-full" style={{ width: `${analytics.aiReadinessIndex}%` }}></div>
          </div>
          <div className="mt-auto pt-4">
            <IndexMethodologyPanel methodologyKey="aiReadiness" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Career Awareness Score</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 mt-2">{analytics.careerAwarenessScore}<span className="text-sm font-normal text-slate-500">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-700 h-full rounded-full" style={{ width: `${analytics.careerAwarenessScore}%` }}></div>
          </div>
          <div className="mt-auto pt-4">
            <IndexMethodologyPanel methodologyKey="careerAwareness" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Employment Readiness</h3>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-slate-900 mt-2">{analytics.employmentReadinessIndex}<span className="text-sm font-normal text-slate-500">/100</span></div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-blue-700 h-full rounded-full" style={{ width: `${analytics.employmentReadinessIndex}%` }}></div>
          </div>
          <div className="mt-auto pt-4">
            <IndexMethodologyPanel methodologyKey="employmentReadiness" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm mt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Summary Insights</h2>
        <ul className="space-y-4 text-slate-600">
          {dynamicInsights.map((insight, index) => (
            <li key={index} className="flex gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-[#FD6925]' : 'bg-[#8F1838]'
              }`}></div>
              <p>{insight}</p>
            </li>
          ))}
          {dynamicInsights.length === 0 && (
            <p>Not enough data to generate insights.</p>
          )}
        </ul>
      </div>

      <AIInsights data={data} pageName="Overview" />
    </div>
  );
}
