import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Slay the Spreadsheet',
  description: 'Deckbuilding roguelike satirique sur la recherche d’emploi.',
  appleWebApp: { capable: true, title: 'Spreadsheet', statusBarStyle: 'default' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#3D6BE0',
  // Le jeu est pensé portrait, zone du pouce : on fige l'échelle sur mobile.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
