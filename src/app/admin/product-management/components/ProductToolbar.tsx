'use client';

import React, { useRef, useState } from 'react';
import { Search, Plus, Upload, Download, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import type { Product } from '@/lib/mockData';

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
  onImport: (products: Product[]) => void;
  onExport: () => void;
  onDeleteAll: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  lowStockCount: number;
};

const BRANDS = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok', 'Puma', 'Nike', 'SKECHERS'];
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return;

        const separator = ',';
        const headers = lines[0]
          .replace(/^\uFEFF/, '')
          .split(separator)
          .map((h) => h.trim().replace(/^["']|["']$/g, ''));

        const productMap = new Map<string, Product>();

        lines.slice(1).forEach((line) => {
          if (!line.trim()) return;

          // Ekstraksi nilai CSV dengan penanganan tanda koma dalam tanda kutip ganda ""
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === separator && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const row: Record<string, string> = {};
          headers.forEach((h, i) => {
            row[h] = (values[i] ?? '').replace(/^"|"$/g, '').trim();
          });

          // Mengakomodasi key map Sport Station ("Article Code") maupun fallback format lama ("productCode")
          const productCode = row['Article Code'] || row['productCode'];
          if (!productCode) return;

          const modelName = row['Description'] || row['modelName'] || '';
          
          const origPriceRaw = String(row['originalPrice'] || '0').replace(/,/g, '');
          const originalPrice = Number(origPriceRaw);

          const discPriceRaw = String(row['DiscountPrice'] || '0').replace(/,/g, '');
          let discountedPrice = Number(discPriceRaw);

          let discountPercent: 0 | 10 | 20 | 30 = 0;
          if (originalPrice > 0 && !isNaN(discountedPrice)) {
            const computedDiffPct = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
            if (computedDiffPct >= 25) discountPercent = 30;
            else if (computedDiffPct >= 15) discountPercent = 20;
            else if (computedDiffPct >= 5) discountPercent = 10;
          }

          if (isNaN(discountedPrice) || discountedPrice <= 0) {
            discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
          }

          const rawSize = row['Size'] || row['sizeEU'] || '';
          const stock = Number(row['stock']) || 0;
          const imageUrl = row['imageUrl'] || '';
          const categoryInput = (row['Category'] || row['category'] || 'FOOTWEAR').toUpperCase();

          const sizes: any[] = [];
          if (rawSize.includes('-')) {
            const [start, end] = rawSize.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              for (let s = start; s <= end; s++) {
                sizes.push({ eu: String(s), uk: '', us: '', cm: '', stock });
              }
            }
          } else if (rawSize) {
            sizes.push({ eu: rawSize, uk: '', us: '', cm: '', stock });
          }

          if (productMap.has(productCode)) {
            const existing = productMap.get(productCode)!;
            if (sizes.length > 0) existing.sizes = [...existing.sizes, ...sizes];
          } else {
            productMap.set(productCode, {
              id: productCode,
              productCode,
              fullSkuCode: productCode,
              brand: modelName.toUpperCase().startsWith('PMA') ? 'Puma' : modelName.toUpperCase().startsWith('AIW') ? 'Airwalk' : 'Diadora',
              modelName,
              color: row['color'] || '',
              category: CATEGORIES.includes(categoryInput) ? (categoryInput as any) : 'FOOTWEAR',
              imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
              originalPrice,
              discountPercent,
              discountedPrice,
              sizes,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });

        onImport(Array.from(productMap.values()));
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.readAsText(file, 'UTF-8');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg border bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload size={14} /> Import CSV
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg border bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Kosongkan Data
          </button>

          <button
            onClick={onAddProduct}
            className="flex items-center gap-1 text-xs font-600 bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm"
          >
            <Plus size={14} /> Tambah Manual
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrand(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Brand</option>
          {BRANDS.map((b) => <option key={`filter-brand-${b}`} value={b}>{b}</option>)}
        </select>

        <select
          value={filterDiscount}
          onChange={(e) => onFilterDiscount(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Diskon</option>
          {DISCOUNTS.map((d) => <option key={`filter-disc-${d}`} value={d}>{d}%</option>)}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={`filter-cat-${c}`} value={c}>{c}</option>)}
        </select>

        <select
          value={filterStock}
          onChange={(e) => onFilterStock(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Stok</option>
          {STOCK_FILTERS.map((sf) => <option key={`filter-stock-${sf.value}`} value={sf.value}>{sf.label}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-500 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw size={12} /> Reset Filter
          </button>
        )}

        <div className="ml-auto flex items-center gap-3 text-2xs text-muted-foreground font-500">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle size={10} /> {lowStockCount} Kritis
            </span>
          )}
          <span>Menampilkan <strong className="text-foreground">{totalFiltered}</strong> dari {totalAll} produk</span>
        </div>
      </div>
    </div>
  );
}