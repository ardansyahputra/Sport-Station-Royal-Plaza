import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const STORAGE_KEY = 'sportstation-settings';

type SettingsData = {
  name: string;
  email: string;
  password: string;
};

const DEFAULT_SETTINGS: SettingsData = {
  name: 'Admin Store',
  email: 'admin@sportstation.com',
  password: 'SportStation@2026',
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

    return NextResponse.json(storage.value);
  } catch (error) {
    console.error(error);

    return NextResponse.json(DEFAULT_SETTINGS, {
      status: 500,
    });
  }
}

/* =====================================================
   SAVE SETTINGS
===================================================== */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SettingsData>;

    /* GET CURRENT */

    const existing = await prisma.appStorage.findUnique({
      where: {
        key: STORAGE_KEY,
      },
    });

    const current = (existing?.value as SettingsData | null) ?? DEFAULT_SETTINGS;

    /* MERGE */

    const updated: SettingsData = {
      ...current,
      ...body,
    };

    /* UPSERT */

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
    console.error(error);

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
