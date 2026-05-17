import type { Product } from '@/lib/mockData';

const STORAGE_KEY = 'sportstation-products';

const STORAGE_URL = '/api/products';

/* =====================================================
   GET PRODUCTS
===================================================== */

export async function getStoredProducts(): Promise<Product[]> {
  try {
    /* DATABASE FIRST */

    const response = await fetch(STORAGE_URL, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const products = Array.isArray(data) ? data : [];

    /* SYNC LOCAL CACHE */

    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    return products;
  } catch (error) {
    console.error(error);

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
   SAVE PRODUCTS
===================================================== */

export async function saveStoredProducts(products: Product[]) {
  try {
    /* UPDATE LOCAL */

    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

    /* UPDATE DATABASE */

    await fetch(STORAGE_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(products),
    });
  } catch (error) {
    console.error(error);
  }
}
