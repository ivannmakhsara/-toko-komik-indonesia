import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider }   from '@/context/CartContext';
import { SellerProvider } from '@/context/SellerContext';
import { ChatProvider }   from '@/context/ChatContext';
import { AuthProvider }   from '@/context/AuthContext';
import Navbar      from '@/components/Navbar';
import Footer      from '@/components/Footer';
import ChatWidget  from '@/components/ChatWidget';
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
  title: 'Komik Indonesia — Platform Komik Lokal #1',
  description: 'Temukan ratusan komik lokal Indonesia. Dari Gundala hingga Garudayana — dukung kreator Indonesia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${displayFont.variable} ${bodyFont.variable} min-h-screen flex flex-col`}>
        <GoogleProvider>
        <AuthProvider>
        <ChatProvider>
        <SellerProvider>
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
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
