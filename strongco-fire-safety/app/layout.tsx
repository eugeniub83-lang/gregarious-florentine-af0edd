import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Strongco Fire Safety FSER',
  description: 'Strongco Fire Safety FSER form system with PDF generation and email delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
