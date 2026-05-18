// src/app/api/settings/route.ts

import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const STORAGE_KEY = 'sportstation-settings';

// 1. Tambahkan properti avatar ke dalam Type Definition
type SettingsData = {
  name: string;
  email: string;
  password: string;
  avatar?: string; // Menyimpan string base64 foto profil
};

// 2. Tambahkan default avatar agar saat database kosong, avatar default tetap muncul
const DEFAULT_SETTINGS: SettingsData = {
  name: 'Admin Store',
  email: 'admin@sportstation.com',
  password: 'SportStation@2026',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop'
};

/* =====================================================
   GET SETTINGS
===================================================== */
export async function GET() {
  try {
    const storage = await prisma.appStorage.findUnique({
      where: {
        key: STORAGE_KEY,
      },
    });

    /* NO DATA YET */
    if (!storage) {
      await prisma.appStorage.create({
        data: {
          key: STORAGE_KEY,
          value: DEFAULT_SETTINGS,
        },
      });

      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // Mengembalikan data gabungan dari DB (sudah termasuk avatar jika ada)
    return NextResponse.json(storage.value);
  } catch (error) {
    console.error("Error di GET API Settings:", error);

    return NextResponse.json(DEFAULT_SETTINGS, {
      status: 500,
    });
  }
}

/* =====================================================
   SAVE SETTINGS (POST)
===================================================== */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SettingsData>;

    /* GET CURRENT DATA FROM DATABASE */
    const existing = await prisma.appStorage.findUnique({
      where: {
        key: STORAGE_KEY,
      },
    });

    const current = (existing?.value as SettingsData | null) ?? DEFAULT_SETTINGS;

    /* MERGE DATA LAMA DENGAN DATA BARU */
    // Jika user hanya ganti avatar, email & password lama tetap aman ter-merge
    const updated: SettingsData = {
      ...current,
      ...body,
    };

    /* UPSERT KE PRISMA DATABASE */
    await prisma.appStorage.upsert({
      where: {
        key: STORAGE_KEY,
      },
      update: {
        value: updated,
      },
      create: {
        key: STORAGE_KEY,
        value: updated,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error di POST API Settings:", error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}