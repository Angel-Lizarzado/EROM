import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { ExchangeRateProvider } from '@/context/ExchangeRateContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { getExchangeRate } from '@/lib/exchange-rate';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    template: '%s | EROM',
    default: 'EROM - Tu Tienda Online de Moda en Venezuela',
  },
  description: 'Descubre nuestra colección exclusiva de ropa, accesorios y joyería. Envíos a todo el país con precios en Dólares y Bolívares.',
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    title: 'EROM - Tu Tienda Online',
    description: 'Moda exclusive en Venezuela. Ropa, accesorios y más.',
    url: 'https://erom-store.com', // Replace with actual URL if known, or leave generic
    siteName: 'EROM',
    images: [
      {
        url: '/favicon.png', // Using the large logo requested
        width: 500,
        height: 500,
        alt: 'EROM Logo',
      },
    ],
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EROM - Tu Tienda Online',
    description: 'Moda exclusive en Venezuela.',
    images: ['/favicon.png'],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch data on server
  const exchangeData = await getExchangeRate();

  return (
    <html lang="es" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <FavoritesProvider>
          <ExchangeRateProvider
            rate={exchangeData.promedio}
            fechaActualizacion={exchangeData.fechaActualizacion}
          >
            {children}
            <Analytics />
          </ExchangeRateProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}
