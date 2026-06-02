"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="bg-rose-50 p-4 rounded-full mb-4">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 max-w-md mb-6">
        An error occurred while trying to load the dashboard data. Please try again or contact the administrator.
      </p>
      <button
        onClick={() => reset()}
        className="bg-[#0F172A] text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
