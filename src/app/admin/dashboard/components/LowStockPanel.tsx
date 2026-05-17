import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, PackageX } from 'lucide-react';
import type { LowStockAlert } from '@/lib/mockData';

type LowStockPanelProps = {
  alerts: LowStockAlert[];
};

export default function LowStockPanel({ alerts }: LowStockPanelProps) {
  return (
    <div className="bg-card rounded-xl border shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
          <h3 className="text-sm font-600 text-foreground">Notifikasi Stok Rendah</h3>
          <span className="text-2xs font-700 px-1.5 py-0.5 rounded-full bg-danger-bg text-danger">
            {alerts.length} SKU
          </span>
        </div>
        <Link
          href="/product-management"
          className="flex items-center gap-1 text-xs font-500 hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          Kelola stok <ArrowRight size={12} />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageX size={36} className="text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm font-500 text-muted-foreground">Semua stok dalam kondisi aman</p>
          <p className="text-xs text-muted-foreground mt-1">Tidak ada SKU dengan stok ≤ 3 unit</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--muted)' }}>
                {['Brand', 'Model', 'Warna', 'Ukuran EU', 'Stok', 'Status'].map((col) => (
                  <th
                    key={`lsth-${col}`}
                    className="px-4 py-2.5 text-left text-2xs font-600 uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-2xs font-700 px-2 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(255,107,0,0.1)', color: 'var(--primary)' }}
                    >
                      {alert.brand}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-500 text-foreground max-w-[180px] truncate">{alert.modelName}</p>
                    <p className="text-2xs text-muted-foreground font-mono">{alert.productCode}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{alert.color}</td>
                  <td className="px-4 py-3 text-xs font-600 font-tabular text-foreground">EU {alert.sizeEU}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-sm font-700 font-tabular"
                      style={{ color: alert.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}
                    >
                      {alert.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-2xs font-600 px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: alert.stock === 0 ? 'var(--danger-bg)' : 'var(--warning-bg)',
                        color: alert.stock === 0 ? 'var(--danger)' : 'var(--warning)',
                      }}
                    >
                      {alert.stock === 0 ? 'Habis' : 'Kritis'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}