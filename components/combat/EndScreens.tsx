import { motion } from 'framer-motion';
import type { Blind, GameState } from '@/lib/engine';

const GEORGIA = 'Georgia, "Times New Roman", serif';

interface Props {
  readonly state: GameState;
  readonly blind: Blind;
  readonly onReset: () => void;
}

const fadeUp = (delay: number, duration = 1.4) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: 'easeOut' as const },
});

/**
 * Les trois fins du proto, à l'identique :
 * - lost : rouge sur noir, Georgia — le refus parle la langue de l'entreprise.
 * - won  : vert sombre — la victoire n'est qu'un entretien confirmé.
 * - passive : gris plat, sans-serif, sans solennité — ne rien risquer
 *   ne mérite même pas une mise en scène.
 */
export default function EndScreens({ state, blind, onReset }: Props) {
  if (state.status === 'playing') return null;

  if (state.status === 'lost') {
    const title =
      state.lostReason === 'shattered' ? blind.deathLineShattered : blind.deathLineBelowSeuil;
    const detail =
      state.lostReason === 'belowSeuil'
        ? `Dossier final : ${Math.round(state.hope)}. L'offre exigeait ${blind.seuil}.`
        : null;
    return (
      <Overlay bg="#05070C" onReset={onReset} btnLabel="recommencer" btnClass="border-[#3A3F4B] text-[#8A93A6]">
        {/* Le tampon : la ligne de mort s'abat comme un DENIED de Papers Please. */}
        <motion.h1
          initial={{ opacity: 0, scale: 1.7, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ delay: 1.3, duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
          className="m-0 mb-5 max-w-[400px] whitespace-pre-line border-[3px] border-[var(--danger-bright)] px-6 py-4 text-center text-[26px] font-bold leading-[1.4] tracking-[0.03em] text-[var(--danger-bright)]"
          style={{ fontFamily: GEORGIA }}
        >
          {title}
        </motion.h1>
        <motion.p
          {...fadeUp(1.8)}
          className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#6B7280]"
        >
          {detail}
        </motion.p>
      </Overlay>
    );
  }

  if (state.status === 'won') {
    return (
      <Overlay bg="#0B1710" onReset={onReset} btnLabel="rejouer" btnClass="border-[#2D4A3C] text-[#7FA893]">
        <motion.h1
          {...fadeUp(1.3)}
          className="m-0 mb-3 max-w-[360px] whitespace-pre-line px-5 text-center text-[26px] font-bold leading-[1.4] tracking-[0.03em] text-[#6EE7B7]"
          style={{ fontFamily: GEORGIA }}
        >
          {blind.victoryLine}
        </motion.h1>
        <motion.p
          {...fadeUp(1.8)}
          className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#5F8272]"
        >
          Dossier final : {Math.round(state.hope)} / {blind.seuil} exigés.
        </motion.p>
      </Overlay>
    );
  }

  // passive — gris plat, sans-serif : l'anti-cérémonie.
  return (
    <Overlay bg="#E9EBEE" onReset={onReset} btnLabel="recommencer" btnClass="border-[#C6CBD4] text-[#9AA1AD]">
      <motion.h1
        {...fadeUp(1.3)}
        className="m-0 mb-3 max-w-[360px] px-5 text-center text-[20px] font-semibold text-[#9AA1AD]"
      >
        Vous n&apos;avez rien risqué.
      </motion.h1>
      <motion.p
        {...fadeUp(1.8)}
        className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#ABB1BC]"
      >
        Vous n&apos;avez rien obtenu non plus.
      </motion.p>
    </Overlay>
  );
}

function Overlay({
  bg,
  btnLabel,
  btnClass,
  onReset,
  children,
}: {
  readonly bg: string;
  readonly btnLabel: string;
  readonly btnClass: string;
  readonly onReset: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 1.1, ease: 'easeInOut' }}
    >
      {children}
      <motion.button
        {...fadeUp(2.9, 1)}
        onClick={onReset}
        className={`cursor-pointer rounded-full border bg-transparent px-[18px] py-2 text-[12px] ${btnClass}`}
      >
        {btnLabel}
      </motion.button>
    </motion.div>
  );
}
