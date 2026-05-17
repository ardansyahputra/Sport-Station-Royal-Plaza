'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type Props = {
  data: { discount: string; count: number }[];
};

const barColors = ['#6B7280', '#2563EB', '#FF6B00', '#DC2626'];

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-lg px-3 py-2 shadow-dropdown text-sm">
      <p className="font-600 text-foreground">Diskon {label}</p>
      <p className="text-muted-foreground mt-0.5">
        <span className="font-700 text-foreground">{payload[0].value}</span> produk
      </p>
    </div>
  );
}

export default function DiscountDistributionChart({ data }: Props) {
  return (
    <div className="bg-card rounded-xl border shadow-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-600 text-foreground">Distribusi Diskon</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Jumlah produk per tier diskon</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="discount"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`disc-cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t flex-wrap">
        {data.map((item, i) => (
          <div key={`disc-legend-${i}`} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: barColors[i % barColors.length] }} />
            <span className="text-2xs text-muted-foreground">{item.discount} ({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}