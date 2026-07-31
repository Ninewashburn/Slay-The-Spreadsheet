import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Refusal } from '@/lib/engine';

const GEORGIA = 'Georgia, "Times New Roman", serif';
/** Vitesse de frappe du mail. Lent exprès : run 1, on subit chaque lettre. */
const CHAR_MS = 18;

interface Props {
  readonly refusal: Refusal;
  /** Avec la relique « Expérience du candidat », le mail devient fermable tout de suite. */
  readonly skippable: boolean;
  readonly onClose: (early: boolean) => void;
}

/**
 * Le mail de refus, écrit lettre par lettre.
 *
 * C'est le système de durée de vie du jeu (GAME_DESIGN §Reliques) : run 1, il
 * est imblocable et on lit tout. Ensuite, la relique le rend fermable
 * immédiatement. Le jeu te fait perdre du temps, puis te rend ton temps.
 * Fermer AVANT que le mot pivot n'apparaisse débloque « Je savais ».
 */
export default function RefusalMail({ refusal, skippable, onClose }: Props) {
  const [shown, setShown] = useState(0);
  const pivotIndex = useRef(refusal.body.toLowerCase().indexOf(refusal.pivot.toLowerCase()));

  // Le mail s'écrit toujours lettre par lettre. Ce que la relique change n'est
  // pas la vitesse, c'est le DROIT de fermer avant la fin.
  useEffect(() => {
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= refusal.body.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, CHAR_MS);
    return () => clearInterval(id);
  }, [refusal.body.length, skippable]);

  const complete = shown >= refusal.body.length;
  // Le joueur a-t-il fermé avant d'avoir lu le mot qui annonçait le refus ?
  const pivotVisible = pivotIndex.current >= 0 && shown > pivotIndex.current;
  const canClose = skippable || complete;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070C] px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="w-full max-w-[520px]">
        <div className="mb-4 flex items-center justify-between border-b border-[#1C2333] pb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Message reçu
          </span>
          <span className="text-[11px] text-[#4B5563]">ne pas répondre</span>
        </div>

        <p
          className="min-h-[190px] whitespace-pre-line text-[15px] leading-[1.75] text-[#C4CBD6]"
          style={{ fontFamily: GEORGIA }}
        >
          {refusal.body.slice(0, shown)}
          {!complete && <span className="opacity-60">▍</span>}
        </p>

        <div className="mt-7 flex items-center justify-between">
          <span className="text-[11px] text-[#4B5563]">
            {canClose ? '' : 'Lecture en cours.'}
          </span>
          {canClose && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => onClose(skippable && !pivotVisible)}
              className="cursor-pointer rounded-full border border-[#3A3F4B] bg-transparent px-5 py-2 text-[12px] text-[#8A93A6]"
            >
              fermer
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
