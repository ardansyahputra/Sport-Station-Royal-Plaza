'use client';

import React from 'react';
import { Search, Plus, Upload, Download, X, AlertTriangle, RotateCcw } from 'lucide-react';

type ProductToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  filterBrand: string;
  onFilterBrand: (v: string) => void;
  filterDiscount: string;
  onFilterDiscount: (v: string) => void;
  filterCategory: string;
  onFilterCategory: (v: string) => void;
  filterStock: string;
  onFilterStock: (v: string) => void;
  onAddProduct: () => void;
  onImport: () => void;
  onExport: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  lowStockCount: number;
};

const BRANDS = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok'];
const DISCOUNTS = ['0', '50', '70', '80'];
const CATEGORIES = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT'];
const STOCK_FILTERS = [
  { value: 'in', label: 'Stok Aman' },
  { value: 'low', label: 'Stok Rendah' },
  { value: 'out', label: 'Habis Stok' },
];

export default function ProductToolbar({
  search, onSearchChange,
  filterBrand, onFilterBrand,
  filterDiscount, onFilterDiscount,
  filterCategory, onFilterCategory,
  filterStock, onFilterStock,
  onAddProduct, onImport, onExport,
  hasActiveFilters, onResetFilters,
  totalFiltered, totalAll,
  lowStockCount,
}: ProductToolbarProps) {
  return (
    <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
      {/* Top row: search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari brand, model, kode, warna..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            >
              <X size={13} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Low stock badge */}
        {lowStockCount > 0 && (
          <button
            onClick={() => onFilterStock(filterStock === 'low' ? '' : 'low')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
            style={{
              backgroundColor: filterStock === 'low' ? 'var(--warning)' : 'var(--warning-bg)',
              color: filterStock === 'low' ? 'white' : 'var(--warning)',
            }}
          >
            <AlertTriangle size={13} />
            {lowStockCount} stok rendah
          </button>
        )}

        {/* Actions */}
        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-500 text-muted-foreground bg-muted hover:bg-border transition-all active:scale-95"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-500 text-muted-foreground bg-muted hover:bg-border transition-all active:scale-95"
        >
          <Download size={15} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        <button
          onClick={onAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-600 text-white transition-all active:scale-95 shadow-card"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={15} />
          Tambah Produk
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Brand filter */}
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrand(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Brand</option>
          {BRANDS.map((b) => <option key={`filter-brand-${b}`} value={b}>{b}</option>)}
        </select>

        {/* Discount filter */}
        <select
          value={filterDiscount}
          onChange={(e) => onFilterDiscount(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Diskon</option>
          {DISCOUNTS.map((d) => <option key={`filter-disc-${d}`} value={d}>Diskon {d}%</option>)}
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={`filter-cat-${c}`} value={c}>{c}</option>)}
        </select>

        {/* Stock filter */}
        <select
          value={filterStock}
          onChange={(e) => onFilterStock(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Stok</option>
          {STOCK_FILTERS.map((sf) => <option key={`filter-stock-${sf.value}`} value={sf.value}>{sf.label}</option>)}
        </select>

        {/* Reset filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-500 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw size={12} />
            Reset filter
          </button>
        )}

        <div className="ml-auto text-xs text-muted-foreground">
          Menampilkan <span className="font-600 text-foreground">{totalFiltered}</span> dari <span className="font-600 text-foreground">{totalAll}</span> produk
        </div>
      </div>
    </div>
  );
}