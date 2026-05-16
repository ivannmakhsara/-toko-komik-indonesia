'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import TopBar  from '@/components/TopBar';
import Footer  from '@/components/Footer';

export default function ContentWrapper({ children }: { children: ReactNode }) {
  const pathname  = usePathname();
  const isSeller  = pathname.startsWith('/seller');

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${isSeller ? '' : 'lg:ml-[168px]'}`}>
      {!isSeller && <TopBar />}
      <main className={`flex-1 ${isSeller ? '' : 'pb-16 lg:pb-0'}`}>{children}</main>
      {!isSeller && <Footer />}
    </div>
  );
}
