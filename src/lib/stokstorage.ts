import type { Product } from '@/lib/mockData';

const CLEARANCE_STORAGE_KEY = 'sportstation-clearance-products';
const CLEARANCE_STORAGE_URL = '/api/stok-lastcall';

export async function getStoredClearance(): Promise<Product[]> {
  try {
    const response = await fetch(CLEARANCE_STORAGE_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    const products = Array.isArray(data) ? data : [];
    localStorage.setItem(CLEARANCE_STORAGE_KEY, JSON.stringify(products));
    return products;
  } catch {
    const local = localStorage.getItem(CLEARANCE_STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  }
}

export async function saveStoredClearance(products: Product[]) {
  localStorage.setItem(CLEARANCE_STORAGE_KEY, JSON.stringify(products));
  await fetch(CLEARANCE_STORAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products),
  });
}

// Fungsi Hapus Khusus Clearance
export async function clearStoredClearance() {
  localStorage.removeItem(CLEARANCE_STORAGE_KEY);
  await fetch(CLEARANCE_STORAGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([]),
  });
}