'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { MOCK_PRODUCTS, computeLowStockAlerts } from '@/lib/mockData';
import type { LowStockAlert } from '@/lib/mockData';

type AppLayoutProps = {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
};

export default function AppLayout({ children, pageTitle, pageSubtitle }: AppLayoutProps) {
  const [alerts, setAlerts] = useState<LowStockAlert[]>(() =>
    computeLowStockAlerts(MOCK_PRODUCTS, 3)
  );

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  };

  const activeCount = alerts.filter((a) => !a.dismissed).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar lowStockCount={activeCount} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar
          alerts={alerts}
          onDismissAlert={handleDismissAlert}
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-screen-2xl mx-auto px-6 py-6 xl:px-8 2xl:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}