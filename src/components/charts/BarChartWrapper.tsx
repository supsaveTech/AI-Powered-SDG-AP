"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface BarChartWrapperProps {
  data: Record<string, unknown>[];
  xDataKey: string;
  yDataKey: string;
  fill?: string;
  height?: number;
}

export function BarChartWrapper({ data, xDataKey, yDataKey, fill = "#0F172A", height = 300 }: BarChartWrapperProps) {
  return (
    <div style={{ height: height, width: '100%', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey={xDataKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            dy={10}
            interval="preserveStartEnd"
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              fontSize: '12px',
            }}
          />
          <Bar dataKey={yDataKey} fill={fill} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
