"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartWrapperProps {
  data: Record<string, unknown>[];
  nameKey: string;
  dataKey: string;
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = ["#0F172A", "#8F1838", "#FD6925", "#334155", "#94A3B8"];

interface LegendPayloadItem {
  color?: string;
  value?: string;
}

// Compact legend for small screens
const renderLegend = (props: { payload?: readonly LegendPayloadItem[] }) => {
  const { payload } = props;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 px-2">
      {payload?.map((entry: LegendPayloadItem, index: number) => (
        <li key={`legend-${index}`} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="truncate max-w-[120px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function PieChartWrapper({ data, nameKey, dataKey, colors = DEFAULT_COLORS, height = 300 }: PieChartWrapperProps) {
  return (
    <div style={{ height: height, width: '100%', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="30%"
            outerRadius="55%"
            paddingAngle={3}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              fontSize: '12px',
            }}
          />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
