export type SizeEntry = {
  eu: string;
  uk: string;
  us: string;
  cm: string;
  stock: number;
};

export type Product = {
  id: string;

  productCode: string;
  fullSkuCode: string;

  brand:
    | 'Airwalk'
    | 'Converse'
    | 'Diadora'
    | 'New Balance'
    | 'Reebok';

  modelName: string;

  color: string;

  category:
    | 'MEN'
    | 'WOMEN'
    | 'UNISEX'
    | 'KIDS'
    | 'INFANT';

  imageUrl: string;

  originalPrice: number;

  discountPercent: 0 | 10 | 20 | 30;

  discountedPrice: number;

  sizes: SizeEntry[];

  createdAt: string;

  updatedAt: string;
};

/* =========================================
   KOSONGKAN DATA MOCKUP
========================================= */

export const MOCK_PRODUCTS = [];

/* =========================================
   FORMAT RUPIAH
========================================= */

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

/* =========================================
   TOTAL STOCK SEMUA PRODUK
========================================= */

export function getTotalStock(products: Product[]) {
  return products.reduce((total, product) => {
    const stock = product.sizes.reduce(
      (sum, size) => sum + size.stock,
      0
    );

    return total + stock;
  }, 0);
}

/* =========================================
   LOW STOCK ALERTS
========================================= */

export function computeLowStockAlerts(
  products: Product[],
  threshold = 3
) {
  return products.filter((product) => {
    const totalStock = product.sizes.reduce(
      (sum, size) => sum + size.stock,
      0
    );

    return totalStock <= threshold;
  });
}

/* =========================================
   DISTRIBUSI DISKON
========================================= */

export function getDiscountDistribution(
  products: Product[]
) {
  return [
    {
      name: '0%',
      value: products.filter(
        (p) => p.discountPercent === 0
      ).length,
    },
    {
      name: '10%',
      value: products.filter(
        (p) => p.discountPercent === 10
      ).length,
    },
    {
      name: '20%',
      value: products.filter(
        (p) => p.discountPercent === 20
      ).length,
    },
    {
      name: '30%',
      value: products.filter(
        (p) => p.discountPercent === 30
      ).length,
    },
  ];
}

/* =========================================
   STOCK BERDASARKAN BRAND
========================================= */

export function getStockByBrand(
  products: Product[]
) {
  const brands = [
    'Airwalk',
    'Converse',
    'Diadora',
    'New Balance',
    'Reebok',
  ];

  return brands.map((brand) => {
    const brandProducts = products.filter(
      (p) => p.brand === brand
    );

    const stock = brandProducts.reduce(
      (total, product) => {
        return (
          total +
          product.sizes.reduce(
            (sum, size) => sum + size.stock,
            0
          )
        );
      },
      0
    );

    return {
      brand,
      stock,
    };
  });
}