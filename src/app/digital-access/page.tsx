import { dataService } from "@/services/dataService";
import { getAccessMetrics, getInfrastructureMetrics, calculateDigitalAccessIndex } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import IndexMethodologyPanel from "@/components/ui/IndexMethodologyPanel";
import { Wifi } from "lucide-react";

export default async function DigitalAccessPage() {
  const data = await dataService.fetchData();
  const metrics = getAccessMetrics(data);
  const infraMetrics = getInfrastructureMetrics(data);
  const accessScore = Math.round(calculateDigitalAccessIndex(data));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Digital Access & Infrastructure</h1>
          <p className="text-slate-500 mt-2">
            Visualization of device ownership, internet reliability, and power infrastructure.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-center bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm">
          <div className="flex items-center text-slate-500 mb-1">
            <Wifi className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wider">Digital Access Index</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#0F172A]">{accessScore}</span>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-2">
        <div className="p-6">
          <IndexMethodologyPanel methodologyKey="digitalAccess" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Device Ownership (%)</h2>
          <div className="flex-1">
            <BarChartWrapper data={metrics.deviceAccess} xDataKey="name" yDataKey="percentage" fill="#0F172A" />
          </div>
          <DataSourceTag questionNumbers={[6, 7, 8, 9]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Internet Reliability</h2>
          <div className="flex-1">
            <PieChartWrapper data={metrics.internetReliability} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[10]} />
        </div>
        
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Internet Access Location</h2>
          <div className="flex-1">
            <BarChartWrapper data={infraMetrics.internetLocation} xDataKey="name" yDataKey="value" fill="#FD6925" />
          </div>
          <DataSourceTag questionNumbers={[11]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Monthly Data Cost</h2>
          <div className="flex-1">
            <PieChartWrapper data={infraMetrics.dataCost} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[15]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Electricity Reliability</h2>
          <div className="flex-1">
            <PieChartWrapper data={infraMetrics.electricityReliability} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[12]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Primary Power Source</h2>
          <div className="flex-1">
            <BarChartWrapper data={infraMetrics.powerSource} xDataKey="name" yDataKey="value" fill="#14B8A6" />
          </div>
          <DataSourceTag questionNumbers={[13]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Electricity Impact on Device Usage</h2>
          <div className="h-72">
            <BarChartWrapper data={infraMetrics.electricityImpact} xDataKey="name" yDataKey="value" fill="#8F1838" />
          </div>
          <DataSourceTag questionNumbers={[14]} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm mt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Access Summary</h2>
        <p className="text-slate-600 leading-relaxed">
          Smartphone ownership is significantly higher than laptop or desktop ownership, indicating a mobile-first digital experience for most respondents. Reliable internet access and consistent electricity remain major challenges, which directly impacts the ability to participate in remote work or online technical training programs.
        </p>
      </div>

      <AIInsights data={data} pageName="Digital Access" />
    </div>
  );
}
