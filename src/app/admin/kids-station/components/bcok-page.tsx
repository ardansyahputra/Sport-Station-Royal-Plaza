import React from 'react';
import AppLayout from '@/components/AppLayout';
import BCOKProductManagementContent from './BCOKProductManagementContent';

export default function BCOKAdminPage() {
  return (
    <AppLayout
      pageTitle="Manajemen Produk BCOK"
      pageSubtitle="Katalog Kids Station — Admin Panel"
    >
      <BCOKProductManagementContent />
    </AppLayout>
  );
}