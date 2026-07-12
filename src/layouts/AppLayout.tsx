import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DonateWidget } from '@/components/layout/DonateWidget';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export function AppLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <ScrollToTop />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[560px] overflow-hidden"
      >
        <div
          className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full blur-[120px]"
          style={{ background: 'var(--color-glow-purple)' }}
        />
        <div
          className="absolute -right-40 -top-24 h-[480px] w-[480px] rounded-full blur-[120px]"
          style={{ background: 'var(--color-glow-blue)' }}
        />
      </div>

      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <DonateWidget />
    </div>
  );
}
