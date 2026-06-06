// =====================================================
// BCOK / Kids Station — Data Types & Utilities
// Kolom Excel: Article Code | Description | Brand |
//   Category | GENDER | stock | originalPrice |
//   DiscountPercent | DiscountPrice | imageUrl
// =====================================================

export type BCOKCategory = 'TOYS' | 'ACCESSORIES' | 'BAGS' | 'HOME';
export type BCOKGender = 'KIDS' | 'UNISEX' | 'ALL';

export type BCOKProduct = {
  id: string;
  productCode: string;       // Article Code
  modelName: string;         // Description
  brand: string;             // Brand
  category: BCOKCategory;    // TOYS / ACCESSORIES / BAGS / HOME
  gender: BCOKGender;        // KIDS / UNISEX / ALL
  stock: number;             // Total stock (no size variants for this catalog)
  originalPrice: number;     // originalPrice
  discountPercent: number;   // 0 / 20 / 30 / 40 / 50 / 90
  discountedPrice: number;   // DiscountPrice
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function computeLowStockAlerts(products: BCOKProduct[]): Set<string> {
  const ids = new Set<string>();
  for (const p of products) {
    if (p.stock > 0 && p.stock <= 3) ids.add(p.id);
  }
  return ids;
}

export const BCOK_BRANDS = [
  'ADOPT ME', 'ALL IN FUN', 'AVENGERS', 'BABY ALIVE', 'BANDAI GIRLS',
  'BILDO', 'BLUE LOCK', 'CALLIE', 'CITY LEGO-ALJ', 'CREATOR LEGO-ALJ',
  "CUP O' STYLE", 'DIAMONDZ', 'DICKIE TOYS', 'DISCOVERY MINDBLOWN',
  'DISCOVERY SHARPER IMAGE', 'DISCOVERY TOY', 'DISNEY ACCESSORIES',
  'DISNEY PUZZLE', 'DISNEY ROLEPLAY', 'FAO SCHWARZ', 'FURBY',
  'FURREAL JUST PLAY', 'GOLDLOK', 'GUNDAM', 'HASBRO GAMES', 'JADA',
  'JAKKS', 'LEGO', 'LEGO DUPLO', 'LEGO TECHNIC', 'MAJORETT', 'MARUKA',
  'MKB MARVEL', 'NANO CRAFT', 'NERF', 'NULLSET', 'PHATMOJO', 'PLAYDOH',
  'PLAYTIME FUN', 'PRESCHOOL LISCENCED', 'QMAN/KEEPPLEY', 'SANRIO',
  'SANRIO BENSON', 'SANRIO DANIEL & CO', 'SBABAM', 'SIKU COLLECTIBLES',
  'SIMBA NON DISNEY', 'SMIGGLE', 'SQUISHMALLOW', 'STICKI ROLLS',
  'SWOP POP', 'SYMA HELICOPTER', 'TODDY', "TONS O' FUN",
  "TONS O' FUN BUBBLE", 'TRANSFORMERS TOYS', 'YOLOPARK', 'ZOO TROOP',
] as const;

export const BCOK_CATEGORIES: BCOKCategory[] = ['TOYS', 'ACCESSORIES', 'BAGS', 'HOME'];
export const BCOK_DISCOUNT_OPTIONS = [0, 20, 30, 40, 50, 90];
