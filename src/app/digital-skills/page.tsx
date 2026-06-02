import { dataService } from "@/services/dataService";
import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { calculateDigitalSkillsReadiness, calculateAverage } from "@/utils/dataAggregation";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function DigitalSkillsPage() {
  const data = await dataService.fetchData();

  const skillsData = [
    { name: 'Word', score: calculateAverage(data.map(d => d.skillMicrosoftWord)) },
    { name: 'Excel', score: calculateAverage(data.map(d => d.skillExcel)) },
    { name: 'Programming', score: calculateAverage(data.map(d => d.skillProgramming)) },
    { name: 'Design', score: calculateAverage(data.map(d => d.skillGraphicDesign)) },
    { name: 'Marketing', score: calculateAverage(data.map(d => d.skillDigitalMarketing)) },
    { name: 'AI Tools', score: calculateAverage(data.map(d => d.skillAITools)) },
    { name: 'Data Analysis', score: calculateAverage(data.map(d => d.skillDataAnalysis)) },
    { name: 'Video Editing', score: calculateAverage(data.map(d => d.skillVideoEditing)) },
  ].sort((a, b) => b.score - a.score);

  const readinessScore = Math.round(calculateDigitalSkillsReadiness(data));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Digital Skills</h1>
        <p className="text-slate-500 mt-2">
          Self-reported proficiency across various digital tools and domains (Scale 1–5).
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-xl border p-6 shadow-sm md:col-span-1 flex flex-col justify-center items-center text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Readiness Score</h2>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={`${readinessScore * 3.51} 351`} className="text-[#0F172A]" />
            </svg>
            <span className="absolute text-3xl font-bold text-[#0F172A]">{readinessScore}</span>
          </div>
          <p className="text-slate-500 text-sm mt-4">Composite score representing general digital preparedness.</p>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Average Skill Proficiency</h2>
          <BarChartWrapper data={skillsData} xDataKey="name" yDataKey="score" fill="#8F1838" />
        </div>
      </div>

      <AIInsights data={data} pageName="Digital Skills" />
    </div>
  );
}
