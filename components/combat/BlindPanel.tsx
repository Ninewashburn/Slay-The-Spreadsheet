import type { Blind, BlindKind, GameState } from '@/lib/engine';
import { currentSeuil, POUPEE_LAYER_LABELS, POUPEE_LAYER_LINES } from '@/lib/engine';
import { GhosteurAvatar, RecruiterAvatar } from './art';

function BlindAvatar({ kind, size }: { readonly kind: BlindKind; readonly size: number }) {
  // Le Ghosteur et le Poste Fictif n'ont pas de visage : on ne sait même pas
  // ce que c'est. Une machine ? Une personne ? Rien ?
  if (kind === 'silent-decay' || kind === 'no-resolution') return <GhosteurAvatar size={size} />;
  return <RecruiterAvatar size={size} />;
}

/**
 * L'adversaire incarné, en haut de la fenêtre (le voyageur au guichet de Papers
 * Please). Un avatar, un nom, sa règle en langage d'entreprise. Le blind ne
 * parle pas : le panneau décrit, c'est tout. Sa seule prise de parole est sa
 * ligne de mort.
 */
export default function BlindPanel({
  blind,
  state,
}: {
  readonly blind: Blind;
  readonly state: GameState;
}) {
  const layer = state.blindState.layer;
  const isLayers = blind.kind === 'nested-layers';
  // Les couches sont visuellement quasi identiques : seul le badge change.
  const name = isLayers ? (POUPEE_LAYER_LABELS[layer] ?? blind.name) : blind.name;
  const rule = isLayers ? (POUPEE_LAYER_LINES[layer] ?? blind.rule) : blind.rule;

  return (
    <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--bg)] px-4 py-3 lg:px-6 lg:py-4">
      <div className="shrink-0">
        <BlindAvatar kind={blind.kind} size={52} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-[var(--ink)] lg:text-[15px]">{name}</div>
        {/* Le flavor dit QUI parle. */}
        <div className="truncate text-[12px] text-[var(--muted)] lg:text-[12.5px]">{rule}</div>
        {/* La mécanique dit CE QUI SE PASSE. Jamais l'un sans l'autre. */}
        <div className="mt-1 flex items-start gap-1.5">
          <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--corail)]" />
          <span className="text-[11.5px] font-semibold leading-snug text-[var(--ink)]">
            {blind.mechanic}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {blind.seuil > 0 && (
          <span className="rounded-full border border-[#F0DDBC] bg-[#FFF6E8] px-2.5 py-0.5 text-[11px] font-bold text-[var(--ink)]">
            Espoir exigé : {currentSeuil(state, blind)}
          </span>
        )}
        <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
          {isLayers
            ? `Interlocuteur ${layer + 1} / ${blind.layers ?? 1}`
            : `Décision sous ${blind.maxTurns} tours`}
        </span>
      </div>
    </div>
  );
}
