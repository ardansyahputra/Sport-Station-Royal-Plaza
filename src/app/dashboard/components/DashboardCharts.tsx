'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DiscountDistributionChart = dynamic(
  () => import('./DiscountDistributionChart'),
  { ssr: false, loading: () => <div className="animate-pulse bg-muted rounded-xl h-[280px]" /> }
);

const StockByBrandChart = dynamic(
  () => import('./StockByBrandChart'),
  { ssr: false, loading: () => <div className="animate-pulse bg-muted rounded-xl h-[280px]" /> }
);

type DashboardChartsProps = {
  discountDist: { discount: string; count: number }[];
  stockByBrand: { brand: string; stock: number }[];
};

export default function DashboardCharts({ discountDist, stockByBrand }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DiscountDistributionChart data={discountDist} />
      <StockByBrandChart data={stockByBrand} />
    </div>
  );
}