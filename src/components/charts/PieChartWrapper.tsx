"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartWrapperProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ["#0F172A", "#8F1838", "#FD6925", "#334155", "#94A3B8"];

export function PieChartWrapper({ data, nameKey, dataKey, colors = DEFAULT_COLORS, height = 300 }: PieChartWrapperProps) {
  return (
    <div style={{ height: height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
