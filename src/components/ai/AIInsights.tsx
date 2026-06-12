import { generatePageInsights, AIInsightSet } from "@/services/aiService";
import { buildPageContext } from "@/utils/ragContextBuilder";
import { SurveyResponse } from "@/types";
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Target, 
  Bot
} from "lucide-react";

interface AIInsightsProps {
  data: SurveyResponse[];
  pageName: string;
}

export async function AIInsights({ data, pageName }: AIInsightsProps) {
  const ragContext = buildPageContext(data, pageName);
  const insights: AIInsightSet = await generatePageInsights(pageName, ragContext);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-900 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">AI Insights Engine</h2>
          <p className="text-xs text-slate-400">Powered by survey data · {pageName} analysis</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/30">
            ● Live
          </span>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* Key Findings */}
        <div className="border-b border-r-0 md:border-r border-slate-200 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F172A]/10">
              <Lightbulb className="h-3.5 w-3.5 text-[#0F172A]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Key Findings</h3>
          </div>
          <ul className="space-y-3">
            {insights.keyFindings.map((finding, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {/* Trend Analysis */}
        <div className="border-b border-slate-200 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FD6925]/10">
              <TrendingUp className="h-3.5 w-3.5 text-[#FD6925]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Trend Analysis</h3>
          </div>
          <ul className="space-y-3">
            {insights.trendAnalysis.map((trend, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FD6925]" />
                {trend}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="border-b border-r-0 md:border-r md:border-b-0 border-slate-200 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8F1838]/10">
              <Zap className="h-3.5 w-3.5 text-[#8F1838]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Evidence-Based Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="mt-0.5 flex-shrink-0 text-[#8F1838]">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* SDG Mapping */}
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <Target className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">SDG Impact Mapping</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#8F1838] px-2 py-0.5 text-xs font-bold text-white">
                  SDG 8
                </span>
                <span className="text-xs text-slate-500">Decent Work &amp; Economic Growth</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {insights.sdgMapping.sdg8.map((item, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[#8F1838]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-[#FD6925] px-2 py-0.5 text-xs font-bold text-white">
                  SDG 9
                </span>
                <span className="text-xs text-slate-500">Industry, Innovation &amp; Infrastructure</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {insights.sdgMapping.sdg9.map((item, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[#FD6925]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
