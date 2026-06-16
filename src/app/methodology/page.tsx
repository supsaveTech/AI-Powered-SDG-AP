"use client";

import { useData } from "@/contexts/DataContext";
import { AlertCircle } from "lucide-react";
import { AIInsights } from "@/components/ai/AIInsights";

export default function MethodologyPage() {
  const { data, isInitializing } = useData();

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Methodology</h1>
          <p className="text-slate-500 mt-2">How we collect, analyze, and interpret digital skills data.</p>
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Methodology</h1>
        <p className="text-slate-500 mt-2">
          Data collection strategy, index calculations, and platform architecture.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Data Collection & Integration</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              Data was collected via online and offline survey instruments distributed across Port Harcourt.
            </p>
            <p>
              <strong>Data Integration Priority Strategy:</strong>
              <br />
              1. <em>Google Sheets API:</em> Direct real-time sync with live forms.
              <br />
              2. <em>Published CSV URL:</em> Fallback to public web-published CSV.
              <br />
              3. <em>Uploaded CSV:</em> Local cached data ingested via the Admin panel.
              <br />
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Sampling Strategy</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              A randomized, mixed-methods sampling approach was employed targeting youth and educators across different geographic locations in Port Harcourt (urban vs. peri-urban).
            </p>
            <p>
              Current Active Sample Size: <strong>{data.length}</strong> respondents.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Index Calculations</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-2">AI Readiness Index</h3>
            <p>Evaluates awareness, usage frequency, and diversity of AI tools used. Max score: 100.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-2">Digital Access Index</h3>
            <p>Calculates baseline infrastructure readiness combining device ownership, internet reliability, and electricity access. Max score: 100.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-2">Digital Skills Readiness Score</h3>
            <p>A weighted composite of self-reported skill levels, coding experience, and breadth of digital skills possessed. Max score: 100.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-bold text-slate-900 mb-2">Employment Readiness Index</h3>
            <p>Measures alignment of aspirations and desired skills with modern, flexible job markets (remote/hybrid). Max score: 100.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg md:col-span-2">
            <h3 className="font-bold text-slate-900 mb-2">Traceability</h3>
            <p>Every KPI, index, and chart on this platform traces directly back to a specific survey question (Q1–Q30), ensuring complete data transparency.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border p-6 shadow-sm border-l-4 border-l-[#FD6925]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">AI-Augmented Analysis Framework</h2>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>
            Traditional descriptive statistics are augmented using advanced Generative AI capabilities via RAG (Retrieval-Augmented Generation). The dataset is ingested, aggregated into a localized context, and mapped against the United Nations Sustainable Development Goals (SDGs 8 and 9).
          </p>
          <p>
            This hybrid approach provides real-time, context-aware insights, strategic recommendations, and interactive chatbot functionality without requiring constant manual data interpretation.
          </p>
        </div>
      </div>

      <AIInsights data={data} pageName="Methodology" />
    </div>
  );
}
