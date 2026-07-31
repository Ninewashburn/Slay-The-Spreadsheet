import { formatSalary } from '@/lib/engine';
import type { Blind, GameState, Offer } from '@/lib/engine';
import { currentSeuil } from '@/lib/engine';

interface Props {
  readonly blind: Blind;
  readonly offer: Offer | null;
  readonly state: GameState;
}

/**
 * L'offre comme document (le passeport de Papers Please) : une feuille qu'on
 * lit, posée de travers sur le bureau. Le texte reste droit (un texte pivoté
 * perd son antialiasing) ; seule une feuille vierge du dessous porte
 * l'inclinaison. Le panneau s'adapte au blind : l'ATS affiche son mot exigé, la
 * Poupée Russe affiche la récompense qui fond.
 */
export default function OfferPanel({ blind, offer, state }: Props) {
  const isATS = blind.kind === 'word-trigger';
  const isGhost = blind.kind === 'silent-decay';
  const isLayers = blind.kind === 'nested-layers';
  const seuil = currentSeuil(state, blind);

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
          {offer?.title ?? 'Développeur (H/F)'}
        </div>
        <div className="mt-0.5 text-[11px] text-[var(--muted)]">
          {isGhost ? 'Candidature transmise au recruteur.' : (offer?.contract ?? 'CDI.')}
        </div>

        <hr className="my-3 border-[var(--line)]" />

        {isATS ? (
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
        ) : (
          <ul className="space-y-1.5 text-[12px] leading-relaxed text-[var(--ink)]">
            {(offer?.advantages ?? ['Environnement dynamique.']).map((a) => (
              <li key={a}>{a}</li>
            ))}
            {offer && <li className="font-semibold">{offer.redFlag.label}.</li>}
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
              <span className="text-[var(--muted)]">Espoir exigé</span>
              <b className="text-[var(--ink)]">{seuil}</b>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Durée du processus</span>
            <b className="text-[var(--ink)]">{blind.maxTurns} tours</b>
          </div>
          {isLayers && (
            // La récompense fond à chaque intermédiaire : chacun prend sa marge.
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Reste à négocier</span>
              <b className="text-[var(--corail)]">{state.blindState.reward} %</b>
            </div>
          )}
        </div>

        {offer && (
          <div className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              Rémunération
            </div>
            <div className="font-mono text-[11.5px] font-bold text-[var(--ink)]">
              {formatSalary(offer.salaryLow)} à {formatSalary(offer.salaryHigh)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
