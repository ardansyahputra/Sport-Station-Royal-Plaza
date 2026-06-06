import React from 'react';
import AppLayout from '@/components/AppLayout';
import BCOKProductManagementContent from './components/BCOKProductManagementContent';

export default function BCOKProductManagementPage() {
  return (
    <AppLayout
      pageTitle="Manajemen Produk"
      pageSubtitle="Katalog BCOK / Kids Station — Semua Kategori"
    >
      <BCOKProductManagementContent />
    </AppLayout>
  );
}