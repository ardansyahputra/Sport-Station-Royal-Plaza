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

const CSV_TEMPLATE_HEADERS = [
  'productCode', 'fullSkuCode', 'brand', 'modelName', 'color',
  'category', 'originalPrice', 'discountPercent', 'imageUrl',
  'sizeEU', 'sizeUK', 'sizeUS', 'sizeCM', 'stock',
];

const SAMPLE_CSV = `productCode,fullSkuCode,brand,modelName,color,category,originalPrice,discountPercent,imageUrl,sizeEU,sizeUK,sizeUS,sizeCM,stock
AIWCL999001,AIWCL999001018036,Airwalk,AIW SAMPLE (A/W),WHITE,WOMEN,499000,70,,36,3.5,6,23,5
AIWCL999001,AIWCL999001018037,Airwalk,AIW SAMPLE (A/W),WHITE,WOMEN,499000,70,,37,4,6.5,23.5,3`;

function parseMockCSV(csvText: string): ImportResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const productMap = new Map<string, Product>();

  if (lines.length < 2) {
    return { success: 0, errors: ['File CSV kosong atau tidak memiliki data'], products: [] };
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const requiredHeaders = ['productCode', 'brand', 'modelName', 'category', 'originalPrice', 'discountPercent'];
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { success: 0, errors: [`Header kolom tidak lengkap: ${missingHeaders.join(', ')}`], products: [] };
  }

  const VALID_BRANDS = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok'];
  const VALID_CATEGORIES = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT'];
  const VALID_DISCOUNTS = [0, 50, 70, 80];

  lines.slice(1).forEach((line, idx) => {
    const rowNum = idx + 2;
    if (!line.trim()) return;

    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });

    const productCode = row.productCode;
    const brand = row.brand as Product['brand'];
    const modelName = row.modelName;
    const category = row.category as Product['category'];
    const originalPrice = Number(row.originalPrice);
    const discountPercent = Number(row.discountPercent) as 0 | 50 | 70 | 80;

    if (!productCode) { errors.push(`Baris ${rowNum}: Kode produk kosong`); return; }
    if (!VALID_BRANDS.includes(brand)) { errors.push(`Baris ${rowNum}: Brand "${brand}" tidak valid`); return; }
    if (!VALID_CATEGORIES.includes(category)) { errors.push(`Baris ${rowNum}: Kategori "${category}" tidak valid`); return; }
    if (isNaN(originalPrice) || originalPrice < 0) { errors.push(`Baris ${rowNum}: Harga tidak valid`); return; }
    if (!VALID_DISCOUNTS.includes(discountPercent)) { errors.push(`Baris ${rowNum}: Diskon ${discountPercent}% tidak valid (0/50/70/80)`); return; }

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
    } else {
      const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
      const product: Product = {
        id: `import-${productCode}-${Date.now()}`,
        productCode,
        fullSkuCode: row.fullSkuCode ?? productCode,
        brand,
        modelName,
        color: row.color ?? '',
        category,
        imageUrl: row.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop',
        originalPrice,
        discountPercent,
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
    // Backend integration point: POST /api/products/import with multipart/form-data
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
        {/* Template download */}
        <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'rgba(37,99,235,0.2)' }}>
          <FileText size={16} style={{ color: 'var(--info)' }} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-600" style={{ color: 'var(--info)' }}>Gunakan template CSV yang disediakan</p>
            <p className="text-2xs text-muted-foreground mt-0.5">
              Kolom wajib: productCode, brand, modelName, category, originalPrice, discountPercent
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

        {/* Drop zone */}
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
            accept=".csv,.xlsx,.xls"
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
              <p className="text-sm font-600 text-foreground">Seret & lepas file di sini</p>
              <p className="text-xs text-muted-foreground">atau klik untuk memilih file</p>
              <p className="text-2xs text-muted-foreground mt-1">Format didukung: CSV, XLSX, XLS</p>
            </div>
          )}
        </div>

        {/* Import result */}
        {importResult && (
          <div className="space-y-3 animate-slide-up">
            {/* Summary */}
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

            {/* Errors */}
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

            {importResult.success > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'rgba(22,163,74,0.2)' }}>
                <CheckCircle size={15} style={{ color: 'var(--success)' }} />
                <p className="text-xs font-500" style={{ color: 'var(--success)' }}>
                  {importResult.success} produk siap diimport. Klik tombol &quot;Import&quot; untuk melanjutkan.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}