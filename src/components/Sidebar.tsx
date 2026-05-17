'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Package,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { getStoredSettings } from '@/lib/settingsStorage';

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

type SidebarProps = {
  lowStockCount?: number;
};

const navItems: NavItem[] = [
  {
    key: 'nav-dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: 'nav-products',
    label: 'Manajemen Produk',
    href: '/product-management',
    icon: <Package size={20} />,
  },

  {
    key: 'nav-settings',
    label: 'Pengaturan',
    href: '/pengaturan',
    icon: <Settings size={20} />,
  },
];

export default function Sidebar({ lowStockCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [credentials, setCredentials] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const load = async () => {
      const data = await getStoredSettings();
      setCredentials({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    };

    load();
  }, []);

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? '64px' : '240px', backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b"
        style={{ borderColor: 'var(--sidebar-border)', minHeight: '72px' }}
      >
        <div className="flex-shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="block text-white font-bold text-sm leading-tight whitespace-nowrap">
              Sport Station
            </span>
            <span
              className="block text-xs whitespace-nowrap"
              style={{ color: 'var(--sidebar-text)' }}
            >
              Royal Plaza
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <p
            className="px-3 mb-2 text-2xs font-600 uppercase tracking-widest"
            style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}
          >
            Menu Utama
          </p>
        )}
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative text-white
                ${isActive ? 'sidebar-item-active' : 'text-sidebar'}
              `}
              style={!isActive ? {} : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span
                className="flex-shrink-0"
                style={{ color: isActive ? 'var(--primary)' : 'var(--sidebar-text)' }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="text-sm font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                  {item.label}
                </span>
              )}
              {!collapsed && item.key === 'nav-products' && lowStockCount > 0 && (
                <span className="ml-auto flex-shrink-0 text-2xs font-700 px-1.5 py-0.5 rounded-full bg-danger text-white">
                  {lowStockCount}
                </span>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-dropdown">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div
        className="border-t px-2 py-3 space-y-1"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {/* Admin info */}
        {!collapsed && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <ShieldCheck size={14} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-600 text-white truncate">{credentials.name}</p>
              <p className="text-2xs truncate" style={{ color: 'var(--sidebar-text)' }}>
                {credentials.email}
              </p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-sidebar-hover group"
          style={{ color: 'var(--sidebar-text)' }}
          title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          <span className="flex-shrink-0">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </span>
          {!collapsed && <span className="text-sm">Ciutkan</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-dropdown">
              Perluas sidebar
            </span>
          )}
        </button>

        {/* Logout */}
        <Link
          href="/login-screen"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-sidebar-hover group"
          style={{ color: 'var(--sidebar-text)' }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm">Keluar</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-dropdown">
              Keluar
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
