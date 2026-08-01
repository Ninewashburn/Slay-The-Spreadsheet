'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ACTE_I_POOLS, CARD_DEFS, currentSeuil, isBlocked } from '@/lib/engine';
import type { Blind, GameState } from '@/lib/engine';
import { useCombatStore } from '@/lib/ui/combatStore';
import { previewCard, riskLine } from '@/lib/ui/preview';
import AchievementToast from './AchievementToast';
import ActivityFeed from './ActivityFeed';
import Backdrop from './Backdrop';
import BlindPanel from './BlindPanel';
import EndScreens from './EndScreens';
import HandCard from './HandCard';
import HomeScreen from './HomeScreen';
import HopeCounter from './HopeCounter';
import JobBoard from './JobBoard';
import OfferPanel from './OfferPanel';
import RefusalMail from './RefusalMail';

/** La sous-ligne sous le compteur : brouillard du côté du système (§4). */
function sublineFor(blind: Blind, state: GameState): { text: string; risky: boolean } {
  switch (blind.kind) {
    case 'silent-decay':
      return state.hope <= 0
        ? { text: 'Le silence a gagné.', risky: false }
        : { text: 'Aucune réponse ne vient. Votre Espoir se décompose.', risky: state.hope >= 30 };
    case 'word-trigger':
      return { text: 'Le filtre ne lit que les mots-clés.', risky: false };
    case 'escalating-demands':
      return state.blindState.transparent
        ? { text: 'Vous avez dit ce que vous ne saviez pas faire.', risky: false }
        : { text: 'La liste des exigences continue de s’allonger.', risky: true };
    case 'nested-layers':
      return { text: 'Votre interlocuteur n’est pas le décideur.', risky: false };
    case 'no-resolution':
      return { text: 'Votre dossier est en cours de traitement.', risky: false };
    case 'scripted-loss':
      return { text: 'L’échange se passe très bien.', risky: false };
    default:
      return riskLine(state, blind.computeRisk);
  }
}

/**
 * La scène. Décor de bureau, fenêtre du logiciel RH au centre, offre en
 * document, log en fil de notifications. L'UI LIT l'état et FOURNIT les rolls,
 * jamais une règle. Elle orchestre la run : accueil, job board, combat, refus.
 */
export default function CombatScreen() {
  const store = useCombatStore();
  const { phase, state, blind, offer, fx, animating, refusal, newAchievements } = store;
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // La méta vit dans le navigateur : lue APRÈS l'hydratation, jamais au rendu
  // serveur (sinon mismatch garanti).
  useEffect(() => {
    store.loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toasts = (
    <AchievementToast ids={newAchievements} onDismiss={store.dismissAchievements} />
  );

  if (refusal) {
    return (
      <>
        <RefusalMail
          refusal={refusal}
          skippable={store.refusalSkippable}
          onClose={store.closeRefusal}
        />
        {toasts}
      </>
    );
  }

  if (phase === 'home') {
    return (
      <div className="relative">
        <Backdrop />
        <div className="relative z-10">
          <HomeScreen onPlay={() => store.startRun()} meta={store.meta} />
        </div>
        {toasts}
      </div>
    );
  }

  if (phase === 'board') {
    return (
      <div className="relative">
        <Backdrop />
        <div className="relative z-10">
          <JobBoard
            offers={store.offers}
            step={store.step}
            totalSteps={ACTE_I_POOLS.length}
            carriedHope={state?.hope ?? 0}
            onPick={store.pickOffer}
          />
        </div>
        {toasts}
      </div>
    );
  }

  if (!state || !blind) return <div className="h-dvh" />;

  const isGhost = blind.kind === 'silent-decay';
  const isFictif = blind.kind === 'no-resolution';
  const canLeaveHere = (isGhost || isFictif) && !state.blindState.leaveLocked;
  const playing = state.status === 'playing';
  const frozen = !playing || animating;
  const subline = sublineFor(blind, state);
  const seuil = currentSeuil(state, blind);

  const canPlaySomething = state.hand.some((inst) => {
    const def = CARD_DEFS[inst.defId];
    return def !== undefined && def.cost <= state.energy && !isBlocked(def, blind);
  });
  const ctaPulse = playing && !animating && (canLeaveHere || !canPlaySomething);

  const isPointInDropZone = (x: number, y: number): boolean => {
    const r = dropZoneRef.current?.getBoundingClientRect();
    return r !== undefined && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  return (
    <div className="relative h-dvh overflow-hidden">
      <Backdrop />

      <div className="relative z-10 mx-auto grid h-full max-w-[1520px] grid-cols-1 justify-center gap-6 lg:grid-cols-[300px_minmax(0,760px)_330px] lg:gap-8 lg:px-8 lg:py-8">
        <aside className="hidden flex-col justify-center lg:flex">
          <OfferPanel blind={blind} offer={offer} state={state} />
        </aside>

        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--panel)] lg:rounded-[22px] lg:border lg:border-[var(--line)] lg:shadow-[0_24px_70px_rgba(28,35,51,0.12)]">
          <header className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              Slay the Spreadsheet
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[12px] font-semibold text-[var(--muted)]">
                Étape {store.step + 1} / {ACTE_I_POOLS.length}
              </span>
              <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[12px] font-semibold text-[var(--muted)]">
                Tour {Math.min(state.turn, blind.maxTurns)} / {blind.maxTurns}
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

          <BlindPanel blind={blind} state={state} />

          {/* La Liste Infinie : les exigences révélées s'empilent, visiblement. */}
          {state.blindState.demands.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-b border-[var(--line)] bg-[var(--bg)] px-5 py-2.5">
              {state.blindState.demands.map((d, i) => (
                <motion.span
                  key={`${d}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                    state.blindState.transparent
                      ? 'bg-[var(--green-soft)] text-[var(--green)]'
                      : 'bg-[#FFEDE5] text-[#C2410C]'
                  }`}
                >
                  {d}
                </motion.span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end px-5 pt-2">
            <span className="text-[11px] text-[var(--muted)]">
              Pioche {state.drawPile.length} · Défausse {state.discardPile.length}
            </span>
          </div>

          <div ref={dropZoneRef} className="relative min-h-0 flex-1">
            {dragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-3 z-10 rounded-[18px] border-2 border-dashed border-[#C9D8F7] bg-[var(--blue-soft)]/20"
              />
            )}
            <HopeCounter
              hope={state.hope}
              seuil={seuil}
              fx={fx}
              subline={subline}
              turnsLeft={Math.max(0, blind.maxTurns - state.turn + 1)}
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5 px-3.5 pb-1 pt-2 lg:gap-4 lg:px-6">
            {state.hand.map((inst) => {
              const def = CARD_DEFS[inst.defId];
              if (!def) return null;
              return (
                <HandCard
                  key={inst.uid}
                  def={def}
                  preview={previewCard(state, def, seuil)}
                  disabled={frozen || def.cost > state.energy}
                  blocked={isBlocked(def, blind)}
                  requiredKeyword={blind.requiredKeyword}
                  onPlay={() => store.playCard(inst.uid)}
                  isPointInDropZone={isPointInDropZone}
                  onDragChange={setDragging}
                />
              );
            })}
          </div>

          <div className="flex gap-2 px-4 pb-1.5 pt-2.5 lg:gap-3 lg:px-6 lg:pt-4">
            {/* Une interdiction muette se lit comme un bug : on dit pourquoi. */}
            <div className="relative flex-1">
              <button
                onClick={canLeaveHere ? store.endTurn : store.passTurn}
                disabled={frozen || (!canLeaveHere && state.playedThisTurn)}
                title={
                  !canLeaveHere && state.playedThisTurn
                    ? 'Vous vous êtes déjà manifesté ce tour.'
                    : undefined
                }
                className="w-full cursor-pointer rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-3.5 text-[13.5px] font-bold text-[var(--muted)] hover:enabled:bg-[#EEF1F6] disabled:cursor-default disabled:opacity-30 lg:p-4 lg:text-[14.5px]"
              >
                {canLeaveHere ? 'Attendre encore' : 'Passer le tour'}
              </button>
              {!canLeaveHere && state.playedThisTurn && playing && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pointer-events-none absolute inset-x-0 -top-4 text-center text-[10.5px] text-[var(--muted)]"
                >
                  Vous vous êtes déjà manifesté ce tour.
                </motion.span>
              )}
            </div>
            <motion.button
              onClick={canLeaveHere ? store.leave : store.endTurn}
              disabled={frozen}
              animate={
                ctaPulse
                  ? {
                      boxShadow: [
                        '0 0 0 0 rgba(61,107,224,0)',
                        `0 0 0 9px ${canLeaveHere ? 'rgba(255,138,101,0.18)' : 'rgba(61,107,224,0.18)'}`,
                        '0 0 0 0 rgba(61,107,224,0)',
                      ],
                    }
                  : { boxShadow: '0 0 0 0 rgba(61,107,224,0)' }
              }
              transition={
                ctaPulse ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }
              }
              className={`flex-1 cursor-pointer rounded-[var(--radius)] border-none p-3.5 text-[13.5px] font-bold text-white disabled:cursor-default disabled:opacity-30 lg:p-4 lg:text-[14.5px] ${
                canLeaveHere
                  ? 'bg-[var(--corail)] hover:enabled:brightness-95'
                  : 'bg-[var(--ink)] hover:enabled:bg-[#2A3346]'
              }`}
            >
              {canLeaveHere ? 'Partir' : 'Terminer le tour'}
            </motion.button>
          </div>

          <footer className="px-5 pb-3.5 pt-1 text-center">
            <button
              onClick={() => store.toHome()}
              className="cursor-pointer border-none bg-transparent text-[12px] text-[var(--muted)] underline"
            >
              abandonner la run
            </button>
          </footer>
        </div>

        <aside className="hidden min-h-0 flex-col justify-center lg:flex">
          <ActivityFeed log={state.log} />
        </aside>
      </div>

      <EndScreens
        state={state}
        blind={blind}
        isLastStep={store.isLastStep}
        onContinue={store.continueRun}
        onHome={store.toHome}
        refusalPending={refusal !== null}
      />
      {toasts}
    </div>
  );
}
