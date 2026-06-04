import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CCMS – Chronic Care Management System',
  description: 'Streamline chronic care management for doctors and pharmacies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
