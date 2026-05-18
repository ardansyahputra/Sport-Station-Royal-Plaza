'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { LowStockAlert } from '@/lib/mockData';
import { getStoredSettings } from '@/lib/settingsStorage';

type TopbarProps = {
  alerts: LowStockAlert[];
  onDismissAlert: (id: string) => void;
  pageTitle: string;
  pageSubtitle?: string;
};

export default function Topbar({ alerts, onDismissAlert, pageTitle, pageSubtitle }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    avatar: '',
  });

  const loadData = async () => {
    const data = await getStoredSettings();
    setCredentials({
      name: data.name || 'Admin Store',
      email: data.email || 'admin@sportstation.com',
      avatar: data.avatar || '',
    });
  };

  useEffect(() => {
    loadData();

    // Dengarkan event 'profileUpdate' dari halaman pengaturan
    window.addEventListener('profileUpdate', loadData);
    return () => window.removeEventListener('profileUpdate', loadData);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 bg-card border-b flex items-center justify-between px-6 py-0"
      style={{ minHeight: '64px' }}
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-700 text-foreground leading-tight">{pageTitle}</h1>
        {pageSubtitle && <p className="text-xs text-muted-foreground mt-0.5">{pageSubtitle}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Last updated */}
        <span className="text-xs text-muted-foreground hidden md:block">
          Diperbarui: 11/05/2026 15:35
        </span>

        {/* Notification bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg transition-all duration-150 hover:bg-muted active:scale-95"
            aria-label={`${activeAlerts.length} notifikasi stok rendah`}
          >
            <Bell size={20} className="text-muted-foreground" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-2xs font-700 rounded-full bg-danger text-white px-1">
                {activeAlerts.length > 99 ? '99+' : activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-modal border animate-slide-down z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-warning" />
                  <span className="text-sm font-600 text-foreground">Stok Hampir Habis</span>
                  {activeAlerts.length > 0 && (
                    <span className="text-2xs font-700 px-1.5 py-0.5 rounded-full bg-danger text-white">
                      {activeAlerts.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {activeAlerts.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={28} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm text-muted-foreground">Semua stok aman</p>
                  </div>
                ) : (
                  activeAlerts.slice(0, 15).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors group"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{
                          backgroundColor: alert.stock === 0 ? 'var(--danger)' : 'var(--warning)',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-foreground truncate">
                          {alert.modelName}
                        </p>
                        <p className="text-2xs text-muted-foreground mt-0.5">
                          {alert.brand} · {alert.color} · EU {alert.sizeEU}
                        </p>
                        <p
                          className="text-2xs font-700 mt-0.5"
                          style={{ color: alert.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}
                        >
                          {alert.stock === 0 ? 'Stok habis' : `${alert.stock} unit tersisa`}
                        </p>
                      </div>
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-border transition-all"
                        title="Tutup notifikasi"
                      >
                        <X size={12} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {activeAlerts.length > 0 && (
                <div className="px-4 py-2.5 border-t">
                  <Link
                    href="/product-management"
                    className="flex items-center justify-between text-xs font-600 text-primary hover:underline"
                    onClick={() => setNotifOpen(false)}
                  >
                    <span>Lihat semua produk stok rendah</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin avatar & credentials yang otomatis sinkron */}
        <div className="flex items-center gap-2 pl-3 border-l">
          {credentials.avatar ? (
            <img
              src={credentials.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 text-white flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {credentials.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block max-w-[120px]">
            <p className="text-xs font-600 text-foreground leading-tight truncate">{credentials.name}</p>
            <p className="text-2xs text-muted-foreground truncate">{credentials.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}