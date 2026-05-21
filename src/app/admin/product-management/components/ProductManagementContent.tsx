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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterDiscount, setFilterDiscount] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [tableKey, setTableKey] = useState(0);

  /* =====================================================
      LOAD STORAGE
  ===================================================== */
  const loadProducts = async () => {
    const storedProducts = await getStoredProducts();
    setProducts(storedProducts);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadProducts();

    window.addEventListener('storage', loadProducts);
    return () => {
      window.removeEventListener('storage', loadProducts);
    };
  }, []);

  /* =====================================================
      LOW STOCK
  ===================================================== */
  const lowStockAlerts = useMemo(() => {
    return computeLowStockAlerts(products, 3);
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
          p.brand.toLowerCase().includes(q) ||
          p.modelName.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q)
      );
    }

    /* FILTER BRAND */
    if (filterBrand) {
      result = result.filter((p) => p.brand === filterBrand);
    }

    /* FILTER DISCOUNT */
    if (filterDiscount) {
      result = result.filter((p) => p.discountPercent === Number(filterDiscount));
    }

    /* FILTER CATEGORY */
    if (filterCategory) {
      result = result.filter((p) => p.category === filterCategory);
    }

    /* FILTER STOCK */
    if (filterStock === 'low') {
      const lowIds = new Set(lowStockAlerts.map((a) => a.productId));
      result = result.filter((p) => lowIds.has(p.id));
    }

    if (filterStock === 'out') {
      result = result.filter((p) => p.sizes.some((s) => s.stock === 0));
    }

    if (filterStock === 'in') {
      result = result.filter((p) => p.sizes.every((s) => s.stock > 3));
    }

    /* SORT */
    if (sortKey) {
      result.sort((a, b) => {
        let av: string | number = '';
        let bv: string | number = '';

        if (sortKey === 'brand') { av = a.brand; bv = b.brand; }
        if (sortKey === 'modelName') { av = a.modelName; bv = b.modelName; }
        if (sortKey === 'originalPrice') { av = a.originalPrice; bv = b.originalPrice; }
        if (sortKey === 'discountPercent') { av = a.discountPercent; bv = b.discountPercent; }
        if (sortKey === 'totalStock') {
          av = a.sizes.reduce((s, sz) => s + (Number(sz?.stock) || 0), 0);
          bv = b.sizes.reduce((s, sz) => s + (Number(sz?.stock) || 0), 0);
        }

        if (typeof av === 'string') {
          return sortDir === 'asc'
            ? av.localeCompare(bv as string)
            : (bv as string).localeCompare(av);
        }
        return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av;
      });
    }

    return result;
  }, [products, search, filterBrand, filterDiscount, filterCategory, filterStock, sortKey, sortDir, lowStockAlerts]);

  /* =====================================================
      PAGINATION
  ===================================================== */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /* =====================================================
      SORT
  ===================================================== */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  /* =====================================================
      SELECT
  ===================================================== */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginated.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  /* =====================================================
      SAVE PRODUCT
  ===================================================== */
  const handleSaveProduct = async (product: Product) => {
    let nextProducts: Product[] = [];

    if (editingProduct) {
      nextProducts = products.map((p) => (p.id === product.id ? product : p));
      toast.success(`Produk "${product.modelName}" berhasil diperbarui`);
    } else {
      nextProducts = [product, ...products];
      toast.success(`Produk "${product.modelName}" berhasil ditambahkan`);
    }

    setProducts(nextProducts);
    setFormModalOpen(false);
    setEditingProduct(null);
    setTableKey((prev) => prev + 1);

    try {
      await saveStoredProducts(nextProducts);
    } catch (err) {
      console.error("Gagal sinkron database:", err);
    }
  };

  /* =====================================================
      DELETE SINGLE
  ===================================================== */
  const handleDeleteProduct = async (id: string) => {
    setDeleteLoading(true);
    const product = products.find((p) => p.id === id);
    const nextProducts = products.filter((p) => p.id !== id);

    setProducts(nextProducts);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setDeleteTarget(null);
    setDeleteLoading(false);
    setTableKey((prev) => prev + 1);
    
    toast.success(`Produk "${product?.modelName}" dihapus`);

    try {
      await saveStoredProducts(nextProducts);
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
      BULK DELETE
  ===================================================== */
  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    const count = selectedIds.size;
    const nextProducts = products.filter((p) => !selectedIds.has(p.id));

    setProducts(nextProducts);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setDeleteLoading(false);
    setTableKey((prev) => prev + 1);
    
    toast.success(`${count} produk berhasil dihapus`);

    try {
      await saveStoredProducts(nextProducts);
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
      DELETE ALL DATA
  ===================================================== */
  const handleDeleteAll = async () => {
    setDeleteLoading(true);
    setProducts([]);
    setSelectedIds(new Set());
    setDeleteAllOpen(false);
    setDeleteLoading(false);
    setTableKey((prev) => prev + 1);
    
    toast.success("Seluruh data produk berhasil dikosongkan");

    try {
      await saveStoredProducts([]);
    } catch (err) {
      console.error(err);
    }
  };

  /* =====================================================
      EXPORT CSV (SESUAI TEMPLATE SPORT STATION)
  ===================================================== */
  const handleExport = () => {
    // Header kolom disesuaikan persis seperti template-import-sport-station.csv
    const headers = [
      'productCode',
      'fullSkuCode',
      'brand',
      'modelName',
      'color',
      'category',
      'originalPrice',
      'discountPercent',
      'imageUrl',
      'sizeEU',
      'sizeUK',
      'sizeUS',
      'sizeCM',
      'stock'
    ];

    const rows: string[] = [];

    filtered.forEach((p) => {
      const originalPrice = p.originalPrice || 0;
      const discountPercent = p.discountPercent || 0;
      const fullSku = p.fullSkuCode || '';
      const imageUrl = p.imageUrl || '';

      if (p.sizes && p.sizes.length > 0) {
        // Jika data internal menggunakan array ukuran (misalnya hasil import)
        p.sizes.forEach((sz) => {
          const currentSizeEU = sz.eu || (sz as any).size || '';
          const currentStock = sz.stock ?? 0;

          // Buat baris baru untuk setiap pecahan ukuran produk
          const row = [
            p.productCode,
            fullSku,
            p.brand,
            p.modelName,
            p.color,
            p.category,
            originalPrice,
            discountPercent,
            imageUrl,
            currentSizeEU,
            sz.uk || '',
            sz.us || '',
            sz.cm || '',
            currentStock
          ].join(',');
          rows.push(row);
        });
      } else {
        // Fallback jika tidak ada data ukuran sama sekali
        const row = [
          p.productCode,
          fullSku,
          p.brand,
          p.modelName,
          p.color,
          p.category,
          originalPrice,
          discountPercent,
          imageUrl,
          '', '', '', '', 0
        ].join(',');
        rows.push(row);
      }
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sport-station-products-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Berhasil mengekspor ${rows.length} baris ukuran produk`);
  };

  /* =====================================================
      IMPORT PRODUCTS (MENGGABUNGKAN BARIS UKURAN TEMPLATE)
  ===================================================== */
  const handleImportProducts = async (parsedRows: any[]) => {
    if (!parsedRows || parsedRows.length === 0) return;

    const productMap: { [code: string]: Product } = {};

    parsedRows.forEach((row) => {
      // Ambil kode produk utama
      const productCode = row['productcode'] || row['productCode'];
      if (!productCode) return;

      const sizeEU = row['sizeeu'] || row['sizeEU'] || row['size'] || '';
      const stock = Number(row['stock']) || 0;

      // Hitung kalkulasi harga diskon otomatis
      const originalPrice = Number(row['originalprice'] || row['originalPrice']) || 0;
      const discountPercent = Number(row['discountpercent'] || row['discountPercent']) || 0;
      const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));

      if (!productMap[productCode]) {
        productMap[productCode] = {
          id: productCode, // Menggunakan productCode sebagai primary ID agar tidak duplikat
          productCode: productCode,
          fullSkuCode: row['fullskucode'] || row['fullSkuCode'] || '',
          brand: row['brand'] || 'Airwalk',
          modelName: row['modelname'] || row['modelName'] || '',
          color: row['color'] || '',
          category: (row['category'] || 'UNISEX').toUpperCase() as any,
          imageUrl: row['imageurl'] || row['imageUrl'] || row['image'] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          originalPrice,
          discountPercent: discountPercent as any,
          discountedPrice,
          sizes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Masukkan baris ukuran saat ini ke properti sizes internal (.eu)
      if (sizeEU) {
        productMap[productCode].sizes.push({
          eu: String(sizeEU),
          uk: row['sizeuk'] || row['sizeUK'] || '',
          us: row['sizeus'] || row['sizeUS'] || '',
          cm: row['sizecm'] || row['sizeCM'] || '',
          stock: stock,
        });
      }
    });

    const newProductsArray = Object.values(productMap);
    
    // Gabungkan dengan produk lama (pastikan tidak duplikat id)
    const oldProductsFiltered = products.filter(
      (op) => !productMap[op.productCode]
    );

    const nextProducts = [...newProductsArray, ...oldProductsFiltered];
    
    setProducts(nextProducts);
    setImportModalOpen(false);
    setTableKey((prev) => prev + 1);
    
    toast.success(`Berhasil memuat ${newProductsArray.length} produk dari file template`);

    try {
      await saveStoredProducts(nextProducts);
    } catch (err) {
      console.error(err);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setFilterBrand('');
    setFilterDiscount('');
    setFilterCategory('');
    setFilterStock('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || filterBrand || filterDiscount || filterCategory || filterStock;

  return (
    <div className="space-y-4">
      <ProductToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        filterBrand={filterBrand}
        onFilterBrand={(v) => { setFilterBrand(v); setCurrentPage(1); }}
        filterDiscount={filterDiscount}
        onFilterDiscount={(v) => { setFilterDiscount(v); setCurrentPage(1); }}
        filterCategory={filterCategory}
        onFilterCategory={(v) => { setFilterCategory(v); setCurrentPage(1); }}
        filterStock={filterStock}
        onFilterStock={(v) => { setFilterStock(v); setCurrentPage(1); }}
        onAddProduct={handleAddProduct}
        onImport={handleImportProducts} // Disambungkan ke pengolah baris template di atas
        onExport={handleExport}
        onDeleteAll={() => setDeleteAllOpen(true)}
        hasActiveFilters={!!hasActiveFilters}
        onResetFilters={resetFilters}
        totalFiltered={filtered.length}
        totalAll={products.length}
        lowStockCount={lowStockAlerts.length}
      />

      <ProductTable
        key={tableKey}
        products={paginated}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onEdit={handleEditProduct}
        onDelete={(id) => setDeleteTarget(id)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalFiltered={filtered.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        lowStockProductIds={new Set(lowStockAlerts.map((a) => a.productId))}
      />

      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingProduct(null); }}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
        existingProducts={products}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportProducts}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteProduct(deleteTarget)}
        title="Hapus Produk"
        message={`Apakah yakin ingin menghapus produk "${products.find((p) => p.id === deleteTarget)?.modelName}"?`}
        confirmLabel="Hapus Produk"
        isDestructive
        isLoading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Hapus Produk Massal"
        message={`Anda akan menghapus ${selectedIds.size} produk.`}
        confirmLabel={`Hapus ${selectedIds.size} Produk`}
        isDestructive
        isLoading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Seluruh Data"
        message="Peringatan keras! Tindakan ini akan menghapus semua data produk di database Anda secara permanen. Apakah Anda benar-benar yakin?"
        confirmLabel="Ya, Hapus Semua Data"
        isDestructive
        isLoading={deleteLoading}
      />
    </div>
  );
}