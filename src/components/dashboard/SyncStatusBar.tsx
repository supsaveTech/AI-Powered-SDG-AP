"use client";

import { useEffect, useState } from "react";
import { dataService, SyncStatus } from "@/services/dataService";
import { Cloud, CloudOff, RefreshCw, UploadCloud, Database, AlertCircle } from "lucide-react";

export function SyncStatusBar() {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    syncTime: Date | null;
    syncStatus: SyncStatus;
    totalResponses: number;
    errorMessage?: string | null;
  }>({
    isConnected: false,
    syncTime: null,
    syncStatus: 'offline',
    totalResponses: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      const dataStatus = dataService.getDataStatus();
      const diagnostics = dataService.getDiagnostics();
      setStatus({
        ...dataStatus,
        errorMessage: diagnostics.errorMessage
      });
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch(status.syncStatus) {
      case 'live':
        return { icon: <Cloud className="w-4 h-4 text-emerald-500" />, text: 'Live Google Sheets Sync', colorClass: 'text-slate-700' };
      case 'csv':
        return { icon: <Cloud className="w-4 h-4 text-blue-500" />, text: 'Live Google Sheets (CSV)', colorClass: 'text-slate-700' };
      case 'uploaded-csv':
        return { icon: <UploadCloud className="w-4 h-4 text-purple-500" />, text: 'Using Uploaded CSV', colorClass: 'text-slate-700' };
      case 'cached-csv':
        return { icon: <UploadCloud className="w-4 h-4 text-purple-500" />, text: 'Using Cached CSV', colorClass: 'text-slate-700' };

      
      // Error States
      case 'error-auth':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Invalid API Key', colorClass: 'text-red-600 font-semibold' };
      case 'error-permission':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Permission Denied', colorClass: 'text-red-600 font-semibold' };
      case 'error-not-found':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Spreadsheet Not Found', colorClass: 'text-red-600 font-semibold' };
      case 'error-invalid-range':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Invalid Range', colorClass: 'text-red-600 font-semibold' };
      case 'error-parser':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Parser Failed', colorClass: 'text-red-600 font-semibold' };
      case 'error-network':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Network/HTTP Failure', colorClass: 'text-red-600 font-semibold' };
      case 'error-env':
        return { icon: <AlertCircle className="w-4 h-4 text-red-500" />, text: 'Google Sheets Error: Missing Configuration', colorClass: 'text-red-600 font-semibold' };
      
      default:
        return { icon: <CloudOff className="w-4 h-4 text-slate-400" />, text: 'Offline', colorClass: 'text-slate-500' };
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

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-4 text-sm font-medium bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
      <div className="flex items-center gap-2" title={status.errorMessage ? `Error: ${status.errorMessage}` : `Data Source: ${config.text}`}>
        {config.icon}
        <span className={`hidden sm:inline ${config.colorClass}`}>{config.text}</span>
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
