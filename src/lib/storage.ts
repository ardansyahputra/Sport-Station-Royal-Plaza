import type { Product } from '@/lib/mockData';

const STORAGE_KEY = 'sportstation-products';

/* =====================================================
   GET PRODUCTS
===================================================== */

export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      'Gagal mengambil data products:',
      error
    );

    return [];
  }
}

/* =====================================================
   SAVE PRODUCTS
===================================================== */

export function saveStoredProducts(
  products: Product[]
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );
  } catch (error) {
    console.error(
      'Gagal menyimpan products:',
      error
    );
  }
}