import AppLayout from '@/components/AppLayout';
import Pengaturan from './Pengaturan';

export default function Page() {
  return (
    <AppLayout
      pageTitle="Manajemen Produk"
      pageSubtitle="Katalog Footwear Up to 70% — Sport Station Royal Plaza"
    >
      <Pengaturan />
    </AppLayout>
  );
}
