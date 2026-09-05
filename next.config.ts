import type { NextConfig } from 'next';

/**
 * L'app est 100 % cliente (le moteur est du TypeScript pur, le hasard est
 * injecté et seedé) : elle n'a jamais eu besoin d'un serveur. On l'exporte donc
 * en fichiers statiques, ce qui sert à la fois l'hébergement web et le
 * dépannage hors ligne.
 *
 * Deux sorties, un seul build :
 * - `npm run build` — chemins absolus, pour un site servi à la racine.
 * - `npm run build:offline` — chemins relatifs, pour ouvrir `out/index.html`
 *   par double-clic, sans serveur (démo sans réseau).
 *
 * `npm_lifecycle_event` est le nom du script npm en cours. On s'en sert plutôt
 * que d'une variable d'environnement en préfixe, qui ne marcherait pas sous
 * Windows.
 */
const isOfflineBuild = process.env.npm_lifecycle_event === 'build:offline';

const nextConfig: NextConfig = {
  output: 'export',
  ...(isOfflineBuild ? { assetPrefix: './' } : {}),
};

export default nextConfig;
