"use client";

import { useData } from "@/contexts/DataContext";
import { getCareerAwarenessMetrics } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { Briefcase, AlertCircle, GraduationCap } from "lucide-react";

export default function CareerAwarenessPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Awareness</h1>
          <p className="text-slate-500 mt-2">Interest in remote work, freelancing, and global digital economy opportunities.</p>
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

  const total = data.length || 1;

  const awarenessData = [
    { name: 'Software Eng', percentage: Math.round((data.filter(d => d.awareSoftwareEngineering).length / total) * 100) },
    { name: 'Data Science', percentage: Math.round((data.filter(d => d.awareDataScience).length / total) * 100) },
    { name: 'AI', percentage: Math.round((data.filter(d => d.awareAI).length / total) * 100) },
    { name: 'Cybersecurity', percentage: Math.round((data.filter(d => d.awareCybersecurity).length / total) * 100) },
    { name: 'UI/UX Design', percentage: Math.round((data.filter(d => d.awareUIUX).length / total) * 100) },
    { name: 'Cloud Computing', percentage: Math.round((data.filter(d => d.awareCloudComputing).length / total) * 100) },
    { name: 'Digital Marketing', percentage: Math.round((data.filter(d => d.awareDigitalMarketing).length / total) * 100) },
  ].sort((a, b) => b.percentage - a.percentage);

  const numCareersDist = data.reduce((acc, curr) => {
    const count = curr.techCareersKnown?.length || 0;
    const bucket = count === 0 ? '0' : count <= 2 ? '1-2' : count <= 4 ? '3-4' : '5+';
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const interestDist = data.reduce((acc, curr) => {
    if (curr.careerInterest) acc[curr.careerInterest] = (acc[curr.careerInterest] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const awarenessScore = analytics.careerAwarenessScore;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Awareness</h1>
          <p className="text-slate-500 mt-2">
            Analysis of respondent knowledge regarding modern tech careers and their interest in pursuing them.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Career Awareness Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-emerald-700">{awarenessScore}</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="careerAwareness" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Career Path Awareness (%)</h2>
          <div className="h-80">
            <BarChartWrapper data={awarenessData} xDataKey="name" yDataKey="percentage" fill="#FD6925" />
          </div>
          <DataSourceTag questionNumbers={[23]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Number of Tech Careers Identified</h2>
          <div className="flex-1">
            <BarChartWrapper 
              data={Object.entries(numCareersDist).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name))} 
              xDataKey="name" 
              yDataKey="value" 
              fill="#0F172A" 
            />
          </div>
          <DataSourceTag questionNumbers={[23]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Interest in Tech Career</h2>
          <div className="flex-1">
            <PieChartWrapper 
              data={Object.entries(interestDist).map(([name, value]) => ({ name, value }))} 
              nameKey="name" 
              dataKey="value" 
            />
          </div>
          <DataSourceTag questionNumbers={[24]} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Insight</h2>
        <p className="text-slate-600 leading-relaxed">
          While general interest in technology is high, awareness of specific career trajectories like Cloud Computing or specialized Data Science roles often lags behind more visible fields like Digital Marketing or Software Engineering. Bridging this awareness gap is a critical first step towards structured skills training.
        </p>
      </div>

      <AIInsights data={data} pageName="Career Awareness" />
    </div>
  );
}
