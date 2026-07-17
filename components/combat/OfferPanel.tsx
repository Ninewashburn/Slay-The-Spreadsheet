import type { Blind } from '@/lib/engine';

/**
 * L'offre comme document (le passeport de Papers Please) : une feuille
 * qu'on lit, légèrement posée de travers sur le bureau. En V1 l'offre
 * sera générée et deviendra le niveau lui-même ; ici, la version slice.
 */
export default function OfferPanel({ blind }: { readonly blind: Blind }) {
  return (
    <div className="relative">
      {/* La feuille du dessous, de travers. Le texte, lui, reste droit :
          un texte pivoté perd son antialiasing (le « flou » du playtest). */}
      <div
        className="absolute inset-0 rounded-[6px] border border-[var(--line)] bg-[var(--panel)]"
        style={{ transform: 'rotate(-1.6deg)' }}
        aria-hidden
      />
      <div className="relative rounded-[6px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_10px_30px_rgba(28,35,51,0.08)] lg:p-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
        Offre d&apos;emploi
      </div>
      <div className="mt-2 text-[16px] font-bold leading-tight text-[var(--ink)]">
        Développeur (H/F)
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--muted)]">CDI. Démarrage dès que possible.</div>

      <hr className="my-3 border-[var(--line)]" />

      <ul className="space-y-1.5 text-[12px] leading-relaxed text-[var(--ink)]">
        <li>Environnement dynamique.</li>
        <li>Équipe à taille humaine.</li>
        <li>Fortes perspectives d&apos;évolution.</li>
      </ul>

      <hr className="my-3 border-[var(--line)]" />

      <div className="space-y-1 text-[12px]">
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Espoir exigé en fin de processus</span>
          <b className="text-[var(--ink)]">{blind.seuil}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--muted)]">Durée du processus</span>
          <b className="text-[var(--ink)]">{blind.maxTurns} tours</b>
        </div>
      </div>

        <div className="mt-4 rounded-full bg-[var(--blue-soft)] px-3 py-1.5 text-center text-[11px] font-bold text-[var(--blue)]">
          Candidature simplifiée
        </div>
      </div>
    </div>
  );
}
