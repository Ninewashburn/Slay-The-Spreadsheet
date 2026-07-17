import { CoffeeMug, OfficePlant } from './art';

/**
 * Le décor : le bureau du candidat. Une grille de points de dashboard,
 * deux formes molles, une plante, un café. La scène dit « espace de
 * travail », jamais « plateau de jeu » (CLAUDE.md §6).
 */
export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* grille de points, la texture universelle du SaaS */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--line) 1.2px, transparent 1.2px)',
          backgroundSize: '26px 26px',
        }}
      />
      {/* formes molles Memphis, aux coins */}
      <div
        className="absolute -left-40 -top-44 h-[420px] w-[420px] rounded-full opacity-60"
        style={{ background: 'var(--blue-soft)' }}
      />
      <div
        className="absolute -bottom-52 -right-36 h-[460px] w-[460px] rounded-full opacity-50"
        style={{ background: 'var(--green-soft)' }}
      />
      <div
        className="absolute -right-16 top-24 h-40 w-40 rounded-[38%] opacity-40"
        style={{ background: '#FFEDE5', transform: 'rotate(18deg)' }}
      />
      {/* le bureau : plante et café, desktop uniquement */}
      <div className="absolute bottom-0 left-8 hidden lg:block">
        <OfficePlant width={130} />
      </div>
      <div className="absolute bottom-6 right-14 hidden -rotate-6 lg:block">
        <CoffeeMug width={64} />
      </div>
    </div>
  );
}
