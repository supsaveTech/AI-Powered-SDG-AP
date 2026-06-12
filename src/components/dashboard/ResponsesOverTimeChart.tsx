"use client";

import { useMemo } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend
} from 'recharts';

interface ResponsesOverTimeChartProps {
  data: {
    date: string;
    daily: number;
    cumulative: number;
  }[];
}

export function ResponsesOverTimeChart({ data }: ResponsesOverTimeChartProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      displayDate: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-500">No response data available over time.</div>;
  }

  return (
    <div className="h-80 w-full mt-4" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
          <defs>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F172A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            dy={8}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            width={36}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            width={36}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
            }}
            cursor={{ fill: '#F8FAFC' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            iconSize={10}
          />
          <Bar yAxisId="left" dataKey="daily" name="Daily Responses" fill="#FD6925" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="cumulative" 
            name="Cumulative Total"
            stroke="#0F172A" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCumulative)" 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
