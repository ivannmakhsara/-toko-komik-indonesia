import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider }     from '@/context/CartContext';
import { SellerProvider }   from '@/context/SellerContext';
import { ChatProvider }     from '@/context/ChatContext';
import { AuthProvider }     from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Sidebar            from '@/components/Sidebar';
import ContentWrapper     from '@/components/ContentWrapper';
import ChatWidget         from '@/components/ChatWidget';
import GoogleProvider     from '@/components/GoogleProvider';
import MobileBottomNav    from '@/components/MobileBottomNav';

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
        <WishlistProvider>
        <CartProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </div>
          <ChatWidget />
          <MobileBottomNav />
        </CartProvider>
        </WishlistProvider>
        </SellerProvider>
        </ChatProvider>
        </AuthProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
