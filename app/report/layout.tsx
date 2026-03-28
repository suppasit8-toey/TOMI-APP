import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 900,
  initialScale: 0.4,
  userScalable: true,
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
