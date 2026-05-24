'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, Loader2 } from 'lucide-react';
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

// Fungsi pembersih sel CSV yang super bandel
function cleanCSVCell(cell: string): string {
  if (!cell) return '';
  let cleaned = cell.trim();
  
  // Hapus kutip di awal dan akhir akibat string mentah pembungkus
  cleaned = cleaned.replace(/^"+|"+$/g, '');
  
  // Perbaiki double quotes bertumpuk (""Warna"" menjadi Warna)
  cleaned = cleaned.replace(/""/g, '"').replace(/^"+|"+$/g, '');
  
  // Jika ada koma tersisa di ujung akibat glitch pemisahan, bersihkan
  if (cleaned.endsWith(',')) {
    cleaned = cleaned.substring(0, cleaned.length - 1);
  }
  return cleaned.trim();
}

function parseCSVRobust(csvText: string): ImportResult {
  // Pecah berdasarkan baris
  const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const productMap = new Map<string, Product>();

  if (lines.length <= 1) {
    return { success: 0, errors: ['File CSV kosong.'], products: [] };
  }

  // PEMBERSIHAN TOTAL UNTUK HEADER YANG GLITCH/RUSAK
  let headerLine = lines[0];
  
  // Perbaikan paksa jika baris pertama mengandung bug "Article Code,"
  if (headerLine.includes('"Article Code,""')) {
    headerLine = headerLine.replace('"Article Code,""', '"Article Code","');
  }

  // Pecah kolom header dengan regex cerdas
  const rawHeaders = headerLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  const headers = rawHeaders.map(h => cleanCSVCell(h).toLowerCase());

  // Cari index lokasi kolom secara fleksibel
  const idxCode = headers.findIndex(h => h.includes('article') || h.includes('code'));
  const idxDesc = headers.findIndex(h => h.includes('description') || h.includes('model') || h.includes('desc'));
  const idxBrand = headers.findIndex(h => h.includes('brand'));
  const idxCategory = headers.findIndex(h => h.includes('category'));
  const idxGender = headers.findIndex(h => h.includes('gender'));
  const idxColor = headers.findIndex(h => h.includes('warna') || h.includes('color'));
  const idxPrice = headers.findIndex(h => h.includes('originalprice') || h.includes('harga'));
  const idxDiscountPrice = headers.findIndex(h => h.includes('discountprice'));
  const idxSize = headers.findIndex(h => h.includes('size') || h.includes('ukuran'));
  const idxStock = headers.findIndex(h => h.includes('stock') || h.includes('stok'));
  const idxImg = headers.findIndex(h => h.includes('imageurl') || h.includes('foto'));

  // Validasi darurat jika kolom inti masih gagal ditemukan akibat struktur CSV hancur
  if (idxCode === -1 || idxBrand === -1) {
    return {
      success: 0,
      errors: ['Struktur kolom CSV tidak dikenali. Pastikan nama header bersih.'],
      products: []
    };
  }

  // Iterasi data baris produk (mulai dari baris index 1)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const rawCells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cells = rawCells.map(c => cleanCSVCell(c));

    // Ambil data murni berdasarkan index yang sudah dihitung presisi
    const productCode = cells[idxCode];
    if (!productCode) continue;

    const modelName = cells[idxDesc] || 'Produk Tanpa Nama';
    const brand = cells[idxBrand] || 'Mixed';
    const color = cells[idxColor] || 'Mixed';
    const csvCategory = (cells[idxCategory] || 'FOOTWEAR').toUpperCase();
    const csvGender = (cells[idxGender] || 'UNISEX').toUpperCase();

    // Normalisasi nominal harga dari karakter non-angka (seperti titik/koma separator)
    const originalPrice = parseInt((cells[idxPrice] || '0').replace(/[^0-9]/g, ''), 10) || 0;
    const discountedPrice = parseInt((cells[idxDiscountPrice] || '0').replace(/[^0-9]/g, ''), 10) || originalPrice;

    // Hitung persentase diskon belanja
    let discountPercent: 0 | 10 | 20 | 30 = 0;
    if (originalPrice > 0 && discountedPrice < originalPrice) {
      const computedPct = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
      if (computedPct >= 25) discountPercent = 30;
      else if (computedPct >= 15) discountPercent = 20;
      else if (computedPct >= 5) discountPercent = 10;
    }

    const imageUrl = cells[idxImg] || '';
    const currentSize = cells[idxSize] || 'All Size';
    const currentStock = parseInt(cells[idxStock], 10) || 0;

    const sizeEntry: SizeEntry = {
      eu: currentSize,
      uk: '',
      us: '',
      cm: '',
      stock: currentStock
    };

    // Gabungkan size jika nomor artikel produknya sama (Group By Article Code)
    if (productMap.has(productCode)) {
      const existingProduct = productMap.get(productCode)!;
      const sizeExists = existingProduct.sizes.some(s => s.eu === currentSize);
      if (!sizeExists) {
        existingProduct.sizes.push(sizeEntry);
      } else {
        const foundSize = existingProduct.sizes.find(s => s.eu === currentSize)!;
        foundSize.stock += currentStock;
      }
    } else {
      const newProduct: Product = {
        id: `prod-${productCode}`,
        productCode,
        fullSkuCode: productCode,
        brand: brand as any,
        modelName,
        color,
        category: csvGender as any, // Menyimpan data Gender ke property category default database
        imageUrl,
        originalPrice,
        discountPercent,
        discountedPrice,
        sizes: [sizeEntry],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Menyimpan data Kategori ke properti kustom productType
      (newProduct as any).productType = csvCategory;
      productMap.set(productCode, newProduct);
    }
  }

  const finalProducts = Array.from(productMap.values());
  return { success: finalProducts.length, errors: [], products: finalProducts };
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSVRobust(text);
      setImportResult(result);
      setIsLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setImportResult(null); onClose(); }} title="Import CSV" size="md">
      <div className="space-y-4 py-4 text-center">
        {!importResult && !isLoading && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 cursor-pointer hover:bg-slate-50 border-slate-200"
          >
            <input ref={fileInputRef} type="file" className="hidden" accept=".csv" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">Klik untuk pilih dan unggah file CSV Anda</p>
          </div>
        )}

        {isLoading && (
          <div className="py-6">
            <Loader2 className="animate-spin mx-auto text-orange-500 mb-2" size={28} />
            <p className="text-xs text-slate-500">Sedang membaca data produk...</p>
          </div>
        )}

        {importResult && (
          <div className="space-y-4 text-left">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium">
              ✔ Berhasil mendeteksi {importResult.success} produk dari file CSV Anda.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setImportResult(null)} className="px-3 py-1.5 bg-slate-100 text-xs rounded-lg">Ulangi</button>
              <button 
                onClick={() => { onImport(importResult.products); setImportResult(null); onClose(); }} 
                className="px-4 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg"
              >
                Tampilkan di Tabel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}