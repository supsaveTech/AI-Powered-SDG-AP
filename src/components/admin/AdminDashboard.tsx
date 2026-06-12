"use client";

import { useState, useEffect, useCallback } from "react";
import { dataService, DataStatus } from "@/services/dataService";
import { getManualOverrides, setManualOverride, normalizeCommunityNameWithMethod } from "@/utils/communityNormalizer";
import { ResponsesOverTimeChart } from "@/components/dashboard/ResponsesOverTimeChart";
import { getResponseGrowthTimeSeries } from "@/utils/dataAggregation";
import { SurveyResponse } from "@/types";

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [rawName, setRawName] = useState("");
  const [canonicalName, setCanonicalName] = useState("");
  const [data, setData] = useState<SurveyResponse[]>([]);

  const loadOverrides = useCallback(() => {
    setOverrides(getManualOverrides());
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
      refreshStatus();
    } else {
      alert("Invalid password");
    }
  };

  const refreshStatus = () => {
    setStatus(dataService.getDataStatus());
    dataService.fetchData().then(setData);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await dataService.fetchData(true);
    refreshStatus();
    setIsRefreshing(false);
    alert("Data refreshed successfully!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const success = await dataService.uploadCsvData(csv);
      if (success) {
        alert("CSV uploaded and processed successfully.");
        refreshStatus();
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
                placeholder="Enter admin password"
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Panel</h1>
        <p className="text-slate-500 mt-2">Manage data pipelines and system status.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Data Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Total Records</span>
              <span className="font-medium">{status?.totalResponses || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Last Sync Time</span>
              <span className="font-medium">{status?.syncTime ? new Date(status.syncTime).toLocaleString() : 'Never'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Live Connection</span>
              <span className={`font-medium ${status?.isConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                {status?.isConnected ? 'Connected to Google Sheets' : 'Using Mock/CSV Data'}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-full bg-[#0F172A] text-white rounded-md py-2 font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Google Sheets Data'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">CSV Upload Fallback</h2>
          <p className="text-sm text-slate-500 mb-6">
            If the Google Sheets connection fails, you can manually upload the exported CSV from Google Forms to update the dashboard.
          </p>
          
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
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
        </div>
      </div>

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

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Community Name Management</h2>
        <p className="text-sm text-slate-500 mb-6">
          Map raw community names from survey responses to clean canonical names. This takes precedence over fuzzy matching.
        </p>

        <form onSubmit={handleAddOverride} className="flex gap-4 mb-6">
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
          <button type="submit" className="bg-[#0F172A] text-white rounded-md px-6 py-2 hover:bg-slate-800 transition-colors">
            Add Override
          </button>
        </form>

        <div className="border rounded-md overflow-hidden">
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
