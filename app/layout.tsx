import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Mulish as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'MERCHANT HUB',
  description: 'created by Khamble boys',
};

const fontSans = FontSans({
  subsets: ['cyrillic'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
