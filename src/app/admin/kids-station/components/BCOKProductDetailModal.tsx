'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import AppImage from '@/components/ui/AppImage';
import { Edit2, AlertTriangle, Package } from 'lucide-react';
import type { BCOKProduct } from '@/lib/bcokData';
import { formatIDR } from '@/lib/bcokData';

type Props = {
  product: BCOKProduct;
  onClose: () => void;
  onEdit: (product: BCOKProduct) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  TOYS:        '🧸 Mainan',
  ACCESSORIES: '🎒 Aksesori',
  BAGS:        '👜 Tas',
  HOME:        '🏠 Rumah',
};

const DISCOUNT_COLORS: Record<number, string> = {
  0:  'bg-slate-100 text-slate-600',
  20: 'bg-yellow-100 text-yellow-700',
  30: 'bg-orange-100 text-orange-700',
  40: 'bg-rose-100 text-rose-700',
  50: 'bg-red-100 text-red-700',
  90: 'bg-red-600 text-white',
};

export default function BCOKProductDetailModal({ product, onClose, onEdit }: Props) {
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 3;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Detail Produk"
      subtitle={`${product.brand} — ${product.modelName}`}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-500 text-muted-foreground bg-muted rounded-lg hover:bg-border transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-600 text-white rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Edit2 size={14} />
            Edit Produk
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
            <AppImage
              src={product.imageUrl}
              alt={product.modelName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-700 text-foreground leading-tight">{product.modelName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{product.brand}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-2xs font-600 px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>
              <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${DISCOUNT_COLORS[product.discountPercent] ?? 'bg-slate-100 text-slate-600'}`}>
                {product.discountPercent === 0 ? 'Harga Normal' : `Diskon ${product.discountPercent}%`}
              </span>
              <span className="text-2xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-600">
                {product.gender}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {product.discountPercent > 0 && (
              <p className="text-xs price-original font-tabular">{formatIDR(product.originalPrice)}</p>
            )}
            <p className="text-xl font-700 font-tabular" style={{ color: 'var(--primary)' }}>
              {formatIDR(product.discountedPrice)}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/50">
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Kode Artikel</p>
            <p className="text-xs font-600 font-mono text-foreground">{product.productCode}</p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Kategori</p>
            <p className="text-xs font-600 text-foreground">{product.category}</p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Harga Asli</p>
            <p className="text-xs font-600 font-tabular text-foreground">{formatIDR(product.originalPrice)}</p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Harga Jual</p>
            <p className="text-xs font-700 font-tabular" style={{ color: 'var(--primary)' }}>
              {formatIDR(product.discountedPrice)}
            </p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Diperbarui</p>
            <p className="text-xs text-foreground">
              {new Date(product.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Target</p>
            <p className="text-xs font-600 text-foreground">{product.gender}</p>
          </div>
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-3 p-4 rounded-xl border">
          <div className={`p-2 rounded-lg ${isOut ? 'bg-red-50' : isLow ? 'bg-amber-50' : 'bg-green-50'}`}>
            {isLow ? (
              <AlertTriangle size={20} className="text-amber-500" />
            ) : (
              <Package size={20} className={isOut ? 'text-red-500' : 'text-green-500'} />
            )}
          </div>
          <div>
            <p className="text-2xs text-muted-foreground">Stok Tersedia</p>
            <p
              className="text-2xl font-800 font-tabular"
              style={{ color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)' }}
            >
              {product.stock} <span className="text-sm font-500 text-muted-foreground">unit</span>
            </p>
          </div>
          <div className="ml-auto">
            {isOut ? (
              <span className="text-xs font-700 px-3 py-1.5 rounded-full bg-red-100 text-red-600">Stok Habis</span>
            ) : isLow ? (
              <span className="text-xs font-700 px-3 py-1.5 rounded-full bg-amber-100 text-amber-600">Stok Kritis</span>
            ) : (
              <span className="text-xs font-700 px-3 py-1.5 rounded-full bg-green-100 text-green-600">Stok Aman</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
