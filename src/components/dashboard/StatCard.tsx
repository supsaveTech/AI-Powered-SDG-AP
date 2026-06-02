"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  delay?: number;
  colorClass?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  delay = 0,
  colorClass = "text-primary"
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col"
    >
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-slate-500">{title}</h3>
        <Icon className={cn("h-4 w-4", colorClass)} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-slate-500">
            <span className={trend.isPositive ? "text-emerald-500" : "text-rose-500"}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>{" "}
            {trend.label}
          </p>
        )}
        {description && !trend && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </motion.div>
  );
}
