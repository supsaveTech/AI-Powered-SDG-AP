"use client";

import { useData } from "@/contexts/DataContext";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { calculateAverage, calculateDigitalSkillsReadiness } from "@/utils/dataAggregation";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { Laptop, AlertCircle } from "lucide-react";

export default function DigitalSkillsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Digital Skills Readiness</h1>
          <p className="text-slate-500 mt-2">Evaluation of proficiency in word processing, spreadsheets, presentations, and email.</p>
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

  const skillsData = [
    { name: 'Word', score: calculateAverage(data.map(d => d.skillMicrosoftWord)) },
    { name: 'Excel', score: calculateAverage(data.map(d => d.skillExcel)) },
    { name: 'Programming', score: calculateAverage(data.map(d => d.skillProgramming)) },
    { name: 'Design', score: calculateAverage(data.map(d => d.skillGraphicDesign)) },
    { name: 'Marketing', score: calculateAverage(data.map(d => d.skillDigitalMarketing)) },
    { name: 'AI Tools', score: calculateAverage(data.map(d => d.skillAITools)) },
    { name: 'Data Analysis', score: calculateAverage(data.map(d => d.skillDataAnalysis)) },
    { name: 'Video Editing', score: calculateAverage(data.map(d => d.skillVideoEditing)) },
  ].sort((a, b) => b.score - a.score);

  // New specific fields: skillLevel, codingExperience, digitalSkillsPossessed
  const skillLevelDist = data.reduce((acc, curr) => {
    if (curr.skillLevel) acc[curr.skillLevel] = (acc[curr.skillLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const codingExpDist = data.reduce((acc, curr) => {
    if (curr.codingExperience) acc[curr.codingExperience] = (acc[curr.codingExperience] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const skillsPossessedDist = data.reduce((acc, curr) => {
    (curr.digitalSkillsPossessed || []).forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const readinessScore = Math.round(calculateDigitalSkillsReadiness(data));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Digital Skills Readiness</h1>
          <p className="text-slate-500 mt-2">
            Analysis of self-reported digital proficiencies, coding experience, and overall skill levels.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <Laptop className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Digital Skills Readiness Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#FD6925]">{readinessScore}</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="digitalSkills" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Self-Reported Skill Level</h2>
          <div className="flex-1">
            <BarChartWrapper 
              data={Object.entries(skillLevelDist).map(([name, value]) => ({ name, value }))} 
              xDataKey="name" 
              yDataKey="value" 
              fill="#0F172A" 
            />
          </div>
          <DataSourceTag questionNumbers={[17]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Coding Experience</h2>
          <div className="flex-1">
            <PieChartWrapper 
              data={Object.entries(codingExpDist).map(([name, value]) => ({ name, value }))} 
              nameKey="name" 
              dataKey="value" 
            />
          </div>
          <DataSourceTag questionNumbers={[18]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Specific Skills Possessed (Frequency)</h2>
          <div className="h-72">
            <BarChartWrapper 
              data={Object.entries(skillsPossessedDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)} 
              xDataKey="name" 
              yDataKey="value" 
              fill="#FD6925" 
            />
          </div>
          <DataSourceTag questionNumbers={[16]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Average Skill Proficiency (Scale 1-5)</h2>
          <div className="h-72">
            <BarChartWrapper data={skillsData} xDataKey="name" yDataKey="score" fill="#8F1838" />
          </div>
          <DataSourceTag questionNumbers={[16]} />
        </div>
      </div>

      <AIInsights data={data} pageName="Digital Skills" />
    </div>
  );
}
