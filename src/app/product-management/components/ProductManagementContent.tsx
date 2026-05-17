'use client';

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { toast } from 'sonner';

import type { Product } from '@/lib/mockData';

import { computeLowStockAlerts } from '@/lib/mockData';

import {
  getStoredProducts,
  saveStoredProducts,
} from '@/lib/storage';

import ProductToolbar from './ProductToolbar';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import ImportModal from './ImportModal';

import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProductManagementContent() {
  /* =====================================================
     STATE
  ===================================================== */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [filterBrand, setFilterBrand] =
    useState('');

  const [filterDiscount, setFilterDiscount] =
    useState('');

  const [filterCategory, setFilterCategory] =
    useState('');

  const [filterStock, setFilterStock] =
    useState('');

  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());

  const [sortKey, setSortKey] =
    useState<string>('');

  const [sortDir, setSortDir] = useState<
    'asc' | 'desc'
  >('asc');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [formModalOpen, setFormModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [importModalOpen, setImportModalOpen] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<string | null>(null);

  const [bulkDeleteOpen, setBulkDeleteOpen] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  /* =====================================================
     LOAD STORAGE
  ===================================================== */

  useEffect(() => {
    const loadProducts = async () => {
      const storedProducts =
        await getStoredProducts();

      setProducts(storedProducts);

      setIsLoaded(true);
    };

    loadProducts();

    window.addEventListener(
      'focus',
      loadProducts
    );

    window.addEventListener(
      'storage',
      loadProducts
    );

    return () => {
      window.removeEventListener(
        'focus',
        loadProducts
      );

      window.removeEventListener(
        'storage',
        loadProducts
      );
    };
  }, []);

  /* =====================================================
     AUTO SAVE STORAGE
  ===================================================== */

  useEffect(() => {
    if (!isLoaded) return;

    saveStoredProducts(products);
  }, [products, isLoaded]);

  /* =====================================================
     LOW STOCK
  ===================================================== */

  const lowStockAlerts = useMemo(() => {
    return computeLowStockAlerts(
      products,
      3
    );
  }, [products]);

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filtered = useMemo(() => {
    let result = [...products];

    /* SEARCH */

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter(
        (p) =>
          p.brand
            .toLowerCase()
            .includes(q) ||
          p.modelName
            .toLowerCase()
            .includes(q) ||
          p.productCode
            .toLowerCase()
            .includes(q) ||
          p.color
            .toLowerCase()
            .includes(q)
      );
    }

    /* FILTER BRAND */

    if (filterBrand) {
      result = result.filter(
        (p) =>
          p.brand === filterBrand
      );
    }

    /* FILTER DISCOUNT */

    if (filterDiscount) {
      result = result.filter(
        (p) =>
          p.discountPercent ===
          Number(filterDiscount)
      );
    }

    /* FILTER CATEGORY */

    if (filterCategory) {
      result = result.filter(
        (p) =>
          p.category ===
          filterCategory
      );
    }

    /* FILTER STOCK */

    if (filterStock === 'low') {
      const lowIds = new Set(
        lowStockAlerts.map(
          (a) => a.productId
        )
      );

      result = result.filter((p) =>
        lowIds.has(p.id)
      );
    }

    if (filterStock === 'out') {
      result = result.filter((p) =>
        p.sizes.some(
          (s) => s.stock === 0
        )
      );
    }

    if (filterStock === 'in') {
      result = result.filter((p) =>
        p.sizes.every(
          (s) => s.stock > 3
        )
      );
    }

    /* SORT */

    if (sortKey) {
      result.sort((a, b) => {
        let av:
          | string
          | number = '';

        let bv:
          | string
          | number = '';

        if (sortKey === 'brand') {
          av = a.brand;
          bv = b.brand;
        }

        if (
          sortKey === 'modelName'
        ) {
          av = a.modelName;
          bv = b.modelName;
        }

        if (
          sortKey ===
          'originalPrice'
        ) {
          av = a.originalPrice;
          bv = b.originalPrice;
        }

        if (
          sortKey ===
          'discountPercent'
        ) {
          av =
            a.discountPercent;

          bv =
            b.discountPercent;
        }

        if (
          sortKey ===
          'totalStock'
        ) {
          av = a.sizes.reduce(
            (s, sz) =>
              s + sz.stock,
            0
          );

          bv = b.sizes.reduce(
            (s, sz) =>
              s + sz.stock,
            0
          );
        }

        if (
          typeof av === 'string'
        ) {
          return sortDir ===
            'asc'
            ? av.localeCompare(
                bv as string
              )
            : (
                bv as string
              ).localeCompare(av);
        }

        return sortDir ===
          'asc'
          ? av -
              (bv as number)
          : (bv as number) -
              av;
      });
    }

    return result;
  }, [
    products,
    search,
    filterBrand,
    filterDiscount,
    filterCategory,
    filterStock,
    sortKey,
    sortDir,
    lowStockAlerts,
  ]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.ceil(
    filtered.length / pageSize
  );

  const paginated = filtered.slice(
    (currentPage - 1) *
      pageSize,
    currentPage * pageSize
  );

  /* =====================================================
     SORT
  ===================================================== */

  const handleSort = (
    key: string
  ) => {
    if (sortKey === key) {
      setSortDir((d) =>
        d === 'asc'
          ? 'desc'
          : 'asc'
      );
    } else {
      setSortKey(key);

      setSortDir('asc');
    }

    setCurrentPage(1);
  };

  /* =====================================================
     SELECT
  ===================================================== */

  const handleSelectAll = (
    checked: boolean
  ) => {
    if (checked) {
      setSelectedIds(
        new Set(
          paginated.map(
            (p) => p.id
          )
        )
      );
    } else {
      setSelectedIds(
        new Set()
      );
    }
  };

  const handleSelectRow = (
    id: string,
    checked: boolean
  ) => {
    setSelectedIds((prev) => {
      const next =
        new Set(prev);

      if (checked)
        next.add(id);
      else next.delete(id);

      return next;
    });
  };

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const handleAddProduct = () => {
    setEditingProduct(null);

    setFormModalOpen(true);
  };

  /* =====================================================
     EDIT PRODUCT
  ===================================================== */

  const handleEditProduct = (
    product: Product
  ) => {
    setEditingProduct(product);

    setFormModalOpen(true);
  };

  /* =====================================================
     SAVE PRODUCT
  ===================================================== */

  const handleSaveProduct = (
    product: Product
  ) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? product
            : p
        )
      );

      toast.success(
        `Produk "${product.modelName}" berhasil diperbarui`
      );
    } else {
      setProducts((prev) => [
        product,
        ...prev,
      ]);

      toast.success(
        `Produk "${product.modelName}" berhasil ditambahkan`
      );
    }

    setFormModalOpen(false);

    setEditingProduct(null);
  };

  /* =====================================================
     DELETE SINGLE
  ===================================================== */

  const handleDeleteProduct =
    async (id: string) => {
      setDeleteLoading(true);

      await new Promise((r) =>
        setTimeout(r, 500)
      );

      const product =
        products.find(
          (p) => p.id === id
        );

      setProducts((prev) =>
        prev.filter(
          (p) => p.id !== id
        )
      );

      setSelectedIds((prev) => {
        const next =
          new Set(prev);

        next.delete(id);

        return next;
      });

      setDeleteTarget(null);

      setDeleteLoading(false);

      toast.success(
        `Produk "${product?.modelName}" dihapus`
      );
    };

  /* =====================================================
     BULK DELETE
  ===================================================== */

  const handleBulkDelete =
    async () => {
      setDeleteLoading(true);

      await new Promise((r) =>
        setTimeout(r, 600)
      );

      const count =
        selectedIds.size;

      setProducts((prev) =>
        prev.filter(
          (p) =>
            !selectedIds.has(
              p.id
            )
        )
      );

      setSelectedIds(
        new Set()
      );

      setBulkDeleteOpen(false);

      setDeleteLoading(false);

      toast.success(
        `${count} produk berhasil dihapus`
      );
    };

  /* =====================================================
     EXPORT CSV
  ===================================================== */

  const handleExport = () => {
    const headers = [
      'productCode',
      'brand',
      'modelName',
      'color',
      'category',
      'originalPrice',
      'discountPercent',
      'discountedPrice',
    ];

    const rows = filtered.map(
      (p) =>
        [
          p.productCode,
          p.brand,
          p.modelName,
          p.color,
          p.category,
          p.originalPrice,
          p.discountPercent,
          p.discountedPrice,
        ].join(',')
    );

    const csv = [
      headers.join(','),
      ...rows,
    ].join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv',
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        'a'
      );

    a.href = url;

    a.download = `products-${Date.now()}.csv`;

    a.click();

    URL.revokeObjectURL(url);

    toast.success(
      `${filtered.length} produk berhasil diekspor`
    );
  };

  /* =====================================================
     IMPORT
  ===================================================== */

  const handleImportProducts = (
    newProducts: Product[]
  ) => {
    setProducts((prev) => [
      ...newProducts,
      ...prev,
    ]);

    setImportModalOpen(false);

    toast.success(
      `${newProducts.length} produk berhasil diimport`
    );
  };

  /* =====================================================
     RESET FILTER
  ===================================================== */

  const resetFilters = () => {
    setSearch('');

    setFilterBrand('');

    setFilterDiscount('');

    setFilterCategory('');

    setFilterStock('');

    setCurrentPage(1);
  };

  const hasActiveFilters =
    search ||
    filterBrand ||
    filterDiscount ||
    filterCategory ||
    filterStock;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-4">
      <ProductToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);

          setCurrentPage(1);
        }}
        filterBrand={
          filterBrand
        }
        onFilterBrand={(v) => {
          setFilterBrand(v);

          setCurrentPage(1);
        }}
        filterDiscount={
          filterDiscount
        }
        onFilterDiscount={(
          v
        ) => {
          setFilterDiscount(v);

          setCurrentPage(1);
        }}
        filterCategory={
          filterCategory
        }
        onFilterCategory={(
          v
        ) => {
          setFilterCategory(v);

          setCurrentPage(1);
        }}
        filterStock={
          filterStock
        }
        onFilterStock={(v) => {
          setFilterStock(v);

          setCurrentPage(1);
        }}
        onAddProduct={
          handleAddProduct
        }
        onImport={() =>
          setImportModalOpen(
            true
          )
        }
        onExport={
          handleExport
        }
        hasActiveFilters={
          !!hasActiveFilters
        }
        onResetFilters={
          resetFilters
        }
        totalFiltered={
          filtered.length
        }
        totalAll={
          products.length
        }
        lowStockCount={
          lowStockAlerts.length
        }
      />

      <ProductTable
        products={paginated}
        selectedIds={
          selectedIds
        }
        onSelectAll={
          handleSelectAll
        }
        onSelectRow={
          handleSelectRow
        }
        onEdit={
          handleEditProduct
        }
        onDelete={(id) =>
          setDeleteTarget(id)
        }
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={
          currentPage
        }
        totalPages={
          totalPages
        }
        pageSize={pageSize}
        totalFiltered={
          filtered.length
        }
        onPageChange={
          setCurrentPage
        }
        onPageSizeChange={(
          s
        ) => {
          setPageSize(s);

          setCurrentPage(1);
        }}
        lowStockProductIds={
          new Set(
            lowStockAlerts.map(
              (a) =>
                a.productId
            )
          )
        }
      />

      <ProductFormModal
        isOpen={
          formModalOpen
        }
        onClose={() => {
          setFormModalOpen(
            false
          );

          setEditingProduct(
            null
          );
        }}
        editingProduct={
          editingProduct
        }
        onSave={
          handleSaveProduct
        }
        existingProducts={
          products
        }
      />

      <ImportModal
        isOpen={
          importModalOpen
        }
        onClose={() =>
          setImportModalOpen(
            false
          )
        }
        onImport={
          handleImportProducts
        }
      />

      <ConfirmDialog
        isOpen={
          !!deleteTarget
        }
        onClose={() =>
          setDeleteTarget(
            null
          )
        }
        onConfirm={() =>
          deleteTarget &&
          handleDeleteProduct(
            deleteTarget
          )
        }
        title="Hapus Produk"
        message={`Apakah yakin ingin menghapus produk "${
          products.find(
            (p) =>
              p.id ===
              deleteTarget
          )?.modelName
        }"?`}
        confirmLabel="Hapus Produk"
        isDestructive
        isLoading={
          deleteLoading
        }
      />

      <ConfirmDialog
        isOpen={
          bulkDeleteOpen
        }
        onClose={() =>
          setBulkDeleteOpen(
            false
          )
        }
        onConfirm={
          handleBulkDelete
        }
        title="Hapus Produk Massal"
        message={`Anda akan menghapus ${selectedIds.size} produk.`}
        confirmLabel={`Hapus ${selectedIds.size} Produk`}
        isDestructive
        isLoading={
          deleteLoading
        }
      />
    </div>
  );
}