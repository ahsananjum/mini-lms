import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Mini LMS',
  description: 'Mini LMS Frontend Phase 1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
