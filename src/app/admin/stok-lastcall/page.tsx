import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProductManagementContent from './components/ProductManagementContent';

export default function ProductManagementPage() {
  return (
    <AppLayout
      pageTitle="Manajemen Produk Lastcall"
      pageSubtitle="Katalog Footwear Up to 70% — Sport Station Royal Plaza"
    >
      <ProductManagementContent />
    </AppLayout>
  );
}