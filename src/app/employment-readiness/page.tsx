import { dataService } from "@/services/dataService";
import { PieChartWrapper } from "@/components/charts/PieChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function EmploymentReadinessPage() {
  const data = await dataService.fetchData();

  const remoteWorkDist = data.reduce((acc, curr) => {
    acc[curr.interestInRemoteWork] = (acc[curr.interestInRemoteWork] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const remoteWorkData = Object.entries(remoteWorkDist).map(([name, value]) => ({ name, value }));

  const topSkills = data.flatMap(d => d.desiredSkills).reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employment Readiness</h1>
        <p className="text-slate-500 mt-2">
          Interest in remote work, desired skills, and overall readiness for the digital economy.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Interest in Remote Work</h2>
          <PieChartWrapper data={remoteWorkData} nameKey="name" dataKey="value" />
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Desired Skills to Learn</h2>
          <div className="space-y-4">
            {Object.entries(topSkills)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([skill, count], i) => (
                <div key={skill} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-700">{skill}</span>
                  </div>
                  <span className="text-sm text-slate-500">{count} interested</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <AIInsights data={data} pageName="Employment Readiness" />
    </div>
  );
}
