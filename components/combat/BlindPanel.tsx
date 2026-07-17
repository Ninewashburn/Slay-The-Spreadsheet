import type { Blind, BlindKind } from '@/lib/engine';
import { GhosteurAvatar, RecruiterAvatar } from './art';

/** La règle du blind en langage d'entreprise, par famille. Sec, poli, §8. */
const KIND_LINES: Record<BlindKind, string> = {
  probabilistic: 'Étudie votre dossier. Peut émettre des réserves à tout moment.',
  'word-trigger': 'Analyse automatique. Toute pièce hors référentiel est écartée.',
  'silent-decay': 'Dossier transmis. Aucune réponse à ce jour.',
};

function BlindAvatar({ kind, size }: { readonly kind: BlindKind; readonly size: number }) {
  if (kind === 'silent-decay') return <GhosteurAvatar size={size} />;
  return <RecruiterAvatar size={size} />;
}

/**
 * L'adversaire incarné, en haut de la fenêtre (le voyageur au guichet de
 * Papers Please). Un avatar sans visage, un nom, sa règle en langage
 * d'entreprise. Le blind ne parle pas : le panneau décrit, c'est tout.
 */
export default function BlindPanel({ blind }: { readonly blind: Blind }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3 lg:px-6 lg:py-4">
      <div className="shrink-0">
        <BlindAvatar kind={blind.kind} size={52} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-[var(--ink)] lg:text-[15px]">{blind.name}</div>
        <div className="truncate text-[12px] text-[var(--muted)] lg:text-[12.5px]">
          {KIND_LINES[blind.kind]}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="rounded-full border border-[#F0DDBC] bg-[#FFF6E8] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)]">
          Dossier exigé : {blind.seuil}
        </span>
        <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
          Décision sous {blind.maxTurns} tours
        </span>
      </div>
    </div>
  );
}
