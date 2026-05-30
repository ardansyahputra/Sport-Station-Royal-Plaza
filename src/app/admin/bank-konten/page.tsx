import AppLayout from '@/components/AppLayout';
import BankKontenContent from './BankKonten'; // Kita pindahkan logika ke sini

export default function Page() {
  return (
    <AppLayout
      pageTitle="Bank Konten"
      pageSubtitle="Kelola konten video promosi"
    >
      <BankKontenContent />
    </AppLayout>
  );
}