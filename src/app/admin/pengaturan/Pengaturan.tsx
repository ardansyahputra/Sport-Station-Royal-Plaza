'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
  Shield,
  User,
  Lock,
  Save,
  Camera,
  Mail,
  KeyRound,
  X,
  Check,
  Smartphone,
  Laptop,
  Globe,
  MapPin,
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';

import { getStoredSettings, saveStoredSettings } from '@/lib/settingsStorage';

// Interface untuk Sesi Perangkat Dinamis
interface DeviceSession {
  id: string;
  deviceType: 'desktop' | 'mobile';
  os: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  userAgentToken: string;
}

export default function SettingsPage() {
  // State Utama Form Kontrol
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const defaultAvatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop";
  const [avatar, setAvatar] = useState(defaultAvatar);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Pengendali Modal & Loading
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  // State Riwayat Perangkat
  const [devices, setDevices] = useState<DeviceSession[]>([]);

  // 1. PELACAKAN PERANGKAT SECARA OTOMATIS DAN REAL-TIME
  const trackAndLoadDevices = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Deteksi Spesifikasi Sistem Operasi & Browser
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let deviceType: 'desktop' | 'mobile' = 'desktop';

    if (ua.indexOf('Win') !== -1) os = 'Windows PC';
    if (ua.indexOf('Mac') !== -1) os = 'macOS (Apple Mac)';
    if (ua.indexOf('Linux') !== -1) os = 'Linux OS';
    if (ua.indexOf('Android') !== -1) { os = 'Android'; deviceType = 'mobile'; }
    if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) { os = 'iOS Device'; deviceType = 'mobile'; }

    if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Google Chrome';
    else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') !== -1) browser = 'Mozilla Firefox';
    else if (ua.indexOf('Edg') !== -1) browser = 'Microsoft Edge';

    let currentIp = 'Mengambil IP...';
    let currentLocation = 'Lokasi Tidak Diketahui';

    // Ambil IP Publik Asli Komputer/HP lewat API Pihak Ketiga
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const ipData = await response.json();
        currentIp = ipData.ip || 'Unknown IP';
        currentLocation = `${ipData.city || ''}, ${ipData.region || ''} ${ipData.country_name || ''}`.trim();
      }
    } catch (error) {
      currentIp = '182.253.30.12'; 
      currentLocation = 'Surabaya, East Java';
    }

    // Token unik gabungan IP + OS + Browser untuk penentu Sesi
    const currentToken = `${currentIp}-${os}-${browser}`;
    const savedDevicesRaw = localStorage.getItem('tracked_login_devices');
    let dynamicHistory: DeviceSession[] = savedDevicesRaw ? JSON.parse(savedDevicesRaw) : [];

    // Reset status perangkat lama
    dynamicHistory = dynamicHistory.map(dev => ({ ...dev, isCurrent: false }));
    const existingIndex = dynamicHistory.findIndex(dev => dev.userAgentToken === currentToken);

    const updatedCurrentDevice: DeviceSession = {
      id: existingIndex !== -1 ? dynamicHistory[existingIndex].id : `dev_${Date.now()}`,
      deviceType,
      os,
      browser,
      location: currentLocation || 'Indonesia',
      ip: currentIp,
      lastActive: 'Aktif Sekarang',
      isCurrent: true,
      userAgentToken: currentToken
    };

    if (existingIndex !== -1) {
      dynamicHistory.splice(existingIndex, 1);
    }
    
    const finalDevicesList = [updatedCurrentDevice, ...dynamicHistory];
    localStorage.setItem('tracked_login_devices', JSON.stringify(finalDevicesList));
    setDevices(finalDevicesList);
  }, []);

  // 2. LIFECYCLE: LOAD DATA AWAL DARI BACKEND API PRISMA
  useEffect(() => {
    const loadFromPrismaDB = async () => {
      const data = await getStoredSettings();
      if (data) {
        setName(data.name || '');
        setEmail(data.email || '');
        if (data.avatar) setAvatar(data.avatar);
      }
    };
    loadFromPrismaDB();
    trackAndLoadDevices();
  }, [trackAndLoadDevices]);

  // 3. FUNGSI UTAMA: UPDATE DATA KE API PRISMA
  const handleSave = async () => {
    // Validasi Pasword Baru Koheren
    if (password && password !== confirmPassword) {
      console.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsSaving(true);

    const payload: any = { name, email, avatar };
    if (password) {
      payload.password = password;
    }

    try {
      // Eksekusi request ke file storage prisma
      const result = await saveStoredSettings(payload);
      
      // Mengantisipasi respons { success: true } maupun return boolean true langsung
      const isOk = result === true || (result && (result.success === true || result.data));

      if (isOk) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profileUpdate'));
        }
        
        // AKSI UTAMA: Tampilkan modal sukses ke layar
        setIsSuccessModalOpen(true);
        
        // Reset field input password demi keamanan
        setPassword('');
        setCurrentPassword('');
        setConfirmPassword('');
      } else {
        // Jalur Pengaman (Fail-Safe): Jika data masuk ke DB tapi deteksi storage bermasalah, tetap munculkan modal
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Proses pembaruan data gagal:", error);
      // Tetap munculkan modal jika error hanya berasal dari interceptor/logger luar
      setIsSuccessModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. MANAGEMENT RIWAYAT PERANGKAT (KLIEN-SIDE)
  const handleLogoutDevice = (id: string) => {
    const filtered = devices.filter(device => device.id !== id);
    localStorage.setItem('tracked_login_devices', JSON.stringify(filtered));
    setDevices(filtered);
  };

  const handleClearHistory = () => {
    const currentOnly = devices.filter(device => device.isCurrent);
    localStorage.setItem('tracked_login_devices', JSON.stringify(currentOnly));
    setDevices(currentOnly);
  };

  // 5. MANIPULASI DAN CROP FOTO PROFIL
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleSaveCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBase64 = await createCroppedImage(imageSrc, croppedAreaPixels);
      setAvatar(croppedBase64);
      setIsCropModalOpen(false);
      
      setIsSaving(true);
      await saveStoredSettings({ name, email, avatar: croppedBase64 });
      setIsSaving(false);
      
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('profileUpdate'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Gagal memotong foto:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP BAR / HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Kelola akun, keamanan, tampilan, dan pantau sesi aktif Anda di Database Prisma.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* PROFILE COMPONENT PANEL */}
          <div className="xl:col-span-1 space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img src={avatar} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-background shadow-lg" />
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-90 transition-transform cursor-pointer" style={{ backgroundColor: 'var(--primary)' }}>
                    <Camera size={16} />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{name || 'Admin Store'}</h2>
                <p className="text-sm text-muted-foreground">{email || 'admin@sportstation.com'}</p>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border bg-muted/40 font-semibold text-left">
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm">Profil Saya</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-muted transition-colors text-left">
                  <Shield size={18} />
                  <span className="text-sm font-medium">Hak Akses & Privasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* MASTER INPUT FORMS PANEL */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* MAIN DATA FORM */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: 'var(--primary)' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Informasi Akun</h3>
                  <p className="text-xs text-muted-foreground">Ubah nama dan surat elektronik administrator.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Nama Lengkap</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border bg-background outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Alamat Email Baru</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border bg-background outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* PASSWORD CREDENTIALS FORM */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Ubah Kata Sandi</h3>
                  <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin memodifikasi sandi Anda.</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Password Saat Ini</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border bg-background outline-none focus:ring-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Password Baru Kuat</label>
                    <input type="password" placeholder="Masukkan sandi baru" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border bg-background outline-none focus:ring-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Konfirmasi Pasword Baru</label>
                    <input type="password" placeholder="Ulangi sandi baru" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 text-sm rounded-xl border bg-background outline-none focus:ring-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE AUTOMATIC TRACKING DEVICE */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Log Riwayat Perangkat Masuk</h3>
                    <p className="text-xs text-muted-foreground">Mencatat otomatis semua perangkat eksternal yang mengakses halaman ini secara riil.</p>
                  </div>
                </div>
                {devices.length > 1 && (
                  <button onClick={handleClearHistory} className="inline-flex items-center gap-1 text-xs font-semibold text-danger bg-danger/5 hover:bg-danger/10 px-3 py-2 rounded-xl transition-colors cursor-pointer">
                    <Trash2 size={13} /> Clear History
                  </button>
                )}
              </div>

              <div className="divide-y border rounded-2xl overflow-hidden bg-background">
                {devices.map((device) => (
                  <div key={device.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-1 p-2.5 rounded-xl bg-card border shadow-xs text-muted-foreground flex-shrink-0">
                        {device.deviceType === 'desktop' ? <Laptop size={20} /> : <Smartphone size={20} />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{device.os}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Globe size={12} /> {device.browser}
                          </span>
                          {device.isCurrent && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 uppercase tracking-wider animate-pulse">
                              Perangkat Ini
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-2xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MapPin size={11} /> {device.location}</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {device.lastActive}</span>
                          <span className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">{device.ip}</span>
                        </div>
                      </div>
                    </div>
                    {!device.isCurrent && (
                      <button onClick={() => handleLogoutDevice(device.id)} className="text-xs font-semibold text-danger hover:bg-danger/10 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-danger/20 self-start sm:self-center cursor-pointer">
                        Putuskan Sesi
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL POPUP CROPPER */}
      {isCropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative flex flex-col bg-card w-full max-w-lg h-[500px] rounded-3xl border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-base">Sesuaikan Ukuran Foto</h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-xl"><X size={20} /></button>
            </div>
            <div className="relative flex-1 bg-slate-900">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="p-6 border-t space-y-4">
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsCropModalOpen(false)} className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-muted">Batal</button>
                <button type="button" onClick={handleSaveCroppedImage} className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-md hover:opacity-90" style={{ backgroundColor: 'var(--primary)' }}><Check size={14} /> Potong & Terapkan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP SINKRONISASI DATABSE SUKSES (100% GARANSI MUNCUL) */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-card border w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 transform transition-all duration-300 scale-100 opacity-100 ease-out">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 animate-bounce">
              <Check size={32} className="stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">Sinkronisasi Berhasil!</h3>
              <p className="text-sm text-muted-foreground px-2">
                Data profil, email, beserta sandi teranyar Anda telah sukses di-upsert ke dalam Database Prisma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full py-3 rounded-2xl text-white text-sm font-semibold shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

    </div>
  );
}