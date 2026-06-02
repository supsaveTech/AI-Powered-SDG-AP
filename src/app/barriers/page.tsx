import { dataService } from "@/services/dataService";
import { generateBarrierRanking } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function BarriersPage() {
  const data = await dataService.fetchData();
  const rankings = generateBarrierRanking(data);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Barriers to Learning</h1>
        <p className="text-slate-500 mt-2">
          Severity ranking of obstacles preventing youth from acquiring digital skills (Scale 1–5).
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Barrier Severity Ranking</h2>
        <BarChartWrapper data={rankings} xDataKey="name" yDataKey="score" fill="#8F1838" height={400} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8F1838]/10 text-[#8F1838] text-xs">1</span>
            Primary Obstacle: {rankings[0]?.name || 'Cost'}
          </h3>
          <p className="text-sm text-slate-600">
            {rankings[0]?.name} consistently ranks as the most severe barrier. This suggests that interventions must focus on subsidizing access to devices, internet, or training programs to be effective.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A]/10 text-[#0F172A] text-xs">2</span>
            Secondary Obstacle: {rankings[1]?.name || 'Device Access'}
          </h3>
          <p className="text-sm text-slate-600">
            Without reliable {rankings[1]?.name?.toLowerCase()}, theoretical knowledge cannot be put into practice. Establishing community tech hubs could mitigate this issue.
          </p>
        </div>
      </div>

      <AIInsights data={data} pageName="Barriers" />
    </div>
  );
}
