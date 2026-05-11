'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { MOCK_PRODUCTS, computeLowStockAlerts } from '@/lib/mockData';
import type { Product } from '@/lib/mockData';
import ProductToolbar from './ProductToolbar';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import ImportModal from './ImportModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProductManagementContent() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  const lowStockAlerts = useMemo(() => computeLowStockAlerts(products, 3), [products]);

  // Filter + search
  const filtered = useMemo(() => {
    let result = [...products];

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

    if (filterBrand) result = result.filter((p) => p.brand === filterBrand);
    if (filterDiscount) result = result.filter((p) => p.discountPercent === Number(filterDiscount));
    if (filterCategory) result = result.filter((p) => p.category === filterCategory);
    if (filterStock === 'low') {
      const lowIds = new Set(lowStockAlerts.map((a) => a.productId));
      result = result.filter((p) => lowIds.has(p.id));
    } else if (filterStock === 'out') {
      result = result.filter((p) => p.sizes.some((s) => s.stock === 0));
    } else if (filterStock === 'in') {
      result = result.filter((p) => p.sizes.every((s) => s.stock > 3));
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        let av: string | number = '';
        let bv: string | number = '';
        if (sortKey === 'brand') { av = a.brand; bv = b.brand; }
        else if (sortKey === 'modelName') { av = a.modelName; bv = b.modelName; }
        else if (sortKey === 'originalPrice') { av = a.originalPrice; bv = b.originalPrice; }
        else if (sortKey === 'discountPercent') { av = a.discountPercent; bv = b.discountPercent; }
        else if (sortKey === 'totalStock') {
          av = a.sizes.reduce((s, sz) => s + sz.stock, 0);
          bv = b.sizes.reduce((s, sz) => s + sz.stock, 0);
        }
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
        return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av;
      });
    }

    return result;
  }, [products, search, filterBrand, filterDiscount, filterCategory, filterStock, sortKey, sortDir, lowStockAlerts]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

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

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      // Backend integration point: PUT /api/products/:id
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      toast.success(`Produk "${product.modelName}" berhasil diperbarui`);
    } else {
      // Backend integration point: POST /api/products
      setProducts((prev) => [product, ...prev]);
      toast.success(`Produk "${product.modelName}" berhasil ditambahkan`);
    }
    setFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // Backend integration point: DELETE /api/products/:id
    const product = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setDeleteTarget(null);
    setDeleteLoading(false);
    toast.success(`Produk "${product?.modelName}" dihapus`);
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // Backend integration point: DELETE /api/products/bulk { ids: [...] }
    const count = selectedIds.size;
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
    setDeleteLoading(false);
    toast.success(`${count} produk berhasil dihapus`);
  };

  // Export to CSV
  const handleExport = () => {
    // Backend integration point: GET /api/products/export?format=csv
    const headers = ['productCode', 'brand', 'modelName', 'color', 'category', 'originalPrice', 'discountPercent', 'discountedPrice'];
    const rows = filtered.map((p) =>
      [p.productCode, p.brand, p.modelName, p.color, p.category, p.originalPrice, p.discountPercent, p.discountedPrice].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sport-station-products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} produk diekspor ke CSV`);
  };

  const handleImportProducts = (newProducts: Product[]) => {
    // Backend integration point: POST /api/products/import
    setProducts((prev) => [...newProducts, ...prev]);
    setImportModalOpen(false);
    toast.success(`${newProducts.length} produk berhasil diimport`);
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
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        hasActiveFilters={!!hasActiveFilters}
        onResetFilters={resetFilters}
        totalFiltered={filtered.length}
        totalAll={products.length}
        lowStockCount={lowStockAlerts.length}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card animate-slide-up" style={{ backgroundColor: 'var(--secondary)' }}>
          <span className="text-sm font-600 text-white">{selectedIds.size} produk dipilih</span>
          <div className="flex-1" />
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-xs font-500 px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Batal pilih
          </button>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="text-xs font-600 px-3 py-1.5 rounded-lg text-white transition-colors active:scale-95"
            style={{ backgroundColor: 'var(--danger)' }}
          >
            Hapus {selectedIds.size} produk
          </button>
        </div>
      )}

      <ProductTable
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => { setFormModalOpen(false); setEditingProduct(null); }}
        editingProduct={editingProduct}
        onSave={handleSaveProduct}
        existingProducts={products}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportProducts}
      />

      {/* Delete single confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteProduct(deleteTarget)}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${products.find((p) => p.id === deleteTarget)?.modelName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Produk"
        isDestructive
        isLoading={deleteLoading}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Hapus Produk Massal"
        message={`Anda akan menghapus ${selectedIds.size} produk sekaligus. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={`Hapus ${selectedIds.size} Produk`}
        isDestructive
        isLoading={deleteLoading}
      />
    </div>
  );
}