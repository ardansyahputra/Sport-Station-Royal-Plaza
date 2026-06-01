'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ShoppingBag,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import { getStoredProducts } from '@/lib/storage';
import { formatIDR, type Product } from '@/lib/mockData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';

export default function DashboardLandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // State Filter
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedDiscount, setSelectedDiscount] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // State Modal Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductToOrder, setSelectedProductToOrder] = useState<Product | null>(null);

  // State Form Order
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // ✅ Video manual — ganti nama file sesuai yang kamu taruh di folder public/
  const videos = [
    "/nike.mp4",
    "/nike.mp4",
    "/nike.mp4",
  ];

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const storedProducts = await getStoredProducts();
        setProducts(storedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const availableBrands = ['ALL', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter((product) => {
    const matchBrand = selectedBrand === 'ALL' || product.brand === selectedBrand;
    let matchDiscount = true;
    if (selectedDiscount === 'DISCOUNT') matchDiscount = product.discountPercent > 0;
    else if (selectedDiscount === 'NORMAL') matchDiscount = product.discountPercent === 0;
    // gender disimpan di field "category" (MEN/WOMEN/UNISEX)
    const rawGender = (product.category || '').toUpperCase();
    const matchGender = selectedGender === 'ALL' || rawGender === selectedGender;
    // kategori produk disimpan di field "productType" (FOOTWEAR/APPAREL/ACCESSORIES)
    const rawType = ((product as any).productType || '').toUpperCase();
    const matchCategory = selectedCategory === 'ALL' || rawType === selectedCategory;
    return matchBrand && matchDiscount && matchGender && matchCategory;
  });

  const handleOpenOrderModal = (product: Product) => {
    setSelectedProductToOrder(product);
    setIsModalOpen(true);
    setSelectedSize('');
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToOrder) return;

    const targetPhoneNumber = "6282225915363";
    const productPrice = selectedProductToOrder.discountPercent > 0
      ? formatIDR(selectedProductToOrder.discountedPrice)
      : formatIDR(selectedProductToOrder.originalPrice);

    const whatsappText = `⚡ *PESANAN BARU - SPORT STATION ROYAL* ⚡
    
Halo Admin Sport Station Royal Plaza! 👋
Saya tertarik dan ingin memesan produk keren ini. Berikut adalah detail pesanan saya:

============================
👟 *DETAIL PRODUK PREMIUM*
============================
• *Brand/Merk* : ${selectedProductToOrder.brand}
• *Model/Tipe* : ${selectedProductToOrder.modelName}
• *Kategori* : ${selectedProductToOrder.category}
• *Warna* : ${selectedProductToOrder.color || '-'}
• *Request Size (EU)* : 🔥 *${selectedSize}*
• *Total Harga* : *${productPrice}*

============================
👤 *DATA LENGKAP PEMESAN*
============================
• *Nama* : ${customerName}
• *Email* : ${customerEmail}
• *No. WhatsApp*: ${customerPhone}
• *Alamat Pengiriman*: ${customerAddress}

Mohon bantuan Admin untuk segera mengecek ketersediaan barang dan memproses pesanan ini ya. Terima kasih banyak! ✨`;

    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/${targetPhoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedSize('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="text-slate-600 font-medium text-sm tracking-widest animate-pulse">Memuat katalog Sport Station Royal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-800 antialiased font-sans overflow-x-hidden">

      {/* --- HERO BANNER SECTION --- */}
      <section className="relative w-full h-[60vh] md:h-[80vh] bg-slate-950 flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/nike.mp4" type="video/mp4" />
          Browser Anda tidak mendukung tag video.
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-0"></div>

        <div className="absolute inset-0 flex items-center z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-10">
          <div className="max-w-xl md:max-w-3xl space-y-4 md:space-y-6 animate-[fadeIn_1s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-widest rounded-full w-max">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              New Season Premium Gear
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-none drop-shadow-lg">
              SPORT STATION <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">ROYAL</span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base font-normal max-w-xl leading-relaxed drop-shadow">
              Temukan koleksi perlengkapan & sepatu olahraga original dari brand kelas dunia dengan penawaran terbaik langsung dari genggaman Anda.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#katalog"
                className="group flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-orange-500/20 rounded-xl"
              >
                <ShoppingBag size={14} />
                Jelajahi Produk
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@sportsstationroyal"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 rounded-xl backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
                TikTok
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/sportsstationroyal"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 rounded-xl backdrop-blur-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fcfcfc] to-transparent z-10"></div>
      </section>

      {/* --- WEEKLY PROMO SECTION --- */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 md:p-8">

          {/* Header Section */}
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3">
                <span>🔥 Weekly Update</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase">Promo Terkini Sport Station</h3>
              <p className="text-xs text-slate-500 mt-2">Video eksklusif koleksi terbaru kami</p>
            </div>
            {/* Badge TikTok */}
            <a
              href="https://www.tiktok.com/@sportsstationroyal"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              @sportsstationroyal
            </a>
          </div>

          {/* Video Horizontal Fullwidth */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-200 group" style={{ aspectRatio: '16/9' }}>
            <video
              src={videos[0]}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Badge LIVE */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              PROMO VIDEO
            </div>

            {/* User Tag bawah */}
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-orange-500/90 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow">
                <span className="text-[9px] text-white font-black">SS</span>
              </div>
              <div>
                <p className="text-white text-xs font-black drop-shadow">@sportsstationroyal</p>
                <p className="text-white/70 text-[9px] font-medium drop-shadow">Sport Station Royal Plaza</p>
              </div>
            </div>

            {/* Badge kanan bawah */}
            <div className="absolute bottom-5 right-5 z-10">
              <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                🔥 Weekly Update
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* --- FEATURES INFO SECTION --- */}
      <section className="relative z-20 mt-8 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/70 border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* 1. Layanan Pelanggan */}
          <div className="flex flex-col items-center p-4 text-center group hover:scale-[1.02] transition-transform duration-300 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="mb-4 p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-orange-500/30">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-2 text-slate-800">Layanan Pelanggan</h4>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full tracking-widest shadow-sm">
                10.00 - 22.00 WIB
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px] mx-auto">
                Admin kami siap membantu konsultasi ukuran, ketersediaan stok, dan info produk secara <span className="font-bold text-slate-700">real-time</span> via WhatsApp.
              </p>
            </div>
          </div>

          {/* 2. Kebijakan Penukaran */}
          <div className="flex flex-col items-center p-4 text-center group hover:scale-[1.02] transition-transform duration-300">
            <div className="mb-4 p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-orange-500/30">
              <RotateCcw size={28} strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-2 text-slate-800">Kebijakan Penukaran</h4>
            <div className="text-left text-[10px] text-slate-500 space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              <p className="font-bold text-slate-700 underline">Ketentuan Umum:</p>
              <p>Wajib bukti beli (GRATIS jika kasir tidak beri bukti). Kritik: map.active@map.co.id</p>
              <p className="font-bold text-slate-700 underline pt-1">Kebijakan:</p>
              <ul className="list-disc pl-3 space-y-0.5">
                <li>Maks. 7 hari di lokasi pembelian.</li>
                <li>Harga normal, kondisi asli & tag utuh.</li>
                <li>Wajib bawa bukti beli asli.</li>
                <li>Bukan barang "Heat Item".</li>
                <li>Tidak berlaku untuk: Skincare, Swimwear, Underwear, Socks, Earrings, F&B.</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">

        {/* --- CATALOGUE SECTION --- */}
        <section id="katalog" className="space-y-8 scroll-mt-10">
          <div className="text-center max-w-sm mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">Our Collection</h2>
            <div className="h-1 w-12 bg-orange-500 mx-auto rounded-full"></div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Koleksi Produk Terlaris Hanya Untuk Anda</p>
          </div>

          {/* Bar Filter Dinamis */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm flex-shrink-0">
              <SlidersHorizontal size={16} className="text-orange-500" />
              <span>Saring Berdasarkan:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto xl:flex xl:items-center">
              {/* Filter Brand */}
              <div className="space-y-1.5 min-w-[180px]">
                <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Brand Eksklusif</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand === 'ALL' ? '🌟 Semua Brand' : `👟 ${brand}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                {/* Filter Gender */}
                <div className="space-y-1.5 w-full">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Gender</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Gender</option>
                    <option value="MEN">👨 Men</option>
                    <option value="WOMEN">👩 Women</option>
                    <option value="UNISEX">🚻 Unisex</option>
                  </select>
                </div>

                {/* Filter Kategori */}
                <div className="space-y-1.5 w-full">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  >
                    <option value="ALL">Semua Produk</option>
                    <option value="FOOTWEAR">👟 Footwear</option>
                    <option value="APPAREL">👕 Apparel</option>
                    <option value="ACCESSORIES">👜 Accessories</option>
                  </select>
                </div>
              </div>

              {/* Filter Kategori Harga */}
              <div className="space-y-1.5 min-w-[180px]">
                <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kategori Penawaran</label>
                <select
                  value={selectedDiscount}
                  onChange={(e) => setSelectedDiscount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none"
                >
                  <option value="ALL">💰 Semua Harga</option>
                  <option value="DISCOUNT">🔥 Sedang Promo Diskon %</option>
                  <option value="NORMAL">🏷️ Harga Normal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Produk */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-100 bg-white rounded-3xl shadow-sm max-w-md mx-auto p-6">
              <p className="text-sm text-slate-400 font-medium">Maaf, tidak ada produk yang cocok dengan kombinasi filter Anda.</p>
              <button
                onClick={() => { setSelectedBrand('ALL'); setSelectedDiscount('ALL'); setSelectedGender('ALL'); setSelectedCategory('ALL'); }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-orange-500 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const hasDiscount = product.discountPercent > 0;
                const availableSizes = product.sizes
                  ? product.sizes.filter((s) => s.stock > 0).map((s) => s.eu)
                  : [];

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-slate-50/50 w-full overflow-hidden flex items-center justify-center p-4">
                      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                        {hasDiscount && (
                          <span className="bg-pink-600 text-white font-extrabold text-xs tracking-wider uppercase px-2 py-1 rounded shadow-sm">
                            -{product.discountPercent}%
                          </span>
                        )}
                        <span className="bg-emerald-600 text-white font-bold text-[9px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm w-max">
                          ORIGINAL
                        </span>
                      </div>
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"}
                        alt={product.modelName}
                        className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop";
                        }}
                      />
                    </div>

                    <div className="p-4 flex flex-col flex-1 bg-white">
                      <div className="flex-1 space-y-1.5">
                        {/* Baris Brand */}
                        <span className="text-orange-500 font-black text-sm uppercase tracking-wider">{product.brand}</span>

                        {/* Baris Badge: Kategori (productType) + Gender (category) + Article Code */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Badge Type (RUNNING, CASUAL, dll) */}
                          {(() => {
                            const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
                              'RUNNING':          { label: '🏃 Running',        bg: '#DBEAFE', text: '#1D4ED8' },
                              'CASUAL LACE-UPS':  { label: '👟 Casual Lace-Ups',bg: '#F0FDF4', text: '#15803D' },
                              'CASUAL BOOTS':     { label: '🥾 Casual Boots',   bg: '#FEF3C7', text: '#B45309' },
                              'CASUAL SHOES':     { label: '👞 Casual Shoes',   bg: '#FEF9C3', text: '#A16207' },
                              'SANDAL':           { label: '🩴 Sandal',         bg: '#FFF7ED', text: '#C2410C' },
                              'SKATE':            { label: '🛹 Skate',          bg: '#F5F3FF', text: '#7C3AED' },
                              'WALKING':          { label: '🚶 Walking',        bg: '#ECFDF5', text: '#047857' },
                              'INDOOR / COURT':   { label: '🏸 Indoor/Court',   bg: '#EFF6FF', text: '#2563EB' },
                              'BASKET BALL':      { label: '🏀 Basketball',     bg: '#FFF7ED', text: '#EA580C' },
                              'X - TRAININNG':    { label: '💪 Training',       bg: '#FDF2F8', text: '#9D174D' },
                              'LIFESTYLE':        { label: '✨ Lifestyle',      bg: '#F0FDFA', text: '#0F766E' },
                              'OUTDOOR':          { label: '⛰️ Outdoor',        bg: '#ECFCCB', text: '#3F6212' },
                              'SOCCER / FOOTBALL':{ label: '⚽ Soccer',         bg: '#F0FDF4', text: '#166534' },
                              'TENNIS':           { label: '🎾 Tennis',         bg: '#FFFBEB', text: '#92400E' },
                              'FOOTWEAR':         { label: '👟 Footwear',       bg: '#F1F5F9', text: '#475569' },
                              'APPAREL':          { label: '👕 Apparel',        bg: '#F5F3FF', text: '#6D28D9' },
                              'ACCESSORIES':      { label: '👜 Accessories',    bg: '#FEF3C7', text: '#B45309' },
                            };
                            const typeKey = ((product as any).type || (product as any).productType || '').toUpperCase();
                            const cfg = TYPE_CONFIG[typeKey] ?? { label: typeKey || 'Footwear', bg: '#F1F5F9', text: '#475569' };
                            if (!typeKey) return null;
                            return (
                              <span
                                className="font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded"
                                style={{ backgroundColor: cfg.bg, color: cfg.text }}
                              >
                                {cfg.label}
                              </span>
                            );
                          })()}
                          {/* Badge Gender dari product.category */}
                          {(() => {
                            const GENDER_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
                              'MEN':    { label: '♂ MEN',    bg: '#DBEAFE', text: '#1D4ED8' },
                              'MALE':   { label: '♂ MEN',    bg: '#DBEAFE', text: '#1D4ED8' },
                              'WOMEN':  { label: '♀ WOMEN',  bg: '#FCE7F3', text: '#BE185D' },
                              'FEMALE': { label: '♀ WOMEN',  bg: '#FCE7F3', text: '#BE185D' },
                              'UNISEX': { label: '⚥ UNISEX', bg: '#EDE9FE', text: '#6D28D9' },
                              'KIDS':   { label: '🧒 KIDS',  bg: '#FEF3C7', text: '#B45309' },
                            };
                            const genderKey = (product.category || 'UNISEX').toUpperCase();
                            const cfg = GENDER_CONFIG[genderKey] ?? GENDER_CONFIG['UNISEX'];
                            return (
                              <span
                                className="font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded"
                                style={{ backgroundColor: cfg.bg, color: cfg.text }}
                              >
                                {cfg.label}
                              </span>
                            );
                          })()}
                          {/* Article Code */}
                          {(product as any).productCode && (
                            <span className="bg-slate-800 text-slate-300 font-mono font-bold text-[8px] tracking-wider px-2 py-0.5 rounded truncate max-w-[110px]" title={(product as any).productCode}>
                              #{(product as any).productCode}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                          {product.modelName}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">{product.color || 'Multicolor'}</p>
                        <div className="pt-1">
                          {availableSizes.length > 0 ? (
                            <div className="border border-slate-100 rounded-xl overflow-hidden">
                              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ready Size (EU)</span>
                              </div>
                              <div className="grid grid-cols-3 divide-x divide-y divide-slate-100">
                                {availableSizes.map((sz) => (
                                  <div key={sz} className="flex flex-col items-center justify-center py-1.5 px-1 bg-white hover:bg-orange-50 transition-colors">
                                    <span className="text-[11px] font-black text-slate-800 leading-none">{sz}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-block text-xs bg-pink-50 border border-pink-100 px-2 py-0.5 rounded text-pink-600 font-bold uppercase tracking-wider">
                              Out Of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-2">
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-sm font-extrabold text-slate-900">{formatIDR(product.discountedPrice)}</span>
                              <span className="text-[10px] text-slate-400 line-through font-medium">{formatIDR(product.originalPrice)}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-extrabold text-slate-900">{formatIDR(product.originalPrice)}</span>
                          )}
                        </div>
                        <button
                          disabled={availableSizes.length === 0}
                          onClick={() => handleOpenOrderModal(product)}
                          className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-orange-500 hover:shadow-md transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          {availableSizes.length > 0 ? 'Order Now' : 'Habis'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- SECTION ABOUT US & GOOGLE MAPS --- */}
        <section className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-orange-500 font-extrabold text-[11px] uppercase tracking-widest">
                <span className="h-1 w-5 bg-orange-500 rounded-full"></span>
                Authorized Store
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                About Sport Station <br />
                <span className="text-orange-500">Royal Plaza</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sport Station Royal Plaza Surabaya adalah destinasi utama Anda untuk mendapatkan perlengkapan olahraga dan *lifestyle sneaker* 100% original dari brand terkemuka dunia seperti Nike, Adidas, Puma, Skechers, Reebok, Converse, dan Diadora.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Kami berkomitmen memberikan pengalaman belanja katalog digital yang instan, transparan, dan terpercaya dengan kemudahan pemesanan langsung terhubung ke admin gerai resmi kami melalui WhatsApp.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                <MapPin size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Lantai Ground, Royal Plaza, Jl. Ahmad Yani No.16-18, Surabaya, Jawa Timur</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <Clock size={16} className="text-orange-500 flex-shrink-0" />
                <span>Buka Setiap Hari: 10:00 - 22:00 WIB</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <Phone size={16} className="text-orange-500 flex-shrink-0" />
                <span>+62 822-2591-5363 (CS Online)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative min-h-[300px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.545115201402!2d112.7303043!3d-7.2974421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb32c66c3c5b%3A0x633a681c61830172!2sRoyal%20Plaza!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sports Station Royal Plaza Map"
            ></iframe>
            <a
              href="https://maps.app.goo.gl/example"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 bg-white hover:bg-slate-900 hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-lg text-[11px] font-bold text-slate-800 transition-colors flex items-center gap-1.5 z-10"
            >
              <MapPin size={12} className="text-orange-500" />
              Buka di Google Maps
            </a>
          </div>
        </section>

      </main>

      {/* --- FOOTER AREA --- */}
      <footer className="bg-white border-t border-slate-100 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <h2 className="font-black tracking-widest uppercase text-base">
            <span className="text-orange-500">Sport Station</span> <span className="text-slate-900">Royal</span>
          </h2>
          <p className="text-xs text-slate-400 font-normal">© {currentYear} Public Catalog Engine. All rights reserved.</p>
        </div>
      </footer>

      {/* --- MODAL POPUP FORM ORDER --- */}
      {isModalOpen && selectedProductToOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)] max-h-[90vh] flex flex-col">

            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Format Pemesanan Instan</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
            <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <img
                    src={selectedProductToOrder.imageUrl}
                    alt=""
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"}
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-orange-500 font-black text-[9px] uppercase">{selectedProductToOrder.brand}</span>
                    <span className="text-slate-300 text-[9px]">•</span>
                    {(() => {
                      const gender = ((selectedProductToOrder as any).gender || '').toUpperCase();
                      const genderConfig: Record<string, { label: string; bg: string }> = {
                        MEN:    { label: '♂ MEN',    bg: 'bg-blue-600' },
                        MALE:   { label: '♂ MEN',    bg: 'bg-blue-600' },
                        WOMEN:  { label: '♀ WOMEN',  bg: 'bg-pink-500' },
                        FEMALE: { label: '♀ WOMEN',  bg: 'bg-pink-500' },
                        UNISEX: { label: '⚥ UNISEX', bg: 'bg-violet-600' },
                        KIDS:   { label: '🧒 KIDS',  bg: 'bg-amber-500' },
                      };
                      const cfg = genderConfig[gender] || { label: gender || 'UNISEX', bg: 'bg-slate-500' };
                      return (
                        <span className={`${cfg.bg} text-white font-extrabold text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded`}>
                          {cfg.label}
                        </span>
                      );
                    })()}
                  </div>
                  {(selectedProductToOrder as any).productCode && (
                    <p className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">
                      Art. <span className="text-slate-600">#{(selectedProductToOrder as any).productCode}</span>
                    </p>
                  )}
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedProductToOrder.modelName}</p>
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedProductToOrder.discountPercent > 0
                      ? formatIDR(selectedProductToOrder.discountedPrice)
                      : formatIDR(selectedProductToOrder.originalPrice)}
                  </p>
                </div>
              </div>

             {/* TABEL INFO STOK SIZE */}
  <div className="space-y-2">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
      Ketersediaan Stok Size (EU)
    </label>
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
        <div className="px-3 py-2 text-center">Size EU</div>
        <div className="px-3 py-2 text-center border-l border-white/10">Stok Tersedia</div>
      </div>
      <div className="overflow-y-auto max-h-[130px] divide-y divide-slate-100">
        {selectedProductToOrder.sizes &&
          selectedProductToOrder.sizes
            .filter((sizeEntry) => sizeEntry.stock > 0)
            .sort((a, b) => parseFloat(a.eu) - parseFloat(b.eu))
            .map((sizeEntry) => (
              <div key={sizeEntry.eu} className="grid grid-cols-2 text-xs bg-white hover:bg-slate-50 transition-colors">
                <div className="px-3 py-2 text-center font-black text-slate-800 font-mono">
                  {sizeEntry.eu}
                </div>
                <div className="px-3 py-2 text-center border-l border-slate-100">
                  <span className="font-bold text-[10px] text-emerald-600">{sizeEntry.stock} pcs</span>
                </div>
              </div>
            ))}
        {(!selectedProductToOrder.sizes || selectedProductToOrder.sizes.every(s => s.stock === 0)) && (
          <div className="px-3 py-3 text-center text-[10px] font-bold text-pink-500">Semua ukuran habis</div>
        )}
      </div>
    </div>
    <p className="text-[10px] text-slate-400 italic">↕ Scroll untuk lihat semua ukuran yang tersedia</p>
  </div>

  {/* REQUEST SIZE — TULIS MANUAL */}
  <div className="space-y-1.5">
    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
      Request Size (EU) <span className="text-pink-500">*</span>
    </label>
    <input
      type="text"
      required
      placeholder="Contoh: 42, 43, atau 41.5"
      value={selectedSize}
      onChange={(e) => setSelectedSize(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:font-normal placeholder:text-slate-400"
    />
    <p className="text-[10px] text-slate-400 italic">Tulis ukuran yang kamu inginkan sesuai tabel stok di atas</p>
  </div>
  {/* AKHIR SIZE SECTION */}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap Pemesan <span className="text-pink-500">*</span></label>
                <input
                  type="text" required placeholder="Contoh: Budi Santoso"
                  value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alamat Email Aktif <span className="text-pink-500">*</span></label>
                <input
                  type="email" required placeholder="Contoh: budi@gmail.com"
                  value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">No. WhatsApp Pemesan <span className="text-pink-500">*</span></label>
                <input
                  type="tel" required placeholder="Contoh: 081234567890"
                  value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Field Alamat */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Alamat Lengkap <span className="text-pink-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Ahmad Yani No.10, RT 02/RW 03, Kel. Gayungan, Kec. Gayungan, Surabaya, Jawa Timur 60235"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} />
                  Kirim Pesanan Ke WhatsApp
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}