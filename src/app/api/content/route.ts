import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const CONTENT_KEY = 'sportstation-content-bank';

export async function GET() {
  const data = await prisma.appStorage.findUnique({ where: { key: CONTENT_KEY } });
  return NextResponse.json(data?.value ?? []);
}

export async function DELETE() {
  try {
    await prisma.appStorage.update({
      where: { key: 'sportstation-content-bank' },
      data: { value: [] }, // Mengosongkan data menjadi array kosong
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  await prisma.appStorage.upsert({
    where: { key: CONTENT_KEY },
    update: { value: body },
    create: { key: CONTENT_KEY, value: body },
  });
  return NextResponse.json({ success: true });
}