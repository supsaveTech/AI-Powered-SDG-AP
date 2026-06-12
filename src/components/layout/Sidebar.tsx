"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Smartphone, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  AlertTriangle,
  School,
  Lightbulb,
  FileText,
  Settings,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Demographics', href: '/demographics', icon: Users },
  { name: 'Digital Access', href: '/digital-access', icon: Smartphone },
  { name: 'Digital Skills', href: '/digital-skills', icon: Code2 },
  { name: 'AI Awareness', href: '/ai-awareness', icon: BrainCircuit },
  { name: 'Career Awareness', href: '/career-awareness', icon: GraduationCap },
  { name: 'Employment Readiness', href: '/employment-readiness', icon: Briefcase },
  { name: 'Barriers', href: '/barriers', icon: AlertTriangle },
  { name: 'Case Study', href: '/school-observation', icon: School },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Methodology', href: '/methodology', icon: FileText },
];

interface SidebarProps {
  isMobileOpen: boolean;
  isTabletCollapsed: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isMobileOpen,
  isTabletCollapsed,
  onCloseMobile,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white overflow-hidden">
      {/* ── Sidebar header ─────────────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-4 justify-between">
        {/* Title — hidden in collapsed tablet mode */}
        {!isTabletCollapsed && (
          <h1 className="text-sm font-bold leading-tight truncate pr-2">
            Digital Skills for Decent Work
          </h1>
        )}

        {/* Mobile: close button */}
        {isMobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Tablet: collapse toggle */}
        {!isMobileOpen && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={isTabletCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors",
              isTabletCollapsed && "mx-auto"
            )}
          >
            {isTabletCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* ── Navigation items ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                title={isTabletCollapsed ? item.name : undefined}
                className={cn(
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isTabletCollapsed && 'justify-center px-2'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                    'h-5 w-5 flex-shrink-0',
                    !isTabletCollapsed && 'mr-3'
                  )}
                  aria-hidden="true"
                />
                {/* Label — hidden in tablet collapsed mode */}
                {!isTabletCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Admin link ──────────────────────────────────────────────── */}
        <div className="border-t border-slate-800 p-2">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            title={isTabletCollapsed ? "Admin Panel" : undefined}
            className={cn(
              pathname === '/admin'
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isTabletCollapsed && 'justify-center px-2'
            )}
          >
            <Settings
              className={cn(
                'h-5 w-5 text-slate-400 group-hover:text-white flex-shrink-0',
                !isTabletCollapsed && 'mr-3'
              )}
            />
            {!isTabletCollapsed && <span>Admin Panel</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}
