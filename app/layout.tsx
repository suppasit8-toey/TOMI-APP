import type { Metadata, Viewport } from 'next';
import { Prompt, Libre_Barcode_39_Text } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

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
  metadataBase: new URL('https://www.xn--42cf2bdb5dorp5fubrbrf74a0b.com'),
  title: 'TOMI FILM MANAGEMENT SYSTEM',
  description: 'ระบบจัดการงานติดตั้งฟิล์ม TOMI FILM',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TOMI FILM',
    description: 'ระบบจัดการงานติดตั้งฟิล์ม TOMI FILM',
    url: '/',
    siteName: 'TOMI FILM',
    images: [
      {
        url: '/images/hero/banner.png',
        width: 1200,
        height: 630,
        alt: 'TOMI FILM - บริการติดตั้งฟิล์มอาคารพรีเมียม',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOMI FILM',
    description: 'ระบบจัดการงานติดตั้งฟิล์ม TOMI FILM',
    images: ['/images/hero/banner.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptConfig.variable} ${barcode.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen pb-safe pt-safe" suppressHydrationWarning>
        <AnalyticsTracker />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
