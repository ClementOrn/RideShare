/**
 * Root Layout
 * Main layout component with providers
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Private Ride Share - FHE Enabled',
  description: 'Secure, Private Ride Sharing with Fully Homomorphic Encryption',
  keywords: ['blockchain', 'ethereum', 'rideshare', 'privacy', 'fhe', 'zama', 'fhevm'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
