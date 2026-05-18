'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { ChevronUp, ChevronDown, ChevronsUpDown, Edit2, Trash2, Eye, AlertTriangle, ChevronLeft, ChevronRight, Package } from 'lucide-react';
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
  Reebok: '#D97706',
};

const CATEGORY_LABELS: Record<string, string> = {
  MEN: 'Pria',
  WOMEN: 'Wanita',
  UNISEX: 'Unisex',
  KIDS: 'Anak',
  INFANT: 'Bayi',
};

function SortIcon({ colKey, sortKey, sortDir }: { colKey: string; sortKey: string; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== colKey) return <ChevronsUpDown size={13} className="text-muted-foreground opacity-40" />;
  return sortDir === 'asc'
    ? <ChevronUp size={13} style={{ color: 'var(--primary)' }} />
    : <ChevronDown size={13} style={{ color: 'var(--primary)' }} />;
}

const PAGE_SIZES = [5, 10, 20, 50];

export default function ProductTable({
  products, selectedIds, onSelectAll, onSelectRow,
  onEdit, onDelete, sortKey, sortDir, onSort,
  currentPage, totalPages, pageSize, totalFiltered,
  onPageChange, onPageSizeChange, lowStockProductIds,
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
          <table className="w-full text-sm" style={{ minWidth: '1000px' }}>
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--muted)' }}>
                {/* Checkbox */}
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                    aria-label="Pilih semua produk di halaman ini"
                  />
                </th>
                {/* Image */}
                <th className="px-4 py-3 w-16 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground">
                  Foto
                </th>
                {/* Brand */}
                <th
                  className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => onSort('brand')}
                >
                  <div className="flex items-center gap-1">
                    Brand
                    <SortIcon colKey="brand" sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
                {/* Model */}
                <th
                  className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => onSort('modelName')}
                >
                  <div className="flex items-center gap-1">
                    Model
                    <SortIcon colKey="modelName" sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
                {/* Code */}
                <th className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Kode Produk
                </th>
                {/* Color */}
                <th className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground">
                  Warna
                </th>
                {/* Category */}
                <th className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground">
                  Kategori
                </th>
                {/* Sizes */}
                <th className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Ukuran EU
                </th>
                {/* Stock */}
                <th
                  className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => onSort('totalStock')}
                >
                  <div className="flex items-center gap-1">
                    Total Stok
                    <SortIcon colKey="totalStock" sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
                {/* Price */}
                <th
                  className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => onSort('originalPrice')}
                >
                  <div className="flex items-center gap-1">
                    Harga
                    <SortIcon colKey="originalPrice" sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
                {/* Discount */}
                <th
                  className="px-4 py-3 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
                  onClick={() => onSort('discountPercent')}
                >
                  <div className="flex items-center gap-1">
                    Diskon
                    <SortIcon colKey="discountPercent" sortKey={sortKey} sortDir={sortDir} />
                  </div>
                </th>
                {/* Actions */}
                <th className="px-4 py-3 text-right text-2xs font-600 uppercase tracking-wider text-muted-foreground w-28">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                const isLowStock = lowStockProductIds.has(product.id);
                const isSelected = selectedIds.has(product.id);
                
                // PERBAIKAN DI SINI: Cukup ambil text langsung dari index ke-0 
                const sizeRange = product.sizes.length > 0
                  ? product.sizes[0].eu
                  : '—';

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
                        aria-label={`Pilih ${product.modelName}`}
                      />
                    </td>

                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                        <AppImage
                          src={product.imageUrl}
                          alt={`Foto ${product.brand} ${product.modelName} warna ${product.color}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3">
                      <span
                        className="text-2xs font-700 px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${BRAND_COLORS[product.brand]}18`,
                          color: BRAND_COLORS[product.brand],
                        }}
                      >
                        {product.brand}
                      </span>
                    </td>

                    {/* Model */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-500 text-foreground max-w-[180px] truncate">{product.modelName}</p>
                        {isLowStock && (
                          <AlertTriangle size={13} style={{ color: 'var(--warning)' }} className="flex-shrink-0" title="Stok rendah" />
                        )}
                      </div>
                    </td>

                    {/* Code */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">{product.productCode}</span>
                    </td>

                    {/* Color */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">{product.color}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-2xs font-500 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </span>
                    </td>

                    {/* Sizes */}
                    <td className="px-4 py-3">
                      {/* Tampilan teks ukuran bersih sesuai ketikan admin */}
                      <span className="text-xs font-tabular text-muted-foreground whitespace-nowrap">{sizeRange}</span>
                    </td>

                    {/* Total Stock */}
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-700 font-tabular"
                        style={{
                          color: totalStock === 0 ? 'var(--danger)' : totalStock <= 5 ? 'var(--warning)' : 'var(--success)',
                        }}
                      >
                        {totalStock}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <div>
                        {product.discountPercent > 0 && (
                          <p className="text-2xs price-original font-tabular">{formatIDR(product.originalPrice)}</p>
                        )}
                        <p className="text-sm font-700 font-tabular text-foreground">{formatIDR(product.discountedPrice)}</p>
                      </div>
                    </td>

                    {/* Discount badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                          product.discountPercent === 0 ? 'discount-badge-0' :
                          product.discountPercent === 50 ? 'discount-badge-50' :
                          product.discountPercent === 70 ? 'discount-badge-70' : 'discount-badge-80'
                        }`}
                      >
                        {product.discountPercent === 0 ? 'No disc.' : `-${product.discountPercent}%`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewProduct(product)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          title="Lihat detail produk"
                          aria-label={`Lihat detail ${product.modelName}`}
                        >
                          <Eye size={15} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg hover:bg-info-bg transition-colors"
                          title="Edit produk"
                          aria-label={`Edit ${product.modelName}`}
                        >
                          <Edit2 size={15} style={{ color: 'var(--info)' }} />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-bg transition-colors"
                          title="Hapus produk — tindakan tidak dapat dibatalkan"
                          aria-label={`Hapus ${product.modelName}`}
                        >
                          <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-xs rounded-lg border bg-input text-foreground px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
            >
              {PAGE_SIZES.map((s) => (
                <option key={`pgsize-${s}`} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {startItem}–{endItem} dari {totalFiltered}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman sebelumnya"
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
                    currentPage === page
                      ? 'text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  style={currentPage === page ? { backgroundColor: 'var(--primary)' } : {}}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {viewProduct && (
        <ProductDetailModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onEdit={(p) => { setViewProduct(null); onEdit(p); }}
        />
      )}
    </>
  );
}