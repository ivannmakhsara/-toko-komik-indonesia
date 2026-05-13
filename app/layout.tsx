import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { SellerProvider } from '@/context/SellerContext';
import { ChatProvider } from '@/context/ChatContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Toko Komik Indonesia',
  description: 'Belanja komik Indonesia terlengkap dan terpercaya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}
