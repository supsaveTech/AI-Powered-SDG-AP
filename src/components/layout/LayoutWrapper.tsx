"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SyncStatusBar } from "@/components/dashboard/SyncStatusBar";
import { MockDataBanner } from "@/components/dashboard/MockDataBanner";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  // Auto-collapse sidebar on tablet-sized screens (< 1280px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsTabletCollapsed(false);
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 768) {
        setIsTabletCollapsed(true);
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  // Width of the desktop/tablet sidebar
  const sidebarWidth = isTabletCollapsed ? "w-16" : "w-64";
  const mainPadding = isTabletCollapsed ? "md:pl-16" : "md:pl-64";

  return (
    <>
      {/* ── Mobile: Fixed top header ────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm">
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex items-center justify-center w-9 h-9 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-sm font-semibold text-slate-900 truncate leading-tight">
          Digital Skills for Decent Work
        </h1>
      </div>

      {/* ── Mobile: Backdrop overlay ─────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: Off-canvas drawer ─────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          isMobileOpen={isMobileOpen}
          isTabletCollapsed={false}
          onCloseMobile={closeMobile}
        />
      </div>

      {/* ── Desktop / Tablet: Fixed sidebar ───────────────────────────── */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 ${sidebarWidth} transition-all duration-300 ease-in-out`}
      >
        <Sidebar
          isMobileOpen={false}
          isTabletCollapsed={isTabletCollapsed}
          onToggleCollapse={() => setIsTabletCollapsed((prev) => !prev)}
        />
      </div>

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div
        className={`flex flex-col flex-1 ${mainPadding} transition-all duration-300 ease-in-out`}
      >
        <MockDataBanner />
        {/* Desktop header (hidden on mobile — we use the fixed header above) */}
        <header className="hidden md:flex sticky top-0 z-10 h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 justify-end">
          <SyncStatusBar />
        </header>

        {/* Mobile: sync status visible inside scrollable content */}
        <div className="md:hidden flex justify-end px-4 pt-16 pb-1 bg-slate-50">
          <SyncStatusBar />
        </div>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 pt-2 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
