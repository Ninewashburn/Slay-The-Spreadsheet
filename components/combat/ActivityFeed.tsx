import { AnimatePresence, motion } from 'framer-motion';

/**
 * Le log du moteur rendu en fil de notifications SaaS : chaque entrée
 * est un événement du dossier. Le moteur écrit, le fil affiche. La joie
 * stérile du dashboard, au service de la lisibilité.
 */
export default function ActivityFeed({ log }: { readonly log: readonly string[] }) {
  const recent = log.slice(-8).reverse();

  return (
    <div className="flex max-h-full flex-col rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_10px_30px_rgba(28,35,51,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          Activité du dossier
        </span>
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--blue)] px-1 text-[9px] font-bold text-white">
          {log.length}
        </span>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-xl bg-[var(--bg)] px-3 py-4 text-center text-[11.5px] text-[var(--muted)]">
          Aucune activité pour le moment.
        </div>
      ) : (
        <ul className="space-y-1.5 overflow-hidden">
          <AnimatePresence initial={false}>
            {recent.map((entry, i) => (
              <motion.li
                key={`${log.length - i}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex items-start gap-2 rounded-xl bg-[var(--bg)] px-3 py-2"
              >
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blue)]" />
                <span className="text-[11.5px] leading-snug text-[var(--ink)]">{entry}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
