'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';
import type { BCOKProduct, BCOKCategory, BCOKGender } from '@/lib/bcokData';
import { BCOK_BRANDS, BCOK_CATEGORIES, BCOK_DISCOUNT_OPTIONS } from '@/lib/bcokData';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: BCOKProduct | null;
  onSave: (product: BCOKProduct) => void;
  existingProducts: BCOKProduct[];
};

type FormValues = {
  productCode: string;
  modelName: string;
  brand: string;
  category: BCOKCategory;
  gender: BCOKGender;
  stock: number;
  originalPrice: number;
  discountPercent: number;
  imageUrl: string;
};

const GENDERS: BCOKGender[] = ['KIDS', 'UNISEX', 'ALL'];

export default function BCOKProductFormModal({
  isOpen, onClose, editingProduct, onSave, existingProducts,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      productCode: '',
      modelName: '',
      brand: 'LEGO',
      category: 'TOYS',
      gender: 'KIDS',
      stock: 0,
      originalPrice: 0,
      discountPercent: 0,
      imageUrl: '',
    },
  });

  const discountPercent = watch('discountPercent') ?? 0;
  const originalPrice = watch('originalPrice') ?? 0;
  const imageUrlWatch = watch('imageUrl');

  const discountedPrice = Math.round(Number(originalPrice) * (1 - Number(discountPercent) / 100));

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      reset({
        productCode: editingProduct.productCode,
        modelName: editingProduct.modelName,
        brand: editingProduct.brand,
        category: editingProduct.category,
        gender: editingProduct.gender,
        stock: editingProduct.stock,
        originalPrice: editingProduct.originalPrice,
        discountPercent: editingProduct.discountPercent,
        imageUrl: editingProduct.imageUrl,
      });
      setImagePreview(editingProduct.imageUrl);
    } else {
      reset({
        productCode: '', modelName: '', brand: 'LEGO',
        category: 'TOYS', gender: 'KIDS',
        stock: 0, originalPrice: 0, discountPercent: 0, imageUrl: '',
      });
      setImagePreview('');
    }
  }, [isOpen, editingProduct, reset]);

  // live preview from URL field
  useEffect(() => {
    if (imageUrlWatch) setImagePreview(imageUrlWatch);
  }, [imageUrlWatch]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 200));

    const product: BCOKProduct = {
      id: editingProduct?.id ?? `bcok-${Date.now()}`,
      productCode: data.productCode,
      modelName: data.modelName,
      brand: data.brand,
      category: data.category,
      gender: data.gender,
      stock: Number(data.stock),
      originalPrice: Number(data.originalPrice),
      discountPercent: Number(data.discountPercent),
      discountedPrice,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(product);
    setIsSubmitting(false);
    onClose();
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400';
  const labelCls = 'block text-sm mb-1 font-medium text-slate-700';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Produk' : 'Tambah Produk'}
      subtitle={editingProduct ? `Mengedit: ${editingProduct.modelName}` : 'Tambah produk baru ke katalog'}
      size="2xl"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border text-sm text-slate-600 hover:bg-slate-50">
            Batal
          </button>
          <button type="submit" form="bcok-product-form" disabled={isSubmitting}
            className="px-5 py-2 rounded-lg text-white text-sm flex items-center gap-2"
            style={{ backgroundColor: 'var(--primary, #f97316)' }}>
            {isSubmitting
              ? <><Loader2 size={16} className="animate-spin" />Menyimpan...</>
              : editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'
            }
          </button>
        </>
      }
    >
      <form id="bcok-product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Row 1: Brand + Category + Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Brand</label>
            <select className={inputCls + ' bg-white'} {...register('brand', { required: true })}>
              {BCOK_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Kategori</label>
            <select className={inputCls + ' bg-white'} {...register('category', { required: true })}>
              {BCOK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Target</label>
            <select className={inputCls + ' bg-white'} {...register('gender')}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Kode Artikel + Nama Produk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Kode Artikel (Article Code)</label>
            <input type="text" placeholder="Contoh: LEGO60413" className={inputCls}
              {...register('productCode', {
                required: 'Kode artikel wajib diisi',
                validate: (v) => !editingProduct && existingProducts.some((p) => p.productCode === v)
                  ? 'Kode sudah dipakai'
                  : true,
              })} />
            {errors.productCode && <p className="text-xs text-red-500 mt-1">{errors.productCode.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Nama / Deskripsi Produk</label>
            <input type="text" placeholder="Contoh: LEGO CITY FIRE RESCUE PLANE" className={inputCls}
              {...register('modelName', { required: 'Nama produk wajib diisi' })} />
            {errors.modelName && <p className="text-xs text-red-500 mt-1">{errors.modelName.message}</p>}
          </div>
        </div>

        {/* Row 3: Stok + Harga */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t">
          <div>
            <label className={labelCls}>Stok</label>
            <input type="number" min="0" className={inputCls}
              {...register('stock', { valueAsNumber: true, min: 0 })} />
          </div>
          <div>
            <label className={labelCls}>Harga Asli</label>
            <input type="number" min="0" className={inputCls}
              {...register('originalPrice', { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelCls}>Diskon</label>
            <select className={inputCls + ' bg-white'} {...register('discountPercent', { valueAsNumber: true })}>
              {BCOK_DISCOUNT_OPTIONS.map((d) => (
                <option key={d} value={d}>{d === 0 ? 'Normal (0%)' : `${d}%`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Harga Final</label>
            <div className="border bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 font-tabular">
              Rp {discountedPrice.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Row 4: Image URL */}
        <div>
          <label className={labelCls}>URL Foto Produk</label>
          <input type="text" placeholder="https://..." className={inputCls}
            {...register('imageUrl')} />
          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover border shadow-sm" />
            </div>
          )}
        </div>

      </form>
    </Modal>
  );
}
