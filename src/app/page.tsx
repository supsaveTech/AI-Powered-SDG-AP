import { ImpactCounters } from "@/components/dashboard/ImpactCounters";
import { dataService } from "@/services/dataService";
import { 
  calculateDigitalSkillsReadiness, 
  calculateTechCareerInterest, 
  calculateEmploymentReadiness 
} from "@/utils/dataAggregation";
import { generateInsights } from "@/utils/insightEngine";
import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { ReportGenerator } from "@/components/ai/ReportGenerator";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function OverviewPage() {
  // Fetch data
  const data = await dataService.fetchData();

  // Calculate high-level KPIs
  const totalRespondents = data.length;
  const uniqueLocations = new Set(data.map(d => d.location)).size;
  
  // These would typically be from other datasets or metadata, we'll mock them relative to data length
  const schoolsEngaged = 12; 
  const awarenessSessions = 24;
  const projectDurationDays = 120;
  
  const digitalSkillsScore = Math.round(calculateDigitalSkillsReadiness(data));
  const techInterestScore = Math.round(calculateTechCareerInterest(data));
  const employmentReadinessScore = Math.round(calculateEmploymentReadiness(data));
  const dynamicInsights = generateInsights(data);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Project Overview</h1>
          <p className="text-slate-500 mt-2">
            Mapping Youth Readiness and Digital Career Awareness in Port Harcourt.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ReportGenerator />
          <ExportReportButton data={data} />
        </div>
      </div>

      <ImpactCounters
        totalRespondents={totalRespondents}
        communitiesReached={uniqueLocations}
        schoolsEngaged={schoolsEngaged}
        awarenessSessions={awarenessSessions}
        sdgsSupported={2} // SDG 8 & 9
        projectDurationDays={projectDurationDays}
      />

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Digital Skills Readiness</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0F172A]">{digitalSkillsScore}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#0F172A] h-full rounded-full" style={{ width: `${digitalSkillsScore}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Tech Career Interest</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#FD6925]">{techInterestScore}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#FD6925] h-full rounded-full" style={{ width: `${techInterestScore}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Employment Readiness</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#8F1838]">{employmentReadinessScore}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#8F1838] h-full rounded-full" style={{ width: `${employmentReadinessScore}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm mt-4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Summary Insights</h2>
        <ul className="space-y-4 text-slate-600">
          {dynamicInsights.map((insight, index) => (
            <li key={index} className="flex gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                index % 3 === 0 ? 'bg-primary' : index % 3 === 1 ? 'bg-[#FD6925]' : 'bg-[#8F1838]'
              }`}></div>
              <p>{insight}</p>
            </li>
          ))}
          {dynamicInsights.length === 0 && (
            <p>Not enough data to generate insights.</p>
          )}
        </ul>
      </div>

      <AIInsights data={data} pageName="Overview" />
    </div>
  );
}
