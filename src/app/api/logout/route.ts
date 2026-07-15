// src/app/api/logout/route.ts

import { NextResponse } from 'next/server';

const TOKEN_COOKIE = 'token'; // HARUS sama dengan yang dicek di middleware.ts

/* =====================================================
   LOGOUT (POST)
   - Hapus cookie token supaya middleware.ts kembali
     menganggap user belum login
===================================================== */
export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}