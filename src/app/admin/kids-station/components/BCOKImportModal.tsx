'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { BCOKProduct } from '@/lib/bcokData';

// Format kolom BCOK / Kids Station:
// Article Code | Description | Brand | Category | GENDER |
// stock | originalPrice | DiscountPercent | DiscountPrice | imageUrl

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: BCOKProduct[]) => void;
};

export default function BCOKImportModal({ isOpen, onClose, onImport }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getVal = (row: Record<string, any>, keys: string[]): string => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
    return '';
  };

  const parseDiscount = (raw: string): number => {
    if (!raw || raw === '#VALUE!') return 0;
    const num = parseFloat(raw.replace('%', ''));
    return isNaN(num) ? 0 : Math.round(num);
  };

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

        const products: BCOKProduct[] = [];
        const seenCodes = new Set<string>();

        for (const row of jsonData) {
          const articleCode = getVal(row, ['Article Code', 'article_code', 'productCode', 'Kode Artikel']);
          if (!articleCode || seenCodes.has(articleCode)) {
            if (articleCode) seenCodes.add(articleCode); // skip duplicate
            continue;
          }
          seenCodes.add(articleCode);

          const discountPercent = parseDiscount(
            getVal(row, ['DiscountPercent', 'discount_percent', 'Diskon'])
          );

          const originalPriceRaw = Number(
            getVal(row, ['originalPrice', 'original_price', 'Harga Normal']).replace(/,/g, '') || '0'
          );

          const discountedPriceRaw = Number(
            getVal(row, ['DiscountPrice', 'discount_price', 'Harga Diskon']).replace(/,/g, '') || '0'
          );

          const discountedPrice = discountedPriceRaw > 0
            ? discountedPriceRaw
            : Math.round(originalPriceRaw * (1 - discountPercent / 100));

          const stock = Number(getVal(row, ['stock', 'Stock', 'Stok']) || '0');

          // Category: TOYS / ACCESSORIES / BAGS / HOME
          const rawCategory = getVal(row, ['Category', 'category', 'Kategori']).toUpperCase();
          const category = (['TOYS', 'ACCESSORIES', 'BAGS', 'HOME'].includes(rawCategory)
            ? rawCategory
            : 'TOYS') as BCOKProduct['category'];

          // Gender: KIDS / UNISEX / ALL
          const rawGender = getVal(row, ['GENDER', 'Gender', 'gender']).toUpperCase();
          const gender = (['KIDS', 'UNISEX', 'ALL'].includes(rawGender)
            ? rawGender
            : 'KIDS') as BCOKProduct['gender'];

          // Pick first non-empty imageUrl column
          const imageUrl =
            getVal(row, ['imageUrl', 'image_url', 'Gambar']) ||
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150';

          products.push({
            id: `bcok-${Date.now()}-${products.length}`,
            productCode: articleCode,
            modelName: getVal(row, ['Description', 'description', 'Deskripsi']) || 'No Name',
            brand: getVal(row, ['Brand', 'brand', 'Merek']) || 'Unknown',
            category,
            gender,
            stock,
            originalPrice: originalPriceRaw,
            discountPercent,
            discountedPrice,
            imageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (products.length === 0) {
          throw new Error('Tidak ada produk valid. Pastikan kolom "Article Code" terisi.');
        }

        setPreview(`${products.length} produk siap diimpor dari ${jsonData.length} baris data.`);
        onImport(products);
        setIsLoading(false);
        onClose();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal membaca file.');
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Gagal membaca file. Coba lagi.');
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.csv', '.xlsx', '.xls'].includes(ext)) {
      setError('Format tidak didukung. Gunakan CSV, XLSX, atau XLS.');
      return;
    }
    processFile(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Katalog BCOK / Kids Station">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-700">
              <p className="font-600">Error:</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {preview && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700">{preview}</p>
          </div>
        )}

        <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />

        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`p-10 border-2 border-dashed rounded-lg text-center transition-all ${
            isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:bg-slate-50 hover:border-orange-400'
          }`}
        >
          <Upload className="mx-auto text-slate-400" size={32} />
          <p className="mt-2 text-sm text-slate-600 font-500">
            {isLoading ? 'Memproses file...' : 'Klik untuk upload file BCOK'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Support CSV / XLSX / XLS</p>
        </div>

        {/* Column reference */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs font-600 text-orange-700 mb-2">Kolom yang dikenali dari template BCOK:</p>
          <div className="flex flex-wrap gap-1.5">
            {['Article Code', 'Description', 'Brand', 'Category', 'GENDER', 'stock', 'originalPrice', 'DiscountPercent', 'DiscountPrice', 'imageUrl'].map((col) => (
              <span key={col} className="text-2xs bg-white border border-orange-200 text-orange-700 px-2 py-0.5 rounded font-mono">
                {col}
              </span>
            ))}
          </div>
          <p className="text-2xs text-orange-600 mt-2">
            ⚠️ Kolom <strong>Category</strong> berisi: TOYS / ACCESSORIES / BAGS / HOME<br />
            ⚠️ Kolom <strong>GENDER</strong> berisi: KIDS / UNISEX / ALL
          </p>
        </div>

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
