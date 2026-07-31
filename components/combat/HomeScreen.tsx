import { motion } from 'framer-motion';
import { ACHIEVEMENTS, RELIC_EXPERIENCE } from '@/lib/engine';
import type { MetaState } from '@/lib/engine';
import { OfficePlant } from './art';

/**
 * L'accueil : sobre, un logiciel qu'on ouvre, pas un jeu qui s'annonce. Logo
 * texte, une phrase, un bouton. La méta-progression s'affiche discrètement,
 * comme un compteur de dossiers : le jeu ne fait jamais la leçon.
 */
export default function HomeScreen({
  onPlay,
  meta,
}: {
  readonly onPlay: () => void;
  readonly meta: MetaState;
}) {
  const hasRelic = meta.relics.includes(RELIC_EXPERIENCE);

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute bottom-0 left-6 hidden opacity-90 lg:block">
        <OfficePlant width={120} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="mb-3 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Espace candidat
        </div>
        <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-[var(--ink)] lg:text-[46px]">
          Slay the Spreadsheet
        </h1>
        <p className="mt-3 max-w-[360px] text-[13.5px] leading-relaxed text-[var(--muted)]">
          Votre Espoir est votre score. C&apos;est aussi la seule chose par laquelle le
          processus peut vous atteindre.
        </p>

        <motion.button
          onClick={onPlay}
          whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(61,107,224,0.28)' }}
          whileTap={{ y: 0, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="mt-8 cursor-pointer rounded-[var(--radius)] border-none bg-[var(--blue)] px-10 py-3.5 text-[15px] font-bold text-white"
        >
          {meta.runsPlayed > 0 ? 'Postuler à nouveau' : 'Postuler'}
        </motion.button>

        <div className="mt-4 text-[11px] text-[var(--muted)]">
          Cinq étapes. Une seule vous refusera quoi que vous fassiez.
        </div>

        {meta.runsPlayed > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
              {meta.runsPlayed} candidature{meta.runsPlayed > 1 ? 's' : ''} envoyée
              {meta.runsPlayed > 1 ? 's' : ''}
            </span>
            <span className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
              {meta.achievements.length} / {ACHIEVEMENTS.length} succès
            </span>
            {hasRelic && (
              // La relique du jeu : tu reconnais un refus aux trois premiers mots.
              <span className="rounded-full border border-[#C9D8F7] bg-[var(--blue-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--blue)]">
                Expérience du candidat
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
