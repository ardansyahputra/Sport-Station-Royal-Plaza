'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Users,
  Power,
  X,
  Phone,
  ExternalLink,
} from 'lucide-react';
import {
  type AdminContact,
  getAdmins,
  fetchAdmins,
  addAdmin,
  removeAdmin,
  toggleAdminActive,
  buildWhatsappLink,
} from '@/lib/adminConfig';

type ProductToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  filterBrand: string;
  onFilterBrand: (v: string) => void;
  filterDiscount: string;
  onFilterDiscount: (v: string) => void;
  filterCategory: string;
  onFilterCategory: (v: string) => void;
  filterStock: string;
  onFilterStock: (v: string) => void;
  onAddProduct: () => void;
  onImport: () => void; // ← cukup void, ImportModal yang handle parsing
  onExport: () => void;
  onDeleteAll: () => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  totalFiltered: number;
  totalAll: number;
  lowStockCount: number;
};

const BRANDS = [
  'Airwalk',
  'Converse',
  'Diadora',
  'New Balance',
  'Reebok',
  'Puma',
  'Nike',
  'Adidas',
  'SKECHERS',
];
const DISCOUNTS = ['0', '10', '20', '30'];
const CATEGORIES = ['MEN', 'WOMEN', 'UNISEX', 'KIDS', 'INFANT', 'FOOTWEAR'];
const STOCK_FILTERS = [
  { value: 'out', label: 'Stok Habis (= 0)' },
  { value: 'low', label: 'Stok Kritis (1 - 3)' },
  { value: 'safe', label: 'Stok Aman (> 3)' },
];

export default function ProductToolbar({
  search,
  onSearchChange,
  filterBrand,
  onFilterBrand,
  filterDiscount,
  onFilterDiscount,
  filterCategory,
  onFilterCategory,
  filterStock,
  onFilterStock,
  onAddProduct,
  onImport,
  onExport,
  onDeleteAll,
  hasActiveFilters,
  onResetFilters,
  totalFiltered,
  totalAll,
  lowStockCount,
}: ProductToolbarProps) {
  // === State Popup Kelola Admin WhatsApp ===
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [admins, setAdmins] = useState<AdminContact[]>([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [adminFormError, setAdminFormError] = useState('');

  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Muat daftar admin TERBARU dari server setiap kali popup dibuka,
  // supaya selalu sinkron dengan device/HP admin lain (bukan cache basi).
  useEffect(() => {
    if (isAdminModalOpen) {
      setAdmins(getAdmins()); // tampilkan cache dulu biar gak kosong/kedip
      setAdminFormError('');
      setIsAdminLoading(true);
      fetchAdmins()
        .then(setAdmins)
        .finally(() => setIsAdminLoading(false));
    }
  }, [isAdminModalOpen]);

  const handleToggleAdmin = async (id: string) => {
    setAdmins(await toggleAdminActive(id));
  };

  const handleRemoveAdmin = async (id: string) => {
    setAdmins(await removeAdmin(id));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newAdminName.trim();
    const phone = newAdminPhone.replace(/[^\d]/g, '');
    if (!name || !phone) {
      setAdminFormError('Nama dan No. WA admin wajib diisi.');
      return;
    }
    if (phone.length < 9) {
      setAdminFormError('No. WA tidak valid.');
      return;
    }
    setAdmins(await addAdmin(name, phone));
    setNewAdminName('');
    setNewAdminPhone('');
    setAdminFormError('');
  };

  return (
    <div className="bg-white p-4 rounded-xl border space-y-3 shadow-sm">
      {/* ROW 1 — Search + Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Cari kode artikel atau model..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm rounded-lg border bg-input text-foreground pl-9 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Import — hanya buka modal, tidak ada logika parsing di sini */}
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg border bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload size={14} />
            Import Excel / CSV
          </button>

          <button
            onClick={onExport} // Fungsi dari props
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50"
          >
            <Download size={14} />
            Export (.xlsx)
          </button>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Users size={14} />
            Admin
          </button>

          <button
            onClick={onDeleteAll}
            className="flex items-center gap-1.5 text-xs font-600 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
            Kosongkan Data
          </button>

          <button
            onClick={onAddProduct}
            className="flex items-center gap-1 text-xs font-600 bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-all shadow-sm"
          >
            <Plus size={14} />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* ROW 2 — Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <select
          value={filterBrand}
          onChange={(e) => onFilterBrand(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Brand</option>
          {BRANDS.map((b) => (
            <option key={`filter-brand-${b}`} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={filterDiscount}
          onChange={(e) => onFilterDiscount(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Diskon</option>
          {DISCOUNTS.map((d) => (
            <option key={`filter-disc-${d}`} value={d}>
              {d}%
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => onFilterCategory(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {CATEGORIES.map((c) => (
            <option key={`filter-cat-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filterStock}
          onChange={(e) => onFilterStock(e.target.value)}
          className="text-sm rounded-lg border bg-input text-foreground px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Stok</option>
          {STOCK_FILTERS.map((sf) => (
            <option key={`filter-stock-${sf.value}`} value={sf.value}>
              {sf.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-500 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw size={12} />
            Reset Filter
          </button>
        )}

        <div className="ml-auto flex items-center gap-3 text-2xs text-muted-foreground font-500">
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              <AlertTriangle size={10} />
              {lowStockCount} Kritis
            </span>
          )}
          <span>
            Menampilkan{' '}
            <strong className="text-foreground">{totalFiltered}</strong> dari{' '}
            {totalAll} produk
          </span>
        </div>
      </div>

      {/* === POPUP KELOLA ADMIN WHATSAPP === */}
      {isAdminModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          style={{ animation: 'adminOverlayIn 0.2s ease-out' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsAdminModalOpen(false); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[88vh]"
            style={{ animation: 'adminScaleUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider">Kelola Admin WhatsApp</h3>
                  <p className="text-[10px] text-slate-400 font-normal normal-case">
                    Aktifkan (ON) admin yang sedang bertugas hari ini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4 bg-slate-50">
              {/* Daftar Admin */}
              <div className="space-y-2">
                {isAdminLoading && (
                  <p className="text-center text-[10px] text-slate-400 py-1">
                    Menyinkronkan data admin dari server...
                  </p>
                )}
                {admins.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">
                    Belum ada admin. Tambahkan No. WA admin di bawah.
                  </p>
                )}
                {admins.map((admin) => {
                  const testWaLink = buildWhatsappLink(
                    admin.phone,
                    `Halo ${admin.name}! 👋 Ini pesan test dari sistem Sport Station Royal Plaza untuk memastikan nomor WA admin ini sudah aktif dan siap menerima pesanan. ✅`
                  );
                  return (
                    <div
                      key={admin.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        admin.active
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            admin.active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Phone size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{admin.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">+{admin.phone}</p>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                            admin.active
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {admin.active ? 'ON • Duty' : 'OFF'}
                        </span>

                        {/* Toggle ON/OFF */}
                        <button
                          type="button"
                          onClick={() => handleToggleAdmin(admin.id)}
                          title={admin.active ? 'Matikan (OFF)' : 'Aktifkan (ON)'}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-colors flex-shrink-0 ${
                            admin.active
                              ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <Power size={14} />
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => handleRemoveAdmin(admin.id)}
                          title="Hapus admin"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Preview link wa.me (format api.whatsapp.com/send) + tombol test */}
                      <a
                        href={testWaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-1.5 text-[9px] font-mono text-slate-400 hover:text-emerald-600 bg-white border border-slate-100 rounded-lg px-2 py-1.5 truncate transition-colors"
                        title="Klik untuk test buka WhatsApp admin ini"
                      >
                        <ExternalLink size={10} className="flex-shrink-0" />
                        <span className="truncate">
                          api.whatsapp.com/send/?phone={admin.phone}&amp;...
                        </span>
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Form Tambah Admin */}
              <form
                onSubmit={handleAddAdmin}
                className="p-3 bg-white border border-dashed border-slate-300 rounded-xl space-y-2"
              >
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  + Tambah Admin Baru
                </p>
                <p className="text-[9px] text-slate-400 -mt-1 leading-relaxed">
                  Admin baru otomatis langsung <span className="font-bold text-emerald-600">ON</span> dan akan tampil sebagai pilihan di halaman utama. Matikan (OFF) kalau lagi libur.
                </p>
                <input
                  type="text"
                  placeholder="Nama admin, contoh: Admin Toni"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-slate-50 text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="No. WA, contoh: 081234567890"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border bg-slate-50 text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                {adminFormError && (
                  <p className="text-[10px] text-red-500 font-semibold">{adminFormError}</p>
                )}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  <Plus size={14} />
                  Tambah Admin
                </button>
              </form>

              <p className="text-[10px] text-slate-400 italic text-center">
                Bisa lebih dari 1 admin ON sekaligus (support puluhan admin). Semua admin yang ON akan muncul sebagai pilihan buat customer saat checkout di halaman utama.
              </p>
            </div>
          </div>

          <style>{`
            @keyframes adminOverlayIn {
              from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes adminScaleUp {
              from { opacity: 0; transform: scale(0.94) translateY(8px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}