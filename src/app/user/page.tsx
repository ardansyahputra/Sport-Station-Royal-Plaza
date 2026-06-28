'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeOut, setWelcomeOut] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // State Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedDiscount, setSelectedDiscount] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // State Modal Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductToOrder, setSelectedProductToOrder] = useState<Product | null>(null);

  // State Modal CNB
  const [isCNBModalOpen, setIsCNBModalOpen] = useState(false);

  // State Form Order
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Loop Google Drive video: reload iframe setiap X detik (sesuai durasi video)
  const [iframeKey, setIframeKey] = useState(0);
  const DRIVE_VIDEO_DURATION_MS = 60 * 1000; // ganti angka ini sesuai durasi video (detik × 1000)
  useEffect(() => {
    const timer = setInterval(() => {
      setIframeKey(k => k + 1);
    }, DRIVE_VIDEO_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  // Data 10 Grup CNB
  const cnbGroups = [
    { num: 1,  url: 'https://chat.whatsapp.com/Bervk63uUZk7MqM6GBhosN' },
    { num: 2,  url: 'https://chat.whatsapp.com/FDzVkoJHn6PBQq6BD0YW1K' },
    { num: 3,  url: 'https://chat.whatsapp.com/LYfVSs2itlfK7snXgEGDE7' },
    { num: 4,  url: 'https://chat.whatsapp.com/I0BPjgeuCNy34KzNA1xxOf' },
    { num: 5,  url: 'https://chat.whatsapp.com/DeXHoO1TTIrEllnOYoSMng' },
    { num: 6,  url: 'https://chat.whatsapp.com/G5L3wb1N1V3F9T8u1sAg3M' },
    { num: 7,  url: 'https://chat.whatsapp.com/Dn2xfjAWxWc5Ow13OtVDrh' },
    { num: 8,  url: 'https://chat.whatsapp.com/HBwcu1ouhaj17F2ICUiAUZ' },
    { num: 9,  url: 'https://chat.whatsapp.com/Fgj2crnZcbQ6Ep27zuegAr' },
    { num: 10, url: 'https://chat.whatsapp.com/BiYCAkKUAOK3kzXmanN7S7' },
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
        setShowWelcome(true);
        setTimeout(() => setWelcomeOut(true), 2800);
        setTimeout(() => setShowWelcome(false), 3400);
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
    const rawGender = (product.category || '').toUpperCase();
    const matchGender = selectedGender === 'ALL' || rawGender === selectedGender;
    const rawType = ((product as any).productType || '').toUpperCase();
    const matchCategory = selectedCategory === 'ALL' || rawType === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      (product.modelName || '').toLowerCase().includes(q) ||
      (product.brand || '').toLowerCase().includes(q) ||
      ((product as any).productCode || '').toLowerCase().includes(q) ||
      (product.color || '').toLowerCase().includes(q);
    return matchBrand && matchDiscount && matchGender && matchCategory && matchSearch;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #fff7f0 0%, #ffffff 50%, #fff3e8 100%)' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
          <p className="text-orange-500 font-bold text-sm tracking-widest animate-pulse uppercase">Memuat katalog Sport Station Royal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 antialiased font-sans overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #fff7f0 0%, #ffffff 40%, #fff3e8 70%, #ffffff 100%)' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', animation: 'bgFloat1 14s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 -left-48 w-[600px] h-[600px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)', animation: 'bgFloat2 18s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #fdba74 0%, transparent 70%)', animation: 'bgFloat3 12s ease-in-out infinite' }}
        />
        {/* Subtle diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #f97316 0px, #f97316 1px, transparent 1px, transparent 40px)',
          }}
        />
      </div>

      {/* === GLOBAL STYLES === */}
      <style>{`
        @keyframes welcomeFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes welcomeFadeOut {
          from { opacity: 1; } to { opacity: 0; }
        }
        @keyframes logoReveal {
          0%   { opacity: 0; transform: scale(0.7) translateY(30px); }
          60%  { opacity: 1; transform: scale(1.05) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes taglineSlide {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50%       { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @keyframes barGrow {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes bgFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -40px) scale(1.08); }
          66%       { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes bgFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-40px, 30px) scale(1.12); }
        }
        @keyframes bgFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(20px, -20px) scale(0.9); }
          80%       { transform: translate(-15px, 35px) scale(1.05); }
        }
        @keyframes welcomeSweep {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(400%) skewX(-15deg); }
        }
        @keyframes welcomeRing {
          0%   { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes welcomeDot {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.5); opacity: 1; }
        }
        @keyframes bgDiagonalMove {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        @keyframes cnbPulseRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes cnbFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes cnbShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes cnbArrow {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50%       { transform: translateX(5px); opacity: 0.6; }
        }
        @keyframes cnbOverlayIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes cnbSheetUp {
          from { opacity: 0; transform: translateY(60px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cnbItemIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes cnbGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
          50%       { box-shadow: 0 0 20px 4px rgba(249,115,22,0.3); }
        }
        @keyframes cnbBadgePop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes cnbShineLine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* === WELCOME ANIMATION OVERLAY === */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #fff7f0 0%, #ffffff 35%, #fff3e0 65%, #fff8f2 100%)',
            animation: welcomeOut
              ? 'welcomeFadeOut 0.6s ease-in forwards'
              : 'welcomeFadeIn 0.5s ease-out forwards',
          }}
        >
          {/* Animated radial burst background */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(251,146,60,0.08) 45%, transparent 70%)', animation: 'bgFloat1 6s ease-in-out infinite' }}
            />
            {/* Pulse rings */}
            {[0, 0.4, 0.8].map((delay, i) => (
              <span
                key={i}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-300/40"
                style={{
                  width: `${180 + i * 120}px`,
                  height: `${180 + i * 120}px`,
                  animation: `welcomeRing 2s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Sweep shimmer lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[0.5, 1.1, 1.7].map((delay, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-16 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)',
                  animation: `welcomeSweep 2.4s ease-in-out ${delay}s both`,
                }}
              />
            ))}
          </div>

          {/* Corner accents */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-orange-400/60 rounded-tl-xl" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-orange-400/60 rounded-tr-xl" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-orange-400/60 rounded-bl-xl" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-orange-400/60 rounded-br-xl" />

          {/* Sparkle dots */}
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-orange-400"
              style={{
                width: `${4 + (i % 3) * 3}px`,
                height: `${4 + (i % 3) * 3}px`,
                top: `${12 + Math.sin(i * 1.1) * 32}%`,
                left: `${8 + (i * 9)}%`,
                animation: `sparkle ${0.7 + i * 0.12}s ease-in-out ${0.3 + i * 0.1}s both`,
              }}
            />
          ))}

          <div className="text-center px-8 space-y-5 relative z-10">
            {/* Brand mark */}
            <div style={{ animation: 'logoReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-lg shadow-orange-300/40">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                ★ Welcome To ★
              </div>
              <h1 className="text-slate-900 text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none drop-shadow-sm">
                Sport Station
              </h1>
              <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 text-2xl sm:text-4xl font-black uppercase tracking-widest mt-1">
                Royal Plaza
              </h2>
            </div>
            <p
              className="text-slate-500 text-xs sm:text-sm font-semibold tracking-widest uppercase"
              style={{ animation: 'taglineSlide 0.5s ease-out 0.9s both' }}
            >
              Katalog Digital · Original Produk · Surabaya
            </p>
            <div
              className="mx-auto w-56 h-1 bg-orange-100 rounded-full overflow-hidden shadow-inner"
              style={{ animation: 'taglineSlide 0.4s ease-out 1s both' }}
            >
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 rounded-full shadow-md shadow-orange-300/50"
                style={{ animation: 'barGrow 2s ease-out 0.3s both' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- HERO BANNER SECTION --- */}
      <section className="relative z-10 w-full h-[60vh] md:h-[80vh] bg-slate-950 flex items-center justify-center overflow-hidden">
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
          <div className="max-w-xl md:max-w-3xl space-y-4 md:space-y-6" style={{ animation: 'fadeIn 1s ease-out' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-widest rounded-full w-max">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              WEB KATALOG SPORT STATION SURABAYA
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-none drop-shadow-lg">
              SPORT STATION <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">ROYAL PLAZA SURABAYA</span>
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
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fff7f0] to-transparent z-10"></div>
      </section>

      {/* --- WEEKLY PROMO SECTION --- */}
      <section className="relative z-20 max-w-md mx-auto px-4 mt-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                <span>🔥 Weekly Update</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase leading-tight">Promo Terkini<br/>Sport Station</h3>
              <p className="text-[11px] text-slate-500 mt-1">Video eksklusif koleksi terbaru kami</p>
            </div>
            <a
              href="https://www.tiktok.com/@sportsstationroyal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
              TikTok
            </a>
          </div>

          {/* Video — full width, no gap */}
          <div className="relative w-full aspect-[9/16] bg-slate-900">
            <iframe
              key={iframeKey}
              src="https://drive.google.com/file/d/1Gro_mvPsUIXDbNwlmM4w9_A5X7MJwiox/preview"
              className="absolute inset-0 w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
              PROMO VIDEO
            </div>
            <div className="absolute bottom-5 left-5 z-10 flex items-center gap-2 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-orange-500/90 backdrop-blur-md flex items-center justify-center border-2 border-white/30 shadow">
                <span className="text-[9px] text-white font-black">SS</span>
              </div>
              <div>
                <p className="text-white text-xs font-black drop-shadow">@sportsstationroyal</p>
                <p className="text-white/70 text-[9px] font-medium drop-shadow">Sport Station Royal Plaza</p>
              </div>
            </div>
            <div className="absolute bottom-5 right-5 z-10">
              <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                🔥 Weekly Update
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* --- LAYANAN PELANGGAN SECTION --- */}
      <section className="relative z-20 mt-8 max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/70 border border-slate-100 p-8 flex flex-col items-center text-center">
          <div className="mb-4 p-3 bg-orange-50 text-orange-500 rounded-2xl shadow-sm">
            <ShieldCheck size={28} strokeWidth={2} />
          </div>
          <h4 className="text-sm font-bold tracking-wider uppercase mb-4 text-slate-800">
            Layanan Pelanggan
          </h4>
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-full tracking-widest shadow-sm">
              10.00 - 22.00 WIB
            </span>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Admin kami siap membantu konsultasi ukuran, ketersediaan stok, dan info produk secara <span className="font-bold text-slate-700">real-time</span> via WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* === CNB GROUP SECTION === */}
      <section className="relative z-20 mt-8 max-w-6xl mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-3xl border border-orange-200 shadow-xl shadow-orange-100/60"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
        >
          {/* Decorative glowing orbs */}
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Left: Icon + badge */}
            <div className="flex-shrink-0 relative" style={{ animation: 'cnbFloat 3s ease-in-out infinite' }}>
              <span className="absolute inset-0 rounded-full bg-orange-500/40"
                style={{ animation: 'cnbPulseRing 2s ease-out infinite' }} />
              <span className="absolute inset-0 rounded-full bg-orange-500/30"
                style={{ animation: 'cnbPulseRing 2s ease-out 0.6s infinite' }} />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-2xl shadow-orange-500/40">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm1 7.5h-2v-2h2v2zm0-4h-2V13h2v2.5zM11.93 12.02C11.04 10.2 9.16 9 7 9c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.79 0 3.39-.75 4.54-1.95C10.59 17.85 10 16.49 10 15c0-1.09.28-2.12.76-3.02l1.17.02zM7 19c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM21 5V3H3v2h8v2H3v2h8.1c.9-1.21 2.21-2.09 3.73-2.38C15.56 6.24 16.26 6 17 6c1.38 0 2.63.56 3.54 1.46L21 7V5z"/>
                </svg>
              </div>
            </div>

            {/* Center: Text content */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping inline-block" />
                Komunitas Resmi
              </div>
              <h3 className="text-white text-xl sm:text-3xl font-black uppercase tracking-tight leading-tight">
                Gabung Grup{' '}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #f97316, #fbbf24, #f97316)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    animation: 'cnbShimmer 2.5s linear infinite',
                  }}
                >
                  CNB
                </span>
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
                Mau dapet info promo eksklusif, flash sale, dan update produk terbaru duluan?
                Yuk, masuk ke grup komunitas <span className="text-white font-bold">CNB</span> — gratis dan langsung terhubung ke tim kami! 🔥
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {['🔥 Flash Sale Duluan', '📦 Info Stok Baru', '🎁 Promo Eksklusif', '💬 Tanya Admin'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 text-[10px] font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CTA Button — buka modal */}
            <div className="flex-shrink-0 text-center">
              <button
                onClick={() => setIsCNBModalOpen(true)}
                className="group relative inline-flex flex-col items-center gap-1"
              >
                <span className="absolute -inset-1 rounded-2xl bg-orange-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-2xl shadow-orange-500/40 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-orange-500/60">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Klik Di Sini
                  <span style={{ animation: 'cnbArrow 1s ease-in-out infinite' }}>→</span>
                </span>
                <span className="text-slate-500 text-[10px] font-medium mt-1">Pilih Grup WhatsApp CNB</span>
              </button>
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
              {/* Search Bar */}
              <div className="space-y-1.5 min-w-[200px]">
                <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Cari Produk</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                  <input
                    type="text"
                    placeholder="Nama model, brand, kode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:font-normal placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>

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
                onClick={() => { setSelectedBrand('ALL'); setSelectedDiscount('ALL'); setSelectedGender('ALL'); setSelectedCategory('ALL'); setSearchQuery(''); }}
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
                    <div className="relative aspect-[9/16] bg-slate-50/50 w-full overflow-hidden flex items-center justify-center p-4">
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
                        <span className="text-orange-500 font-black text-sm uppercase tracking-wider">{product.brand}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const pt = ((product as any).productType || '').toUpperCase();
                            const typeLabel: Record<string, string> = {
                              FOOTWEAR: '👟 Footwear',
                              APPAREL: '👕 Apparel',
                              ACCESSORIES: '👜 Accessories',
                            };
                            const label = typeLabel[pt] || pt;
                            if (!label) return null;
                            return (
                              <span className="bg-slate-100 text-slate-700 font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded border border-slate-200/60">
                                {label}
                              </span>
                            );
                          })()}
                          {(() => {
                            const genderUpper = (product.category || 'UNISEX').toUpperCase();
                            const genderConfig: Record<string, { label: string; bg: string }> = {
                              MEN:    { label: '♂ MEN',    bg: 'bg-blue-600'   },
                              MALE:   { label: '♂ MEN',    bg: 'bg-blue-600'   },
                              WOMEN:  { label: '♀ WOMEN',  bg: 'bg-pink-500'   },
                              FEMALE: { label: '♀ WOMEN',  bg: 'bg-pink-500'   },
                              UNISEX: { label: '⚥ UNISEX', bg: 'bg-violet-600' },
                              KIDS:   { label: '🧒 KIDS',  bg: 'bg-amber-500'  },
                            };
                            const cfg = genderConfig[genderUpper] ?? { label: '⚥ UNISEX', bg: 'bg-violet-600' };
                            return (
                              <span className={`${cfg.bg} text-white font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded`}>
                                {cfg.label}
                              </span>
                            );
                          })()}
                          {(product as any).subType && (() => {
                            const subType = (product as any).subType.toUpperCase();
                            const colorMap: Record<string, string> = {
                              RUNNING: 'bg-orange-500',
                              CASUAL: 'bg-emerald-600',
                              TRAINING: 'bg-blue-600',
                              LIFESTYLE: 'bg-purple-600',
                              BASKETBALL: 'bg-red-600',
                            };
                            const bgColor = colorMap[subType] || 'bg-slate-700';
                            return (
                              <span className={`${bgColor} text-white font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded border border-white/10`}>
                                {subType}
                              </span>
                            );
                          })()}
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
                About Store
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                About <br />
                <span className="text-orange-500">Sport Station Royal Plaza</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sport Station Royal Plaza Surabaya adalah destinasi utama Anda untuk mendapatkan perlengkapan olahraga dan lifestyle sneaker 100% original dari brand terkemuka dunia seperti Nike, Adidas, Puma, Skechers, Reebok, Converse, dan Diadora.
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
            {/* ✅ FIXED: Koordinat tepat Royal Plaza Surabaya — Jl. Ahmad Yani */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.6107983598!2d112.73117531477397!3d-7.294399794717483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fbf8381ac47f%3A0x21df62b4ff995ba2!2sRoyal%20Plaza%20Surabaya!5e0!3m2!1sen!2sid!4v1717900000001!5m2!1sen!2sid"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sports Station Royal Plaza Map"
            ></iframe>
            <a
              href="https://maps.app.goo.gl/RoyalPlazaSurabaya"
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
      <footer className="relative z-10 border-t border-orange-100 mt-24 py-12" style={{ background: 'linear-gradient(180deg, #fff7f0 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <h2 className="font-black tracking-widest uppercase text-base">
            <span className="text-orange-500">Sport Station</span> <span className="text-slate-900">Royal Plaza</span>
          </h2>
          <p className="text-xs text-slate-400 font-normal">© {currentYear} Sport Station Royal Plaza. COPYRIGHT BY Sport Station Royal Plaza</p>
        </div>
      </footer>

      {/* === MODAL CNB GROUP === */}
      {isCNBModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md"
          style={{ animation: 'cnbOverlayIn 0.3s ease-out forwards' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsCNBModalOpen(false); }}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            style={{ animation: 'cnbSheetUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
          >
            {/* Header Modal CNB */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-6 pb-8 flex-shrink-0">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              {/* Close button */}
              <button
                onClick={() => setIsCNBModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white transition-all duration-200 z-10"
              >
                <X size={16} />
              </button>

              {/* Badge animasi pop */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-3 relative z-10"
                style={{ animation: 'cnbBadgePop 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                10 Grup Aktif · Komunitas CNB
              </div>

              <h2 className="text-white text-xl font-black uppercase tracking-tight leading-tight relative z-10">
                Pilih Grup{' '}
                <span
                  className="text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #f97316, #fbbf24, #f97316)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    animation: 'cnbShimmer 2.5s linear infinite',
                  }}
                >
                  WhatsApp CNB
                </span>
              </h2>
              <p className="text-slate-400 text-[11px] mt-1.5 relative z-10 leading-relaxed">
                Pilih salah satu grup di bawah untuk bergabung. Gratis & langsung terhubung ke komunitas kami! 🔥
              </p>

              {/* Animated shimmer bar */}
              <div className="mt-4 h-0.5 bg-white/10 rounded-full overflow-hidden relative z-10">
                <div
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"
                  style={{ animation: 'cnbShineLine 1.8s ease-in-out infinite' }}
                />
              </div>
            </div>

            {/* List 10 Grup */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2.5 bg-slate-50">
              {cnbGroups.map(({ num, url }, i) => (
                <a
                  key={num}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden"
                  style={{ animation: `cnbItemIn 0.4s ease-out ${0.08 + i * 0.045}s both` }}
                >
                  {/* Shine sweep on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-orange-50 to-transparent skew-x-12 group-hover:translate-x-[600%] transition-transform duration-700" />
                  </div>

                  {/* Nomor bulat gradient */}
                  <div
                    className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: num <= 5
                        ? 'linear-gradient(135deg, #f97316, #fbbf24)'
                        : 'linear-gradient(135deg, #f97316, #ef4444)',
                      animation: `cnbGlow 2.5s ease-in-out ${i * 0.25}s infinite`,
                    }}
                  >
                    {num}
                  </div>

                  {/* Info teks */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors duration-200">
                      Grup CNB Sport Station #{num}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      chat.whatsapp.com/···
                    </p>
                  </div>

                  {/* Arrow icon */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-white transition-colors" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer Modal */}
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                🔒 Semua grup dikelola resmi oleh{' '}
                <span className="font-bold text-slate-600">Sport Station Royal Plaza</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL POPUP FORM ORDER --- */}
      {isModalOpen && selectedProductToOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[90vh] flex flex-col" style={{ animation: 'scaleUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>

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
                        const gender = (selectedProductToOrder.category || 'UNISEX').toUpperCase();
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

                {/* Tabel stok size */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Ketersediaan Stok Size (EU)
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                      <div className="px-3 py-2 text-center"> Size EU atau CM</div>
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

                {/* Request Size */}
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