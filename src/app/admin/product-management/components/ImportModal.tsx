'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/mockData';

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

// Fungsi Ekstraksi: Mengubah link pencarian Google Image menjadi link file gambar mentah (.png/.jpg)
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
    console.error('Gagal mengekstrak URL Gambar Google:', e);
  }
  return url;
}

function parseMockCSV(csvText: string): ImportResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const productMap = new Map<string, Product>();

  if (lines.length < 2) {
    return { success: 0, errors: ['File CSV kosong atau tidak memiliki data'], products: [] };
  }

  // Otomatis deteksi separator (titik koma ";" atau koma ",")
  const separator = lines[0].includes(';') ? ';' : ',';

  // Ambil header dan bersihkan dari hidden character seperti \r (Carriage Return dari Windows Excel)
  const headers = lines[0].split(separator).map((h) => h.trim().replace(/[\r\n]/g, ''));
  
  const requiredHeaders = ['productCode', 'brand', 'modelName', 'category', 'originalPrice', 'discountPercent'];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    return { success: 0, errors: [`Header kolom tidak lengkap: ${missingHeaders.join(', ')}`], products: [] };
  }

  // Daftar validasi master data toleran (huruf besar/kecil disamakan di bawah)
  const VALID_BRANDS = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok', 'Puma', 'Nike', 'SKECHERS'];
  const VALID_CATEGORIES = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT', 'FOOTWEAR'];
  const VALID_DISCOUNTS = [0, 10, 20, 30];

  lines.slice(1).forEach((line, idx) => {
    const rowNum = idx + 2;
    if (!line.trim()) return;

    // Pecah baris dan bersihkan hidden carriage return (\r)
    const values = line.split(separator).map((v) => v.trim().replace(/[\r\n]/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });

    const productCode = row.productCode;
    if (!productCode) { errors.push(`Baris ${rowNum}: Kode produk kosong`); return; }

    // 1. Ambil & Rapikan Brand (Contoh: 'airwalk' -> 'Airwalk', 'nike' -> 'Nike')
    let rawBrand = (row.brand || '').trim();
    let normalizedBrand = rawBrand;
    if (rawBrand) {
      normalizedBrand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1).toLowerCase();
      // Handle khusus brand dengan spasi seperti New Balance
      if (normalizedBrand.toLowerCase() === 'new balance') {
        normalizedBrand = 'New Balance';
      }
    }
    const brand = normalizedBrand as Product['brand'];
    
    const modelName = row.modelName;
    
    // 2. Ambil & Rapikan Kategori ke Huruf Kapital (Contoh: 'footwear' -> 'FOOTWEAR')
    const category = (row.category || '').toUpperCase() as Product['category'];
    
    const originalPrice = Number(row.originalPrice);
    
    // 3. AMBIL & PAKSA DATA DISKON KE ANGKA VALID (Menghapus tanda % jika ada)
    const rawDiscount = (row.discountPercent || '').replace('%', '').trim();
    let discountPercent = rawDiscount === '' ? 0 : Number(rawDiscount);
    
    // Jika data diskon di excel bukan 0, 10, 20, atau 30, paksa ke 0 agar tidak merusak state utama
    if (!VALID_DISCOUNTS.includes(discountPercent)) {
      discountPercent = 0;
    }

    // 4. Ambil Gambar & Bongkar secara otomatis jika berupa link pencarian Google
    const rawImageUrl = row.imageUrl ? row.imageUrl.trim() : '';
    const imageUrl = extractDirectImageUrl(rawImageUrl);

    // Validasi Baris sebelum dimasukkan ke Array Produk
    if (!VALID_BRANDS.includes(brand)) { errors.push(`Baris ${rowNum}: Brand "${brand}" tidak terdaftar di sistem`); return; }
    if (!VALID_CATEGORIES.includes(category)) { errors.push(`Baris ${rowNum}: Kategori "${category}" tidak valid`); return; }
    if (isNaN(originalPrice) || originalPrice < 0) { errors.push(`Baris ${rowNum}: Harga asli tidak valid`); return; }

    const sizeEU = row.sizeEU ?? '';
    const sizeEntry = sizeEU ? {
      eu: sizeEU,
      uk: row.sizeUK ?? '',
      us: row.sizeUS ?? '',
      cm: row.sizeCM ?? '',
      stock: Number(row.stock ?? 0),
    } : null;

    if (productMap.has(productCode)) {
      const existing = productMap.get(productCode)!;
      if (sizeEntry) existing.sizes.push(sizeEntry);
      if (!existing.imageUrl && imageUrl) existing.imageUrl = imageUrl;
    } else {
      // Hitung harga diskon secara matematika bulat
      const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
      
      const product: Product = {
        id: `import-${productCode}-${Date.now()}`,
        productCode,
        fullSkuCode: row.fullSkuCode || productCode,
        brand,
        modelName,
        color: row.color ?? '',
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop',
        originalPrice,
        discountPercent: discountPercent as 0 | 10 | 20 | 30, // Dipastikan berupa angka murni tipe diskon
        discountedPrice,
        sizes: sizeEntry ? [sizeEntry] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      productMap.set(productCode, product);
    }
  });

  const products = Array.from(productMap.values());
  return { success: products.length, errors, products };
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    setImportResult(null);

    await new Promise((r) => setTimeout(r, 600));

    const text = await file.text();
    const result = parseMockCSV(text);
    setImportResult(result);
    setIsProcessing(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownloadTemplate = () => {
    const SAMPLE_CSV = `productCode;fullSkuCode;brand;modelName;color;category;originalPrice;discountPercent;imageUrl;sizeEU;sizeUK;sizeUS;sizeCM;stock\naiwxxx;sjsjsj;airwalk;dika;black;footwear;199000;30%;https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/zvggo9fhlalzrv9hc7j1/AIR+MAX+PLUS+%28GS%29.png;36;;;;35`;
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-import-sport-station.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = () => {
    if (importResult && importResult.products.length > 0) {
      onImport(importResult.products);
    }
    handleClose();
  };

  const handleClose = () => {
    setFileName('');
    setImportResult(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Data Produk"
      subtitle="Upload file CSV untuk menambahkan produk secara massal"
      size="lg"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-500 text-muted-foreground bg-muted rounded-lg hover:bg-border transition-colors"
          >
            Batal
          </button>
          {importResult && importResult.products.length > 0 && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-2 px-5 py-2 text-sm font-600 text-white rounded-lg transition-all active:scale-95"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <CheckCircle size={15} />
              Import {importResult.success} Produk
            </button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'rgba(37,99,235,0.2)' }}>
          <FileText size={16} style={{ color: 'var(--info)' }} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-600" style={{ color: 'var(--info)' }}>Mendukung pemisah titik koma (;) dan otomatis bersihkan tipe diskon</p>
            <p className="text-2xs text-muted-foreground mt-0.5">
              Diskon valid di sistem: 0%, 10%, 20%, atau 30%. Jika mengisi di luar angka tersebut akan otomatis terbaca sebagai 0% (No Discount).
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 text-xs font-600 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 flex-shrink-0"
            style={{ backgroundColor: 'var(--info)', color: 'white' }}
          >
            <Download size={12} />
            Template
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
            backgroundColor: dragOver ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-500 text-muted-foreground">Memproses file...</p>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-2">
              <FileText size={28} style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-600 text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">Klik untuk mengganti file</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className="text-muted-foreground opacity-50" />
              <p className="text-sm font-600 text-foreground">Seret & lepas file CSV di sini</p>
              <p className="text-xs text-muted-foreground">atau klik untuk memilih file dari komputer</p>
            </div>
          )}
        </div>

        {importResult && (
          <div className="space-y-3 animate-slide-up">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'rgba(22,163,74,0.2)' }}>
                <p className="text-xl font-700 font-tabular" style={{ color: 'var(--success)' }}>{importResult.success}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Produk valid</p>
              </div>
              <div className="text-center p-3 rounded-xl border" style={{ backgroundColor: importResult.errors.length > 0 ? 'var(--danger-bg)' : 'var(--muted)', borderColor: importResult.errors.length > 0 ? 'rgba(220,38,38,0.2)' : 'var(--border)' }}>
                <p className="text-xl font-700 font-tabular" style={{ color: importResult.errors.length > 0 ? 'var(--danger)' : 'var(--muted-foreground)' }}>{importResult.errors.length}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Error</p>
              </div>
              <div className="text-center p-3 rounded-xl border bg-muted">
                <p className="text-xl font-700 font-tabular text-foreground">{importResult.success + importResult.errors.length}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Total baris</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(220,38,38,0.3)' }}>
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: 'var(--danger-bg)', borderColor: 'rgba(220,38,38,0.2)' }}>
                  <XCircle size={14} style={{ color: 'var(--danger)' }} />
                  <span className="text-xs font-600" style={{ color: 'var(--danger)' }}>
                    {importResult.errors.length} error ditemukan
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto scrollbar-thin p-3 space-y-1" style={{ backgroundColor: 'var(--danger-bg)' }}>
                  {importResult.errors.map((err, i) => (
                    <div key={`import-err-${i}`} className="flex items-start gap-2">
                      <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                      <p className="text-2xs" style={{ color: 'var(--danger)' }}>{err}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}