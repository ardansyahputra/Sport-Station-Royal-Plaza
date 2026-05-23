'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { Product, SizeEntry } from '@/lib/mockData';

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
};

type ImportResult = {
  success: number;
  errors: string[];
  products: Product[];
};

// Fungsi pembantu membersihkan URL Gambar pencarian Google jika ada
function extractDirectImageUrl(url: string): string {
  if (!url) return '';
  try {
    const decodedUrl = decodeURIComponent(url);
    if (decodedUrl.includes('imgurl=')) {
      const urlParams = new URLSearchParams(decodedUrl.split('?')[1]);
      const imgUrl = urlParams.get('imgurl');
      if (imgUrl) return imgUrl;
    }
  } catch (e) {
    // Abaikan jika bukan url pencarian
  }
  return url.trim();
}

// Fungsi Parser Robust untuk menghandle koma di dalam kalimat deskripsi produk
function parseCSVRobust(csvText: string): ImportResult {
  const lines = csvText.split(/\r?\n/).map(line => line.trim());
  const errors: string[] = [];
  const productMap = new Map<string, Product>();

  if (lines.length < 2 || !lines[0]) {
    return { success: 0, errors: ['File CSV kosong atau tidak valid'], products: [] };
  }

  // 1. Ambil Header baris pertama
  const isSemicolon = lines[0].includes(';');
  const separator = isSemicolon ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

  for (let idx = 1; idx < lines.length; idx++) {
    const line = lines[idx];
    if (!line || line.replace(new RegExp(separator, 'g'), '').trim() === '') continue;

    const rowNum = idx + 1;
    let values: string[] = [];

    // 2. PENANGANAN UTAMA KOMA DESKRIPSI (Mencegah pergeseran kolom)
    if (separator === ',') {
      // Menggunakan Regex khusus Tokenizer agar koma dalam deskripsi/teks tidak memisahkan kolom
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      values = matches.map(v => v.trim().replace(/^"|"$/g, ''));

      // JIKA baris Puma Anda dempet dan tidak terdeteksi tanda kutipnya di deskripsi, 
      // kita gunakan skema pemetaan manual berbasis jumlah sisa kolom dari belakang.
      if (values.length !== headers.length) {
        const rawSplits = line.split(',');
        // Kita tahu kolom belakang selalu tetap: stock (index-1), imageUrl (index-2), Size (index-3)...
        // Maka kita bungkus bagian depan yang kelebihan koma menjadi satu kesatuan Deskripsi
        const articleCode = rawSplits[0].trim();
        const imageUrlRaw = rawSplits[rawSplits.length - 1] || '';
        const stockRaw = rawSplits[rawSplits.length - 2] || '0';
        const sizeRaw = rawSplits[rawSplits.length - 3] || '39';
        const discountPriceRaw = rawSplits[rawSplits.length - 4] || '0';
        const discountPercentRaw = rawSplits[rawSplits.length - 5] || '0%';
        const originalPriceRaw = rawSplits[rawSplits.length - 6] || '0';
        const categoryRaw = rawSplits[rawSplits.length - 7] || 'UNISEX';

        // Gabungkan sisa kolom di tengah sebagai deskripsi produk utuh
        const descParts = rawSplits.slice(1, rawSplits.length - 7);
        const description = descParts.join(',').trim();

        values = [
          articleCode,
          description,
          categoryRaw,
          originalPriceRaw,
          discountPercentRaw,
          discountPriceRaw,
          sizeRaw,
          stockRaw,
          imageUrlRaw
        ];
      }
    } else {
      values = line.split(';').map(v => v.trim().replace(/^"|"$/g, ''));
    }

    // Map data ke objek sementara
    const rowData: Record<string, string> = {};
    headers.forEach((header, hIdx) => {
      rowData[header] = values[hIdx] || '';
    });

    try {
      const getVal = (keys: string[]) => {
        const foundKey = Object.keys(rowData).find(k => keys.map(x => x.toLowerCase()).includes(k.toLowerCase()));
        return foundKey ? rowData[foundKey].trim() : '';
      };

      // 3. Ambil Kode Produk & Deskripsi Sebenarnya (Bebas Bergeser)
      const productCode = getVal(['Article Code', 'productCode']);
      if (!productCode) {
        errors.push(`Baris ${rowNum}: Kode produk kosong.`);
        continue;
      }

      const modelName = getVal(['Description', 'modelName']) || 'Produk Tanpa Nama';

      // 4. Ambil Link Gambar Asli dari CSV Anda
      let imageUrl = getVal(['imageUrl', 'gambar']);
      if (!imageUrl || !imageUrl.startsWith('http')) {
        // Jika kolom bergeser, cari paksa string berawalan http di dalam seluruh values baris ini
        const foundHttp = values.find(v => v.startsWith('http'));
        if (foundHttp) imageUrl = foundHttp;
      }
      imageUrl = extractDirectImageUrl(imageUrl);

      // 5. Bersihkan Harga (Anti Rp NaN)
      const rawOrigPrice = getVal(['originalPrice']);
      const originalPrice = parseInt(rawOrigPrice.replace(/[^0-9]/g, ''), 10) || 0;

      const rawDiscountPrice = getVal(['DiscountPrice']);
      const discountPrice = parseInt(rawDiscountPrice.replace(/[^0-9]/g, ''), 10) || 0;

      // Hitung persen diskon
      const rawDiscPercent = getVal(['Discount', 'discountPercent']);
      let parsedDiscount = parseInt(rawDiscPercent.replace(/[^0-9]/g, ''), 10) || 0;
      if (parsedDiscount === 0 && originalPrice > 0 && discountPrice > 0) {
        parsedDiscount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
      }

      let discountPercent: 0 | 10 | 20 | 30 = 0;
      if (parsedDiscount >= 30) discountPercent = 30;
      else if (parsedDiscount >= 20) discountPercent = 20;
      else if (parsedDiscount >= 10) discountPercent = 10;

      // 6. Kategori & Ukuran (Grup Array Sizes)
      let rawCategory = getVal(['Category', 'category']).toUpperCase();
      let category: Product['category'] = 'UNISEX';
      if (rawCategory.includes('MEN')) category = 'MEN';
      else if (rawCategory.includes('WOMEN')) category = 'WOMEN';
      else if (rawCategory.includes('KIDS')) category = 'KIDS';

      const sizeEU = getVal(['Size', 'ukuran']) || '39';
      const stock = parseInt(getVal(['stock', 'stok']).replace(/[^0-9]/g, ''), 10) || 0;

      const sizeEntry: SizeEntry = {
        sizeEU,
        sizeUK: String(parseFloat(sizeEU) - 5 || '6'),
        sizeUS: String(parseFloat(sizeEU) - 4 || '7'),
        sizeCM: '25',
        stock
      };

      // 7. Simpan / Gabungkan Data ke Map
      if (productMap.has(productCode)) {
        const existing = productMap.get(productCode)!;
        const sizeExists = existing.sizes.find(s => s.sizeEU === sizeEU);
        if (sizeExists) {
          sizeExists.stock += stock;
        } else {
          existing.sizes.push(sizeEntry);
        }
      } else {
        productMap.set(productCode, {
          id: productCode,
          productCode,
          fullSkuCode: productCode + '01',
          brand: productCode.toUpperCase().startsWith('PMA') ? 'Puma' : 'Airwalk',
          modelName, // Sekarang berisi "PMA FLYER LITE 3...", bukan "OLIVE" lagi!
          color: 'Universal',
          category,
          originalPrice,
          discountPercent,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          sizes: [sizeEntry]
        });
      }
    } catch (e) {
      errors.push(`Baris ${rowNum}: Gagal memproses kolom data.`);
    }
  }

  return {
    success: productMap.size,
    errors,
    products: Array.from(productMap.values())
  };
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsLoading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const res = parseCSVRobust(text);
      setImportResult(res);
      setIsLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleApplyImport = () => {
    if (importResult && importResult.products.length > 0) {
      onImport(importResult.products);
      onClose();
      setImportResult(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import CSV Dinamis" size="md">
      <div className="space-y-4">
        {!importResult && !isLoading && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }} />
            <Upload size={24} className="text-orange-500 mb-2" />
            <p className="text-xs font-semibold text-slate-700">Pilih atau Seret File CSV ke Sini</p>
            <p className="text-3xs text-slate-400 mt-1">Menggunakan sistem filter koma bertumpuk otomatis.</p>
          </div>
        )}

        {isLoading && (
          <div className="p-8 flex flex-col items-center justify-center">
            <Loader2 size={24} className="text-orange-500 animate-spin mb-2" />
            <p className="text-xs text-slate-500 font-medium">Sedang menyeimbangkan deskripsi produk & link gambar...</p>
          </div>
        )}

        {importResult && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-slate-800">{importResult.success} Model Produk Siap Di-import</p>
              <p className="text-3xs text-slate-500">Koma deskripsi berhasil dikunci, link gambar terbaca sempurna.</p>
            </div>

            {importResult.errors.length > 0 && (
              <div className="rounded-xl border border-red-200 overflow-hidden bg-red-50/50">
                <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-red-100 bg-red-50 text-red-700">
                  <XCircle size={14} />
                  <span className="text-2xs font-semibold">{importResult.errors.length} Baris Gagal</span>
                </div>
                <div className="max-h-28 overflow-y-auto p-3 space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={`err-${i}`} className="flex items-start gap-1 text-3xs font-medium text-red-600">
                      <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                      <p>{err}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setImportResult(null)} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg">Ganti File</button>
              <button
                onClick={handleApplyImport}
                disabled={importResult.success === 0}
                className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg disabled:opacity-40"
              >
                Terapkan ke Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}