'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Product } from '@/lib/mockData';

// Struktur kolom sesuai template Excel:
// Article Code | Description | Brand | Gender | ProductType | Color | Size |
// stock | originalPrice | DiscountPercent | DiscountPrice | imageUrl

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
};

type SizeEntry = {
  eu: string;
  uk: string;
  us: string;
  cm: string;
  stock: number;
};

type ProductDraft = {
  productCode: string;
  modelName: string;
  brand: string;
  category: string;   // gender: MEN / WOMEN / UNISEX / KIDS
  productType: string; // FOOTWEAR / APPAREL / ACCESSORIES
  subType: string;    // RUNNING / CASUAL LACE-UPS / TRAINING / dll
  color: string;
  imageUrl: string;
  originalPrice: number;
  discountPercent: number;
  discountedPrice: number;
  sizes: SizeEntry[];
};

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
}: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --------------------------------------------------
      HELPER — ambil nilai dari row dengan fallback key
  -------------------------------------------------- */
  const getVal = (row: Record<string, any>, keys: string[]): string => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
        return String(row[k]).trim();
      }
    }
    return '';
  };

  /* --------------------------------------------------
      CORE — proses file Excel / CSV
  -------------------------------------------------- */
  const processFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    setPreview(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);

        const workbook = XLSX.read(data, { type: 'array' });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          defval: '',
          raw: false,
        });

        if (!jsonData || jsonData.length === 0) {
          throw new Error('File tidak memiliki data atau sheet kosong.');
        }

        /* ---- MAP: productCode → ProductDraft ---- */
        const productMap = new Map<string, ProductDraft>();

        for (const row of jsonData) {
          // --- Article Code (wajib ada) ---
          const articleCode = getVal(row, [
            'Article Code',
            'article_code',
            'Artikel Kode',
            'productCode',
          ]);

          if (!articleCode) {
            console.warn('Row dilewati karena tidak ada Article Code:', row);
            continue;
          }

          // --- Size ---
          const sizeEu = getVal(row, ['Size', 'size', 'Ukuran', 'sizeEU']);

          // --- Stock ---
          const stock = Number(
            getVal(row, ['stock', 'Stock', 'Stok']) || '0'
          );

          // --- Base product (hanya dibuat sekali per articleCode) ---
          if (!productMap.has(articleCode)) {
            // Price — hapus separator ribuan sebelum konversi
            const originalPrice = Number(
              getVal(row, [
                'originalPrice',
                'original_price',
                'Harga Normal',
              ]).replace(/,/g, '')
            );

            const discountedPriceRaw = Number(
              getVal(row, [
                'DiscountPrice',
                'discount_price',
                'Harga Diskon',
              ]).replace(/,/g, '')
            );

            const discountPercent = Number(
              getVal(row, [
                'DiscountPercent',
                'discount_percent',
                'Diskon',
              ]) || '0'
            );

            // Jika DiscountPrice tidak diisi, hitung otomatis
            const discountedPrice =
              discountedPriceRaw > 0
                ? discountedPriceRaw
                : Math.round(originalPrice * (1 - discountPercent / 100));

            const brand = getVal(row, ['Brand', 'brand', 'Merek']) || 'Unknown';

            // ✅ FIX UTAMA: Baca kolom "Gender" dari Excel → simpan ke field category
            // Kolom di Excel bernama "Gender" bukan "Category"
            const category = (
              getVal(row, [
                'Gender',   // ← kolom utama di Excel kamu
                'gender',
                'Category',
                'category',
                'Kategori',
              ]) || 'UNISEX'
            ).toUpperCase();

            // ✅ FIX: Baca kolom "ProductType" dari Excel dengan benar
            const productType = (
              getVal(row, [
                'ProductType',
                'productType',
                'Product Type',
              ]) || 'FOOTWEAR'
            ).toUpperCase();

            // ✅ Baca kolom "Type" (sub-tipe spesifik: RUNNING, CASUAL LACE-UPS, dll)
            const subType = getVal(row, ['Type', 'type', 'SubType', 'subType']) || '';

            productMap.set(articleCode, {
              productCode: articleCode,
              modelName:
                getVal(row, ['Description', 'description', 'Deskripsi']) ||
                'No Name',
              brand,
              category,
              productType,
              subType,
              color: getVal(row, ['Color', 'color', 'Warna']) || '-',
              imageUrl: getVal(row, ['imageUrl', 'image_url', 'Gambar']),
              originalPrice,
              discountPercent,
              discountedPrice,
              sizes: [],
            });
          }

          const product = productMap.get(articleCode)!;

          /* ---- SIZE RANGE: "40-45" → expand jadi tiap size ---- */
          if (sizeEu.includes('-')) {
            const [start, end] = sizeEu.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
              for (let s = start; s <= end; s++) {
                const sStr = String(s);
                const existing = product.sizes.find((x) => x.eu === sStr);
                if (existing) {
                  existing.stock += stock;
                } else {
                  product.sizes.push({ eu: sStr, uk: '', us: '', cm: '', stock });
                }
              }
              continue;
            }
          }

          /* ---- SIZE NORMAL: satu nilai ---- */
          if (sizeEu && sizeEu !== '0') {
            const existing = product.sizes.find((x) => x.eu === sizeEu);
            if (existing) {
              existing.stock += stock;
            } else {
              product.sizes.push({ eu: sizeEu, uk: '', us: '', cm: '', stock });
            }
          }
        }

        /* ---- Konversi Map → Product[] ---- */
        const products: Product[] = Array.from(productMap.values()).map(
          (p, index) => ({
            id: `prod-${Date.now()}-${index}`,
            productCode: p.productCode,
            fullSkuCode: p.productCode,
            modelName: p.modelName,
            brand: p.brand,
            category: p.category as Product['category'],
            productType: p.productType as Product['productType'],
            subType: p.subType,
            color: p.color,
            imageUrl:
              p.imageUrl ||
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
            originalPrice: p.originalPrice,
            discountPercent: p.discountPercent as Product['discountPercent'],
            discountedPrice: p.discountedPrice,
            sizes:
              p.sizes.length > 0
                ? p.sizes
                : [{ eu: '0', uk: '', us: '', cm: '', stock: 0 }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        );

        if (products.length === 0) {
          throw new Error(
            'Tidak ada produk valid ditemukan. Pastikan kolom "Article Code" terisi.'
          );
        }

        setPreview(
          `${products.length} produk siap diimpor dari ${jsonData.length} baris data.`
        );

        console.log('[ImportModal] Parsed products sample:', products.slice(0, 3));

        onImport(products);
        setIsLoading(false);
        onClose();

        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('[ImportModal] Error:', err);
        setError(
          err instanceof Error ? err.message : 'Gagal membaca file.'
        );
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Gagal membaca file. Coba lagi.');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  /* --------------------------------------------------
      FILE CHANGE HANDLER
  -------------------------------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();

    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      setError('Format tidak didukung. Gunakan file CSV, XLSX, atau XLS.');
      return;
    }

    processFile(file);
  };

  /* --------------------------------------------------
      RENDER
  -------------------------------------------------- */
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Produk">
      <div className="space-y-4">
        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle
              size={16}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <div className="text-xs text-red-700">
              <p className="font-600">Error:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success preview */}
        {preview && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2
              size={16}
              className="text-green-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-green-700">{preview}</p>
          </div>
        )}

        {/* Drop zone */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
        />

        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed rounded-lg text-center transition-all ${
            isLoading
              ? 'opacity-50 cursor-wait'
              : 'cursor-pointer hover:bg-slate-50 hover:border-primary'
          }`}
        >
          <Upload className="mx-auto text-slate-400" size={32} />
          <p className="mt-2 text-sm text-slate-600 font-500">
            {isLoading ? 'Memproses file...' : 'Klik untuk upload file'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Support CSV / XLSX / XLS
          </p>
        </div>

        {/* Kolom yang dikenali */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs font-600 text-slate-600 mb-2">
            Kolom yang dikenali dari template:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Article Code',
              'Description',
              'Brand',
              'Gender',
              'ProductType',
              'Color',
              'Size',
              'stock',
              'originalPrice',
              'DiscountPercent',
              'DiscountPrice',
              'imageUrl',
            ].map((col) => (
              <span
                key={col}
                className="text-2xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Loader2 className="animate-spin" size={16} />
            <span>Membaca data...</span>
          </div>
        )}
      </div>
    </Modal>
  );
}