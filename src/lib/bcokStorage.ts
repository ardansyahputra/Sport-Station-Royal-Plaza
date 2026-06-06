import type { BCOKProduct } from './bcokData';

const API_URL = '/api/kidsstation/products';

export async function getStoredBCOKProducts(): Promise<BCOKProduct[]> {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveStoredBCOKProducts(products: BCOKProduct[]): Promise<void> {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products),
  });
}
