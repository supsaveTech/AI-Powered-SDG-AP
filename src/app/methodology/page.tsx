import { dataService } from "@/services/dataService";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function MethodologyPage() {
  const data = await dataService.fetchData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Methodology</h1>
        <p className="text-slate-500 mt-2">
          Data collection strategy, sampling methods, and analytical framework.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Data Collection</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              Data was collected via online surveys distributed through local schools, community centers, and youth organizations across multiple states.
            </p>
            <p>
              The survey instruments were designed to capture a broad spectrum of digital engagement metrics, including device access, internet reliability, career awareness, and self-reported skill levels.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Sampling Strategy</h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              A stratified random sampling approach was employed to ensure representation across different age groups, genders, and geographic locations (urban vs. rural).
            </p>
            <p>
              Sample Size: <strong>{data.length}</strong> respondents.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border p-6 shadow-sm border-l-4 border-l-[#FD6925]">
        <h2 className="text-xl font-bold text-slate-900 mb-4">AI-Augmented Analysis Framework</h2>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p>
            Traditional descriptive statistics are augmented using advanced Generative AI capabilities. The dataset is ingested, aggregated, and mapped against the United Nations Sustainable Development Goals (SDGs).
          </p>
          <p>
            By leveraging Large Language Models (LLMs) with a robust heuristic fallback engine, this dashboard provides real-time, context-aware insights, strategic recommendations, and interactive chatbot functionality without requiring constant manual data interpretation.
          </p>
        </div>
      </div>

      <AIInsights data={data} pageName="Methodology" />
    </div>
  );
}
