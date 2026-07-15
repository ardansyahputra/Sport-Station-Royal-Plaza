'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/lib/mockData';
import { computeLowStockAlerts } from '@/lib/mockData';
import { getStoredClearance, saveStoredClearance } from '@/lib/stokstorage';

import ProductToolbar from './ProductToolbar';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import ImportModal from './ImportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import * as XLSX from 'xlsx';

export default function ProductManagementContent() {
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
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStoredClearance();
        setProducts(data);
      } catch (err) {
        console.error('Gagal mengambil data produk:', err);
        toast.error('Gagal memuat basis data produk.');
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const lowStockProductIds = useMemo(
    () => computeLowStockAlerts(products),
    [products]
  );

  /* ---- EXPORT TO XLSX ---- */
  // Format ekspor: satu baris per size, identik dengan format import Excel asli
  // sehingga file hasil export bisa langsung di-import ulang tanpa masalah stok
  const handleExport = () => {
    const exportData: Record<string, any>[] = [];

    for (const p of filtered) {
      const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [];

      if (sizes.length === 0) {
        exportData.push({
          'Article Code': p.productCode,
          'Description': p.modelName,
          'Brand': p.brand,
          'Gender': (p.category || 'UNISEX').toUpperCase(),
          'ProductType': ((p as any).productType || 'FOOTWEAR').toUpperCase(),
          'Color': p.color || '',
          'Size': '',
          'stock': 0,
          'originalPrice': p.originalPrice,
          'DiscountPercent': p.discountPercent,
          'DiscountPrice': p.discountedPrice,
          'imageUrl': p.imageUrl || '',
        });
      } else {
        for (const sz of sizes) {
          exportData.push({
            'Article Code': p.productCode,
            'Description': p.modelName,
            'Brand': p.brand,
            'Gender': (p.category || 'UNISEX').toUpperCase(),
            'ProductType': ((p as any).productType || 'FOOTWEAR').toUpperCase(),
            'Color': p.color || '',
            'Size': sz.eu,
            'stock': sz.stock,
            'originalPrice': p.originalPrice,
            'DiscountPercent': p.discountPercent,
            'DiscountPrice': p.discountedPrice,
            'imageUrl': p.imageUrl || '',
          });
        }
      }
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produk");
    XLSX.writeFile(wb, `Data_Produk_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success(`Berhasil mengekspor ${filtered.length} produk ke Excel (.xlsx)`);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.productCode.toLowerCase().includes(search.toLowerCase()) ||
        p.modelName.toLowerCase().includes(search.toLowerCase());
      const matchesBrand =
        !filterBrand || p.brand.toLowerCase() === filterBrand.toLowerCase();
      const matchesDiscount =
        !filterDiscount || String(p.discountPercent) === filterDiscount;
      const matchesCategory =
        !filterCategory ||
        p.category.toUpperCase() === filterCategory.toUpperCase();
      const totalStock = p.sizes.reduce((s, sz) => s + sz.stock, 0);
      let matchesStock = true;
      if (filterStock === 'out') matchesStock = totalStock === 0;
      else if (filterStock === 'low')
        matchesStock = lowStockProductIds.has(p.id) && totalStock > 0;
      else if (filterStock === 'safe') matchesStock = totalStock > 3;
      return (
        matchesSearch &&
        matchesBrand &&
        matchesDiscount &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    products,
    search,
    filterBrand,
    filterDiscount,
    filterCategory,
    filterStock,
    lowStockProductIds,
  ]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const next = [...filtered];
    next.sort((a, b) => {
      let valA: any = a[sortKey as keyof Product];
      let valB: any = b[sortKey as keyof Product];
      if (sortKey === 'stock') {
        valA = a.sizes.reduce((s, sz) => s + sz.stock, 0);
        valB = b.sizes.reduce((s, sz) => s + sz.stock, 0);
      }
      if (typeof valA === 'string') {
        return sortDir === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDir === 'asc'
        ? (valA ?? 0) - (valB ?? 0)
        : (valB ?? 0) - (valA ?? 0);
    });
    return next;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterBrand, filterDiscount, filterCategory, filterStock]);

  const handleImportProducts = async (newProducts: Product[]) => {
    if (!Array.isArray(newProducts) || newProducts.length === 0) {
      toast.error('Tidak ada produk yang berhasil dibaca dari file.');
      return;
    }

    const currentProductMap = new Map<string, Product>();
    products.forEach((p) => currentProductMap.set(p.productCode, p));
    newProducts.forEach((p) => currentProductMap.set(p.productCode, p));

    const updatedProductsList = Array.from(currentProductMap.values());

    setProducts(updatedProductsList);
    setSelectedIds(new Set());
    setTableKey((prev) => prev + 1);
    toast.success(
      `Berhasil menambahkan/memperbarui ${newProducts.length} produk ke dalam tabel.`
    );

    try {
      await saveStoredClearance(updatedProductsList);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan hasil import ke penyimpanan lokal.');
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setSaveLoading(true);
    let next: Product[];
    if (editingProduct) {
      next = products.map((p) => (p.id === editingProduct.id ? product : p));
      toast.success('Informasi produk berhasil diperbarui.');
    } else {
      next = [product, ...products];
      toast.success('Produk baru berhasil ditambahkan.');
    }
    setProducts(next);
    setFormModalOpen(false);
    setEditingProduct(null);
    setSaveLoading(false);
    await saveStoredClearance(next);
  };

  const handleDeleteProduct = async (id: string) => {
    setDeleteLoading(true);
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    const nextSelected = new Set(selectedIds);
    nextSelected.delete(id);
    setSelectedIds(nextSelected);
    setDeleteTarget(null);
    setDeleteLoading(false);
    toast.success('Produk berhasil dihapus dari sistem.');
    await saveStoredClearance(next);
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    const next = products.filter((p) => !selectedIds.has(p.id));
    setProducts(next);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setDeleteLoading(false);
    toast.success(`${selectedIds.size} produk berhasil dihapus massal.`);
    await saveStoredClearance(next);
  };

  const handleDeleteAll = async () => {
    setDeleteLoading(true);
    setProducts([]);
    setSelectedIds(new Set());
    setDeleteAllOpen(false);
    setDeleteLoading(false);
    toast.success('Seluruh isi database produk berhasil dibersihkan.');
    await saveStoredClearance([]);
  };

  if (!isLoaded) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div key={tableKey} className="space-y-4">
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        filterBrand={filterBrand}
        onFilterBrand={setFilterBrand}
        filterDiscount={filterDiscount}
        onFilterDiscount={setFilterDiscount}
        filterCategory={filterCategory}
        onFilterCategory={setFilterCategory}
        filterStock={filterStock}
        onFilterStock={setFilterStock}
        onAddProduct={() => {
          setEditingProduct(null);
          setFormModalOpen(true);
        }}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onDeleteAll={() => setDeleteAllOpen(true)}
        hasActiveFilters={
          !!(
            search ||
            filterBrand ||
            filterDiscount ||
            filterCategory ||
            filterStock
          )
        }
        onResetFilters={() => {
          setSearch('');
          setFilterBrand('');
          setFilterDiscount('');
          setFilterCategory('');
          setFilterStock('');
        }}
        totalFiltered={sorted.length}
        totalAll={products.length}
        lowStockCount={lowStockProductIds.size}
      />

      <ProductTable
        products={paginated}
        selectedIds={selectedIds}
        onSelectAll={(checked) => {
          if (checked) {
            setSelectedIds(new Set(paginated.map((p) => p.id)));
          } else {
            setSelectedIds(new Set());
          }
        }}
        onSelectRow={(id, checked) => {
          const next = new Set(selectedIds);
          if (checked) next.add(id);
          else next.delete(id);
          setSelectedIds(next);
        }}
        onEdit={(p) => {
          setEditingProduct(p);
          setFormModalOpen(true);
        }}
        onDelete={(id) => setDeleteTarget(id)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(k) => {
          if (sortKey === k) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
          } else {
            setSortKey(k);
            setSortDir('asc');
          }
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalFiltered={sorted.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        lowStockProductIds={lowStockProductIds}
      />

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 z-50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-500 text-slate-300">
            Terpilih{' '}
            <strong className="text-white font-700">{selectedIds.size}</strong>{' '}
            produk
          </span>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Hapus Massal
          </button>
        </div>
      )}

      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
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
        message={`Apakah yakin ingin menghapus produk "${
          products.find((p) => p.id === deleteTarget)?.modelName
        }"?`}
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