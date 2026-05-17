'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import MetricsBentoGrid from './MetricsBentoGrid';
import DashboardCharts from './DashboardCharts';
import LowStockPanel from './LowStockPanel';
import QuickActions from './QuickActions';

import type { Product } from '@/lib/mockData';

import {
  computeLowStockAlerts,
  getTotalStock,
  getDiscountDistribution,
  getStockByBrand,
} from '@/lib/mockData';

import { getStoredProducts } from '@/lib/storage';

export default function DashboardContent() {
  /* =====================================================
     STATE
  ===================================================== */

  const [products, setProducts] =
    useState<Product[]>([]);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */

  useEffect(() => {
    const loadProducts = async () => {
      const storedProducts = await getStoredProducts();

      setProducts(storedProducts);
    };

    // LOAD PERTAMA
    loadProducts();

    // UPDATE SAAT KEMBALI HALAMAN
    window.addEventListener(
      'focus',
      loadProducts
    );

    // UPDATE SAAT STORAGE BERUBAH
    window.addEventListener(
      'storage',
      loadProducts
    );

    return () => {
      window.removeEventListener(
        'focus',
        loadProducts
      );

      window.removeEventListener(
        'storage',
        loadProducts
      );
    };
  }, []);

  /* =====================================================
     METRICS
  ===================================================== */

  const totalProducts =
    products.length;

  const totalStock =
    getTotalStock(products);

  const lowStockAlerts =
    computeLowStockAlerts(
      products,
      3
    );

  const lowStockCount =
    lowStockAlerts.length;

  const outOfStockCount = products
    .flatMap((p) => p.sizes)
    .filter((s) => s.stock === 0)
    .length;

  /* =====================================================
     CHART DATA
  ===================================================== */

  const discountDist =
    getDiscountDistribution(
      products
    );

  const stockByBrand =
    getStockByBrand(products);

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  const isEmpty =
    products.length === 0;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">
      <QuickActions />

      {isEmpty ? (
        <div className="rounded-2xl border border-dashed p-10 text-center bg-card">
          <h2 className="text-xl font-700 text-foreground mb-2">
            Belum Ada Produk
          </h2>

          <p className="text-sm text-muted-foreground">
            Tambahkan produk dari halaman
            Product Management agar
            dashboard otomatis terisi.
          </p>
        </div>
      ) : (
        <>
          <MetricsBentoGrid
            totalProducts={
              totalProducts
            }
            totalStock={totalStock}
            lowStockCount={
              lowStockCount
            }
            outOfStockCount={
              outOfStockCount
            }
          />

          <DashboardCharts
            discountDist={
              discountDist
            }
            stockByBrand={
              stockByBrand
            }
          />

          <LowStockPanel
            alerts={lowStockAlerts.slice(
              0,
              12
            )}
          />
        </>
      )}
    </div>
  );
}