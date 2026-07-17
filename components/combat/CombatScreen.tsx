'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CARD_DEFS } from '@/lib/engine';
import { BLIND, useCombatStore } from '@/lib/ui/combatStore';
import { previewCard, riskLine } from '@/lib/ui/preview';
import ActivityFeed from './ActivityFeed';
import Backdrop from './Backdrop';
import BlindPanel from './BlindPanel';
import EndScreens from './EndScreens';
import HandCard from './HandCard';
import HopeCounter from './HopeCounter';
import OfferPanel from './OfferPanel';

/**
 * La scène (V0.5). Le décor est un bureau, la fenêtre centrale est le
 * logiciel RH, l'offre est un document, le log est un fil de notifications.
 * Rôle inchangé : l'UI LIT l'état et FOURNIT les rolls, jamais une règle.
 */
export default function CombatScreen() {
  const { state, fx, animating, newRun, playCard, passTurn, endTurn } = useCombatStore();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // La run naît côté client (seed = horloge) : le serveur rend une coquille
  // vide identique au premier rendu client — zéro mismatch d'hydratation.
  useEffect(() => {
    if (!useCombatStore.getState().state) newRun();
  }, [newRun]);

  if (!state) return <div className="h-dvh" />;

  const playing = state.status === 'playing';
  const frozen = !playing || animating;
  const subline = riskLine(state, BLIND.computeRisk);
  const canPlaySomething = state.hand.some((inst) => {
    const def = CARD_DEFS[inst.defId];
    return def !== undefined && def.cost <= state.energy;
  });
  // Le CTA respire quand il n'y a plus rien d'autre à faire (le END TURN
  // de Hearthstone, en langage corporate : une pastille bleue qui pulse).
  const ctaPulse = playing && !animating && !canPlaySomething;

  const isPointInDropZone = (x: number, y: number): boolean => {
    const r = dropZoneRef.current?.getBoundingClientRect();
    return r !== undefined && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <Backdrop />

      <div className="relative z-10 mx-auto grid h-full max-w-[1520px] grid-cols-1 justify-center gap-6 lg:grid-cols-[300px_minmax(0,760px)_330px] lg:gap-8 lg:px-8 lg:py-8">
        {/* Le document posé sur le bureau (desktop) */}
        <aside className="hidden flex-col justify-center lg:flex">
          <OfferPanel blind={BLIND} />
        </aside>

        {/* La fenêtre du logiciel RH */}
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--panel)] lg:rounded-[22px] lg:border lg:border-[var(--line)] lg:shadow-[0_24px_70px_rgba(28,35,51,0.12)]">
          <header className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              Slay the Spreadsheet
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[12px] font-semibold text-[var(--muted)]">
                Tour {Math.min(state.turn, BLIND.maxTurns)} / {BLIND.maxTurns}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#C9D8F7] bg-[var(--bg)] px-2.5 py-[7px]">
                <span className="text-[11px] font-bold leading-none text-[var(--blue)]">⚡</span>
                {Array.from({ length: state.energyMax }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${i < state.energy ? 'bg-[var(--blue)]' : 'bg-[var(--line)]'}`}
                  />
                ))}
              </span>
            </div>
          </header>

          <BlindPanel blind={BLIND} />

          <div className="flex items-center justify-end px-5 pt-2">
            <span className="text-[11px] text-[var(--muted)]">
              Pioche {state.drawPile.length} · Défausse {state.discardPile.length}
            </span>
          </div>

          {/* La zone de jeu : on y dépose une carte pour la jouer */}
          <div ref={dropZoneRef} className="relative min-h-0 flex-1">
            {dragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-3 z-10 rounded-[18px] border-2 border-dashed border-[#C9D8F7] bg-[var(--blue-soft)]/20"
              />
            )}
            <HopeCounter hope={state.hope} seuil={BLIND.seuil} fx={fx} subline={subline} />
          </div>

          <div className="grid grid-cols-3 gap-2.5 px-3.5 pb-1 pt-2 lg:gap-4 lg:px-6">
            {state.hand.map((inst) => {
              const def = CARD_DEFS[inst.defId];
              if (!def) return null;
              return (
                <HandCard
                  key={inst.uid}
                  def={def}
                  preview={previewCard(state, def, BLIND.seuil)}
                  disabled={frozen || def.cost > state.energy}
                  onPlay={() => playCard(inst.uid)}
                  isPointInDropZone={isPointInDropZone}
                  onDragChange={setDragging}
                />
              );
            })}
          </div>

          <div className="flex gap-2 px-4 pb-1.5 pt-2.5 lg:gap-3 lg:px-6 lg:pt-4">
            <button
              onClick={passTurn}
              disabled={frozen || state.playedThisTurn}
              className="flex-1 cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-3.5 text-[13.5px] font-bold text-[var(--muted)] hover:enabled:bg-[#EEF1F6] disabled:cursor-default disabled:opacity-30 lg:p-4 lg:text-[14.5px]"
            >
              Passer le tour
            </button>
            <motion.button
              onClick={endTurn}
              disabled={frozen}
              animate={
                ctaPulse
                  ? {
                      boxShadow: [
                        '0 0 0 0 rgba(61,107,224,0)',
                        '0 0 0 9px rgba(61,107,224,0.18)',
                        '0 0 0 0 rgba(61,107,224,0)',
                      ],
                    }
                  : { boxShadow: '0 0 0 0 rgba(61,107,224,0)' }
              }
              transition={ctaPulse ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              className="flex-1 cursor-pointer rounded-[var(--radius)] border-none bg-[var(--ink)] p-3.5 text-[13.5px] font-bold text-white hover:enabled:bg-[#2A3346] disabled:cursor-default disabled:opacity-30 lg:p-4 lg:text-[14.5px]"
            >
              Terminer le tour
            </motion.button>
          </div>

          <footer className="px-5 pb-3.5 pt-1 text-center">
            <button
              onClick={() => newRun()}
              className="cursor-pointer border-none bg-transparent text-[12px] text-[var(--muted)] underline"
            >
              recommencer
            </button>
          </footer>
        </div>

        {/* Le fil d'activité (desktop) */}
        <aside className="hidden min-h-0 flex-col justify-center lg:flex">
          <ActivityFeed log={state.log} />
        </aside>
      </div>

      <EndScreens state={state} blind={BLIND} onReset={() => newRun()} />
    </div>
  );
}
