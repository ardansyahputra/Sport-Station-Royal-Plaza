'use client';

import React, { useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Shield,
  User,
  Palette,
  Globe,
  Smartphone,
  Lock,
  Save,
  Camera,
  Mail,
  KeyRound,
} from 'lucide-react';

import { useEffect } from 'react';
import { getStoredSettings, saveStoredSettings } from '@/lib/settingsStorage';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await getStoredSettings();

      setName(data.name);
      setEmail(data.email);
      setPassword(data.password);
    };

    load();
  }, []);

  const handleSave = async () => {
    await saveStoredSettings({
      name,
      email,
      password,
    });

    alert('Berhasil disimpan');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan</h1>

            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Kelola akun, keamanan, tampilan, dan preferensi aplikasi.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Save size={18} />
            Simpan Perubahan
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="xl:col-span-1 space-y-6">
            {/* PROFILE CARD */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-background shadow-lg"
                  />

                  <button
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-bold text-foreground">Admin Store</h2>

                <p className="text-sm text-muted-foreground">admin@sportstation.com</p>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-muted transition-colors text-left">
                  <User size={18} />
                  <span className="text-sm font-medium">Profil Saya</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-muted transition-colors text-left">
                  <Shield size={18} />
                  <span className="text-sm font-medium">Privasi Akun</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border hover:bg-muted transition-colors text-left">
                  <Smartphone size={18} />
                  <span className="text-sm font-medium">Perangkat Login</span>
                </button>
              </div>
            </div>

            {/* QUICK INFO */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-5">Ringkasan Akun</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>

                  <span className="text-sm font-semibold">Super Admin</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                    Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Terakhir Login</span>

                  <span className="text-sm font-medium">Hari Ini</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="xl:col-span-2 space-y-6">
            {/* ACCOUNT SETTINGS */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <User size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">Informasi Akun</h3>

                  <p className="text-sm text-muted-foreground">
                    Kelola informasi profil dan akun Anda.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Lock size={22} />
                </div>

                <div>
                  <h3 className="text-xl font-bold">Keamanan</h3>

                  <p className="text-sm text-muted-foreground">
                    Ubah password dan pengaturan keamanan akun.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Password Lama</label>

                  <div className="relative">
                    <KeyRound
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="password"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password Baru</label>

                    <input
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Konfirmasi Password</label>

                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-2xl border bg-background outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
