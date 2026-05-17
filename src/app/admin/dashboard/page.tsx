import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardContent from './components/DashboardContent';

export default function DashboardPage() {
  return (
    <AppLayout
      pageTitle="Dashboard"
      pageSubtitle="Ringkasan inventori katalog diskon Sport Station Royal Plaza"
    >
      <DashboardContent />
    </AppLayout>
  );
}