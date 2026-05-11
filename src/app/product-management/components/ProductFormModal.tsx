'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { Product, SizeEntry } from '@/lib/mockData';

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSave: (product: Product) => void;
  existingProducts: Product[];
};

type FormValues = {
  brand: Product['brand'];
  productCode: string;
  fullSkuCode: string;
  modelName: string;
  color: string;
  category: Product['category'];
  imageUrl: string;
  originalPrice: number;
  discountPercent: 0 | 50 | 70 | 80;
};

const BRANDS: Product['brand'][] = ['Airwalk', 'Converse', 'Diadora', 'New Balance', 'Reebok'];
const CATEGORIES: Product['category'][] = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT'];
const DISCOUNTS: (0 | 50 | 70 | 80)[] = [0, 50, 70, 80];

const EMPTY_SIZE: SizeEntry = { eu: '', uk: '', us: '', cm: '', stock: 0 };

export default function ProductFormModal({
  isOpen, onClose, editingProduct, onSave, existingProducts,
}: ProductFormModalProps) {
  const [sizes, setSizes] = useState<SizeEntry[]>([{ ...EMPTY_SIZE }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      brand: 'Airwalk',
      productCode: '',
      fullSkuCode: '',
      modelName: '',
      color: '',
      category: 'MEN',
      imageUrl: '',
      originalPrice: 0,
      discountPercent: 70,
    },
  });

  const discountPercent = watch('discountPercent');
  const originalPrice = watch('originalPrice');
  const discountedPrice = Math.round(Number(originalPrice) * (1 - Number(discountPercent) / 100));

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        reset({
          brand: editingProduct.brand,
          productCode: editingProduct.productCode,
          fullSkuCode: editingProduct.fullSkuCode,
          modelName: editingProduct.modelName,
          color: editingProduct.color,
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl,
          originalPrice: editingProduct.originalPrice,
          discountPercent: editingProduct.discountPercent,
        });
        setSizes(editingProduct.sizes.map((s) => ({ ...s })));
      } else {
        reset({
          brand: 'Airwalk',
          productCode: '',
          fullSkuCode: '',
          modelName: '',
          color: '',
          category: 'MEN',
          imageUrl: '',
          originalPrice: 0,
          discountPercent: 70,
        });
        setSizes([{ ...EMPTY_SIZE }]);
      }
    }
  }, [isOpen, editingProduct, reset]);

  const handleAddSizeRow = () => {
    setSizes((prev) => [...prev, { ...EMPTY_SIZE }]);
  };

  const handleRemoveSizeRow = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSizeChange = (index: number, field: keyof SizeEntry, value: string | number) => {
    setSizes((prev) => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const product: Product = {
      id: editingProduct?.id ?? `prod-${Date.now()}`,
      productCode: data.productCode,
      fullSkuCode: data.fullSkuCode,
      brand: data.brand,
      modelName: data.modelName,
      color: data.color,
      category: data.category,
      imageUrl: data.imageUrl || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop`,
      originalPrice: Number(data.originalPrice),
      discountPercent: Number(data.discountPercent) as 0 | 50 | 70 | 80,
      discountedPrice,
      sizes: sizes.filter((s) => s.eu.trim() !== ''),
      createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(product);
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
      subtitle={editingProduct ? `Mengedit: ${editingProduct.modelName}` : 'Isi data produk footwear baru'}
      size="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-500 text-muted-foreground bg-muted rounded-lg hover:bg-border transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-600 text-white rounded-lg transition-all active:scale-95 disabled:opacity-70 min-w-[120px] justify-center"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'
            )}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          {/* Section 1: Brand & Identity */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b">
              Identitas Produk
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div>
                <label htmlFor="brand" className="block text-sm font-500 text-foreground mb-1.5">
                  Brand <span className="text-danger">*</span>
                </label>
                <select
                  id="brand"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all ${errors.brand ? 'border-danger' : 'border-border'}`}
                  {...register('brand', { required: 'Brand wajib dipilih' })}
                >
                  {BRANDS.map((b) => <option key={`fb-${b}`} value={b}>{b}</option>)}
                </select>
                {errors.brand && <p className="mt-1 text-xs text-danger">{errors.brand.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-500 text-foreground mb-1.5">
                  Kategori <span className="text-danger">*</span>
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
                  {...register('category', { required: true })}
                >
                  {CATEGORIES.map((c) => <option key={`fc-${c}`} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Model Name */}
              <div className="sm:col-span-2">
                <label htmlFor="modelName" className="block text-sm font-500 text-foreground mb-1.5">
                  Nama Model <span className="text-danger">*</span>
                </label>
                <input
                  id="modelName"
                  type="text"
                  placeholder="cth: CHUCK 70 AT CX HI (A/M)"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all ${errors.modelName ? 'border-danger' : 'border-border'}`}
                  {...register('modelName', { required: 'Nama model wajib diisi' })}
                />
                {errors.modelName && <p className="mt-1 text-xs text-danger">{errors.modelName.message}</p>}
              </div>

              {/* Product Code */}
              <div>
                <label htmlFor="productCode" className="block text-sm font-500 text-foreground mb-1.5">
                  Kode Produk <span className="text-danger">*</span>
                </label>
                <p className="text-2xs text-muted-foreground mb-1">Format: AIWCL240606H, CONA01682C, dll</p>
                <input
                  id="productCode"
                  type="text"
                  placeholder="cth: CONA01682C"
                  className={`w-full px-3 py-2 text-sm font-mono rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all ${errors.productCode ? 'border-danger' : 'border-border'}`}
                  {...register('productCode', {
                    required: 'Kode produk wajib diisi',
                    validate: (v) => {
                      if (!editingProduct && existingProducts.some((p) => p.productCode === v)) {
                        return 'Kode produk sudah digunakan';
                      }
                      return true;
                    },
                  })}
                />
                {errors.productCode && <p className="mt-1 text-xs text-danger">{errors.productCode.message}</p>}
              </div>

              {/* Full SKU */}
              <div>
                <label htmlFor="fullSkuCode" className="block text-sm font-500 text-foreground mb-1.5">
                  Full SKU Code
                </label>
                <p className="text-2xs text-muted-foreground mb-1">Kode SKU lengkap termasuk kode warna & ukuran</p>
                <input
                  id="fullSkuCode"
                  type="text"
                  placeholder="cth: CONA01682C008041"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
                  {...register('fullSkuCode')}
                />
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-500 text-foreground mb-1.5">
                  Warna <span className="text-danger">*</span>
                </label>
                <input
                  id="color"
                  type="text"
                  placeholder="cth: CREAM, BLACK, DUSTY PINK"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all ${errors.color ? 'border-danger' : 'border-border'}`}
                  {...register('color', { required: 'Warna wajib diisi' })}
                />
                {errors.color && <p className="mt-1 text-xs text-danger">{errors.color.message}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-500 text-foreground mb-1.5">
                  URL Foto Produk
                </label>
                <p className="text-2xs text-muted-foreground mb-1">Kosongkan untuk menggunakan foto default</p>
                <input
                  id="imageUrl"
                  type="text"
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
                  {...register('imageUrl')}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div>
            <h3 className="text-xs font-700 uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b">
              Harga & Diskon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Original Price */}
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-500 text-foreground mb-1.5">
                  Harga Asli (IDR) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-500">Rp.</span>
                  <input
                    id="originalPrice"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="499000"
                    className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all font-tabular ${errors.originalPrice ? 'border-danger' : 'border-border'}`}
                    {...register('originalPrice', {
                      required: 'Harga wajib diisi',
                      min: { value: 0, message: 'Harga tidak boleh negatif' },
                    })}
                  />
                </div>
                {errors.originalPrice && <p className="mt-1 text-xs text-danger">{errors.originalPrice.message}</p>}
              </div>

              {/* Discount */}
              <div>
                <label htmlFor="discountPercent" className="block text-sm font-500 text-foreground mb-1.5">
                  Persentase Diskon <span className="text-danger">*</span>
                </label>
                <select
                  id="discountPercent"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
                  {...register('discountPercent', { required: true })}
                >
                  {DISCOUNTS.map((d) => (
                    <option key={`fd-${d}`} value={d}>{d === 0 ? 'Tidak ada diskon' : `${d}% diskon`}</option>
                  ))}
                </select>
              </div>

              {/* Calculated price */}
              <div>
                <label className="block text-sm font-500 text-foreground mb-1.5">
                  Harga Setelah Diskon
                </label>
                <div
                  className="px-3 py-2 rounded-lg border text-sm font-700 font-tabular"
                  style={{ backgroundColor: 'var(--accent)', borderColor: 'rgba(255,107,0,0.3)', color: 'var(--primary)' }}
                >
                  Rp. {discountedPrice.toLocaleString('id-ID').replace(/,/g, '.')}
                </div>
                <p className="text-2xs text-muted-foreground mt-1">Dihitung otomatis dari harga asli × diskon</p>
              </div>
            </div>
          </div>

          {/* Section 3: Sizes & Stock */}
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
              <h3 className="text-xs font-700 uppercase tracking-wider text-muted-foreground">
                Ukuran & Stok
              </h3>
              <button
                type="button"
                onClick={handleAddSizeRow}
                className="flex items-center gap-1.5 text-xs font-600 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                style={{ backgroundColor: 'rgba(255,107,0,0.1)', color: 'var(--primary)' }}
              >
                <Plus size={13} />
                Tambah Ukuran
              </button>
            </div>
            <p className="text-2xs text-muted-foreground mb-3">
              Masukkan semua ukuran yang tersedia. Ukuran EU adalah acuan utama.
            </p>

            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted">
                    {['EU *', 'UK', 'US', 'CM', 'Stok *', ''].map((h, i) => (
                      <th key={`szth-${i}`} className="px-3 py-2 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size, index) => (
                    <tr key={`size-row-${index}`} className="border-b last:border-0">
                      {(['eu', 'uk', 'us', 'cm'] as const).map((field) => (
                        <td key={`sz-${field}-${index}`} className="px-2 py-1.5">
                          <input
                            type="text"
                            value={size[field]}
                            onChange={(e) => handleSizeChange(index, field, e.target.value)}
                            placeholder={field === 'eu' ? '40' : field === 'uk' ? '7' : field === 'us' ? '8' : '26'}
                            className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-primary transition-all font-tabular"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min={0}
                          value={size.stock}
                          onChange={(e) => handleSizeChange(index, 'stock', Number(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-primary transition-all font-tabular"
                        />
                      </td>
                      <td className="px-2 py-1.5 w-8">
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(index)}
                          disabled={sizes.length === 1}
                          className="p-1 rounded hover:bg-danger-bg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus baris ukuran ini"
                        >
                          <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sizes.filter((s) => s.eu.trim() === '').length > 0 && (
              <p className="text-2xs text-warning mt-1.5">Baris dengan ukuran EU kosong tidak akan disimpan.</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}