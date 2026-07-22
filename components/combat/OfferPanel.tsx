import type { Blind } from '@/lib/engine';

/**
 * L'offre comme document (le passeport de Papers Please) : une feuille qu'on lit,
 * posée de travers sur le bureau. Elle s'adapte au blind courant. Le texte reste
 * droit (un texte pivoté perd son antialiasing) ; seule une feuille vierge du
 * dessous porte l'inclinaison.
 */
export default function OfferPanel({ blind }: { readonly blind: Blind }) {
  const isATS = blind.kind === 'word-trigger';
  const isGhost = blind.kind === 'silent-decay';

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-[6px] border border-[var(--line)] bg-[var(--panel)]"
        style={{ transform: 'rotate(-1.6deg)' }}
        aria-hidden
      />
      <div className="relative rounded-[6px] border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[0_10px_30px_rgba(28,35,51,0.08)] lg:p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          {isGhost ? 'Accusé de réception' : "Offre d'emploi"}
        </div>
        <div className="mt-2 text-[16px] font-bold leading-tight text-[var(--ink)]">
          Développeur (H/F)
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--muted)]">
          {isGhost ? 'Candidature transmise au recruteur.' : 'CDI. Démarrage dès que possible.'}
        </div>

        <hr className="my-3 border-[var(--line)]" />

        {isATS && (
          <div className="rounded-lg border border-[#F0DDBC] bg-[#FFF6E8] p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Mot-clé exigé par le filtre
            </div>
            <div className="mt-1 font-mono text-[15px] font-bold text-[var(--ink)]">
              {blind.requiredKeyword}
            </div>
            <div className="mt-1 text-[11px] leading-snug text-[var(--muted)]">
              Toute pièce sans ce mot exact est écartée automatiquement.
            </div>
          </div>
        )}

        {isGhost && (
          <ul className="space-y-1.5 text-[12px] leading-relaxed text-[var(--ink)]">
            <li>Nous revenons vers vous très vite.</li>
            <li>Votre profil a retenu notre attention.</li>
            <li className="text-[var(--muted)]">Dernière activité : il y a un moment.</li>
          </ul>
        )}

        {!isATS && !isGhost && (
          <ul className="space-y-1.5 text-[12px] leading-relaxed text-[var(--ink)]">
            <li>Environnement dynamique.</li>
            <li>Équipe à taille humaine.</li>
            <li>Fortes perspectives d&apos;évolution.</li>
          </ul>
        )}

        <hr className="my-3 border-[var(--line)]" />

        <div className="space-y-1 text-[12px]">
          {isGhost ? (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Réponse attendue</span>
              <b className="text-[var(--ink)]">aucune date</b>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Espoir exigé en fin de processus</span>
              <b className="text-[var(--ink)]">{blind.seuil}</b>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Durée du processus</span>
            <b className="text-[var(--ink)]">{blind.maxTurns} tours</b>
          </div>
        </div>

        <div className="mt-4 rounded-full bg-[var(--blue-soft)] px-3 py-1.5 text-center text-[11px] font-bold text-[var(--blue)]">
          {isGhost ? 'En attente de réponse' : 'Candidature simplifiée'}
        </div>
      </div>
    </div>
  );
}
