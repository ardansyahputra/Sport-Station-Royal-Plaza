'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import AppImage from '@/components/ui/AppImage';
import { Edit2, AlertTriangle } from 'lucide-react';
import type { Product } from '@/lib/mockData';
import { formatIDR } from '@/lib/mockData';

type Props = {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  MEN: 'Pria (A/M)',
  WOMEN: 'Wanita (A/W)',
  UNISEX: 'Unisex (A/U)',
  KIDS: 'Anak (K/U)',
  INFANT: 'Bayi',
};

export default function ProductDetailModal({ product, onClose, onEdit }: Props) {
  const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Detail Produk"
      subtitle={`${product.brand} — ${product.modelName}`}
      size="xl"
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
        {/* Header info */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden border bg-muted flex-shrink-0">
            <AppImage
              src={product.imageUrl}
              alt={`Foto ${product.brand} ${product.modelName} warna ${product.color}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-700 text-foreground">{product.modelName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{product.brand} · {product.color}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-2xs font-600 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>
              <span
                className={`text-xs font-700 px-2 py-0.5 rounded-full ${
                  product.discountPercent === 0 ? 'discount-badge-0' :
                  product.discountPercent === 50 ? 'discount-badge-50' :
                  product.discountPercent === 70 ? 'discount-badge-70': 'discount-badge-80'
                }`}
              >
                {product.discountPercent === 0 ? 'Harga Normal' : `Diskon ${product.discountPercent}%`}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {product.discountPercent > 0 && (
              <p className="text-xs price-original font-tabular">{formatIDR(product.originalPrice)}</p>
            )}
            <p className="text-lg font-700 font-tabular" style={{ color: 'var(--primary)' }}>
              {formatIDR(product.discountedPrice)}
            </p>
          </div>
        </div>

        {/* Codes */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/50">
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Kode Produk</p>
            <p className="text-xs font-600 font-mono text-foreground">{product.productCode}</p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Full SKU Code</p>
            <p className="text-xs font-600 font-mono text-foreground">{product.fullSkuCode}</p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Total Stok</p>
            <p
              className="text-sm font-700 font-tabular"
              style={{ color: totalStock === 0 ? 'var(--danger)' : totalStock <= 5 ? 'var(--warning)' : 'var(--success)' }}
            >
              {totalStock} unit
            </p>
          </div>
          <div>
            <p className="text-2xs text-muted-foreground mb-0.5">Diperbarui</p>
            <p className="text-xs text-foreground">{new Date(product.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Size-stock table */}
        <div>
          <p className="text-sm font-600 text-foreground mb-2">Ukuran & Stok</p>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted">
                  {['EU', 'UK', 'US', 'CM', 'Stok', 'Status'].map((h) => (
                    <th key={`dth-${h}`} className="px-3 py-2 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((size) => (
                  <tr key={`size-detail-${product.id}-eu${size.eu}`} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-600 font-tabular text-foreground">{size.eu}</td>
                    <td className="px-3 py-2 text-muted-foreground">{size.uk}</td>
                    <td className="px-3 py-2 text-muted-foreground">{size.us}</td>
                    <td className="px-3 py-2 text-muted-foreground">{size.cm}</td>
                    <td className="px-3 py-2 font-700 font-tabular" style={{ color: size.stock === 0 ? 'var(--danger)' : size.stock <= 3 ? 'var(--warning)' : 'var(--success)' }}>
                      {size.stock}
                    </td>
                    <td className="px-3 py-2">
                      {size.stock === 0 ? (
                        <span className="flex items-center gap-1 text-2xs font-600" style={{ color: 'var(--danger)' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-danger" />Habis
                        </span>
                      ) : size.stock <= 3 ? (
                        <span className="flex items-center gap-1 text-2xs font-600" style={{ color: 'var(--warning)' }}>
                          <AlertTriangle size={10} />Kritis
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-2xs font-600" style={{ color: 'var(--success)' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />Aman
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}