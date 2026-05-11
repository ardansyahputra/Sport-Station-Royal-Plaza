import React from 'react';
import MetricsBentoGrid from './MetricsBentoGrid';
import DashboardCharts from './DashboardCharts';
import LowStockPanel from './LowStockPanel';
import QuickActions from './QuickActions';
import {
  MOCK_PRODUCTS,
  computeLowStockAlerts,
  getTotalStock,
  getDiscountDistribution,
  getStockByBrand,
} from '@/lib/mockData';

export default function DashboardContent() {
  const totalProducts = MOCK_PRODUCTS?.length;
  const totalStock = getTotalStock(MOCK_PRODUCTS);
  const allAlerts = computeLowStockAlerts(MOCK_PRODUCTS, 3);
  const lowStockCount = allAlerts?.length;
  const outOfStockCount = MOCK_PRODUCTS?.flatMap((p) => p?.sizes)?.filter((s) => s?.stock === 0)?.length;
  const discountDist = getDiscountDistribution(MOCK_PRODUCTS);
  const stockByBrand = getStockByBrand(MOCK_PRODUCTS);

  return (
    <div className="space-y-6">
      <QuickActions />
      <MetricsBentoGrid
        totalProducts={totalProducts}
        totalStock={totalStock}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
      />
      <DashboardCharts discountDist={discountDist} stockByBrand={stockByBrand} />
      <LowStockPanel alerts={allAlerts?.slice(0, 12)} />
    </div>
  );
}