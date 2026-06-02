import { dataService } from "@/services/dataService";
import { getDemographics } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function DemographicsPage() {
  const data = await dataService.fetchData();
  const demographics = getDemographics(data);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Demographics</h1>
        <p className="text-slate-500 mt-2">
          Breakdown of survey respondents by age, gender, education, and location.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Age Distribution</h2>
          <BarChartWrapper data={demographics.age} xDataKey="name" yDataKey="value" fill="#0F172A" />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Gender Distribution</h2>
          <PieChartWrapper data={demographics.gender} nameKey="name" dataKey="value" />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Education Level</h2>
          <BarChartWrapper data={demographics.education} xDataKey="name" yDataKey="value" fill="#8F1838" />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Location Distribution (Top 5)</h2>
          <BarChartWrapper data={demographics.location.slice(0, 5)} xDataKey="name" yDataKey="value" fill="#FD6925" />
        </div>
      </div>

      <AIInsights data={data} pageName="Demographics" />
    </div>
  );
}
