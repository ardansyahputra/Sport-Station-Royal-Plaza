import React from 'react';
import Link from 'next/link';
import { Package, Layers, AlertTriangle, ArrowRight } from 'lucide-react';

type MetricsBentoGridProps = {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export default function MetricsBentoGrid({
  totalProducts,
  totalStock,
  lowStockCount,
  outOfStockCount,
}: MetricsBentoGridProps) {
  return (
    // Grid plan: 4 cards → grid-cols-4 on xl, grid-cols-2 on md
    // Hero card (Total Products) spans 2 cols on xl
    // Row 1: hero(2col) + Total Stock(1col) + Low Stock(1col)
    // Row 2: Out of Stock spans full remaining on smaller screens
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Hero: Total Products — spans 2 cols on xl */}
      <div className="xl:col-span-2 bg-card rounded-xl border shadow-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
        <div
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-5"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-500 uppercase tracking-wider text-muted-foreground">Total Produk</p>
            <p className="text-hero-xl font-700 font-tabular text-foreground mt-2">{totalProducts}</p>
            <p className="text-sm text-muted-foreground mt-1">SKU aktif dalam katalog</p>
          </div>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,107,0,0.1)' }}
          >
            <Package size={24} style={{ color: 'var(--primary)' }} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          {(['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok'] as const).map((brand) => (
            <div key={`brand-pill-${brand}`} className="text-center">
              <p className="text-xs font-500 text-foreground">{brand === 'New Balance' ? 'NB' : brand.slice(0, 3).toUpperCase()}</p>
              <p className="text-2xs text-muted-foreground">
                {brand === 'Airwalk' ? '4' : brand === 'Converse' ? '9' : brand === 'Diadora' ? '2' : brand === 'New Balance' ? '7' : '2'}
              </p>
            </div>
          ))}
          <Link href="/product-management" className="ml-auto flex items-center gap-1 text-xs font-500 hover:underline" style={{ color: 'var(--primary)' }}>
            Lihat semua <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Total Stock */}
      <div className="bg-card rounded-xl border shadow-card p-6 flex flex-col justify-between min-h-[140px]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-500 uppercase tracking-wider text-muted-foreground">Total Unit Stok</p>
            <p className="text-3xl font-700 font-tabular text-foreground mt-2">{totalStock}</p>
            <p className="text-xs text-muted-foreground mt-1">unit di semua ukuran</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info-bg)' }}>
            <Layers size={20} style={{ color: 'var(--info)' }} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-2xs mb-1">
            <span className="text-muted-foreground">Tingkat pengisian</span>
            <span className="font-600 text-foreground">74%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '74%', backgroundColor: 'var(--info)' }} />
          </div>
        </div>
      </div>

      {/* Low Stock Alert — in warning/danger state */}
      <div
        className="rounded-xl border shadow-card p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
        style={{ backgroundColor: lowStockCount > 10 ? 'var(--danger-bg)' : 'var(--warning-bg)', borderColor: lowStockCount > 10 ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-xs font-500 uppercase tracking-wider"
              style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)' }}
            >
              Stok Hampir Habis
            </p>
            <p
              className="text-3xl font-700 font-tabular mt-2"
              style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)' }}
            >
              {lowStockCount}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)', opacity: 0.8 }}
            >
              SKU dengan stok ≤ 3 unit
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: lowStockCount > 10 ? 'rgba(220,38,38,0.15)' : 'rgba(217,119,6,0.15)' }}
          >
            <AlertTriangle size={20} style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)' }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)' }}
          />
          <p className="text-2xs font-500" style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)', opacity: 0.9 }}>
            {outOfStockCount} SKU habis stok
          </p>
          <Link
            href="/admin/product-management"
            className="ml-auto text-2xs font-600 flex items-center gap-1"
            style={{ color: lowStockCount > 10 ? 'var(--danger)' : 'var(--warning)' }}
          >
            Kelola <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  );
}