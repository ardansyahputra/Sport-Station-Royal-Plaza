'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import type { BCOKProduct } from '@/lib/bcokData';
import { computeLowStockAlerts } from '@/lib/bcokData';
import { getStoredBCOKProducts, saveStoredBCOKProducts } from '@/lib/bcokStorage';

import BCOKProductToolbar from './BCOKProductToolbar';
import BCOKProductTable from './BCOKProductTable';
import BCOKProductFormModal from './BCOKProductFormModal';
import BCOKImportModal from './BCOKImportModal';
import BCOKProductDetailModal from './BCOKProductDetailModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function BCOKProductManagementContent() {
  /* ===== STATE ===== */
  const [products, setProducts] = useState<BCOKProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDiscount, setFilterDiscount] = useState('');
  const [filterStock, setFilterStock] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BCOKProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<BCOKProduct | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  /* ===== LOAD — sama persis pola Sport Station ===== */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getStoredBCOKProducts();
        setProducts(data);
      } catch (err) {
        console.error('Gagal mengambil data BCOK:', err);
        toast.error('Gagal memuat data produk BCOK.');
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const lowStockProductIds = useMemo(() => computeLowStockAlerts(products), [products]);

  /* ===== EXPORT ===== */
  const handleExport = () => {
    const rows = filtered.map((p) => ({
      'Article Code':    p.productCode,
      'Description':     p.modelName,
      'Brand':           p.brand,
      'Category':        p.category,
      'GENDER':          p.gender,
      'stock':           p.stock,
      'originalPrice':   p.originalPrice,
      'DiscountPercent': p.discountPercent + '%',
      'DiscountPrice':   p.discountedPrice,
      'imageUrl':        p.imageUrl,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Katalog BCOK');
    XLSX.writeFile(wb, `Katalog_BCOK_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Berhasil mengekspor ${filtered.length} produk ke Excel.`);
  };

  /* ===== FILTER ===== */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.productCode.toLowerCase().includes(q) ||
        p.modelName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchBrand    = !filterBrand    || p.brand === filterBrand;
      const matchCategory = !filterCategory || p.category === filterCategory;
      const matchDiscount = !filterDiscount || String(p.discountPercent) === filterDiscount;
      let matchStock = true;
      if      (filterStock === 'out')  matchStock = p.stock === 0;
      else if (filterStock === 'low')  matchStock = lowStockProductIds.has(p.id) && p.stock > 0;
      else if (filterStock === 'safe') matchStock = p.stock > 3;
      return matchSearch && matchBrand && matchCategory && matchDiscount && matchStock;
    });
  }, [products, search, filterBrand, filterCategory, filterDiscount, filterStock, lowStockProductIds]);

  /* ===== SORT ===== */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const vA: any = a[sortKey as keyof BCOKProduct];
      const vB: any = b[sortKey as keyof BCOKProduct];
      if (typeof vA === 'string') return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      return sortDir === 'asc' ? (vA ?? 0) - (vB ?? 0) : (vB ?? 0) - (vA ?? 0);
    });
  }, [filtered, sortKey, sortDir]);

  /* ===== PAGINATE ===== */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [search, filterBrand, filterCategory, filterDiscount, filterStock]);

  /* ===== IMPORT — sama persis pola Sport Station ===== */
  const handleImport = async (incoming: BCOKProduct[]) => {
    if (!Array.isArray(incoming) || incoming.length === 0) {
      toast.error('Tidak ada produk yang berhasil dibaca dari file.');
      return;
    }
    const map = new Map(products.map((p) => [p.productCode, p]));
    incoming.forEach((p) => map.set(p.productCode, p));
    const merged = Array.from(map.values());
    setProducts(merged);
    setSelectedIds(new Set());
    setTableKey((k) => k + 1);
    toast.success(`Berhasil menambahkan/memperbarui ${incoming.length} produk.`);
    try {
      await saveStoredBCOKProducts(merged);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan hasil import ke database.');
    }
  };

  /* ===== SAVE (add/edit) ===== */
  const handleSave = async (product: BCOKProduct) => {
    const next = editingProduct
      ? products.map((p) => (p.id === editingProduct.id ? product : p))
      : [product, ...products];
    setProducts(next);
    setFormModalOpen(false);
    setEditingProduct(null);
    toast.success(editingProduct ? 'Produk berhasil diperbarui.' : 'Produk baru berhasil ditambahkan.');
    try {
      await saveStoredBCOKProducts(next);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan ke database.');
    }
  };

  /* ===== DELETE ===== */
  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    setDeleteTarget(null);
    setDeleteLoading(false);
    toast.success('Produk berhasil dihapus.');
    try {
      await saveStoredBCOKProducts(next);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus dari database.');
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    const next = products.filter((p) => !selectedIds.has(p.id));
    const count = selectedIds.size;
    setProducts(next);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setDeleteLoading(false);
    toast.success(`${count} produk berhasil dihapus massal.`);
    try {
      await saveStoredBCOKProducts(next);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan ke database.');
    }
  };

  const handleDeleteAll = async () => {
    setDeleteLoading(true);
    setProducts([]);
    setSelectedIds(new Set());
    setDeleteAllOpen(false);
    setDeleteLoading(false);
    toast.success('Seluruh data produk BCOK berhasil dihapus.');
    try {
      await saveStoredBCOKProducts([]);
    } catch (err) {
      console.error(err);
      toast.error('Gagal menghapus dari database.');
    }
  };

  /* ===== LOADING STATE ===== */
  if (!isLoaded) {
    return (
      <div className="p-8 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div key={tableKey} className="space-y-4">
      <BCOKProductToolbar
        search={search}
        onSearchChange={setSearch}
        filterBrand={filterBrand}
        onFilterBrand={setFilterBrand}
        filterCategory={filterCategory}
        onFilterCategory={setFilterCategory}
        filterDiscount={filterDiscount}
        onFilterDiscount={setFilterDiscount}
        filterStock={filterStock}
        onFilterStock={setFilterStock}
        onAddProduct={() => { setEditingProduct(null); setFormModalOpen(true); }}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onDeleteAll={() => setDeleteAllOpen(true)}
        hasActiveFilters={!!(search || filterBrand || filterCategory || filterDiscount || filterStock)}
        onResetFilters={() => { setSearch(''); setFilterBrand(''); setFilterCategory(''); setFilterDiscount(''); setFilterStock(''); }}
        totalFiltered={sorted.length}
        totalAll={products.length}
        lowStockCount={lowStockProductIds.size}
      />

      <BCOKProductTable
        products={paginated}
        selectedIds={selectedIds}
        onSelectAll={(checked) => setSelectedIds(checked ? new Set(paginated.map((p) => p.id)) : new Set())}
        onSelectRow={(id, checked) => {
          const next = new Set(selectedIds);
          checked ? next.add(id) : next.delete(id);
          setSelectedIds(next);
        }}
        onEdit={(p) => { setEditingProduct(p); setFormModalOpen(true); }}
        onDelete={(id) => setDeleteTarget(id)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={(k) => {
          if (sortKey === k) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
          else { setSortKey(k); setSortDir('asc'); }
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalFiltered={sorted.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        lowStockProductIds={lowStockProductIds}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 z-50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-500 text-slate-300">
            Terpilih <strong className="text-white font-700">{selectedIds.size}</strong> produk
          </span>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Hapus Massal
          </button>
        </div>
      )}

      {/* Modals */}
      <BCOKProductFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingProduct(null); }}
        editingProduct={editingProduct}
        onSave={handleSave}
        existingProducts={products}
      />

      <BCOKImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      {detailProduct && (
        <BCOKProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onEdit={(p) => { setDetailProduct(null); setEditingProduct(p); setFormModalOpen(true); }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Hapus Produk"
        message={`Hapus "${products.find((p) => p.id === deleteTarget)?.modelName}"?`}
        confirmLabel="Hapus Produk"
        isDestructive
        isLoading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Hapus Massal"
        message={`Hapus ${selectedIds.size} produk sekaligus?`}
        confirmLabel={`Hapus ${selectedIds.size} Produk`}
        isDestructive
        isLoading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={deleteAllOpen}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Hapus Semua Data"
        message="Tindakan ini akan menghapus seluruh data produk BCOK secara permanen. Lanjutkan?"
        confirmLabel="Ya, Hapus Semua"
        isDestructive
        isLoading={deleteLoading}
      />
    </div>
  );
}