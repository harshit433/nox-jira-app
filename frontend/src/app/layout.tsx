import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nox Jira - Kanban Board',
  description: 'Production-grade Jira clone with Kanban board',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-neutral-50">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-neutral-900 bg-neutral-50`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
