'use client';

import React, { useRef } from 'react';
import { Search, Plus, Upload, Download, X, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

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
  onImport: (data: any[]) => void; // Menerima array data hasil parse
  onExport: () => void;
  onDeleteAll: () => void; // Prop untuk aksi hapus semua data
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  lowStockCount: number;
};

const BRANDS = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok','Puma','Nike','SKECHERS',];
const DISCOUNTS = ['0', '10', '20', '30'];
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
  onDeleteAll,
  hasActiveFilters, onResetFilters,
  totalFiltered, totalAll,
  lowStockCount,
}: ProductToolbarProps) {
  
  // Ref untuk memicu input file HTML bawaan
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi membaca file CSV saat user memilih file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      let text = event.target?.result as string;
      if (!text) return;

      // Bersihkan BOM karakter (\uFEFF) jika diekspor dari Excel
      if (text.startsWith('\uFEFF')) {
        text = text.substring(1);
      }

      // Memisah baris text dan membuang baris kosong
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      if (lines.length === 0) return;
      
      // Auto-detect pemisah kolom (, atau ;)
      const firstLine = lines[0];
      const separator = firstLine.includes(';') ? ';' : ',';

      // Mengambil dan membersihkan header dari tanda petik, spasi, dan dibuat lowercase alternatif
      const headers = firstLine.split(separator).map(h => 
        h.trim().replace(/^["']|["']$/g, '').toLowerCase()
      );

      // Mapping isi baris CSV menjadi Array of Object
      const parsedData = lines.slice(1).map(line => {
        // Pemisahan kolom pintar yang mengabaikan pemisah di dalam tanda petik ganda ""
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes; // Toggle status jika di dalam tanda petik
          } else if (char === separator && !inQuotes) {
            values.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^["']|["']$/g, '')); // Masukkan kolom terakhir

        const obj: any = {};
        headers.forEach((header, index) => {
          // Menyesuaikan mapping key agar dibaca dengan benar oleh sistem ImportModal / ProductFormModal Anda
          let key = header;
          if (header.includes('productcode')) key = 'productcode';
          if (header.includes('brand')) key = 'brand';
          if (header.includes('modelname')) key = 'modelname';
          if (header.includes('color')) key = 'color';
          if (header.includes('category')) key = 'category';
          if (header.includes('originalprice')) key = 'originalprice';
          if (header.includes('discountpercent')) key = 'discountpercent';
          if (header.includes('discountedprice')) key = 'discountedprice';
          if (header.includes('image')) key = 'image';

          // Mapping data internal sizes seandainya ditarik kembali dari file export
          if (header.includes('sizes')) {
            // Jika ada text format "40 (5 pcs) | 41 (12 pcs)", ubah balik ke Array Object
            const sizesRaw = values[index] || '';
            if (sizesRaw && sizesRaw !== '-') {
              obj['sizes'] = sizesRaw.split('|').map(item => {
                const match = item.trim().match(/^([a-zA-Z0-9.\-/]+)\s*\((\d+)\s*pcs\)$/);
                return match ? { size: match[1], stock: Number(match[2]) } : null;
              }).filter(Boolean);
            }
          }

          obj[key] = values[index] || '';
        });
        return obj;
      });

      // Kirim hasil olahan data ke komponen utama (ImportModal / ProductManagementContent)
      onImport(parsedData);
      
      // Reset input agar bisa upload file yang sama jika dibutuhkan kembali
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="bg-card rounded-xl border shadow-card p-4 space-y-3">
      {/* Input File Tersembunyi */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

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
        {totalAll > 0 && (
          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-500 text-red-600 bg-red-50 hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 size={15} />
            <span className="hidden sm:inline">Hapus Semua</span>
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
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
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrand(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Brand</option>
          {BRANDS.map((b) => <option key={`filter-brand-${b}`} value={b}>{b}</option>)}
        </select>

        <select
          value={filterDiscount}
          onChange={(e) => onFilterDiscount(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Diskon</option>
          {DISCOUNTS.map((d) => <option key={`filter-disc-${d}`} value={d}>Diskon {d}%</option>)}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => <option key={`filter-cat-${c}`} value={c}>{c}</option>)}
        </select>

        <select
          value={filterStock}
          onChange={(e) => onFilterStock(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Semua Stok</option>
          {STOCK_FILTERS.map((sf) => <option key={`filter-stock-${sf.value}`} value={sf.value}>{sf.label}</option>)}
        </select>

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