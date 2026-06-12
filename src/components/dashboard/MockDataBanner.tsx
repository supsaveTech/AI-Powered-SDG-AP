"use client";

import { useEffect, useState } from "react";
import { dataService } from "@/services/dataService";

export function MockDataBanner() {
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const status = dataService.getDataStatus();
      setIsMock(status.syncStatus === 'mock');
    };
    checkStatus();
    // Re-check periodically in case data source changes (e.g. after upload in another tab/component)
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isMock) return null;

  return (
    <div className="bg-orange-100 text-orange-800 px-4 py-3 text-sm text-center border-b border-orange-200">
      <strong>Demo Mode:</strong> Analytics are currently generated from mock data. Connect Google Sheets or upload a survey CSV to view real project insights.
    </div>
  );
}
