import type { MetadataRoute } from 'next';

/**
 * Le manifest PWA : le jeu s'installe sur l'écran d'accueil (Android), plein
 * écran, portrait, comme une app. Le déterminisme du moteur rend l'app 100 %
 * cliente : aucune dépendance serveur, donc exportable et empaquetable (V2).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Slay the Spreadsheet',
    short_name: 'Spreadsheet',
    description: 'Deckbuilding roguelike satirique sur la recherche d’emploi.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F5F7FA',
    theme_color: '#3D6BE0',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
