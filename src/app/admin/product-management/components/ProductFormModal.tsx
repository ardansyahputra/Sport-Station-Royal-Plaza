'use client';

import React, {
  useEffect,
  useState,
} from 'react';

import { useForm } from 'react-hook-form';

import Modal from '@/components/ui/Modal';

import {
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';

import type {
  Product,
  SizeEntry,
} from '@/lib/mockData';

type ProductFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSave: (
    product: Product
  ) => void;
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

  discountPercent:
    | 0
    | 10
    | 20
    | 30;
};

const BRANDS: Product['brand'][] =
  [
    'Airwalk',
    'Converse',
    'Diadora',
    'New Balance',
    'Reebok',
  ];

const CATEGORIES: Product['category'][] =
  [
    'MEN',
    'WOMEN',
    'UNISEX',
    'KIDS',
    'INFANT',
  ];

const DISCOUNTS: (
  | 0
  | 10
  | 20
  | 30
)[] = [0, 10, 20, 30];

const EMPTY_SIZE: SizeEntry = {
  eu: '',
  uk: '',
  us: '',
  cm: '',
  stock: 0,
};

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

  const [sizes, setSizes] =
    useState<SizeEntry[]>([
      { ...EMPTY_SIZE },
    ]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [imagePreview, setImagePreview] =
    useState<string>('');

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
      discountPercent: 70,
    },
  });

  /* =====================================================
     WATCH
  ===================================================== */

  const discountPercent = watch(
    'discountPercent'
  );

  const originalPrice = watch(
    'originalPrice'
  );

  const discountedPrice =
    Math.round(
      Number(originalPrice) *
        (1 -
          Number(
            discountPercent
          ) /
            100)
    );

  /* =====================================================
     LOAD EDIT DATA
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      reset({
        brand:
          editingProduct.brand,

        productCode:
          editingProduct.productCode,

        fullSkuCode:
          editingProduct.fullSkuCode,

        modelName:
          editingProduct.modelName,

        color:
          editingProduct.color,

        category:
          editingProduct.category,

        originalPrice:
          editingProduct.originalPrice,

        discountPercent:
          editingProduct.discountPercent,
      });

      setSizes(
        editingProduct.sizes.map(
          (s) => ({
            ...s,
          })
        )
      );

      setImagePreview(
        editingProduct.imageUrl ||
          ''
      );
    } else {
      reset({
        brand: 'Airwalk',

        productCode: '',

        fullSkuCode: '',

        modelName: '',

        color: '',

        category: 'MEN',

        originalPrice: 0,

        discountPercent: 70,
      });

      setSizes([
        { ...EMPTY_SIZE },
      ]);

      setImagePreview('');
    }
  }, [
    isOpen,
    editingProduct,
    reset,
  ]);

  /* =====================================================
     SIZE HANDLER
  ===================================================== */

  const handleAddSizeRow =
    () => {
      setSizes((prev) => [
        ...prev,
        { ...EMPTY_SIZE },
      ]);
    };

  const handleRemoveSizeRow = (
    index: number
  ) => {
    setSizes((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSizeChange = (
    index: number,
    field: keyof SizeEntry,
    value: string | number
  ) => {
    setSizes((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const onSubmit = async (
    data: FormValues
  ) => {
    setIsSubmitting(true);

    await new Promise((r) =>
      setTimeout(r, 400)
    );

    const product: Product = {
      id:
        editingProduct?.id ??
        `prod-${Date.now()}`,

      productCode:
        data.productCode,

      fullSkuCode:
        data.fullSkuCode,

      brand: data.brand,

      modelName:
        data.modelName,

      color: data.color,

      category:
        data.category,

      imageUrl:
        imagePreview ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',

      originalPrice:
        Number(
          data.originalPrice
        ),

      discountPercent:
        Number(
          data.discountPercent
        ) as
          | 0
          | 10
          | 20
          | 30,

      discountedPrice,

      sizes: sizes.filter(
        (s) =>
          s.eu.trim() !== ''
      ),

      createdAt:
        editingProduct?.createdAt ??
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    onSave(product);

    setIsSubmitting(false);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingProduct
          ? 'Edit Produk'
          : 'Tambah Produk'
      }
      subtitle={
        editingProduct
          ? `Mengedit ${editingProduct.modelName}`
          : 'Tambah produk baru'
      }
      size="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting
            }
            className="px-4 py-2 rounded-lg border"
          >
            Batal
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={
              isSubmitting
            }
            className="px-5 py-2 rounded-lg text-white flex items-center gap-2"
            style={{
              backgroundColor:
                'var(--primary)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
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
      <form
        id="product-form"
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-6"
      >
        {/* IDENTITAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* BRAND */}
          <div>
            <label className="block text-sm mb-1">
              Brand
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'brand'
              )}
            >
              {BRANDS.map((b) => (
                <option
                  key={b}
                  value={b}
                >
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm mb-1">
              Category
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'category'
              )}
            >
              {CATEGORIES.map(
                (c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          {/* MODEL */}
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">
              Nama Model
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'modelName',
                {
                  required: true,
                }
              )}
            />
          </div>

          {/* PRODUCT CODE */}
          <div>
            <label className="block text-sm mb-1">
              Product Code
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'productCode',
                {
                  required: true,

                  validate: (
                    v
                  ) => {
                    if (
                      !editingProduct &&
                      existingProducts.some(
                        (
                          p
                        ) =>
                          p.productCode ===
                          v
                      )
                    ) {
                      return 'Kode sudah dipakai';
                    }

                    return true;
                  },
                }
              )}
            />

            {errors.productCode && (
              <p className="text-xs text-red-500 mt-1">
                {
                  errors
                    .productCode
                    .message
                }
              </p>
            )}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm mb-1">
              Full SKU
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'fullSkuCode'
              )}
            />
          </div>

          {/* COLOR */}
          <div>
            <label className="block text-sm mb-1">
              Warna
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'color'
              )}
            />
          </div>

          {/* IMAGE */}
          <div className="sm:col-span-2">
            <label className="block text-sm mb-2">
              Foto Produk
            </label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'imageFile'
              )}
              onChange={(e) => {
                const file =
                  e.target
                    .files?.[0];

                if (!file)
                  return;

                const reader =
                  new FileReader();

                reader.onloadend =
                  () => {
                    const base64String =
                      reader.result as string;

                    setImagePreview(
                      base64String
                    );
                  };

                reader.readAsDataURL(
                  file
                );
              }}
            />

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={
                    imagePreview
                  }
                  alt="Preview"
                  className="w-40 h-40 rounded-xl object-cover border"
                />
              </div>
            )}
          </div>
        </div>

        {/* PRICE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">
              Harga Asli
            </label>

            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'originalPrice'
              )}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Diskon
            </label>

            <select
              className="w-full border rounded-lg px-3 py-2"
              {...register(
                'discountPercent'
              )}
            >
              {DISCOUNTS.map(
                (d) => (
                  <option
                    key={d}
                    value={d}
                  >
                    {d}%
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">
              Harga Final
            </label>

            <div className="border rounded-lg px-3 py-2 font-bold">
              Rp{' '}
              {discountedPrice.toLocaleString(
                'id-ID'
              )}
            </div>
          </div>
        </div>

        {/* SIZE */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">
              Size & Stock
            </h3>

            <button
              type="button"
              onClick={
                handleAddSizeRow
              }
              className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg"
              style={{
                backgroundColor:
                  'rgba(255,107,0,0.1)',
              }}
            >
              <Plus size={14} />
              Tambah
            </button>
          </div>

          <div className="space-y-3">
            {sizes.map(
              (
                size,
                index
              ) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-2"
                >
                  {(
                    [
                      'eu',
                      'uk',
                      'us',
                      'cm',
                    ] as const
                  ).map(
                    (
                      field
                    ) => (
                      <input
                        key={
                          field
                        }
                        type="text"
                        value={
                          size[
                            field
                          ]
                        }
                        onChange={(
                          e
                        ) =>
                          handleSizeChange(
                            index,
                            field,
                            e
                              .target
                              .value
                          )
                        }
                        placeholder={field.toUpperCase()}
                        className="border rounded-lg px-2 py-2"
                      />
                    )
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={
                        size.stock
                      }
                      onChange={(
                        e
                      ) =>
                        handleSizeChange(
                          index,
                          'stock',
                          Number(
                            e
                              .target
                              .value
                          )
                        )
                      }
                      placeholder="Stock"
                      className="border rounded-lg px-2 py-2 w-full"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveSizeRow(
                          index
                        )
                      }
                      disabled={
                        sizes.length ===
                        1
                      }
                    >
                      <Trash2
                        size={16}
                        className="text-red-500"
                      />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}