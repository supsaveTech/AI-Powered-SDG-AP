"use client";

import { Download } from "lucide-react";
import { exportToCsv } from "@/utils/exportUtils";
import { SurveyResponse } from "@/types";

export function ExportReportButton({ data }: { data: SurveyResponse[] }) {
  const handleExport = () => {
    exportToCsv(data, "digital_skills_report.csv");
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 h-9 px-4 py-2"
    >
      <Download className="h-4 w-4" />
      Export CSV Data
    </button>
  );
}
