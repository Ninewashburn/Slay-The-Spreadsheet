import { motion } from 'framer-motion';
import { formatSalary } from '@/lib/engine';
import type { Offer } from '@/lib/engine';

interface Props {
  readonly offers: readonly Offer[];
  readonly step: number;
  readonly totalSteps: number;
  readonly carriedHope: number;
  readonly onPick: (offer: Offer) => void;
}

/**
 * Le job board : l'offre EST le niveau (Balatro). Ses « avantages » sont des
 * règles, et son red flag porte le modificateur. On la lit entre les lignes
 * AVANT de postuler (Papers Please : inspecter le document, chercher
 * l'incohérence). Le jeu ne souligne jamais le piège : il l'imprime.
 */
export default function JobBoard({ offers, step, totalSteps, carriedHope, onPick }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1100px] flex-col justify-center px-5 py-8">
      <header className="mb-6 text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          Offres du jour · étape {step + 1} / {totalSteps}
        </div>
        <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.02em] text-[var(--ink)] lg:text-[32px]">
          {offers.length > 1 ? 'Trois offres correspondent à votre profil.' : 'Une offre vous attend.'}
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--muted)]">
          Vous arrivez avec {Math.round(carriedHope)} d&apos;Espoir. Lisez avant de postuler.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {offers.map((offer, i) => (
          <motion.button
            key={offer.id}
            onClick={() => onPick(offer)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(28,35,51,0.14)' }}
            whileTap={{ y: -1, scale: 0.99 }}
            className="flex cursor-pointer flex-col rounded-[var(--radius)] border border-[var(--line)] bg-[var(--panel)] p-5 text-left shadow-[0_2px_8px_rgba(20,30,60,0.05)]"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Offre d&apos;emploi
            </div>
            <div className="mt-1.5 text-[16px] font-bold leading-tight text-[var(--ink)]">
              {offer.title}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--muted)]">{offer.contract}</div>

            <hr className="my-3 border-[var(--line)]" />

            <ul className="space-y-1 text-[12px] leading-relaxed text-[var(--ink)]">
              {offer.advantages.map((a) => (
                <li key={a}>{a}</li>
              ))}
              {/* Le red flag est imprimé comme un avantage. Au joueur de le lire. */}
              <li className="font-semibold">{offer.redFlag.label}.</li>
            </ul>

            <div className="flex-1" />

            <div className="mt-4 rounded-xl bg-[var(--bg)] px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                Rémunération
              </div>
              {/* Au centime près : la fausse précision EST la blague. */}
              <div className="font-mono text-[12px] font-bold text-[var(--ink)]">
                {formatSalary(offer.salaryLow)} à {formatSalary(offer.salaryHigh)}
              </div>
            </div>

            <div className="mt-3 rounded-full bg-[var(--blue)] px-3 py-2 text-center text-[12px] font-bold text-white">
              Postuler
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
