'use client';

import React from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BCOKProduct } from '@/lib/bcokData';
import { formatIDR } from '@/lib/bcokData';
import AppImage from '@/components/ui/AppImage';

type Props = {
  products: BCOKProduct[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onEdit: (p: BCOKProduct) => void;
  onDelete: (id: string) => void;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (k: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalFiltered: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  lowStockProductIds: Set<string>;
};

const CATEGORY_COLORS: Record<string, string> = {
  TOYS:        'bg-purple-100 text-purple-700 border-purple-200',
  ACCESSORIES: 'bg-blue-100 text-blue-700 border-blue-200',
  BAGS:        'bg-amber-100 text-amber-700 border-amber-200',
  HOME:        'bg-green-100 text-green-700 border-green-200',
};

const DISCOUNT_COLORS: Record<number, string> = {
  0:  'bg-slate-100 text-slate-600',
  20: 'bg-yellow-100 text-yellow-700',
  30: 'bg-orange-100 text-orange-700',
  40: 'bg-rose-100 text-rose-700',
  50: 'bg-red-100 text-red-700',
  90: 'bg-red-600 text-white',
};

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: string; sortDir: 'asc' | 'desc' }) {
  if (sortKey !== col) return <ChevronsUpDown size={12} className="text-slate-400" />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-orange-500" />
    : <ChevronDown size={12} className="text-orange-500" />;
}

export default function BCOKProductTable({
  products, selectedIds, onSelectAll, onSelectRow, onEdit, onDelete,
  sortKey, sortDir, onSort, currentPage, totalPages, pageSize,
  totalFiltered, onPageChange, onPageSizeChange, lowStockProductIds,
}: Props) {
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id));

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded accent-orange-500 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-600 uppercase tracking-wider text-slate-500 w-16">Foto</th>
              {[
                { key: 'productCode', label: 'Kode Artikel' },
                { key: 'modelName', label: 'Deskripsi' },
                { key: 'brand', label: 'Brand' },
                { key: 'category', label: 'Kategori' },
                { key: 'stock', label: 'Stok' },
                { key: 'originalPrice', label: 'Harga Asli' },
                { key: 'discountPercent', label: 'Diskon' },
                { key: 'discountedPrice', label: 'Harga Jual' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => onSort(key)}
                  className="px-3 py-3 text-left text-xs font-600 uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-right text-xs font-600 uppercase tracking-wider text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-16 text-center text-sm text-slate-400">
                  Tidak ada produk ditemukan
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLow = lowStockProductIds.has(p.id);
                const isOut = p.stock === 0;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/60 transition-colors ${selectedIds.has(p.id) ? 'bg-orange-50/40' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={(e) => onSelectRow(p.id, e.target.checked)}
                        className="rounded accent-orange-500 cursor-pointer"
                      />
                    </td>

                    {/* Image */}
                    <td className="px-3 py-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-slate-100 flex-shrink-0">
                        <AppImage
                          src={p.imageUrl}
                          alt={p.modelName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Article Code */}
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-600 text-slate-700">{p.productCode}</span>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2 max-w-[200px]">
                      <p className="text-xs font-500 text-slate-800 truncate" title={p.modelName}>{p.modelName}</p>
                    </td>

                    {/* Brand */}
                    <td className="px-3 py-2">
                      <span className="text-xs text-slate-600 font-500">{p.brand}</span>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2">
                      <span className={`text-2xs font-600 px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.category}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-3 py-2">
                      <span
                        className={`text-sm font-700 font-tabular flex items-center gap-1 ${
                          isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-green-600'
                        }`}
                      >
                        {isLow && !isOut && <AlertTriangle size={11} />}
                        {p.stock}
                      </span>
                    </td>

                    {/* Original Price */}
                    <td className="px-3 py-2">
                      {p.discountPercent > 0 ? (
                        <span className="text-xs price-original font-tabular">{formatIDR(p.originalPrice)}</span>
                      ) : (
                        <span className="text-xs font-tabular text-slate-700">{formatIDR(p.originalPrice)}</span>
                      )}
                    </td>

                    {/* Discount */}
                    <td className="px-3 py-2">
                      <span className={`text-2xs font-700 px-2 py-0.5 rounded-full ${DISCOUNT_COLORS[p.discountPercent] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.discountPercent === 0 ? 'Normal' : `-${p.discountPercent}%`}
                      </span>
                    </td>

                    {/* Discounted Price */}
                    <td className="px-3 py-2">
                      <span className="text-sm font-700 font-tabular" style={{ color: 'var(--primary)' }}>
                        {formatIDR(p.discountedPrice)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-xs bg-white"
          >
            {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>dari <strong className="text-slate-700">{totalFiltered}</strong> produk</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-600 px-2">
            Halaman <strong>{currentPage}</strong> dari {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
