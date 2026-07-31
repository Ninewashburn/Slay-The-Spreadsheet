import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { Blind, GameState } from '@/lib/engine';

const GEORGIA = 'Georgia, "Times New Roman", serif';

interface Props {
  readonly state: GameState;
  readonly blind: Blind;
  readonly isLastStep: boolean;
  readonly onContinue: () => void;
  readonly onHome: () => void;
  /** Une défaite mène au mail de refus : cet écran ne montre alors rien. */
  readonly refusalPending: boolean;
}

const fadeUp = (delay: number, duration = 1.4) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration, ease: 'easeOut' as const },
});

/**
 * Les sorties de combat. La typo caractérise le blind : monospace pour la
 * machine (ATS), Georgia pour le refus humain. Le Ghosteur perdu ne produit
 * AUCUN écran : le silence, puis le menu. Le contraste est la caractérisation.
 */
export default function EndScreens({
  state,
  blind,
  isLastStep,
  onContinue,
  onHome,
  refusalPending,
}: Props) {
  const silentLoss = state.status === 'lost' && blind.kind === 'silent-decay';

  useEffect(() => {
    if (!silentLoss) return;
    const t = setTimeout(onHome, 3200);
    return () => clearTimeout(t);
  }, [silentLoss, onHome]);

  if (state.status === 'playing') return null;

  // Le silence : un écran vide qui se retire seul, sans un mot.
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

  // La défaite parle par le mail de refus (RefusalMail), pas ici.
  if (state.status === 'lost' && refusalPending) return null;

  if (state.status === 'won') {
    const machine = blind.kind === 'word-trigger';
    return (
      <Overlay
        bg={isLastStep ? '#0B1710' : '#0B1220'}
        btn={{
          label: isLastStep ? 'terminer' : 'Continuer',
          cls: isLastStep ? 'border-[#2D4A3C] text-[#7FA893]' : 'border-[#2A3A5C] text-[#9DB4E0]',
          onClick: onContinue,
        }}
      >
        <motion.h1
          {...fadeUp(1.1)}
          className={`m-0 mb-3 max-w-[420px] whitespace-pre-line px-5 text-center text-[22px] font-bold leading-[1.4] ${
            isLastStep ? 'text-[#6EE7B7]' : 'text-[#9DB4E0]'
          } ${machine ? 'font-mono tracking-[0.02em]' : ''}`}
          style={machine ? undefined : { fontFamily: GEORGIA }}
        >
          {blind.victoryLine}
        </motion.h1>
        <motion.p
          {...fadeUp(1.6)}
          className={`m-0 mb-7 max-w-[320px] text-center text-[13px] leading-[1.6] ${
            isLastStep ? 'text-[#5F8272]' : 'text-[#5A6B88]'
          }`}
        >
          Vous conservez {Math.round(state.hope)} d&apos;Espoir.
          {!isLastStep && ' Le processus continue.'}
        </motion.p>
      </Overlay>
    );
  }

  // Passif : gris plat, sans-serif, sans solennité. Le vide ne mérite pas
  // une belle typo. Ni puni ni récompensé : constaté.
  if (state.status === 'passive') {
    return (
      <Overlay
        bg="#E9EBEE"
        btn={{ label: 'recommencer', cls: 'border-[#C6CBD4] text-[#9AA1AD]', onClick: onHome }}
      >
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

  return null;
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
