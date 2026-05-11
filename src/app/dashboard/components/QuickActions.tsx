import React from 'react';
import Link from 'next/link';
import { Plus, Download, Upload, Package } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/product-management"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-600 text-white transition-all duration-150 active:scale-95 shadow-card hover:shadow-card-hover"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        <Plus size={16} />
        Tambah Produk
      </Link>
      <Link
        href="/product-management"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-500 text-muted-foreground bg-card border hover:bg-muted transition-all duration-150 active:scale-95"
      >
        <Upload size={16} />
        Import CSV
      </Link>
      <Link
        href="/product-management"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-500 text-muted-foreground bg-card border hover:bg-muted transition-all duration-150 active:scale-95"
      >
        <Download size={16} />
        Export Data
      </Link>
      <Link
        href="/product-management"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-500 bg-card border hover:bg-muted transition-all duration-150 active:scale-95"
        style={{ color: 'var(--primary)' }}
      >
        <Package size={16} />
        Lihat Semua Produk
      </Link>
    </div>
  );
}