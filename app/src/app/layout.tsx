import './globals.css';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: '18+ Hotel Finder',
  description: 'Find hotels that allow 18+ check-in near you.'
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}