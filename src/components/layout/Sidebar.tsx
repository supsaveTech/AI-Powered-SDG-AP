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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Demographics', href: '/demographics', icon: Users },
  { name: 'Digital Access', href: '/digital-access', icon: Smartphone },
  { name: 'Digital Skills', href: '/digital-skills', icon: Code2 },
  { name: 'Career Awareness', href: '/career-awareness', icon: GraduationCap },
  { name: 'Employment Readiness', href: '/employment-readiness', icon: Briefcase },
  { name: 'Barriers', href: '/barriers', icon: AlertTriangle },
  { name: 'School Observation', href: '/school-observation', icon: School },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Methodology', href: '/methodology', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
        <h1 className="text-lg font-bold">Digital Skills for Decent Work</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <Link
            href="/admin"
            className={cn(
              pathname === '/admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
            )}
          >
            <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white" />
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
