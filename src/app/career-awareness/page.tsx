import { dataService } from "@/services/dataService";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function CareerAwarenessPage() {
  const data = await dataService.fetchData();
  const total = data.length || 1;

  const awarenessData = [
    { name: 'Software Eng', percentage: Math.round((data.filter(d => d.awareSoftwareEngineering).length / total) * 100) },
    { name: 'Data Science', percentage: Math.round((data.filter(d => d.awareDataScience).length / total) * 100) },
    { name: 'AI', percentage: Math.round((data.filter(d => d.awareAI).length / total) * 100) },
    { name: 'Cybersecurity', percentage: Math.round((data.filter(d => d.awareCybersecurity).length / total) * 100) },
    { name: 'UI/UX Design', percentage: Math.round((data.filter(d => d.awareUIUX).length / total) * 100) },
    { name: 'Cloud Computing', percentage: Math.round((data.filter(d => d.awareCloudComputing).length / total) * 100) },
    { name: 'Digital Marketing', percentage: Math.round((data.filter(d => d.awareDigitalMarketing).length / total) * 100) },
  ].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Awareness</h1>
        <p className="text-slate-500 mt-2">
          Percentage of respondents aware of specific technology career paths.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Career Path Awareness (%)</h2>
        <BarChartWrapper data={awarenessData} xDataKey="name" yDataKey="percentage" fill="#FD6925" height={400} />
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Insight</h2>
        <p className="text-slate-600 leading-relaxed">
          While general interest in technology is high, awareness of specific career trajectories like Cloud Computing or specialized Data Science roles often lags behind more visible fields like Digital Marketing or Software Engineering. Bridging this awareness gap is a critical first step towards structured skills training.
        </p>
      </div>

      <AIInsights data={data} pageName="Career Awareness" />
    </div>
  );
}
