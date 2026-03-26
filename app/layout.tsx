import type { Metadata, Viewport } from 'next';
import { Prompt, Libre_Barcode_39_Text } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const promptConfig = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-prompt',
});

const barcode = Libre_Barcode_39_Text({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-barcode',
});

export const metadata: Metadata = {
  title: 'TOMI FILM MANAGEMENT SYSTEM',
  description: 'ระบบจัดการงานติดตั้งฟิล์ม TOMI FILM',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptConfig.variable} ${barcode.variable}`}>
      <body className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen pb-safe pt-safe">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
