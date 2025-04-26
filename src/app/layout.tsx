import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://localhost:3000'),
  title: {
    template: '%s | Casa Buriti',
    default: 'Casa Buriti - Caixa',
  },
  description: 'Sistema de gestão de eventos e vendas para a Casa Buriti',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4f46e5' },
    { media: '(prefers-color-scheme: dark)', color: '#4f46e5' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Casa Buriti - Caixa',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Casa Buriti',
    title: 'Casa Buriti - Sistema de Gestão de Eventos',
    description: 'Sistema de gestão de eventos e vendas para a Casa Buriti',
  },
  twitter: {
    card: 'summary',
    title: 'Casa Buriti - Sistema de Gestão de Eventos',
    description: 'Sistema de gestão de eventos e vendas para a Casa Buriti',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  applicationName: 'Casa Buriti - Caixa',
  keywords: ['eventos', 'escola', 'caixa', 'vendas', 'gestão'],
  authors: [{ name: 'Casa Buriti' }],
  creator: 'Casa Buriti',
  publisher: 'Casa Buriti',
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="application-name" content="Casa Buriti - Caixa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Casa Buriti - Caixa" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
