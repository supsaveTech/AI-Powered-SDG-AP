"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface BarChartWrapperProps {
  data: any[];
  xDataKey: string;
  yDataKey: string;
  fill?: string;
  height?: number;
}

export function BarChartWrapper({ data, xDataKey, yDataKey, fill = "#0F172A", height = 300 }: BarChartWrapperProps) {
  return (
    <div style={{ height: height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey={xDataKey} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
          />
          <Bar dataKey={yDataKey} fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
