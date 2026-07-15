// src/app/api/login/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const STORAGE_KEY = 'sportstation-settings';

type SettingsData = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
};

// Sama persis dengan default di /api/settings — biar konsisten kalau DB masih kosong
const DEFAULT_SETTINGS: SettingsData = {
  name: 'Admin Store',
  email: 'admin@sportstation.com',
  password: 'SportStation@2026',
  avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
};

const TOKEN_COOKIE = 'token'; // HARUS sama dengan yang dicek di middleware.ts

/* =====================================================
   LOGIN (POST)
   - Validasi username & password terhadap data Settings
     yang tersimpan di database (satu sumber data, satu user admin)
   - Kalau valid, set cookie `token` supaya middleware.ts
     menganggap user ini sudah login
===================================================== */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = body.username?.trim() ?? '';
    const password = body.password ?? '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    /* AMBIL SETTINGS TERBARU DARI DATABASE (sumber yang sama dengan halaman Settings) */
    const storage = await prisma.appStorage.findUnique({
      where: { key: STORAGE_KEY },
    });

    const settings = (storage?.value as SettingsData | null) ?? DEFAULT_SETTINGS;

    const isValid =
      username.toLowerCase() === settings.email.trim().toLowerCase() &&
      password === settings.password;

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      data: { name: settings.name, email: settings.email, avatar: settings.avatar },
    });

    /* SET COOKIE TOKEN — dicek oleh middleware.ts (isAuthenticated) */
    res.cookies.set(TOKEN_COOKIE, `${settings.email}.${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return res;
  } catch (error) {
    console.error('Error di POST API Login:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}