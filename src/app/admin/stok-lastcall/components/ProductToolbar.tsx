'use client';

import React from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

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
  onImport: () => void; // ← cukup void, ImportModal yang handle parsing
  onExport: () => void;
  onDeleteAll: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  lowStockCount: number;
};

const BRANDS = [
  'Airwalk',
  'Converse',
  'Diadora',
  'New Balance',
  'Reebok',
  'Puma',
  'Nike',
  'Adidas',
  'SKECHERS',
];
const DISCOUNTS = ['0', '10', '20', '30'];
const CATEGORIES = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT', 'FOOTWEAR'];
const STOCK_FILTERS = [
  { value: 'out', label: 'Stok Habis (= 0)' },
  { value: 'low', label: 'Stok Kritis (1 - 3)' },
  { value: 'safe', label: 'Stok Aman (> 3)' },
];

export default function ProductToolbar({
  search,
  onSearchChange,
  filterBrand,
  onFilterBrand,
  filterDiscount,
  onFilterDiscount,
  filterCategory,
  onFilterCategory,
  filterStock,
  onFilterStock,
  onAddProduct,
  onImport,
  onExport,
  onDeleteAll,
  hasActiveFilters,
  onResetFilters,
  totalFiltered,
  totalAll,
  lowStockCount,
}: ProductToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
      {/* ROW 1 — Search + Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari kode artikel atau model..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm rounded-lg border bg-input text-foreground pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Import — hanya buka modal, tidak ada logika parsing di sini */}
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg border bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload size={14} />
            Import Excel / CSV
          </button>

          <button
            onClick={onExport} // Fungsi dari props
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50"
          >
            <Download size={14} />
            Export (.xlsx)
          </button>

          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
            Kosongkan Data
          </button>

          <button
            onClick={onAddProduct}
            className="flex items-center gap-1 text-xs font-600 bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm"
          >
            <Plus size={14} />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* ROW 2 — Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrand(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Brand</option>
          {BRANDS.map((b) => (
            <option key={`filter-brand-${b}`} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filterDiscount}
          onChange={(e) => onFilterDiscount(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Diskon</option>
          {DISCOUNTS.map((d) => (
            <option key={`filter-disc-${d}`} value={d}>
              {d}%
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={`filter-cat-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filterStock}
          onChange={(e) => onFilterStock(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Stok</option>
          {STOCK_FILTERS.map((sf) => (
            <option key={`filter-stock-${sf.value}`} value={sf.value}>
              {sf.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-500 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw size={12} />
            Reset Filter
          </button>
        )}

        <div className="ml-auto flex items-center gap-3 text-2xs text-muted-foreground font-500">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle size={10} />
              {lowStockCount} Kritis
            </span>
          )}
          <span>
            Menampilkan{' '}
            <strong className="text-foreground">{totalFiltered}</strong> dari{' '}
            {totalAll} produk
          </span>
        </div>
      </div>
    </div>
  );
}
