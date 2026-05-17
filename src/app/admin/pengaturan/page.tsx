import AppLayout from '@/components/AppLayout';
import Pengaturan from './Pengaturan';

export default function Page() {
  return (
    <AppLayout
      pageTitle="Pengaturan"
      pageSubtitle="Pengaturan Admin"
    >
      <Pengaturan />
    </AppLayout>
  );
}
