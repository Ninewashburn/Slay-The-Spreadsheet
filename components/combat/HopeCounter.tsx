import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Fx } from '@/lib/ui/combatStore';

const GEORGIA = 'Georgia, "Times New Roman", serif';

interface Props {
  readonly hope: number;
  readonly seuil: number;
  readonly fx: Fx;
  readonly subline: { readonly text: string; readonly risky: boolean };
}

/**
 * Le centre de l'écran : le chiffre d'Espoir. Bleu → doré (≥ 20) → corail (≥ 60),
 * bump quand il grimpe, shatter + shake quand le blind le convertit en dégâts.
 * Le mot de la casse (« Cependant… ») tombe SUR l'ancien chiffre — l'état
 * commité arrive après, c'est le store qui tient la timeline.
 */
export default function HopeCounter({ hope, seuil, fx, subline }: Props) {
  const numberControls = useAnimationControls();
  const zoneControls = useAnimationControls();
  const prevHope = useRef(hope);

  useEffect(() => {
    if (hope > prevHope.current) {
      void numberControls.start({
        scale: [1, 1.14, 1],
        transition: { duration: 0.35, ease: 'easeOut' },
      });
    } else if (hope < prevHope.current) {
      // L'état post-casse vient d'être commité : le nouveau (petit) chiffre
      // repart propre, sans hériter de la pose finale du shatter.
      numberControls.set({ scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' });
    }
    prevHope.current = hope;
  }, [hope, numberControls]);

  useEffect(() => {
    if (fx?.kind === 'shatter') {
      void numberControls.start({
        scale: [1, 1.05, 0.9, 0.7, 0.55],
        rotate: [0, -2, 3, -4, 0],
        opacity: [1, 1, 1, 0.4, 1],
        filter: ['blur(0px)', 'blur(0px)', 'blur(1px)', 'blur(2px)', 'blur(0px)'],
        transition: { duration: 0.55, ease: [0.36, 0.07, 0.19, 0.97] },
      });
      void zoneControls.start({
        x: [0, -6, 5, -4, 3, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      });
    }
  }, [fx, numberControls, zoneControls]);

  const color =
    hope >= 60 ? 'text-[var(--corail)]' : hope >= 20 ? 'text-[var(--gold)]' : 'text-[var(--blue)]';
  const glow =
    hope >= 60
      ? '0 0 32px rgba(255,138,101,0.45)'
      : hope >= 20
        ? '0 0 24px rgba(232,166,61,0.35)'
        : 'none';
  const reached = hope >= seuil;
  const hideSubline = fx?.kind === 'word' || fx?.kind === 'shatter';

  return (
    <motion.div
      animate={zoneControls}
      className="relative flex h-full min-h-0 flex-col items-center justify-center px-6"
    >
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        Espoir
      </div>

      <motion.div
        animate={numberControls}
        className={`text-[84px] font-extrabold leading-none tracking-[-0.02em] tabular-nums transition-colors duration-[400ms] lg:text-[120px] ${color}`}
        style={{ textShadow: glow }}
      >
        {Math.round(hope)}
      </motion.div>

      <div
        className={`mt-2 text-[11px] font-semibold ${reached ? 'text-[var(--green)]' : 'text-[var(--muted)]'}`}
      >
        <b className={reached ? 'text-[var(--green)]' : 'text-[var(--ink)]'}>{Math.round(hope)}</b>{' '}
        / {seuil} exigés à la fin
      </div>

      <div
        className={`mt-2 min-h-[18px] max-w-[280px] text-center text-[13px] ${
          subline.risky ? 'font-semibold text-[var(--corail)]' : 'text-[var(--muted)]'
        }`}
      >
        {hideSubline ? '' : subline.text}
      </div>

      <AnimatePresence>
        {fx?.kind === 'word' && (
          <motion.div
            key="word"
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0, y: -48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <span
              className="text-[42px] font-bold text-[var(--danger-bright)]"
              style={{ fontFamily: GEORGIA }}
            >
              {fx.word}
            </span>
          </motion.div>
        )}

        {fx?.kind === 'turn' && (
          <motion.div
            key="turn"
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <span className="rounded-full bg-[var(--green-soft)] px-4 py-2 text-[15px] font-bold uppercase tracking-[0.08em] text-[var(--green)]">
              {fx.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
