import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { CardDef } from '@/lib/engine';
import type { CardPreview } from '@/lib/ui/preview';
import { CardGlyph } from './art';

interface Props {
  readonly def: CardDef;
  readonly preview: CardPreview;
  /** Grisée par le manque d'Énergie ou par l'ATS. */
  readonly disabled: boolean;
  /** Bloquée par l'ATS : injouable par nature (mot exact absent), pas juste en attente d'Énergie. */
  readonly blocked: boolean;
  /** Le mot que l'ATS exige, affiché sur la carte bloquée. */
  readonly requiredKeyword?: string;
  readonly onPlay: () => void;
  readonly isPointInDropZone: (x: number, y: number) => boolean;
  readonly onDragChange: (dragging: boolean) => void;
}

/**
 * Une carte-objet : elle se soulève au survol, s'incline quand on la saisit, se
 * GLISSE sur le compteur pour être jouée. Le clic reste possible. L'aperçu est la
 * règle d'information : « 16 → 32 », pastille verte pleine au franchissement du
 * seuil. Bloquée par l'ATS, elle est grisée, barrée d'un cadenas, et dit le mot
 * qui lui manque — pas affaiblie, injouable.
 */
export default function HandCard({
  def,
  preview,
  disabled,
  blocked,
  requiredKeyword,
  onPlay,
  isPointInDropZone,
  onDragChange,
}: Props) {
  const justDragged = useRef(false);
  const draggable = !disabled && !blocked;

  const pill = preview.goal
    ? 'bg-[var(--green)] text-white'
    : preview.tone === 'neutral'
      ? 'bg-[var(--green-soft)] text-[var(--green)]'
      : 'bg-[var(--blue-soft)] text-[var(--blue)]';

  return (
    <motion.button
      layout
      drag={draggable}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragStart={() => {
        justDragged.current = true;
        onDragChange(true);
      }}
      onDragEnd={(_e, info) => {
        onDragChange(false);
        setTimeout(() => {
          justDragged.current = false;
        }, 0);
        if (isPointInDropZone(info.point.x, info.point.y)) onPlay();
      }}
      onClick={() => {
        if (!justDragged.current && draggable) onPlay();
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: blocked ? 0.5 : disabled ? 0.35 : 1, y: 0 }}
      whileHover={draggable ? { y: -6, boxShadow: '0 14px 30px rgba(61,107,224,0.18)' } : undefined}
      whileDrag={{
        scale: 1.07,
        rotate: -3,
        zIndex: 40,
        boxShadow: '0 24px 50px rgba(28,35,51,0.25)',
        cursor: 'grabbing',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      disabled={disabled || blocked}
      className={`relative flex min-h-[168px] flex-col rounded-[var(--radius)] border bg-[var(--panel)] p-3 text-left shadow-[0_2px_6px_rgba(20,30,60,0.06)] disabled:cursor-default lg:min-h-[200px] lg:p-4 ${
        blocked ? 'border-dashed border-[var(--line)] grayscale' : 'border-[var(--line)]'
      } ${draggable ? 'cursor-grab touch-none' : ''}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <CardGlyph defId={def.id} />
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9D8F7] bg-[var(--blue-soft)] text-[12px] font-bold text-[var(--blue)]">
          {def.cost}
        </div>
      </div>

      <div className="text-[13px] font-bold leading-[1.25] text-[var(--ink)] lg:text-[15px]">
        {def.name}
      </div>

      {def.flavor && (
        <div className="mt-1.5 line-clamp-3 text-[10.5px] leading-[1.45] text-[var(--muted)] lg:text-[12px]">
          {def.flavor}
        </div>
      )}

      <div className="flex-1" />

      {blocked ? (
        <div className="mt-2 self-start rounded-full bg-[var(--bg)] px-2 py-[3px] text-[10.5px] font-bold text-[var(--muted)]">
          🔒 exige « {requiredKeyword} »
        </div>
      ) : (
        preview.text !== '' && (
          <div
            className={`mt-2 self-start rounded-full px-2 py-[3px] text-[11px] font-bold tabular-nums lg:px-2.5 lg:text-[12.5px] ${pill}`}
          >
            {preview.text}
          </div>
        )
      )}
    </motion.button>
  );
}
