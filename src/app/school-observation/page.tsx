import { dataService } from "@/services/dataService";
import { AIInsights } from "@/components/ai/AIInsights";

export default async function SchoolObservationPage() {
  const data = await dataService.fetchData();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Case Study: Lift Up Child Education Centre</h1>
        <p className="text-slate-500 mt-2">Field observation and localized research insight.</p>
      </div>

      <div className="bg-white rounded-xl border p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Location</h2>
            <p className="text-slate-600">Elelenwo, Port Harcourt</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Date</h2>
            <p className="text-slate-600">22 May 2026</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { value: "30%", label: "Used a Computer", color: "#0F172A" },
            { value: "20%", label: "Aware of AI Tools", color: "#FD6925" },
            { value: "10%", label: "Understand Programming", color: "#8F1838" },
            { value: "0%", label: "Considered Software Eng.", color: "#8F1838" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-lg p-6 text-center border border-slate-100">
              <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm font-medium text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Interpretation &amp; Analysis</h2>
          <div className="prose prose-slate max-w-none text-slate-600 space-y-3">
            <p>
              The field observation at the Lift Up Child Education Centre highlights a significant digital divide at the foundational education level. With only 30% of students having ever used a computer, the physical access barrier severely limits the development of digital skills.
            </p>
            <p>
              The zero percent interest in Software Engineering correlates directly with the lack of exposure. Students cannot aspire to careers they do not understand or know exist.
            </p>
            <p className="font-medium text-slate-900">
              Key Takeaway: Interventions must start with basic computer literacy and career awareness seminars before introducing complex subjects like programming or AI.
            </p>
          </div>
        </div>
      </div>

      <AIInsights data={data} pageName="School Observation" />
    </div>
  );
}
