import type { BCOKProduct } from './bcokData';

const STORAGE_KEY = 'kidsstation-bcok-products';
const API_URL = '/api/kidsstation/products';

/* =====================================================
   GET PRODUCTS — sama persis pola Sport Station
===================================================== */
export async function getStoredBCOKProducts(): Promise<BCOKProduct[]> {
  try {
    /* DATABASE FIRST */
    const response = await fetch(API_URL, { cache: 'no-store' });

    if (!response.ok) {
      // API belum ada / error → fallback ke localStorage
      const local = localStorage.getItem(STORAGE_KEY);
      return local ? JSON.parse(local) : [];
    }

    const data = await response.json();
    const products = Array.isArray(data) ? data : [];

    /* SYNC LOCAL CACHE */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    return products;
  } catch (error) {
    console.error('[BCOK] getStoredBCOKProducts error:', error);

    /* FALLBACK TO LOCAL */
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  }
}

/* =====================================================
   SAVE PRODUCTS — sama persis pola Sport Station
===================================================== */
export async function saveStoredBCOKProducts(products: BCOKProduct[]): Promise<void> {
  try {
    /* UPDATE LOCAL DULU */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    /* UPDATE DATABASE */
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
  } catch (error) {
    console.error('[BCOK] saveStoredBCOKProducts error:', error);
    // Data tetap aman di localStorage meski database gagal
  }
}