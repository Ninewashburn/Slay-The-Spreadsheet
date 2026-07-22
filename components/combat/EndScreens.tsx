import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Blind, GameState } from '@/lib/engine';

const GEORGIA = 'Georgia, "Times New Roman", serif';

interface Props {
  readonly state: GameState;
  readonly blind: Blind;
  readonly isLastBlind: boolean;
  readonly onContinue: () => void;
  readonly onRestart: () => void;
  readonly onHome: () => void;
}

const fadeUp = (delay: number, duration = 1.4) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: 'easeOut' as const },
});

/**
 * Toutes les sorties de combat. La typo caractérise le blind :
 * - ATS (word-trigger) : monospace, la voix froide de la machine.
 * - Recruteur (probabilistic) : Georgia, la solennité du refus humain.
 * - Ghosteur (silent-decay) perdu : AUCUN écran. Le silence. Retour au menu.
 * - Victoire de blind : « Continuer » vers le suivant. Dernier blind : run finie.
 */
export default function EndScreens({
  state,
  blind,
  isLastBlind,
  onContinue,
  onRestart,
  onHome,
}: Props) {
  // Le Ghosteur perdu ne parle pas : après un temps de silence, retour au menu.
  const silentLoss = state.status === 'lost' && blind.kind === 'silent-decay';
  useEffect(() => {
    if (!silentLoss) return;
    const t = setTimeout(onHome, 3200);
    return () => clearTimeout(t);
  }, [silentLoss, onHome]);

  if (state.status === 'playing') return null;

  // --- Victoire ---
  if (state.status === 'won') {
    // Le Ghosteur : on est PARTI (dernier blind). Sobre, pas triomphal.
    if (isLastBlind) {
      return (
        <Overlay bg="#0B1710" btn={{ label: 'recommencer', cls: 'border-[#2D4A3C] text-[#7FA893]', onClick: onRestart }}>
          <motion.h1
            {...fadeUp(1.3)}
            className="m-0 mb-3 max-w-[380px] px-5 text-center text-[24px] font-bold leading-[1.4] text-[#6EE7B7]"
            style={{ fontFamily: GEORGIA }}
          >
            Vous êtes parti.
          </motion.h1>
          <motion.p
            {...fadeUp(1.8)}
            className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#5F8272]"
          >
            Vous avez gardé {Math.round(state.hope)} d&apos;Espoir. Pour la prochaine fois.
          </motion.p>
        </Overlay>
      );
    }
    // Blind intermédiaire réussi : on continue le process.
    return (
      <Overlay bg="#0B1220" btn={{ label: 'Continuer', cls: 'border-[#2A3A5C] text-[#9DB4E0]', onClick: onContinue }}>
        <motion.h1
          {...fadeUp(1.1)}
          className="m-0 mb-3 max-w-[380px] whitespace-pre-line px-5 text-center text-[22px] font-bold leading-[1.4] tracking-[0.02em] text-[#9DB4E0]"
          style={{ fontFamily: blind.kind === 'word-trigger' ? 'monospace' : GEORGIA }}
        >
          {blind.victoryLine}
        </motion.h1>
        <motion.p
          {...fadeUp(1.6)}
          className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#5A6B88]"
        >
          Un humain va peut-être vous lire. Vous conservez {Math.round(state.hope)} d&apos;Espoir.
        </motion.p>
      </Overlay>
    );
  }

  // --- Le silence du Ghosteur : rien. Un écran vide qui se retire seul. ---
  if (silentLoss) {
    return (
      <motion.div
        className="fixed inset-0 z-50"
        style={{ background: '#05070C' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    );
  }

  // --- Défaite passive : gris plat, sans solennité ---
  if (state.status === 'passive') {
    return (
      <Overlay bg="#E9EBEE" btn={{ label: 'recommencer', cls: 'border-[#C6CBD4] text-[#9AA1AD]', onClick: onRestart }}>
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

  // --- Défaite : ligne de mort du blind (monospace pour l'ATS, Georgia sinon) ---
  const machine = blind.kind === 'word-trigger';
  const title = state.lostReason === 'shattered' ? blind.deathLineShattered : blind.deathLineBelowSeuil;
  const detail =
    state.lostReason === 'belowSeuil' && !machine
      ? `Dossier final : ${Math.round(state.hope)}. L'offre exigeait ${blind.seuil}.`
      : null;

  return (
    <Overlay bg="#05070C" btn={{ label: 'recommencer', cls: 'border-[#3A3F4B] text-[#8A93A6]', onClick: onRestart }}>
      <motion.h1
        initial={{ opacity: 0, scale: 1.7, rotate: machine ? 0 : -4 }}
        animate={{ opacity: 1, scale: 1, rotate: machine ? 0 : -4 }}
        transition={{ delay: 1.3, duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
        className={`m-0 mb-5 max-w-[420px] whitespace-pre-line border-[3px] px-6 py-4 text-center font-bold leading-[1.4] ${
          machine
            ? 'border-[#8A93A6] font-mono text-[22px] tracking-[0.02em] text-[#C4CBD6]'
            : 'border-[var(--danger-bright)] text-[26px] tracking-[0.03em] text-[var(--danger-bright)]'
        }`}
        style={machine ? undefined : { fontFamily: GEORGIA }}
      >
        {title}
      </motion.h1>
      {detail && (
        <motion.p
          {...fadeUp(1.8)}
          className="m-0 mb-7 max-w-[300px] text-center text-[13px] leading-[1.6] text-[#6B7280]"
        >
          {detail}
        </motion.p>
      )}
    </Overlay>
  );
}

function Overlay({
  bg,
  btn,
  children,
}: {
  readonly bg: string;
  readonly btn: { readonly label: string; readonly cls: string; readonly onClick: () => void };
  readonly children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      {children}
      <motion.button
        {...fadeUp(2.4, 1)}
        onClick={btn.onClick}
        className={`cursor-pointer rounded-full border bg-transparent px-[18px] py-2 text-[12px] ${btn.cls}`}
      >
        {btn.label}
      </motion.button>
    </motion.div>
  );
}
