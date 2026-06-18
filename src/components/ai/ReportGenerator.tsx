"use client";

import { useState } from "react";
import { FileText, Download, X, Bot, AlertCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function ReportGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data, analytics } = useData();

  const handleGenerate = async () => {
    if (!data || data.length === 0) {
      setError("Reports cannot be generated because no survey dataset is currently loaded.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setReport(null);

    try {
      const notice = "IMPORTANT: Frame the insights as based on responses collected from youths in Port Harcourt.";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate a comprehensive executive summary report covering all aspects of the digital skills survey: demographics, access, skills, barriers, and SDG alignment. Format it clearly with headings and bullet points. IMPORTANT: Include markdown tables that explicitly map your key findings and metrics back to the specific survey question numbers (e.g., Q11, Q23) that generated them. ${notice}` }],
          data,
          analytics,
          isReportGeneration: true
        }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const dataResponse = await response.json();
      setReport(dataResponse.content);
    } catch (error) {
      console.error(error);
      setReport("Failed to generate report. Please try again or check API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsExporting(true);
      console.log("PDF Export Started");
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('pdf-report');
      console.log('PDF Element:', element);
      
      if (!element) {
        alert("PDF generation failed:\nTarget element 'pdf-report' was not found in the DOM.");
        setIsExporting(false);
        return;
      }

      // DIAGNOSTIC SCANNER: Find any computed style containing lab, oklch, or color function
      console.log("--- STARTING COMPUTED STYLE SCAN ---");
      const elementsToScan = [element, ...Array.from(element.querySelectorAll('*'))];
      const colorProps = [
        'color', 'backgroundColor', 'borderColor', 'borderTopColor', 
        'borderRightColor', 'borderBottomColor', 'borderLeftColor', 
        'outlineColor', 'textDecorationColor', 'columnRuleColor',
        'boxShadow', 'textShadow', 'fill', 'stroke'
      ];
      
      const offenders: Array<{el: Element, prop: string, val: string}> = [];
      
      elementsToScan.forEach(el => {
        const computed = window.getComputedStyle(el);
        colorProps.forEach(prop => {
          const val = computed.getPropertyValue(prop) || computed[prop as any];
          if (val && (val.includes('lab(') || val.includes('oklch(') || val.includes('color('))) {
            console.error(`FOUND OFFENDING COLOR! Element:`, el, `Property:`, prop, `Value:`, val);
            offenders.push({ el, prop, val });
          }
        });
      });
      console.log("--- END COMPUTED STYLE SCAN ---", "Total Offenders:", offenders.length);
      
      if (offenders.length > 0) {
        const details = offenders.map(o => `${o.el.tagName}.${o.el.className} -> ${o.prop}: ${o.val}`).join('\n');
        alert(`Found ${offenders.length} unsupported color(s):\n${details}`);
        // Optionally halt here, or let html2canvas crash to confirm it's the exact same issue.
        // Halting here avoids the freeze if the freeze is caused by html2canvas internal DOM mutations.
        throw new Error(`Diagnostic aborted export. Found unsupported colors: \n${details}`);
      }


      
      const opt: any = {
        margin: 15,
        filename: 'Digital-Skills-For-Decent-Work.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
      };
      
      await html2pdf().set(opt).from(element).save();
      console.log("PDF Export Success");
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert(
        `PDF generation failed:\n${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition font-medium"
      >
        <FileText size={18} className="text-[#8F1838]" />
        Generate AI Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Report Generator</h2>
                  <p className="text-sm text-slate-500">Export comprehensive analytics</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {(!data || data.length === 0) ? (
                <div className="p-6">
                  <div className="bg-white/80 rounded-lg p-6 border border-amber-200 text-center flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">
                      Reports cannot be generated because no survey dataset is currently loaded.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {!report && !isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                        <FileText size={40} className="text-slate-400" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Generate</h3>
                        <p className="text-slate-500 mb-6">
                          The AI will analyze the full dataset and generate a comprehensive executive summary aligned with SDG 8 &amp; 9.
                        </p>
                        <button
                          onClick={handleGenerate}
                          className="px-6 py-3 bg-[#0F172A] text-white rounded-lg shadow-sm hover:bg-[#0F172A]/90 transition font-medium w-full"
                        >
                          Generate Report
                        </button>
                      </div>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#FD6925] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-[#FD6925] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-[#FD6925] rounded-full animate-bounce"></div>
                      </div>
                      <p className="text-slate-500 font-medium animate-pulse">Analyzing survey data and generating insights...</p>
                    </div>
                  )}

                  {report && (
                    <div id="pdf-report" className="bg-white p-8 font-sans">
                      <div className="mb-8 border-b border-[#E2E8F0] pb-4">
                        <h1 className="text-3xl font-bold text-[#0F172A]">Executive Summary: Digital Skills for Decent Work</h1>
                        <p className="text-[#64748B] mt-2">Generated by AI Data Analyst • {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="whitespace-pre-wrap text-[#334155] leading-relaxed text-base">
                        {report.split(/(?=###? )/).map((section, idx) => (
                          <div key={idx} className="report-section mb-6" style={{ pageBreakInside: 'avoid' }}>
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {report && (
              <div className="p-6 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-4">
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-medium"
                >
                  Regenerate
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isExporting}
                  className={`px-4 py-2 text-white rounded-lg shadow-sm transition font-medium flex items-center justify-center gap-2 min-w-[160px] ${isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#8F1838] hover:bg-[#8F1838]/90'}`}
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
