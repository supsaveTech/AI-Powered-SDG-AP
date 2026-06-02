import { dataService } from "@/services/dataService";
import { getAccessMetrics } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function DigitalAccessPage() {
  const data = await dataService.fetchData();
  const metrics = getAccessMetrics(data);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Digital Access</h1>
        <p className="text-slate-500 mt-2">
          Visualization of device ownership and internet reliability among respondents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Device Ownership (%)</h2>
          <BarChartWrapper data={metrics.deviceAccess} xDataKey="name" yDataKey="percentage" fill="#0F172A" />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Internet Reliability</h2>
          <PieChartWrapper data={metrics.internetReliability} nameKey="name" dataKey="value" />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Access Summary</h2>
        <p className="text-slate-600 leading-relaxed">
          Smartphone ownership is significantly higher than laptop or desktop ownership, indicating a mobile-first digital experience for most respondents. Reliable internet access remains a challenge, which directly impacts the ability to participate in remote work or online technical training programs.
        </p>
      </div>

      <AIInsights data={data} pageName="Digital Access" />
    </div>
  );
}
