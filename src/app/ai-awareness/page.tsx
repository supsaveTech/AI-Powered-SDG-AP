import { dataService } from "@/services/dataService";
import { getAIAwarenessMetrics, calculateAIReadinessIndex } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { BrainCircuit } from "lucide-react";

export default async function AIAwarenessPage() {
  const data = await dataService.fetchData();
  const metrics = getAIAwarenessMetrics(data);
  const readinessScore = Math.round(calculateAIReadinessIndex(data));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Awareness & Adoption</h1>
          <p className="text-slate-500 mt-2">
            Analysis of Artificial Intelligence usage, preferred tools, and use cases among youth.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <BrainCircuit className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">AI Readiness Index</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#8F1838]">{readinessScore}</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="aiReadiness" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">AI Adoption Rate</h2>
          <div className="relative inline-flex items-center justify-center my-4">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={`${metrics.aiAdoptionRate * 4.52} 452`} className="text-[#8F1838]" />
            </svg>
            <span className="absolute text-4xl font-bold text-[#8F1838]">{metrics.aiAdoptionRate}%</span>
          </div>
          <p className="text-slate-500 text-sm mb-4">Percentage of respondents who have used an AI tool.</p>
          <div className="mt-auto w-full">
            <DataSourceTag questionNumbers={[19]} />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">AI Usage Frequency</h2>
          <div className="flex-1">
            <PieChartWrapper data={metrics.usageFrequency} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[21]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top AI Tools Used</h2>
          <div className="h-72">
            <BarChartWrapper data={metrics.topTools} xDataKey="name" yDataKey="value" fill="#0F172A" />
          </div>
          <DataSourceTag questionNumbers={[20]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Primary AI Use Cases</h2>
          <div className="h-72">
            <BarChartWrapper data={metrics.topUseCases} xDataKey="name" yDataKey="value" fill="#FD6925" />
          </div>
          <DataSourceTag questionNumbers={[22]} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm mt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">AI Adoption Summary</h2>
        <p className="text-slate-600 leading-relaxed">
          The data reveals that {metrics.aiAdoptionRate}% of youth have engaged with Artificial Intelligence tools. While general awareness is growing, the frequency of usage and specific application areas highlight an opportunity to integrate AI literacy into existing digital skills training programs, preparing youth for the future of work.
        </p>
      </div>

      <AIInsights data={data} pageName="AI Awareness" />
    </div>
  );
}
