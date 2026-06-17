"use client";

import { useData } from "@/contexts/DataContext";
import { AIInsights } from "@/components/ai/AIInsights";
import { AlertCircle } from "lucide-react";

export default function SchoolObservationPage() {
  const { data, analytics, isInitializing } = useData();

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F172A]"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case Study: Lift Up Child Education Centre</h1>
          <p className="text-slate-500 mt-2">Field observation and localized research insight.</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Survey Data Available</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            The platform is not currently connected to a valid Google Sheets data source.
          </p>
          <a href="/admin" className="px-6 py-2 bg-[#0F172A] text-white rounded-md font-medium hover:bg-slate-800 transition-colors">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case Study: Lift Up Child Education Centre</h1>
        <p className="text-slate-500 mt-2">Field observation and localized research insight.</p>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Location</h2>
            <p className="text-slate-600">Elelenwo, Port Harcourt</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Date</h2>
            <p className="text-slate-600">22 May 2026</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { value: "30%", label: "Used a Computer", color: "#0F172A" },
            { value: "20%", label: "Aware of AI Tools", color: "#FD6925" },
            { value: "10%", label: "Understand Programming", color: "#8F1838" },
            { value: "0%", label: "Considered Software Eng.", color: "#8F1838" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-lg p-6 text-center border border-slate-100">
              <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Interpretation &amp; Analysis</h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-3">
            <p>
              The field observation at the Lift Up Child Education Centre highlights a significant digital divide
              at the foundational education level. With only 30% of students having ever used a computer, the
              physical access barrier severely limits the development of digital skills.
            </p>
            <p>
              The zero percent interest in Software Engineering correlates directly with the lack of exposure.
              Students cannot aspire to careers they do not understand or know exist.
            </p>
            <p className="font-medium text-slate-900">
              Key Takeaway: Interventions must start with basic computer literacy and career awareness seminars
              before introducing complex subjects like programming or AI.
            </p>
          </div>
        </div>
      </div>

      <AIInsights data={data} analytics={analytics} pageName="School Observation" />
    </div>
  );
}
