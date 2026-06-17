"use client";

import { useState, useEffect, useCallback } from "react";
import { getManualOverrides, setManualOverride, normalizeCommunityNameWithMethod } from "@/utils/communityNormalizer";
import { ResponsesOverTimeChart } from "@/components/dashboard/ResponsesOverTimeChart";
import { getResponseGrowthTimeSeries } from "@/utils/dataAggregation";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, LogOut, BarChart2, Database } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { data, diagnostics, analytics, refreshData, uploadCsv, isSyncing } = useData();
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [rawName, setRawName] = useState("");
  const [canonicalName, setCanonicalName] = useState("");
  const [showRawResponse, setShowRawResponse] = useState(false);

  const loadOverrides = useCallback(() => {
    setOverrides(getManualOverrides());
  }, []);

  useEffect(() => {
    // Check auth persistence
    const authFlag = localStorage.getItem("admin_authenticated");
    if (authFlag === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadOverrides();
    }
  }, [isAuthenticated, loadOverrides]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "sdg2026") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_authenticated", "true");
      refreshData();
    } else {
      alert("Invalid password");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_authenticated");
    setPassword("");
  };

  const handleRefreshData = async () => {
    await refreshData(true);
    alert("Data fetch triggered and globally synced.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const success = await uploadCsv(csv);
      if (success) {
        alert("CSV uploaded, processed, and globally synced successfully.");
      } else {
        alert("Failed to process CSV.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawName.trim() && canonicalName.trim()) {
      setManualOverride(rawName, canonicalName);
      setOverrides(getManualOverrides());
      setRawName("");
      setCanonicalName("");
    }
  };

  // Compute diagnostics
  const totalRespondents = data.length;
  const smartphoneCount = data.filter(d => d.ownsSmartphone).length;
  const laptopCount = data.filter(d => d.ownsLaptop).length;
  const tabletCount = data.filter(d => d.hasTabletAccess).length;
  const desktopCount = data.filter(d => d.hasDesktopAccess).length;
  const aiUsageCount = data.filter(d => d.hasUsedAI).length;
  const careerInterestCount = data.filter(d => {
    const interest = String(d.careerInterest).toLowerCase();
    return interest.includes('strongly agree') || interest.includes('very interested') || interest.includes('yes') || interest.includes('agree') || interest.includes('interested');
  }).length;
  const remoteWorkInterestCount = data.filter(d => {
    const interest = String(d.interestInRemoteWork).toLowerCase();
    return interest.includes('agree') || interest.includes('strongly agree') || interest.includes('yes');
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md border w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
                placeholder="Enter password"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#0F172A] text-white rounded-md py-2 font-medium hover:bg-slate-800 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 mt-2">Manage data pipelines, view diagnostics, and system status.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DIAGNOSTICS LAYER */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Google Sheets Diagnostics</h2>
          
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Environment Variables</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="font-mono text-slate-600 truncate mr-2">NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY</span>
              {diagnostics?.envApiKey ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-mono text-slate-600 truncate mr-2">..._SPREADSHEET_ID</span>
              {diagnostics?.envSheetId ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-mono text-slate-600 truncate mr-2">NEXT_PUBLIC_GOOGLE_SHEETS_CSV_URL</span>
              {diagnostics?.envCsvUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
          </div>

          <div className="space-y-3 mb-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Data Source Inspector</h3>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">Current Source</span>
              <span className="font-medium">{diagnostics?.source || 'None'}</span>
            </div>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">Spreadsheet ID</span>
              <span className="font-mono text-xs">{diagnostics?.spreadsheetId ? `${diagnostics.spreadsheetId.substring(0, 8)}...` : 'N/A'}</span>
            </div>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">Range Requested</span>
              <span className="font-mono text-xs">{diagnostics?.requestedRange || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-start gap-4 text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 whitespace-nowrap">Last Request URL</span>
              <span className="font-mono text-xs break-all text-right">{diagnostics?.requestUrl || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">HTTP Status</span>
              <span className={`font-mono text-xs ${diagnostics?.httpStatus === 200 ? 'text-emerald-600' : 'text-red-600'}`}>
                {diagnostics?.httpStatus || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">Rows Returned</span>
              <span className="font-medium">{diagnostics?.rowsReturned || 0}</span>
            </div>

            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Last Error</span>
              <span className="font-medium text-red-500 text-right max-w-[200px] truncate" title={diagnostics?.errorMessage || ''}>
                {diagnostics?.errorMessage || 'None'}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Survey Header Validation</h3>
            
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500">Validation Status</span>
              {diagnostics?.headerValidation ? (
                <span className={`font-medium ${diagnostics.headerValidation.isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {diagnostics.headerValidation.isValid ? 'Valid' : 'Warning'}
                </span>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
            </div>
            
            {diagnostics?.headerValidation && diagnostics.headerValidation.missingHeaders.length > 0 && (
              <div className="text-sm py-2">
                <span className="text-amber-600 font-semibold mb-1 block">Missing Survey Headers:</span>
                <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1">
                  {diagnostics.headerValidation.missingHeaders.map((header, idx) => (
                    <li key={idx}>{header}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6 border-t pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
              <BarChart2 className="w-4 h-4" /> Live Parsed Data Totals
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2 text-sm">
              <div className="bg-slate-50 p-3 rounded border border-blue-200">
                <div className="text-blue-700 text-xs uppercase mb-1 font-semibold">Smartphone %</div>
                <div className="text-lg font-bold text-slate-900">{totalRespondents ? Math.round((smartphoneCount / totalRespondents) * 100) : 0}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-blue-200">
                <div className="text-blue-700 text-xs uppercase mb-1 font-semibold">Laptop %</div>
                <div className="text-lg font-bold text-slate-900">{totalRespondents ? Math.round((laptopCount / totalRespondents) * 100) : 0}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-blue-200">
                <div className="text-blue-700 text-xs uppercase mb-1 font-semibold">Tablet %</div>
                <div className="text-lg font-bold text-slate-900">{totalRespondents ? Math.round((tabletCount / totalRespondents) * 100) : 0}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-blue-200">
                <div className="text-blue-700 text-xs uppercase mb-1 font-semibold">Desktop %</div>
                <div className="text-lg font-bold text-slate-900">{totalRespondents ? Math.round((desktopCount / totalRespondents) * 100) : 0}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-purple-200">
                <div className="text-purple-700 text-xs uppercase mb-1 font-semibold">Career Interest Score</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.careerAwarenessScore || 0}/100</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-purple-200">
                <div className="text-purple-700 text-xs uppercase mb-1 font-semibold">Remote Work Interest</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.remoteWorkInterest || 0}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-emerald-200">
                <div className="text-emerald-700 text-xs uppercase mb-1 font-semibold">Digital Skills Readiness</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.digitalSkillsReadiness || 0}/100</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-emerald-200">
                <div className="text-emerald-700 text-xs uppercase mb-1 font-semibold">AI Readiness Index</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.aiReadinessIndex || 0}/100</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border border-emerald-200">
                <div className="text-emerald-700 text-xs uppercase mb-1 font-semibold">Employment Readiness</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.employmentReadinessIndex || 0}/100</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border col-span-2 lg:col-span-3 border-amber-200">
                <div className="text-amber-700 text-xs uppercase mb-1 font-semibold">Top Barrier</div>
                <div className="text-lg font-bold text-slate-900">{analytics?.topBarrier || 'N/A'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm opacity-50">
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">Total Respondents</div>
                <div className="text-lg font-bold text-slate-900">{totalRespondents}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">Smartphone Owners (Count)</div>
                <div className="text-lg font-bold text-slate-900">{smartphoneCount}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">Laptop Owners (Count)</div>
                <div className="text-lg font-bold text-slate-900">{laptopCount}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">AI Usage</div>
                <div className="text-lg font-bold text-slate-900">{aiUsageCount}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">Tech Career Interest</div>
                <div className="text-lg font-bold text-slate-900">{careerInterestCount}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded border">
                <div className="text-slate-500 text-xs uppercase mb-1">Remote Work Interest</div>
                <div className="text-lg font-bold text-slate-900">{remoteWorkInterestCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-500" />
              Raw Data Diagnostic (First 5 Responses)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase bg-slate-100 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Raw Devices</th>
                    <th className="px-3 py-2">Raw Work Type</th>
                    <th className="px-3 py-2">Raw Career Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.slice(0, 5).map((d, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.rawDevices || 'N/A'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.rawWorkType || 'N/A'}</td>
                      <td className="px-3 py-2 font-mono text-xs">{d.rawCareerInterest || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            <div className="flex gap-4">
              <button
                onClick={handleRefreshData}
                disabled={isSyncing}
                className="flex-1 bg-[#0F172A] text-white py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {isSyncing ? "Syncing..." : "Trigger Sync"}
              </button>
            </div>

          <div className="mt-4 border border-slate-200 rounded-md overflow-hidden">
            <button 
              onClick={() => setShowRawResponse(!showRawResponse)}
              className="w-full flex justify-between items-center px-4 py-2 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
            >
              Raw API Response Preview
              {showRawResponse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRawResponse && (
              <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-48">
                {diagnostics?.rawResponsePreview || "No response available."}
              </div>
            )}
          </div>

          <div className="mt-4 border border-slate-200 rounded-md overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b text-sm font-medium text-slate-700">
              Startup Diagnostics Log
            </div>
            <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs whitespace-pre-wrap overflow-x-auto max-h-48">
              {diagnostics?.startupLog && diagnostics.startupLog.length > 0 
                ? diagnostics.startupLog.join("\n")
                : "No startup logs available."}
            </div>
          </div>
        </div>

        {/* CSV FALLBACK */}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">CSV Upload Fallback</h2>
          <p className="text-sm text-slate-500 mb-6">
            If Google Sheets connectivity fails completely, you can manually upload the exported CSV. 
            <strong> The CSV data will be saved locally and survive page refreshes.</strong>
          </p>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative mb-6">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm font-medium text-slate-900">Click to upload CSV</span>
            <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
             <h4 className="text-sm font-semibold text-blue-900 mb-1">Local Storage Cache</h4>
             <p className="text-xs text-blue-800">
               If a CSV is uploaded, it is cached in the browser. It will be used immediately if live connections fail.
             </p>
          </div>
        </div>
      </div>

      {/* MONITORING & COMMUNITY CONFIG... */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Survey Monitoring</h2>
            <p className="text-sm text-slate-500">Cumulative project reach and daily survey submission trends.</p>
          </div>
          <div className="flex gap-4 mt-2 md:mt-0 text-sm">
            <div>
              <span className="text-slate-500">First Response: </span>
              <span className="font-medium">{data.length > 0 ? getResponseGrowthTimeSeries(data)[0]?.date : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">Latest Response: </span>
              <span className="font-medium">{data.length > 0 ? getResponseGrowthTimeSeries(data).slice(-1)[0]?.date : 'N/A'}</span>
            </div>
          </div>
        </div>
        <ResponsesOverTimeChart data={getResponseGrowthTimeSeries(data)} />
      </div>

      {/* DETECTED SURVEY HEADERS */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Detected Survey Headers</h2>
            <p className="text-sm text-slate-500">
              Every column detected from the connected Google Sheets / CSV. Unmatched columns are not mapped to any survey question.
            </p>
          </div>
          <div className="flex gap-3 text-xs shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Matched</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />Unmatched</span>
          </div>
        </div>

        {(!diagnostics?.detectedHeaders || diagnostics.detectedHeaders.length === 0) ? (
          <div className="text-slate-400 text-sm italic py-4 text-center">
            No header data available. Trigger a sync to populate this table.
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold text-slate-600 w-10">#</th>
                  <th className="px-3 py-2 font-semibold text-slate-600">Raw Header (from Sheet)</th>
                  <th className="px-3 py-2 font-semibold text-slate-600">Matched Question</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diagnostics.detectedHeaders.map((h) => (
                  <tr key={h.columnIndex} className={h.matchedQuestion ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-3 py-2 font-mono text-slate-400">{h.columnIndex}</td>
                    <td className="px-3 py-2 max-w-xs">
                      <span className="block truncate font-mono text-slate-700" title={h.rawHeader}>
                        {h.rawHeader.replace(/\r?\n|\r/g, ' ↵ ')}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {h.matchedQuestion ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {h.matchedQuestion}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Community Name Management</h2>
        <p className="text-sm text-slate-500 mb-6">
          Map raw community names from survey responses to clean canonical names. This takes precedence over fuzzy matching.
        </p>

        <form onSubmit={handleAddOverride} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Raw Name (e.g. Elenlenwo)"
            value={rawName}
            onChange={(e) => setRawName(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
          />
          <input
            type="text"
            placeholder="Canonical Name (e.g. Elelenwo)"
            value={canonicalName}
            onChange={(e) => setCanonicalName(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F172A]"
          />
          <button type="submit" className="bg-[#0F172A] text-white rounded-md px-6 py-2 hover:bg-slate-800 transition-colors md:whitespace-nowrap">
            Add Override
          </button>
        </form>

        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Raw Input</th>
                <th className="px-4 py-3 font-medium text-slate-600">Canonical Output</th>
                <th className="px-4 py-3 font-medium text-slate-600">Match Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(overrides).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-slate-500 text-center">No manual overrides defined.</td>
                </tr>
              ) : (
                Object.entries(overrides).map(([raw, canonical]) => {
                  const match = normalizeCommunityNameWithMethod(raw);
                  return (
                    <tr key={raw}>
                      <td className="px-4 py-3 font-mono text-slate-700">{raw}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{canonical}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">{match.matchMethod}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
