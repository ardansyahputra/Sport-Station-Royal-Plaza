'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ShoppingCart, Search, Heart, Star, Tag, Package, Zap, Gift,
  Home, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw,
  Headphones, Sparkles, X,
} from 'lucide-react';
import type { BCOKProduct, BCOKCategory } from '@/lib/bcokData';
import { formatIDR } from '@/lib/bcokData';

// ─── Types ─────────────────────────────────────────────────────────────────────
type CartItem = BCOKProduct & { qty: number };

// ─── Constants ─────────────────────────────────────────────────────────────────
const ALL_CATEGORIES: BCOKCategory[] = ['TOYS', 'ACCESSORIES', 'BAGS', 'HOME'];

const CATEGORY_ICONS: Record<BCOKCategory, string> = {
  TOYS: '🧸', ACCESSORIES: '🎒', BAGS: '👜', HOME: '🏠',
};

const CATEGORY_LABELS: Record<BCOKCategory, string> = {
  TOYS: 'Mainan', ACCESSORIES: 'Aksesori', BAGS: 'Tas', HOME: 'Rumah',
};

const CATEGORY_COLORS: Record<BCOKCategory, { bg: string; ring: string; text: string; gradient: string }> = {
  TOYS:        { bg: 'bg-violet-50',  ring: 'ring-violet-400',  text: 'text-violet-700',  gradient: 'from-violet-400 to-purple-500' },
  ACCESSORIES: { bg: 'bg-sky-50',     ring: 'ring-sky-400',     text: 'text-sky-700',     gradient: 'from-sky-400 to-cyan-500' },
  BAGS:        { bg: 'bg-amber-50',   ring: 'ring-amber-400',   text: 'text-amber-700',   gradient: 'from-amber-400 to-orange-500' },
  HOME:        { bg: 'bg-emerald-50', ring: 'ring-emerald-400', text: 'text-emerald-700', gradient: 'from-emerald-400 to-teal-500' },
};

const DISCOUNT_BADGE: Record<number, string> = {
  20: 'bg-yellow-400 text-yellow-900',
  30: 'bg-orange-400 text-white',
  40: 'bg-rose-500 text-white',
  50: 'bg-red-600 text-white',
  90: 'bg-red-700 text-white',
};

const HERO_SLIDES = [
  {
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    badge: '🎉 Promo Spesial',
    title: 'Dunia Mainan\nAnak Pilihan!',
    sub: 'Ratusan produk LEGO, NERF, Hasbro & lebih banyak lagi',
    emoji: '🚀',
    cta: 'Belanja Sekarang',
    tag: 'Diskon hingga 90%',
  },
  {
    gradient: 'from-orange-400 via-rose-500 to-pink-600',
    badge: '🏷️ Flash Sale',
    title: 'Mainan\nBerkualitas Terbaik',
    sub: 'Kids Station — Toko mainan terpercaya keluarga Indonesia',
    emoji: '🎠',
    cta: 'Lihat Katalog',
    tag: 'Gratis Ongkir > Rp 150K',
  },
  {
    gradient: 'from-sky-400 via-cyan-500 to-teal-600',
    badge: '🎁 Gift Special',
    title: 'Hadiah Sempurna\nUntuk Si Kecil',
    sub: 'LEGO, Playdoh, Squishmallow, dan banyak brand favoritmu',
    emoji: '🧸',
    cta: 'Explore Sekarang',
    tag: 'Stok Terbatas!',
  },
];

// ─── Welcome Screen ─────────────────────────────────────────────────────────────
function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'text' | 'burst' | 'exit'>('enter');
  const [lettersDone, setLettersDone] = useState(false);

  const KIDS = 'KIDS'.split('');
  const STATION = 'STATION'.split('');

  useEffect(() => {
    // phase timeline
    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setLettersDone(true), 2000);
    const t3 = setTimeout(() => setPhase('burst'), 2200);
    const t4 = setTimeout(() => setPhase('exit'), 2800);
    const t5 = setTimeout(() => onDone(), 3500);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [onDone]);

  const floatingEmojis = ['🎠', '⭐', '🚀', '🧸', '🎈', '🌟', '🎁', '🎡', '🦄', '🪀', '🎯', '🎪'];

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden transition-all duration-700 ${
        phase === 'exit' ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 30%, #0ea5e9 70%, #10b981 100%)' }}
    >
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(-120vh) rotate(720deg) scale(0.3); opacity: 0; }
        }
        @keyframes letterPop {
          0%   { transform: translateY(60px) scale(0.3) rotateY(90deg); opacity: 0; }
          60%  { transform: translateY(-12px) scale(1.15) rotateY(-10deg); opacity: 1; }
          80%  { transform: translateY(4px) scale(0.97) rotateY(4deg); }
          100% { transform: translateY(0) scale(1) rotateY(0deg); opacity: 1; }
        }
        @keyframes shimmer {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
        }
        @keyframes burstPop {
          0%   { transform: scale(0) rotate(0deg); opacity:0; }
          50%  { transform: scale(1.4) rotate(180deg); opacity:1; }
          100% { transform: scale(1) rotate(360deg); opacity:1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes taglineSlide {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes starTwinkle {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.6); }
        }
        .letter-kids { animation: letterPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .letter-station { animation: letterPop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        .burst-pop { animation: burstPop 0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .tagline-in { animation: taglineSlide 0.5s ease both; }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #fde68a 30%, #fb923c 60%, #fff 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2s ease infinite;
        }
        .orbit-dot { animation: orbitSpin 3s linear infinite; }
        .pulse-ring-anim { animation: pulse-ring 1.5s ease-out infinite; }
        .twinkle { animation: starTwinkle 1.2s ease-in-out infinite; }
      `}</style>

      {/* Floating background emojis */}
      {floatingEmojis.map((em, i) => (
        <div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{
            left: `${(i * 8.3) % 100}%`,
            bottom: `-5%`,
            animation: `floatUp ${3 + (i % 4)}s ease-in ${phase === 'burst' ? '0s' : '99s'} both`,
            animationDelay: `${i * 0.12}s`,
            fontSize: `${1.2 + (i % 3) * 0.6}rem`,
          }}
        >
          {em}
        </div>
      ))}

      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
      </div>

      {/* Pulse rings */}
      {phase === 'burst' && [0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-white/60 pulse-ring-anim"
          style={{ animationDelay: `${i * 0.25}s` }}
        />
      ))}

      {/* Twinkling stars */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute text-yellow-300 twinkle pointer-events-none select-none"
          style={{
            top: `${10 + (i * 7) % 80}%`,
            left: `${5 + (i * 11) % 90}%`,
            fontSize: `${0.6 + (i % 3) * 0.4}rem`,
            animationDelay: `${i * 0.15}s`,
            animationDuration: `${0.8 + (i % 4) * 0.3}s`,
          }}
        >
          ✦
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

        {/* Logo circle */}
        <div className={`relative transition-all duration-500 ${phase === 'burst' ? 'burst-pop' : phase !== 'enter' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          {/* Orbit dot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="orbit-dot text-xl">⭐</div>
          </div>
          <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-2xl">
            <span className="text-5xl">🎪</span>
          </div>
        </div>

        {/* KIDS letters */}
        {phase !== 'enter' && (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-end gap-1">
              {KIDS.map((l, i) => (
                <span
                  key={i}
                  className={`letter-kids inline-block font-black text-7xl sm:text-8xl leading-none ${
                    phase === 'burst' ? 'shimmer-text' : 'text-white'
                  }`}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    fontFamily: "'Nunito', 'Fredoka One', system-ui",
                    textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                    WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                  }}
                >
                  {l}
                </span>
              ))}
            </div>

            {/* STATION letters */}
            <div className="flex items-end gap-0.5">
              {STATION.map((l, i) => (
                <span
                  key={i}
                  className={`letter-station inline-block font-black text-3xl sm:text-4xl leading-none tracking-widest ${
                    phase === 'burst' ? 'shimmer-text' : 'text-white/90'
                  }`}
                  style={{
                    animationDelay: `${0.4 + i * 0.06}s`,
                    fontFamily: "'Nunito', system-ui",
                    letterSpacing: '0.2em',
                    textShadow: '0 2px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tagline */}
        {lettersDone && (
          <div
            className="tagline-in flex flex-col items-center gap-3"
            style={{ animationDelay: '0.1s' }}
          >
            <p className="text-white/80 text-sm sm:text-base font-semibold tracking-wide">
              ✨ Toko Mainan Terpercaya Keluarga Indonesia ✨
            </p>
            <div className="flex items-center gap-2">
              {['🧸 Mainan', '🎒 Aksesori', '👜 Tas', '🏠 Rumah'].map((t, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Loading bar */}
            <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: phase === 'burst' ? '100%' : '70%', transition: 'width 1s ease' }}
              />
            </div>
          </div>
        )}

        {/* Skip button */}
        <button
          onClick={onDone}
          className="absolute top-[-120px] right-[-100px] sm:right-[-200px] text-white/50 hover:text-white text-xs flex items-center gap-1 transition-colors"
        >
          Skip <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Product Image ──────────────────────────────────────────────────────────────
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-orange-100">
      <Gift size={36} className="text-violet-300" />
    </div>
  );
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErr(true)} />;
}

// ─── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({
  product, onAdd, onWish, wished,
}: { product: BCOKProduct; onAdd: (p: BCOKProduct) => void; onWish: (id: string) => void; wished: boolean }) {
  const col = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.TOYS;
  const isOut = product.stock === 0;
  const isLow = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.discountPercent > 0 && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm ${DISCOUNT_BADGE[product.discountPercent] ?? 'bg-orange-500 text-white'}`}>
            -{product.discountPercent}%
          </span>
        )}
        {isOut && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-white">Habis</span>}
        {isLow && !isOut && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-900">Sisa {product.stock}</span>}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => onWish(product.id)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow hover:bg-white transition-all"
      >
        <Heart size={13} fill={wished ? '#f43f5e' : 'none'} className={wished ? 'text-rose-500' : 'text-slate-300'} />
      </button>

      {/* Image */}
      <div className={`h-44 ${col.bg} overflow-hidden`}>
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
          <ProductImage src={product.imageUrl} alt={product.modelName} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">{product.brand}</span>
          <span className={`text-[10px] font-bold ${col.text}`}>{CATEGORY_ICONS[product.category]} {product.category}</span>
        </div>
        <p className="text-xs font-bold text-slate-800 line-clamp-2 flex-1 leading-snug">{product.modelName}</p>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(i => <Star key={i} size={9} fill="#fbbf24" className="text-amber-400" />)}
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            {product.discountPercent > 0 && (
              <p className="text-[10px] text-slate-400 line-through font-tabular">{formatIDR(product.originalPrice)}</p>
            )}
            <p className="text-sm font-black text-orange-500 font-tabular">{formatIDR(product.discountedPrice)}</p>
          </div>
          <button
            onClick={() => !isOut && onAdd(product)}
            disabled={isOut}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 ${
              isOut ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
            }`}
          >
            <ShoppingCart size={11} />
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function KidsStationStorefront() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [products, setProducts]       = useState<BCOKProduct[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);

  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState<BCOKCategory | ''>('');
  const [activeDiscount, setActiveDiscount] = useState<number | null>(null);
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [wishlist, setWishlist]           = useState<Set<string>>(new Set());
  const [heroSlide, setHeroSlide]         = useState(0);
  const [cartOpen, setCartOpen]           = useState(false);
  const [page, setPage]                   = useState(1);
  const PAGE_SIZE = 12;

  // ── Fetch: try API first, then localStorage ──
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setFetchError(null);

      // 1. Try the API route
      try {
        const res = await fetch('/api/kidsstation/products', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : [];
          setProducts(arr);
          // keep localStorage in sync
          try { localStorage.setItem('kidsstation-bcok-products', JSON.stringify(arr)); } catch {}
          setIsLoading(false);
          return;
        }

        // Non-ok status — fall through to localStorage
        console.warn(`[KidsStation] API returned ${res.status}, falling back to localStorage`);
      } catch (err) {
        console.warn('[KidsStation] API unreachable, falling back to localStorage:', err);
      }

      // 2. Fallback: localStorage
      try {
        const raw = localStorage.getItem('kidsstation-bcok-products');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            setFetchError('Server tidak tersedia. Menampilkan data cache lokal.');
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('[KidsStation] localStorage read failed:', e);
      }

      // 3. Nothing found
      setProducts([]);
      setFetchError(
        'Produk belum dimuat. Silakan import data di halaman Admin → Manajemen Produk BCOK terlebih dahulu.'
      );
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  // ── Auto slide ──
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  // ── Filters ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const ms = !q || p.modelName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const mc = !activeCategory || p.category === activeCategory;
      const md = activeDiscount === null || p.discountPercent === activeDiscount;
      return ms && mc && md;
    });
  }, [products, search, activeCategory, activeDiscount]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  useEffect(() => { setPage(1); }, [search, activeCategory, activeDiscount]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:      products.length,
    discounted: products.filter(p => p.discountPercent > 0).length,
    categories: ALL_CATEGORIES.map(c => ({ cat: c, count: products.filter(p => p.category === c).length })),
  }), [products]);

  const featured = useMemo(() =>
    [...products].filter(p => p.stock > 0 && p.discountPercent >= 30)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 6),
    [products]
  );

  // ── Cart ──
  const addToCart = (p: BCOKProduct) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };
  const removeFromCart  = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const toggleWishlist  = (id: string) => setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const cartTotal = cart.reduce((s, i) => s + i.discountedPrice * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const slide = HERO_SLIDES[heroSlide];

  // ── Render ──
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Nunito', 'Poppins', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .font-tabular  { font-variant-numeric: tabular-nums; }
        .line-clamp-2  { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.5s ease both; }
        @keyframes mainIn { from { opacity:0; } to { opacity:1; } }
        .main-in { animation: mainIn 0.8s ease both; }
      `}</style>

      {/* Welcome screen */}
      {showWelcome && <WelcomeScreen onDone={() => setShowWelcome(false)} />}

      {/* ── Top bar ── */}
      <div className="bg-orange-500 text-white text-xs py-2 px-4 text-center font-bold">
        🚚 Gratis Ongkir &gt; Rp 150.000 &nbsp;|&nbsp; 🎁 Produk Original Bergaransi &nbsp;|&nbsp; ⚡ Promo Hingga 90% OFF
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-violet-500 flex items-center justify-center text-xl shadow-md">🎪</div>
            <div>
              <p className="text-base font-black leading-none text-orange-500">Kids</p>
              <p className="text-base font-black leading-none text-violet-600">Station</p>
            </div>
          </div>

          <div className="flex-1 relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari mainan, brand, atau kode produk..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">✕</button>
            )}
          </div>

          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Keranjang</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category nav */}
        <div className="border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory('')}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${!activeCategory ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              🏠 Semua Produk
            </button>
            {ALL_CATEGORIES.map(cat => {
              const col = CATEGORY_COLORS[cat];
              const active = activeCategory === cat;
              const count = stats.categories.find(c => c.cat === cat)?.count ?? 0;
              return (
                <button key={cat} onClick={() => setActiveCategory(active ? '' : cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    active ? `bg-gradient-to-r ${col.gradient} text-white shadow-sm` : `${col.bg} ${col.text} hover:opacity-80`
                  }`}
                >
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-white/70 text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Cart Drawer ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-orange-50 to-violet-50">
              <p className="font-black text-slate-800">🛒 Keranjang ({cartCount})</p>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-3">
                  <ShoppingCart size={40} className="opacity-20" />
                  <p className="text-sm font-semibold">Keranjang masih kosong</p>
                </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <ProductImage src={item.imageUrl} alt={item.modelName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.modelName}</p>
                    <p className="text-[10px] text-slate-400">{item.brand}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs font-black text-orange-500 font-tabular">{formatIDR(item.discountedPrice)}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-bold">×{item.qty}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t space-y-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-700">Total Belanja</p>
                  <p className="text-lg font-black text-orange-500 font-tabular">{formatIDR(cartTotal)}</p>
                </div>
                <button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black py-3 rounded-xl transition-all shadow-lg">
                  Checkout Sekarang →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10 main-in">

        {/* ── Hero ── */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[280px]">
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700`} />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-white/10" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-300/60"
                style={{ top: `${15 + (i * 11) % 70}%`, left: `${5 + (i * 17) % 80}%`, transform: `scale(${0.5 + (i % 3) * 0.5})` }} />
            ))}
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-8 sm:p-10">
            <div className="flex-1">
              <span className="inline-block text-xs font-black px-3 py-1.5 rounded-full bg-white/25 text-white border border-white/30 mb-4">
                {slide.badge}
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight whitespace-pre-line drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-sm text-white/85 mt-3 font-semibold">{slide.sub}</p>
              <div className="flex items-center gap-3 mt-6">
                <button onClick={() => setActiveCategory('')}
                  className="bg-white text-orange-500 font-black px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-all shadow-md text-sm">
                  {slide.cta} →
                </button>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                  {slide.tag}
                </span>
              </div>
            </div>
            <div className="text-8xl sm:text-9xl select-none drop-shadow-2xl">{slide.emoji}</div>
          </div>

          {/* Arrows */}
          <button onClick={() => setHeroSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all backdrop-blur-sm">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all backdrop-blur-sm">
            <ChevronRight size={16} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setHeroSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === heroSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📦', label: 'Total Produk', value: stats.total, color: 'from-violet-400 to-purple-500' },
            { icon: '🏷️', label: 'Produk Diskon', value: stats.discounted, color: 'from-orange-400 to-rose-500' },
            { icon: '⭐', label: 'Brand Tersedia', value: '56+', color: 'from-amber-400 to-orange-500' },
            { icon: '🗂️', label: 'Kategori Aktif', value: '4', color: 'from-sky-400 to-cyan-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-black text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Category cards ── */}
        <section>
          <h2 className="text-xl font-black text-slate-800 mb-4">🗂 Jelajahi Kategori</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ALL_CATEGORIES.map(cat => {
              const col = CATEGORY_COLORS[cat];
              const count = stats.categories.find(c => c.cat === cat)?.count ?? 0;
              const active = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(active ? '' : cat)}
                  className={`relative rounded-2xl p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 ${
                    active ? `border-transparent ring-2 ${col.ring} ring-offset-2` : 'border-slate-100 hover:border-slate-200'
                  } ${col.bg}`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${col.gradient} flex items-center justify-center text-2xl shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <p className={`font-black text-sm ${col.text}`}>{CATEGORY_LABELS[cat]}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">{count} produk</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Flash deals ── */}
        {featured.length > 0 && !search && !activeCategory && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm shadow-red-200 animate-pulse">
                ⚡ FLASH SALE
              </div>
              <h2 className="text-xl font-black text-slate-800">Diskon Terbesar Hari Ini</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {featured.map(p => (
                <ProductCard key={p.id} product={p} onAdd={addToCart} onWish={toggleWishlist} wished={wishlist.has(p.id)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Discount filter ── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Filter diskon:</span>
          {[null, 20, 30, 40, 50, 90].map(d => (
            <button key={d ?? 'all'} onClick={() => setActiveDiscount(d)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                activeDiscount === d ? 'bg-orange-500 text-white border-transparent shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
              }`}
            >
              {d === null ? 'Semua' : `-${d}%`}
            </button>
          ))}
        </div>

        {/* ── Error / info banner ── */}
        {fetchError && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{fetchError}</span>
          </div>
        )}

        {/* ── Product grid ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {activeCategory ? `${CATEGORY_ICONS[activeCategory as BCOKCategory]} ${CATEGORY_LABELS[activeCategory as BCOKCategory]}` : '🛍 Semua Produk'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                {filtered.length} produk{search ? ` untuk "${search}"` : ''}
              </p>
            </div>
            {(activeCategory || search || activeDiscount !== null) && (
              <button onClick={() => { setActiveCategory(''); setSearch(''); setActiveDiscount(null); }}
                className="text-xs font-bold text-orange-500 hover:text-orange-700 flex items-center gap-1 transition-colors">
                <RefreshCw size={11} /> Reset
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="h-44 bg-slate-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded w-1/2 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <div className="text-6xl">🔍</div>
              <p className="text-base font-bold">Produk tidak ditemukan</p>
              <p className="text-sm">Coba ubah kata pencarian atau hapus filter</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginated.map((p, idx) => (
                  <div key={p.id} className="fade-in-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <ProductCard product={p} onAdd={addToCart} onWish={toggleWishlist} wished={wishlist.has(p.id)} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-xl border border-slate-200 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                    <ChevronLeft size={15} />
                  </button>
                  {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                    const pn = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                    return (
                      <button key={pn} onClick={() => setPage(pn)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          pn === page ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-slate-200 hover:border-orange-300 text-slate-700'
                        }`}
                      >{pn}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-xl border border-slate-200 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white">
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Trust badges ── */}
        <section className="border-t border-slate-200 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🚚', title: 'Gratis Ongkir', desc: 'Pembelian > Rp 150.000', color: 'bg-orange-50 text-orange-600' },
              { icon: '🛡️', title: 'Produk Original', desc: 'Garansi keaslian 100%', color: 'bg-violet-50 text-violet-600' },
              { icon: '🔄', title: 'Mudah Return', desc: '7 hari pengembalian', color: 'bg-sky-50 text-sky-600' },
              { icon: '🎧', title: 'Customer Service', desc: 'Siap membantu 24/7', color: 'bg-emerald-50 text-emerald-600' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${b.color}`}>{b.icon}</div>
                <div>
                  <p className="text-sm font-black text-slate-800">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 bg-slate-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-violet-500 flex items-center justify-center text-base shadow">🎪</div>
            <div>
              <p className="text-sm font-black text-orange-400 leading-none">Kids Station</p>
              <p className="text-xs text-slate-500">Toko Mainan Terpercaya</p>
            </div>
          </div>
          <p className="text-xs text-slate-600">© 2025 Kids Station · BCOK Catalog · All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}