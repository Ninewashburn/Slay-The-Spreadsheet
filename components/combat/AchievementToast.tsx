import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { achievementById } from '@/lib/engine';

interface Props {
  readonly ids: readonly string[];
  readonly onDismiss: () => void;
}

/**
 * Les succès. Ils portent la même fonction que la méta-progression, avec de
 * l'humour : ils NOMMENT ce que le joueur vient de comprendre, sans jamais lui
 * faire la leçon (GAME_DESIGN §10 : jamais de popup « Conseil n°7 »). Ils sont
 * cachés jusqu'à leur obtention.
 */
export default function AchievementToast({ ids, onDismiss }: Props) {
  useEffect(() => {
    if (ids.length === 0) return;
    const t = setTimeout(onDismiss, 5200);
    return () => clearTimeout(t);
  }, [ids, onDismiss]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {ids.map((id, i) => {
          const def = achievementById(id);
          if (!def) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: i * 0.15, duration: 0.3, ease: 'easeOut' }}
              className="pointer-events-auto w-[300px] rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-3.5 shadow-[0_18px_40px_rgba(28,35,51,0.22)]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Succès débloqué
              </div>
              <div className="mt-1 text-[14px] font-bold text-[var(--ink)]">{def.name}</div>
              <div className="mt-0.5 text-[11.5px] leading-snug text-[var(--muted)]">
                {def.description}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
