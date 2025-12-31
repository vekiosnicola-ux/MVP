import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dieta Positiva - AI-Powered Wellness Coaching',
  description: 'Internal AI assistant for wellness coaching strategy and content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
