'use client'; // Pastikan ini ada di file komponen Anda

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react'; // Sesuaikan import icon Anda

export const LogoutButton = ({ collapsed }: { collapsed: boolean }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (res.ok) {
        // Redirect ke halaman login setelah cookie berhasil dihapus
        router.push('/admin/login-screen');
        router.refresh(); // Opsional: untuk membersihkan cache state server
      }
    } catch (error) {
      console.error('Logout gagal:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-sidebar-hover group cursor-pointer"
      style={{ color: 'var(--sidebar-text)', background: 'transparent', border: 'none' }}
    >
      <LogOut size={18} className="flex-shrink-0" />
      {!collapsed && <span className="text-sm">Keluar</span>}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-dropdown">
          Keluar
        </span>
      )}
    </button>
  );
};