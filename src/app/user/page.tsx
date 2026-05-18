'use client';

import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  ShoppingBag,
  X,
  Upload,
  CheckCircle2,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import { getStoredProducts } from '@/lib/storage';
import { formatIDR, type Product } from '@/lib/mockData';

export default function DashboardLandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  
  // State Filter
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedDiscount, setSelectedDiscount] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');

  // State Modal Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductToOrder, setSelectedProductToOrder] = useState<Product | null>(null);
  
  // State Form Order
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [selectedSize, setSelectedSize] = useState(''); 

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    const fetchData = async () => {
      try {
        const storedProducts = await getStoredProducts();
        setProducts(storedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const availableBrands = ['ALL', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter((product) => {
    const matchBrand = selectedBrand === 'ALL' || product.brand === selectedBrand;
    
    let matchDiscount = true;
    if (selectedDiscount === 'DISCOUNT') {
      matchDiscount = product.discountPercent > 0;
    } else if (selectedDiscount === 'NORMAL') {
      matchDiscount = product.discountPercent === 0;
    }

    const matchGender = selectedGender === 'ALL' || product.category === selectedGender;

    return matchBrand && matchDiscount && matchGender;
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

    // Format pesan WhatsApp yang interaktif dan menarik
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
• *Ukuran (EU)* : 🔥 *${selectedSize}*
• *Total Harga* : *${productPrice}*

============================
👤 *DATA LENGKAP PEMESAN*
============================
• *Nama* : ${customerName}
• *Email* : ${customerEmail}
• *No. WhatsApp*: ${customerPhone}
• *Bukti SS* : ${screenshotName ? `📸 [Sudah Dilampirkan: ${screenshotName}]` : '❌ Belum memilih file'}

Mohon bantuan Admin untuk segera mengecek ketersediaan barang dan memproses pesanan ini ya. Terima kasih banyak! ✨`;

    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/${targetPhoneNumber}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    setIsModalOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setScreenshotName('');
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
            <div className="pt-2 flex flex-wrap gap-4">
              <a 
                href="#katalog" 
                className="group flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-orange-500/20 rounded-xl"
              >
                <ShoppingBag size={14} />
                Jelajahi Produk
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fcfcfc] to-transparent z-10"></div>
      </section>

      {/* --- FEATURES INFO SECTION --- */}
      <section className="relative z-20 -mt-8 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/70 border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center p-4 text-center group hover:scale-105 transition-transform duration-300 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="mb-4 p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-1 text-slate-800">Dukungan CS 24/7</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">Tim Admin kami siap melayani pertanyaan specifications & size sepatu kapan saja.</p>
          </div>
          <div className="flex flex-col items-center p-4 text-center group hover:scale-105 transition-transform duration-300">
            <div className="mb-4 p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
              <RotateCcw size={28} strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold tracking-wider uppercase mb-1 text-slate-800">Kemudahan Retur</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">Ukuran kurang pas? Lakukan retur barang dengan mudah dalam kurun waktu 3 hari.</p>
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

              {/* Filter Gender (Kategori) */}
              <div className="space-y-1.5 min-w-[180px]">
                <label className="block font-bold text-slate-400 uppercase tracking-wider text-[10px]">Gender / Kategori</label>
                <select 
                  value={selectedGender} 
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer appearance-none"
                >
                  <option value="ALL">👥 Semua Gender</option>
                  <option value="MEN">👨 Men</option>
                  <option value="WOMEN">👩 Women</option>
                  <option value="UNISEX">🚻 Unisex</option>
                  <option value="KIDS">👦 Kids</option>
                </select>
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
                onClick={() => { setSelectedBrand('ALL'); setSelectedDiscount('ALL'); setSelectedGender('ALL'); }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl uppercase tracking-wider hover:bg-orange-500 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const hasDiscount = product.discountPercent > 0;
                
                // Filter size yang memiliki stock > 0
                const availableSizes = product.sizes
                  ? product.sizes.filter((s) => s.stock > 0).map((s) => s.eu)
                  : [];

                return (
                  <div 
                    key={product.id} 
                    className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    {/* Gambar Produk Area */}
                    <div className="relative aspect-square bg-slate-50/50 w-full overflow-hidden flex items-center justify-center p-4">
                      {/* Badge Diskon */}
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

                    {/* Konten Info Produk */}
                    <div className="p-4 flex flex-col flex-1 bg-white">
                      <div className="flex-1 space-y-1.5">
                        {/* Kategori Gender & Brand Header */}
                        <div className="flex items-center justify-between gap-2 uppercase tracking-wider">
                          <span className="text-orange-500 font-black text-sm">{product.brand}</span>
                          <span className="bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded text-xs">
                            ✨ {product.category}
                          </span>
                        </div>
                        
                        {/* Model Name */}
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-orange-500 transition-colors">
                          {product.modelName}
                        </h4>

                        {/* Color Code */}
                        <p className="text-xs text-slate-400 font-medium">{product.color || 'Multicolor'}</p>
                        
                        {/* Ukuran / Size Badge Container */}
                        <div className="pt-1">
                          {availableSizes.length > 0 ? (
                            <div className="space-y-1">
                              <span className="block text-xs font-black text-slate-500 uppercase tracking-wider">Ready Size:</span>
                              <div className="flex flex-wrap gap-1">
                                {availableSizes.map((sz) => (
                                  <span key={sz} className="text-xs bg-slate-100 border border-slate-300/80 px-2 py-0.5 rounded text-slate-800 font-black tracking-wide">
                                    {sz}
                                  </span>
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

                      {/* Baris Harga & Aksi */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-2">
                        {/* Tag Harga */}
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-sm font-extrabold text-slate-900">
                                {formatIDR(product.discountedPrice)}
                              </span>
                              <span className="text-[10px] text-slate-400 line-through font-medium">
                                {formatIDR(product.originalPrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-extrabold text-slate-900">
                              {formatIDR(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Tombol Order */}
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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.369876214532!2d112.73238697587848!3d-7.312248592695958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb7ecbb999ef%3A0x83f28ada0f2993ce!2sSports%20Station%20-%20Royal%20plaza!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Sports Station Royal Plaza Map"
            ></iframe>
            
            <a 
              href="https://www.google.com/maps/place/Sports+Station+-+Royal+plaza/data=!4m2!3m1!1s0x0:0x83f28ada0f2993ce?sa=X&ved=1t:2428&ictx=111" 
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-orange-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Format Pemesanan Instan</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
              
              {/* Ringkasan Singkat Produk */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={selectedProductToOrder.imageUrl} 
                    alt="" 
                    className="object-contain max-h-full max-w-full"
                    onError={(e) => e.currentTarget.src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                    <span className="text-orange-500">{selectedProductToOrder.brand}</span>
                    <span>•</span>
                    <span>{selectedProductToOrder.category}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedProductToOrder.modelName}</p>
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedProductToOrder.discountPercent > 0 
                      ? formatIDR(selectedProductToOrder.discountedPrice) 
                      : formatIDR(selectedProductToOrder.originalPrice)}
                  </p>
                </div>
              </div>

              {/* Input: Upload Screenshot */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upload Screenshot Produk <span className="text-pink-500">*</span></label>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center transition-colors group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    required
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setScreenshotName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <Upload size={18} className="text-slate-400 group-hover:text-orange-500 mb-1 transition-colors" />
                  <p className="text-xs text-slate-700 font-bold text-center">
                    {screenshotName ? `Selected: ${screenshotName}` : "Ambil bukti SS produk dari HP"}
                  </p>
                  <p className="text-[9px] text-slate-400 text-center">Format PNG, JPG, JPEG</p>
                </div>
              </div>

              {/* Input: Pilih Size Produk */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Pilih Ukuran / Size (EU) <span className="text-pink-500">*</span>
                </label>
                <select
                  required
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Ukuran Tersedia --</option>
                  {selectedProductToOrder.sizes && selectedProductToOrder.sizes
                    .filter((s) => s.stock > 0)
                    .map((sizeEntry) => (
                      <option key={sizeEntry.eu} value={`${sizeEntry.eu} EU`}>
                        {sizeEntry.eu} EU (Stok Tersisa: {sizeEntry.stock})
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Input: Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nama Lengkap Pemesan <span className="text-pink-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Input: Alamat Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Alamat Email Aktif <span className="text-pink-500">*</span></label>
                <input 
                  type="email" 
                  required
                  placeholder="Contoh: budi@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Input: Nomor WhatsApp */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">No. WhatsApp Pemesan <span className="text-pink-500">*</span></label>
                <input 
                  type="tel" 
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Tombol Konfirmasi */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/10 transition-colors"
                >
                  Konfirmasi Pemesanan via WhatsApp
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}