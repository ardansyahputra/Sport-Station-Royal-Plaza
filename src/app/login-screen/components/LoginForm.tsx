'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Copy, Check, AlertCircle, Package } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

type LoginFormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

const DEMO_CREDENTIALS = {
  username: 'admin.royalplaza',
  password: 'SportStation@2026',
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const handleCopy = async (field: 'username' | 'password') => {
    const value = field === 'username' ? DEMO_CREDENTIALS.username : DEMO_CREDENTIALS.password;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFillCredentials = () => {
    setValue('username', DEMO_CREDENTIALS.username);
    setValue('password', DEMO_CREDENTIALS.password);
    setAuthError('');
  };

  // Backend integration point: replace with real auth API call
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError('');

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (
      data.username === DEMO_CREDENTIALS.username &&
      data.password === DEMO_CREDENTIALS.password
    ) {
      router.push('/dashboard');
    } else {
      setAuthError('Kredensial tidak valid — gunakan akun demo di bawah untuk masuk');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ backgroundColor: 'var(--secondary)' }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 blob-orange pointer-events-none" />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="absolute top-20 -left-16 w-48 h-48 rounded-full opacity-5"
          style={{ backgroundColor: 'var(--primary)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <AppLogo size={44} />
            <div>
              <span className="block text-white font-800 text-xl leading-tight">Sport Station</span>
              <span className="block text-sm" style={{ color: 'var(--sidebar-text)' }}>Royal Plaza Surabaya</span>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-600 mb-6"
            style={{ backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary)' }}
          >
            <Package size={12} />
            Footwear Up to 70% Collection
          </div>
          <h2 className="text-3xl font-800 text-white leading-tight mb-4">
            Kelola Katalog<br />
            Diskon dengan<br />
            <span style={{ color: 'var(--primary)' }}>Mudah & Cepat</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--sidebar-text)' }}>
            Admin tool untuk manajemen stok, harga diskon, dan katalog produk footwear Sport Station Royal Plaza.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { value: '20+', label: 'Produk Aktif' },
              { value: '5', label: 'Brand' },
              { value: '70%', label: 'Maks Diskon' },
            ].map((stat, i) => (
              <div
                key={`stat-${i}`}
                className="text-center p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <p className="text-xl font-800 font-tabular" style={{ color: 'var(--primary)' }}>{stat.value}</p>
                <p className="text-2xs mt-0.5" style={{ color: 'var(--sidebar-text)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer brand */}
        <div className="relative z-10">
          <p className="text-2xs" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
            © 2026 Sport Station Royal Plaza. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <AppLogo size={36} />
          <span className="font-800 text-lg text-foreground">Sport Station</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-700 text-foreground">Selamat datang</h1>
            <p className="text-sm text-muted-foreground mt-1">Masuk ke panel admin Sport Station</p>
          </div>

          {/* Auth error */}
          {authError && (
            <div className="flex items-start gap-3 p-3 rounded-lg mb-5 animate-slide-down" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-500 text-foreground mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="admin.royalplaza"
                className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                  errors.username ? 'border-danger focus:ring-danger/30' : 'border-border focus:ring-ring/30 focus:border-primary'
                }`}
                {...register('username', { required: 'Username wajib diisi' })}
              />
              {errors.username && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-500 text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-2.5 pr-11 text-sm rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-danger focus:ring-danger/30' : 'border-border focus:ring-ring/30 focus:border-primary'
                  }`}
                  {...register('password', { required: 'Password wajib diisi' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword
                    ? <EyeOff size={16} className="text-muted-foreground" />
                    : <Eye size={16} className="text-muted-foreground" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
                Ingat saya
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-600 text-white transition-all duration-150 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials box */}
          <div className="mt-8 rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,107,0,0.3)', backgroundColor: 'var(--accent)' }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,107,0,0.2)', backgroundColor: 'rgba(255,107,0,0.08)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-600" style={{ color: 'var(--primary)' }}>Akun Demo Admin</span>
              </div>
              <button
                onClick={handleFillCredentials}
                className="text-2xs font-600 px-2.5 py-1 rounded-md transition-all active:scale-95"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                Isi Otomatis
              </button>
            </div>
            <div className="px-4 py-3 space-y-2">
              {[
                { label: 'Username', value: DEMO_CREDENTIALS.username, field: 'username' as const },
                { label: 'Password', value: DEMO_CREDENTIALS.password, field: 'password' as const },
              ].map((item) => (
                <div key={`cred-${item.field}`} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-2xs text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-500 text-foreground font-mono truncate">{item.value}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(item.field)}
                    className="p-1.5 rounded hover:bg-muted transition-colors flex-shrink-0"
                    aria-label={`Salin ${item.label}`}
                  >
                    {copiedField === item.field
                      ? <Check size={14} style={{ color: 'var(--success)' }} />
                      : <Copy size={14} className="text-muted-foreground" />
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}