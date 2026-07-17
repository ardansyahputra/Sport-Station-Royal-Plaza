'use client';

// ============================================================
// KONFIGURASI ADMIN WHATSAPP — SPORT STATION ROYAL PLAZA
// ============================================================
// PENTING: sumber data UTAMA sekarang adalah DATABASE (lewat API
// /api/admin-wa -> route.ts -> Prisma), BUKAN localStorage lagi.
//
// Kenapa diubah? Karena localStorage itu per-browser/per-device.
// Kalau admin toggle ON/OFF dari HP-nya, data itu cuma nyimpen di
// HP admin itu doang — customer yang buka halaman utama di HP lain
// gak akan pernah lihat perubahannya. Makanya kemarin popup "Pilih
// Admin" di customer selalu balik ke "Admin Utama" (fallback default)
// walau admin sudah nambahin Nadia & Ardan di popup Kelola Admin.
//
// Sekarang alurnya:
//  - Semua perubahan (tambah/hapus/toggle admin) -> POST ke /api/admin-wa
//    -> disimpan ke database -> otomatis sinkron ke SEMUA device/HP.
//  - Saat butuh data terbaru (buka popup admin, atau customer klik
//    "Kirim Pesanan") -> GET dari /api/admin-wa supaya selalu dapat
//    data paling baru dari database, bukan data basi di HP masing-masing.
//  - localStorage tetap dipakai sebagai cache instan (biar UI gak
//    kosong/kedip pas nunggu network), tapi bukan sumber kebenaran.
//
// CATATAN LOKASI FILE API: sesuaikan API_URL di bawah ini kalau folder
// route.ts kamu taruh bukan di app/api/admin-wa/route.ts.

export type AdminContact = {
  id: string;
  name: string;
  phone: string; // format internasional tanpa "+" , contoh: 6281234567890
  active: boolean; // true = ON / sedang bertugas (duty), false = OFF / libur
};

const STORAGE_KEY = 'ssrp_admin_contacts_v1';
const API_URL = '/api/admin-wa'; // <-- sesuaikan path ini kalau lokasi route.ts kamu berbeda
export const ADMIN_UPDATED_EVENT = 'ssrp-admin-updated';

// Admin default (fallback) — dipakai kalau database & localStorage masih kosong
const DEFAULT_ADMINS: AdminContact[] = [
  { id: 'admin-default-1', name: 'Admin Utama', phone: '6282225915363', active: true },
];

function isBrowser() {
  return typeof window !== 'undefined';
}

/** Normalisasi nomor WA: buang spasi/simbol, ubah awalan 0 -> 62 */
export function normalizePhone(raw: string): string {
  let phone = (raw || '').replace(/[^\d]/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.slice(1);
  return phone;
}

// ------------------------------------------------------------
// CACHE LOKAL (localStorage) — cuma buat render instan sebelum
// data dari server datang. Bukan sumber kebenaran.
// ------------------------------------------------------------
function getLocalCache(): AdminContact[] {
  if (!isBrowser()) return DEFAULT_ADMINS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ADMINS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ADMINS;
    return parsed as AdminContact[];
  } catch (err) {
    console.error('Gagal membaca cache admin lokal:', err);
    return DEFAULT_ADMINS;
  }
}

function setLocalCache(admins: AdminContact[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
    window.dispatchEvent(new Event(ADMIN_UPDATED_EVENT));
  } catch (err) {
    console.error('Gagal menyimpan cache admin lokal:', err);
  }
}

/**
 * Ambil data admin secara SINKRON & instan dari cache lokal.
 * Dipakai untuk render pertama kali sebelum data dari server datang.
 * Setelah itu, selalu susul dengan fetchAdmins() untuk data yang benar-benar terbaru.
 */
export function getAdmins(): AdminContact[] {
  return getLocalCache();
}

/**
 * Ambil data admin TERBARU langsung dari database (sumber kebenaran utama).
 * Panggil ini setiap kali popup admin dibuka, atau setiap kali customer
 * mau kirim pesanan, supaya datanya selalu sinkron lintas device/HP.
 */
export async function fetchAdmins(): Promise<AdminContact[]> {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Gagal fetch admin dari server (status ${res.status})`);
    const data = await res.json();
    const admins = Array.isArray(data) && data.length > 0 ? data : DEFAULT_ADMINS;
    setLocalCache(admins);
    return admins;
  } catch (err) {
    console.error('Gagal mengambil data admin dari server, pakai cache lokal sementara:', err);
    return getLocalCache();
  }
}

/** Simpan daftar admin ke database + update cache lokal supaya UI langsung responsif */
async function persistAdmins(admins: AdminContact[]): Promise<AdminContact[]> {
  setLocalCache(admins); // optimistic update, biar UI gak nunggu network dulu
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admins),
    });
    if (!res.ok) throw new Error(`Gagal simpan admin ke server (status ${res.status})`);
  } catch (err) {
    console.error('Gagal menyimpan data admin ke server:', err);
  }
  return admins;
}

/**
 * Tambah admin baru.
 * Admin baru otomatis langsung berstatus ON (aktif/bertugas), supaya
 * begitu ditambahkan di ProductToolbar, langsung muncul sebagai pilihan
 * admin tujuan di halaman utama (page.tsx). Kalau admin ini lagi libur,
 * tinggal toggle OFF manual dari popup Admin di ProductToolbar.
 */
export async function addAdmin(name: string, phone: string): Promise<AdminContact[]> {
  const current = await fetchAdmins();
  const newAdmin: AdminContact = {
    id: `admin-${Date.now()}`,
    name: name.trim(),
    phone: normalizePhone(phone),
    active: true,
  };
  const updated = [...current, newAdmin];
  return persistAdmins(updated);
}

/** Hapus admin dari daftar */
export async function removeAdmin(id: string): Promise<AdminContact[]> {
  const current = await fetchAdmins();
  const updated = current.filter((a) => a.id !== id);
  return persistAdmins(updated);
}

/**
 * Toggle ON/OFF satu admin.
 * Boleh lebih dari 1 admin ON (duty) dalam waktu yang sama — misalnya
 * kalau ada banyak admin (20, 30, dst) yang online bareng. Semua admin
 * yang ON akan muncul sebagai pilihan buat customer di halaman utama
 * saat mereka klik "Kirim Pesanan Ke WhatsApp".
 */
export async function toggleAdminActive(id: string): Promise<AdminContact[]> {
  const current = await fetchAdmins();
  const updated = current.map((a) =>
    a.id === id ? { ...a, active: !a.active } : a
  );
  return persistAdmins(updated);
}

/** Ambil semua admin yang sedang ON/bertugas (bisa lebih dari 1) — versi TERBARU dari server */
export async function getOnDutyAdmins(): Promise<AdminContact[]> {
  const admins = await fetchAdmins();
  return admins.filter((a) => a.active);
}

/** Ambil 1 admin buat fallback (dipakai kalau tidak ada admin yang ON sama sekali) — versi TERBARU dari server */
export async function getActiveAdmin(): Promise<AdminContact | null> {
  const admins = await fetchAdmins();
  if (admins.length === 0) return null;
  return admins.find((a) => a.active) || admins[0];
}

/**
 * Bangun link WhatsApp format "api.whatsapp.com/send" — dipakai supaya
 * saat diklik konsisten membuka WhatsApp (app di HP, atau WhatsApp Web
 * di desktop) beserta teks pesan yang sudah terisi otomatis.
 * Contoh hasil:
 * https://api.whatsapp.com/send/?phone=6281234567890&text=Halo...&type=phone_number&app_absent=0
 */
export function buildWhatsappLink(phone: string, text: string): string {
  const cleanPhone = normalizePhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
}