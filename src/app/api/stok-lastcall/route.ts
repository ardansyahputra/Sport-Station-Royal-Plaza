import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Ubah key-nya agar tidak menabrak data produk utama
const CLEARANCE_STORAGE_KEY = 'sportstation-clearance-products';

export async function GET() {
  try {
    const storage = await prisma.appStorage.findUnique({
      where: {
        key: CLEARANCE_STORAGE_KEY,
      },
    });

    return NextResponse.json(storage?.value ?? []);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await prisma.appStorage.upsert({
      where: {
        key: CLEARANCE_STORAGE_KEY,
      },
      update: {
        value: body,
      },
      create: {
        key: CLEARANCE_STORAGE_KEY,
        value: body,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}