import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Slay the Spreadsheet',
  description: 'Deckbuilding roguelike satirique sur la recherche d’emploi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
