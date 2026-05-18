'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';
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
  imageFile: FileList;
  originalPrice: number;
  discountPercent: 0 | 10 | 20 | 30;
  // Field baru khusus form berupa teks biasa
  sizeTextRange: string;
};

const BRANDS: Product['brand'][] = [
  'Airwalk',
  'Converse',
  'Diadora',
  'New Balance',
  'Reebok',
  'SKECHERS',
  'Nike',
  'Puma',
];

const CATEGORIES: Product['category'][] = [
  'MEN',
  'WOMEN',
  'UNISEX',
  'KIDS',
  'INFANT',
];

const DISCOUNTS: (0 | 10 | 20 | 30)[] = [0, 10, 20, 30];

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSave,
  existingProducts,
}: ProductFormModalProps) {
  /* =====================================================
     STATE
  ===================================================== */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  /* =====================================================
     FORM
  ===================================================== */
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
      originalPrice: 0,
      discountPercent: 0,
      sizeTextRange: '',
    },
  });

  /* =====================================================
     WATCH PREVIEW HARGA
  ===================================================== */
  const discountPercent = watch('discountPercent');
  const originalPrice = watch('originalPrice');

  const discountedPrice = Math.round(
    Number(originalPrice) * (1 - Number(discountPercent) / 100)
  );

  /* =====================================================
     LOAD EDIT DATA
  ===================================================== */
  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      // Ambil string size dari array object pertama jika ada data lama
      const existingSizeText =
        editingProduct.sizes && editingProduct.sizes.length > 0
          ? editingProduct.sizes[0].eu
          : '';

      reset({
        brand: editingProduct.brand,
        productCode: editingProduct.productCode,
        fullSkuCode: editingProduct.fullSkuCode,
        modelName: editingProduct.modelName,
        color: editingProduct.color,
        category: editingProduct.category,
        originalPrice: editingProduct.originalPrice,
        discountPercent: editingProduct.discountPercent,
        sizeTextRange: existingSizeText,
      });

      setImagePreview(editingProduct.imageUrl || '');
    } else {
      reset({
        brand: 'Airwalk',
        productCode: '',
        fullSkuCode: '',
        modelName: '',
        color: '',
        category: 'MEN',
        originalPrice: 0,
        discountPercent: 0,
        sizeTextRange: '',
      });
      setImagePreview('');
    }
  }, [isOpen, editingProduct, reset]);

  /* =====================================================
     SUBMIT DATA HANDLER
  ===================================================== */
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    await new Promise((r) => setTimeout(r, 400));

    // Bungkus teks input biasa menjadi struktur skema model Array SizeEntry
    const formattedSizes: SizeEntry[] = data.sizeTextRange.trim() !== '' 
      ? [
          {
            eu: data.sizeTextRange.trim(),
            uk: '',
            us: '',
            cm: '',
            stock: 10, // Default stock aman agar tombol order landing page menyala
          }
        ]
      : [];

    const product: Product = {
      id: editingProduct?.id ?? `prod-${Date.now()}`,
      productCode: data.productCode,
      fullSkuCode: data.fullSkuCode,
      brand: data.brand,
      modelName: data.modelName,
      color: data.color,
      category: data.category,
      imageUrl:
        imagePreview ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      originalPrice: Number(data.originalPrice),
      discountPercent: Number(data.discountPercent) as 0 | 10 | 20 | 30,
      discountedPrice,
      sizes: formattedSizes,
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
      title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
      subtitle={editingProduct ? `Mengedit ${editingProduct.modelName}` : 'Tambah produk baru'}
      size="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Batal
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg text-white text-sm flex items-center gap-2"
            style={{ backgroundColor: 'var(--primary, #f97316)' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : editingProduct ? (
              'Simpan'
            ) : (
              'Tambah Produk'
            )}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* DATA IDENTITAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* BRAND */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Brand</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" {...register('brand')}>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Category (Gender)</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" {...register('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* MODEL NAME */}
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1 font-medium text-slate-700">Nama Model</label>
            <input
              type="text"
              placeholder="Contoh: Air Max Solo"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...register('modelName', { required: true })}
            />
          </div>

          {/* PRODUCT CODE */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Product Code</label>
            <input
              type="text"
              placeholder="Contoh: DX3666-100"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...register('productCode', {
                required: true,
                validate: (v) => {
                  if (
                    !editingProduct &&
                    existingProducts.some((p) => p.productCode === v)
                  ) {
                    return 'Kode sudah dipakai';
                  }
                  return true;
                },
              })}
            />
            {errors.productCode && (
              <p className="text-xs text-red-500 mt-1">{errors.productCode.message}</p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Full SKU</label>
            <input
              type="text"
              placeholder="Contoh: 196605953001"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...register('fullSkuCode')}
            />
          </div>

          {/* COLOR */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Warna</label>
            <input
              type="text"
              placeholder="Contoh: White/Black/Orange"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...register('color')}
            />
          </div>

          {/* INPUT SIZE SEDERHANA (BERDASARKAN TEKS) */}
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Ukuran / Size Tersedia</label>
            <input
              type="text"
              placeholder="Contoh langsung ketik: 36-40 atau 39,40,41"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-orange-50/20 border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              {...register('sizeTextRange', { required: true })}
            />
          </div>

          {/* IMAGE FILE */}
          <div className="sm:col-span-2">
            <label className="block text-sm mb-2 font-medium text-slate-700">Foto Produk</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              {...register('imageFile')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                  setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }}
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-40 h-40 rounded-xl object-cover border" />
              </div>
            )}
          </div>
        </div>

        {/* DATA HARGA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Harga Asli</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              {...register('originalPrice')}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Diskon</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm bg-white" {...register('discountPercent')}>
              {DISCOUNTS.map((d) => (
                <option key={d} value={d}>{d}%</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium text-slate-700">Harga Final</label>
            <div className="border bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold text-slate-800">
              Rp {discountedPrice.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
}