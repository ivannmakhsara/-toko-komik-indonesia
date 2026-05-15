import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider }   from '@/context/CartContext';
import { SellerProvider } from '@/context/SellerContext';
import { ChatProvider }   from '@/context/ChatContext';
import { AuthProvider }   from '@/context/AuthContext';
import Sidebar    from '@/components/Sidebar';
import TopBar     from '@/components/TopBar';
import ChatWidget from '@/components/ChatWidget';
import GoogleProvider from '@/components/GoogleProvider';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Toko Komik Indonesia — Platform Komik Lokal #1',
  description: 'Temukan ratusan komik lokal Indonesia. Dari Gundala hingga Garudayana — dukung kreator Indonesia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${displayFont.variable} ${bodyFont.variable} bg-[#0A0A0B]`}>
        <GoogleProvider>
        <AuthProvider>
        <ChatProvider>
        <SellerProvider>
        <CartProvider>
          <div className="flex min-h-screen">
            {/* Left sidebar — desktop only */}
            <Sidebar />

            {/* Main column */}
            <div className="flex-1 flex flex-col lg:ml-[168px] min-h-screen">
              <TopBar />
              <main className="flex-1">{children}</main>
            </div>
          </div>
          <ChatWidget />
        </CartProvider>
        </SellerProvider>
        </ChatProvider>
        </AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
