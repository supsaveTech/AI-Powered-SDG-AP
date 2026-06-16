"use client";

import { useData } from "@/contexts/DataContext";
import { AIInsights } from "@/components/ai/AIInsights";
import { ReportGenerator } from "@/components/ai/ReportGenerator";
import { getBarrierMetrics, calculateDigitalSkillsReadiness } from "@/utils/dataAggregation";
import DataSourceTag from "@/components/ui/DataSourceTag";
import { Lightbulb, Target, AlertCircle } from "lucide-react";

export default function RecommendationsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategic Recommendations</h1>
          <p className="text-slate-500 mt-2">Data-driven actions for stakeholders, educators, and policymakers.</p>
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

  const barrierMetrics = getBarrierMetrics(data);
  const digitalSkillsScore = analytics.digitalSkillsReadiness;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategic Recommendations</h1>
        <p className="text-slate-500 mt-2">
          Actionable steps based on data insights for stakeholders, NGOs, and policymakers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Education",
            color: "#0F172A",
            icon: (
              <svg className="w-6 h-6" style={{ color: "#0F172A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            items: [
              "Integrate foundational digital literacy (typing, basic software) into the primary school curriculum.",
              "Conduct bi-monthly career awareness seminars introducing high-demand tech roles.",
              "Partner with local tech hubs to provide after-school coding clubs.",
            ],
          },
          {
            title: "Infrastructure",
            color: "#FD6925",
            icon: (
              <svg className="w-6 h-6" style={{ color: "#FD6925" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            ),
            items: [
              "Establish community-led computer labs in underserved areas like Elelenwo.",
              "Provide subsidized mobile data plans for educational purposes.",
              "Launch device donation drives to recycle corporate laptops for student use.",
            ],
          },
          {
            title: "Employment",
            color: "#8F1838",
            icon: (
              <svg className="w-6 h-6" style={{ color: "#8F1838" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            items: [
              "Develop targeted training programs focusing on remote-work-compatible skills.",
              "Create mentorship networks pairing youth with established tech professionals.",
              "Organize localized job fairs and hackathons to connect talent with local startups.",
            ],
          },
        ].map((section) => (
          <div key={section.title} className="bg-white rounded-xl border p-6 shadow-sm" style={{ borderTopColor: section.color, borderTopWidth: 4 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-100 p-2 rounded-lg">{section.icon}</div>
              <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 list-disc pl-5">
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <DataSourceTag questionNumbers={[30, 31]} />
      </div>

      <AIInsights data={data} pageName="Recommendations" />
    </div>
  );
}
