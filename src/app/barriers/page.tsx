import { dataService } from "@/services/dataService";
import { calculateBarrierSeverity } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { AlertTriangle } from "lucide-react";

export default async function BarriersPage() {
  const data = await dataService.fetchData();

  const allBarriersDist = data.reduce((acc, curr) => {
    (curr.barriersToLearning || []).forEach(b => {
      acc[b] = (acc[b] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const allBarriersData = Object.entries(allBarriersDist).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const biggestBarrierDist = data.reduce((acc, curr) => {
    if (curr.biggestBarrier) acc[curr.biggestBarrier] = (acc[curr.biggestBarrier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const biggestBarrierData = Object.entries(biggestBarrierDist).map(([name, value]) => ({ name, value }));

  const rankings = calculateBarrierSeverity(data);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Barriers to Learning</h1>
          <p className="text-slate-500 mt-2">
            Analysis of obstacles preventing youth from acquiring digital skills.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Most Severe Barrier</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#8F1838]">{rankings[0]?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="barrierSeverity" />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Barrier Severity Ranking (Scale 0-5)</h2>
        <div className="h-80">
          <BarChartWrapper data={rankings} xDataKey="name" yDataKey="score" fill="#8F1838" />
        </div>
        <DataSourceTag questionNumbers={[28, 29]} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">General Barriers Identified (Frequency)</h2>
          <div className="flex-1">
            <BarChartWrapper data={allBarriersData} xDataKey="name" yDataKey="value" fill="#0F172A" />
          </div>
          <DataSourceTag questionNumbers={[28]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Biggest Single Barrier</h2>
          <div className="flex-1">
            <PieChartWrapper data={biggestBarrierData} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[29]} />
        </div>

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
