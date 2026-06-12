"use client";

import { useEffect, useState } from "react";
import { dataService, SyncStatus } from "@/services/dataService";
import { Cloud, CloudOff, RefreshCw, UploadCloud, Database } from "lucide-react";

export function SyncStatusBar() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    syncTime: Date | null;
    syncStatus: SyncStatus;
    totalResponses: number;
  }>({
    isConnected: false,
    syncTime: null,
    syncStatus: 'offline',
    totalResponses: 0
  });

  useEffect(() => {
    // Basic polling or just initial fetch to get status
    const updateStatus = () => {
      setStatus(dataService.getDataStatus());
    };
    
    updateStatus();
    
    // Poll every 30 seconds for visual updates
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch(status.syncStatus) {
      case 'sheets-api':
        return <Cloud className="w-4 h-4 text-emerald-500" />;
      case 'sheets-csv':
        return <Cloud className="w-4 h-4 text-blue-500" />;
      case 'uploaded-csv':
        return <UploadCloud className="w-4 h-4 text-purple-500" />;
      case 'mock':
        return <Database className="w-4 h-4 text-orange-500" />;
      default:
        return <CloudOff className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch(status.syncStatus) {
      case 'sheets-api': return 'Live Google Sheets';
      case 'sheets-csv': return 'Live Google Sheets';
      case 'uploaded-csv': return 'Uploaded CSV';
      case 'mock': return 'Mock Data';
      default: return 'Offline';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex items-center gap-4 text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
      <div className="flex items-center gap-2" title={`Data Source: ${getStatusText()}`}>
        {getStatusIcon()}
        <span className="text-slate-700 hidden sm:inline">{getStatusText()}</span>
      </div>
      <div className="w-px h-4 bg-slate-200"></div>
      <div className="flex items-center gap-2 text-slate-500">
        <RefreshCw className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Synced: {formatTimeAgo(status.syncTime)}</span>
        <span className="sm:hidden">{formatTimeAgo(status.syncTime)}</span>
      </div>
    </div>
  );
}
