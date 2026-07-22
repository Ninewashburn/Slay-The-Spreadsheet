/**
 * L'art du jeu : Corporate Memphis fait main, en SVG inline.
 * Aplats de formes simples, membres élastiques, personnages sans visage
 * (le déadpan graphique : personne ne sourit, personne ne juge).
 * Palette = les tokens de la DA (globals.css), jamais de couleur hors charte.
 */

/** Le Recruteur. Sans visage : il vous étudie, vous ne lisez rien. */
export function RecruiterAvatar({ size = 64 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="var(--blue-soft)" />
      {/* torse : chemise bleue, épaules élastiques */}
      <path d="M12 64 Q12 42 32 42 Q52 42 52 64 Z" fill="var(--blue)" />
      {/* col */}
      <path d="M26 44 L32 52 L38 44 Z" fill="#FFFFFF" />
      {/* tête */}
      <circle cx="32" cy="26" r="12" fill="#F2C9A8" />
      {/* casque de cheveux */}
      <path d="M20 26 Q20 12 32 12 Q44 12 44 26 L44 22 Q40 18 32 18 Q24 18 20 22 Z" fill="#1C2333" />
      {/* badge visiteur, à l'envers évidemment */}
      <rect x="38" y="50" width="9" height="12" rx="2" fill="#FFFFFF" transform="rotate(8 42 56)" />
      <rect x="40" y="53" width="5" height="1.6" rx="0.8" fill="var(--line)" transform="rotate(8 42 56)" />
      <rect x="40" y="56" width="5" height="1.6" rx="0.8" fill="var(--line)" transform="rotate(8 42 56)" />
    </svg>
  );
}

/**
 * Le Ghosteur. Pas une silhouette : on ne sait pas ce que c'est.
 * Une machine ? Une personne ? Rien ? Un cercle qui n'est même pas sûr
 * d'exister, et un point d'interrogation. (Prêt pour la tâche 3 du slice.)
 */
export function GhosteurAvatar({ size = 64 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="var(--bg)"
        stroke="var(--line)"
        strokeWidth="2.5"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontSize="32"
        fontWeight="700"
        fill="var(--muted)"
        fontFamily='Georgia, "Times New Roman", serif'
        opacity="0.75"
      >
        ?
      </text>
    </svg>
  );
}

/** Plante de bureau. Obligatoire dans tout SaaS. */
export function OfficePlant({ width = 110 }: { readonly width?: number }) {
  return (
    <svg width={width} viewBox="0 0 110 140" aria-hidden>
      <g>
        <ellipse cx="55" cy="60" rx="9" ry="34" fill="var(--green)" transform="rotate(-24 55 60)" />
        <ellipse cx="55" cy="58" rx="9" ry="38" fill="#2E9E6D" opacity="0.75" transform="rotate(18 55 58)" />
        <ellipse cx="55" cy="52" rx="8" ry="40" fill="var(--green)" opacity="0.9" />
        <ellipse cx="42" cy="72" rx="7" ry="24" fill="#2E9E6D" opacity="0.55" transform="rotate(-40 42 72)" />
        <ellipse cx="68" cy="72" rx="7" ry="24" fill="#2E9E6D" opacity="0.55" transform="rotate(40 68 72)" />
      </g>
      <path d="M32 100 L78 100 L72 138 L38 138 Z" fill="var(--corail)" />
      <rect x="28" y="96" width="54" height="10" rx="5" fill="#E5764F" />
    </svg>
  );
}

/** Le café. Froid depuis 10 h 12. */
export function CoffeeMug({ width = 72 }: { readonly width?: number }) {
  return (
    <svg width={width} viewBox="0 0 72 72" aria-hidden>
      <path
        d="M14 30 Q14 26 18 26 L46 26 Q50 26 50 30 L48 56 Q48 62 42 62 L22 62 Q16 62 16 56 Z"
        fill="var(--gold)"
      />
      <path
        d="M50 32 Q62 32 62 41 Q62 50 49 50 L50 44 Q56 44 56 41 Q56 38 50 38 Z"
        fill="var(--gold)"
      />
      <ellipse cx="32" cy="28" rx="16" ry="3.4" fill="#B77E2B" />
      <path d="M26 20 Q23 15 26 10" stroke="var(--muted)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M36 20 Q39 15 36 9" stroke="var(--muted)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** Pictogramme d'une carte, par id de définition. Un aplat, un symbole. */
export function CardGlyph({ defId }: { readonly defId: string }) {
  switch (defId) {
    case 'entretien-positif':
      // bulle de parole : l'impression orale
      return (
        <Glyph bg="var(--blue-soft)">
          <path
            d="M7 9 Q7 7 9 7 L23 7 Q25 7 25 9 L25 17 Q25 19 23 19 L14 19 L10 23 L10 19 L9 19 Q7 19 7 17 Z"
            fill="var(--blue)"
          />
          <circle cx="12.5" cy="13" r="1.4" fill="#FFFFFF" />
          <circle cx="16" cy="13" r="1.4" fill="#FFFFFF" />
          <circle cx="19.5" cy="13" r="1.4" fill="#FFFFFF" />
        </Glyph>
      );
    case 'poste-correspond':
      // la cible : l'annonce écrite pour vous
      return (
        <Glyph bg="#FFEDE5">
          <circle cx="16" cy="16" r="9" fill="none" stroke="var(--corail)" strokeWidth="2.6" />
          <circle cx="16" cy="16" r="3.6" fill="var(--corail)" />
        </Glyph>
      );
    case 'candidature-envoyee':
      // l'avion en papier : transmis au service concerné
      return (
        <Glyph bg="var(--blue-soft)">
          <path d="M6 15 L26 8 L19 25 L15.5 17.5 Z" fill="var(--blue)" />
          <path d="M15.5 17.5 L26 8 L17 16.4 Z" fill="#2A4FB0" />
        </Glyph>
      );
    case 'mot-cle-exact':
      // l'étiquette : le mot qui passe le filtre
      return (
        <Glyph bg="var(--green-soft)">
          <path d="M7 10 Q7 8 9 8 L16 8 L25 17 Q26 18 25 19.5 L19.5 25 Q18 26 17 25 L8 16 Z" fill="var(--green)" />
          <circle cx="12" cy="13" r="2" fill="#FFFFFF" />
        </Glyph>
      );
    case 'relance-polie':
      // la flèche circulaire : courte, posée, à J+10
      return (
        <Glyph bg="var(--green-soft)">
          <path
            d="M16 7 A9 9 0 1 1 8.2 20.5"
            fill="none"
            stroke="var(--green)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path d="M4.5 17 L9.5 23 L12.5 16.5 Z" fill="var(--green)" />
        </Glyph>
      );
    case 'cv-optimise':
      // le document : des lignes recopiées de l'offre
      return (
        <Glyph bg="var(--blue-soft)">
          <rect x="9" y="6" width="14" height="20" rx="2" fill="#FFFFFF" stroke="var(--blue)" strokeWidth="1.6" />
          <rect x="12" y="10" width="8" height="1.8" rx="0.9" fill="var(--blue)" />
          <rect x="12" y="14" width="8" height="1.8" rx="0.9" fill="var(--blue)" />
          <rect x="12" y="18" width="5" height="1.8" rx="0.9" fill="var(--blue)" />
        </Glyph>
      );
    case 'profil-recherche':
      // la loupe sur le profil : « votre profil correspond »
      return (
        <Glyph bg="var(--blue-soft)">
          <circle cx="14" cy="14" r="6.5" fill="none" stroke="var(--blue)" strokeWidth="2.4" />
          <path d="M19 19 L25 25" stroke="var(--blue)" strokeWidth="2.6" strokeLinecap="round" />
        </Glyph>
      );
    case 'certification':
      // la rosette : coche une case, ajoute une ligne
      return (
        <Glyph bg="var(--blue-soft)">
          <circle cx="16" cy="13" r="7" fill="none" stroke="var(--blue)" strokeWidth="2.2" />
          <path d="M13 13.5 L15.2 15.8 L19.5 11" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 19 L11.5 25 L16 22.5 L20.5 25 L19 19 Z" fill="var(--blue)" />
        </Glyph>
      );
    case 'portfolio':
      // le dossier : rangé, présenté, jamais ouvert
      return (
        <Glyph bg="var(--blue-soft)">
          <path d="M6 10 Q6 8 8 8 L13 8 L15.5 10.5 L24 10.5 Q26 10.5 26 12.5 L26 22 Q26 24 24 24 L8 24 Q6 24 6 22 Z" fill="var(--blue)" />
          <rect x="9" y="13" width="14" height="8.5" rx="1.5" fill="#FFFFFF" opacity="0.85" />
        </Glyph>
      );
    case 'banniere-nebuleuse':
      // l'anneau vert « ouvert aux opportunités »
      return (
        <Glyph bg="var(--green-soft)">
          <circle cx="16" cy="16" r="9" fill="none" stroke="var(--green)" strokeWidth="2.6" />
          <circle cx="16" cy="16" r="4.5" fill="var(--green)" opacity="0.35" />
        </Glyph>
      );
    case 'mutuelle':
      // la croix : présentée comme un avantage, obligatoire par la loi
      return (
        <Glyph bg="var(--green-soft)">
          <path d="M13 7 L19 7 L19 13 L25 13 L25 19 L19 19 L19 25 L13 25 L13 19 L7 19 L7 13 L13 13 Z" fill="var(--green)" />
        </Glyph>
      );
    case 'babyfoot':
      // le ballon : la photo de couverture, personne n'y joue
      return (
        <Glyph bg="var(--green-soft)">
          <circle cx="16" cy="16" r="8.5" fill="#FFFFFF" stroke="var(--green)" strokeWidth="1.8" />
          <path d="M16 10.5 L19.5 13 L18 17 L14 17 L12.5 13 Z" fill="var(--green)" />
        </Glyph>
      );
    default:
      return (
        <Glyph bg="var(--bg)">
          <circle cx="16" cy="16" r="6" fill="var(--muted)" />
        </Glyph>
      );
  }
}

function Glyph({ bg, children }: { readonly bg: string; readonly children: React.ReactNode }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill={bg} />
      {children}
    </svg>
  );
}
