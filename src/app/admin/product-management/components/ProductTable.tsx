'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { Product } from '@/lib/mockData';
import { formatIDR } from '@/lib/mockData';
import ProductDetailModal from './ProductDetailModal';

type ProductTableProps = {
  products: Product[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFiltered: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  lowStockProductIds: Set<string>;
};

const BRAND_COLORS: Record<string, string> = {
  Airwalk: '#1D4ED8',
  Converse: '#DC2626',
  Diadora: '#059669',
  'New Balance': '#7C3AED',
  Reebok: '#0F172A',
  Puma: '#EA580C',
  Nike: '#E11D48',
  SKECHERS: '#2563EB',
};

const SizeBadge = ({ size, stock }: { size: string, stock: number }) => (
  <span 
    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60"
    title={`Stok: ${stock}`}
  >
    {size}
    <span className="opacity-50 font-normal">({stock})</span>
  </span>
);

export default function ProductTable({
  products,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
  onDelete,
  sortKey,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  pageSize,
  totalFiltered,
  onPageChange,
  onPageSizeChange,
  lowStockProductIds,
}: ProductTableProps) {
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id)) && !allSelected;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalFiltered);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (products.length === 0 && totalFiltered === 0) {
    return (
      <div className="bg-card rounded-xl border shadow-card">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={48} className="text-muted-foreground opacity-20 mb-4" />
          <p className="text-base font-600 text-foreground mb-1">Tidak ada produk ditemukan</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Coba ubah filter pencarian atau tambahkan produk baru ke katalog
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-xl border shadow-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm" style={{ minWidth: '1250px' }}>
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--muted)' }}>
                <th className="px-4 py-3 w-10 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground w-16">Foto</th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('modelName')}>
                  <div className="flex items-center gap-1">Info Produk {renderSortIcon('modelName')}</div>
                </th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('productType')}>
                  <div className="flex items-center gap-1">Kategori {renderSortIcon('productType')}</div>
                </th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('category')}>
                  <div className="flex items-center gap-1">Gender {renderSortIcon('category')}</div>
                </th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('brand')}>
                  <div className="flex items-center gap-1">Brand {renderSortIcon('brand')}</div>
                </th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground">Warna</th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground">Ukuran</th>
                <th className="px-4 py-3 text-left font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('stock')}>
                  <div className="flex items-center gap-1">Stok {renderSortIcon('stock')}</div>
                </th>
                <th className="px-4 py-3 text-right font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('originalPrice')}>
                  <div className="flex items-center gap-1 justify-end">Harga Normal {renderSortIcon('originalPrice')}</div>
                </th>
                <th className="px-4 py-3 text-right font-600 text-muted-foreground cursor-pointer" onClick={() => onSort('discountPercent')}>
                  <div className="flex items-center gap-1 justify-end">Diskon {renderSortIcon('discountPercent')}</div>
                </th>
                <th className="px-4 py-3 text-right font-600 text-muted-foreground">Harga Diskon</th>
                <th className="px-4 py-3 text-center font-600 text-muted-foreground w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = Array.isArray(product.sizes)
                  ? product.sizes.reduce((s, sz) => s + (Number(sz?.stock) || 0), 0)
                  : 0;

                const isSelected = selectedIds.has(product.id);
                
                const sizeList = product.sizes && product.sizes.length > 0
                  ? product.sizes.map(s => s.eu).sort((a,b)=>parseFloat(a)-parseFloat(b)).join(', ')
                  : '—';

                const brandColor = BRAND_COLORS[product.brand] || '#64748b';

                // PEMBENARAN 1: Tipe kategori murni diambil dari productType bawaan parser CSV
                const rawType = (product as any).productType || 'FOOTWEAR';
                const displayCategory = rawType.toUpperCase() === 'APPAREL' ? 'Apparel' : 'Footwear';

                // PEMBENARAN 2: Target gender murni dibaca dari category database bawaan
                const rawGender = product.category || 'UNISEX';
                let displayGender = 'Unisex';
                if (rawGender.toUpperCase() === 'MEN') displayGender = 'Men';
                if (rawGender.toUpperCase() === 'WOMEN') displayGender = 'Women';

                return (
                  <tr
                    key={product.id}
                    className={`border-b last:border-0 transition-colors group ${
                      isSelected ? 'bg-accent/50' : 'hover:bg-muted/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelectRow(product.id, e.target.checked)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                    </td>

                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="w-11 h-11 rounded-lg overflow-hidden border bg-muted flex-shrink-0 shadow-sm">
                        <AppImage
                          src={product.imageUrl}
                          alt={`Foto ${product.brand}`}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                    </td>

                    {/* Info Model Name & Sku */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-600 text-foreground text-sm max-w-[220px] truncate">{product.modelName}</span>
                        <span className="text-3xs font-mono text-muted-foreground">{product.productCode}</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-600 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                        {displayCategory}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground font-500">
                        {displayGender}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3">
                      <span
                        className="text-3xs font-700 px-1.5 py-0.5 rounded whitespace-nowrap"
                        style={{
                          backgroundColor: `${brandColor}15`,
                          color: brandColor,
                        }}
                      >
                        {product.brand}
                      </span>
                    </td>

                    {/* Warna */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground font-500">{product.color || '—'}</span>
                    </td>

                    {/* Ukuran Gabungan */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {product.sizes && product.sizes.length > 0 ? (
                          product.sizes
                            .sort((a, b) => parseFloat(a.eu) - parseFloat(b.eu))
                            .map((sz, idx) => (
                              <SizeBadge key={`${product.id}-${idx}`} size={sz.eu} stock={sz.stock} />
                            ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    {/* Stok Terhitung */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-700 ${totalStock === 0 ? 'text-red-500' : 'text-slate-700'}`}>
                        {totalStock} pcs
                      </span>
                    </td>

                    {/* Harga Retail (Harga Normal) */}
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatIDR(product.originalPrice)}
                    </td>

                    {/* Diskon */}
                    <td className="px-4 py-3 text-right">
                      {product.discountPercent > 0 ? (
                        <span className="text-3xs font-700 text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                          -{product.discountPercent}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-500">0%</span>
                      )}
                    </td>

                    {/* Harga Jual (Harga Diskon) */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-700 text-emerald-600">
                        {formatIDR(product.discountedPrice || product.originalPrice)}
                      </span>
                    </td>

                    {/* Tombol Navigasi Aksi */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewProduct(product)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bagian Footer Pagination Utama */}
        <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-muted-foreground font-500">
            Menampilkan <span className="font-600 text-foreground">{startItem}</span>-{''}
            <span className="font-600 text-foreground">{endItem}</span> dari{''}
            <span className="font-600 text-foreground"> {totalFiltered}</span> produk
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-500">
              <span>Baris per halaman:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border bg-input rounded-md px-1.5 py-0.5 text-foreground focus:outline-none text-xs font-600 cursor-pointer"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={`ps-${size}`} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} className="text-muted-foreground" />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`pgdot-${idx}`} className="px-2 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={`pgnum-${page}`}
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-500 transition-all ${
                      currentPage === page ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={(p) => {
            setViewProduct(null);
            onEdit(p);
          }}
        />
      )}
    </>
  );
}