import { dataService } from "@/services/dataService";
import { getDemographics } from "@/utils/dataAggregation";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";
import DataSourceTag from "@/components/ui/DataSourceTag";
import { MapPin } from "lucide-react";

export default async function DemographicsPage() {
  const data = await dataService.fetchData();
  const demographics = getDemographics(data);
  const communitiesReached = demographics.location.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Demographics</h1>
        <p className="text-slate-500 mt-2">
          Breakdown of survey respondents by age, gender, education, and location.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Age Distribution</h2>
          <div className="flex-1">
            <BarChartWrapper data={demographics.age} xDataKey="name" yDataKey="value" fill="#0F172A" />
          </div>
          <DataSourceTag questionNumbers={[1]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Gender Distribution</h2>
          <div className="flex-1">
            <PieChartWrapper data={demographics.gender} nameKey="name" dataKey="value" />
          </div>
          <DataSourceTag questionNumbers={[2]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Education Level</h2>
          <div className="flex-1">
            <BarChartWrapper data={demographics.education} xDataKey="name" yDataKey="value" fill="#8F1838" />
          </div>
          <DataSourceTag questionNumbers={[4]} />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Current Status</h2>
          <div className="flex-1">
            <BarChartWrapper data={demographics.currentStatus} xDataKey="name" yDataKey="value" fill="#14B8A6" />
          </div>
          <DataSourceTag questionNumbers={[5]} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Community Reach Analysis</h2>
            <p className="text-slate-500 text-sm mt-1">Geographic distribution of respondents across Port Harcourt.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-orange-50 border border-orange-100 px-4 py-2 rounded-lg">
            <MapPin className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Communities Reached</p>
              <p className="text-2xl font-bold text-orange-700 leading-none">{communitiesReached}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-slate-700 mb-4">Top Communities Representation</h3>
            <div className="h-72">
              <BarChartWrapper data={demographics.location.slice(0, 8)} xDataKey="name" yDataKey="value" fill="#FD6925" />
            </div>
            <DataSourceTag questionNumbers={[3]} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-700 mb-4">Communities Ranking</h3>
            <div className="overflow-hidden border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Community</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Respondents</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {demographics.location.map((loc, idx) => (
                    <tr key={loc.name} className="hover:bg-slate-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">#{idx + 1}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{loc.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 text-right">{loc.value}</td>
                    </tr>
                  ))}
                  {demographics.location.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-sm text-slate-500">No community data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AIInsights data={data} pageName="Demographics" />
    </div>
  );
}
