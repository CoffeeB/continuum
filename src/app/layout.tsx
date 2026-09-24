import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Continuum — Persistent AI Agent Operating System',
  description: 'Cloud-based execution layer for persistent personal AI agents. Intelligence that persists across model changes and offline sessions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
