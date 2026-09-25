import type { Metadata } from 'next';
import './globals.css';
import TopNavigation from '../components/request/common/TopNavigation';
import Footer from '../components/common/Footer';
import { LanguageProvider } from '../context/LanguageContext';

export const metadata: Metadata = {
  title: 'Automatic Block Planning System | Indian Railways',
  description: 'Railway Maintenance Block Request Module for Engineering (TMS), Traction Distribution (TDMS), and Signal & Telecommunication (SMMS).',
  icons: {
    icon: [
      { url: '/ir-logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/ir-logo.svg',
    apple: '/ir-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 flex flex-col antialiased">
        <LanguageProvider>
          <TopNavigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
