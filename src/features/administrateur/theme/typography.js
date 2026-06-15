/**
 * typography.js — Échelle typographique PneumoIA Admin
 *
 * Police : Inter (chargée dans admin.css)
 * Toutes les tailles de texte utilisées dans l'admin sont définies ici.
 * Les pages importent ces classes plutôt que d'écrire text-[Npx] en dur.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FAMILLE DE POLICE
// ─────────────────────────────────────────────────────────────────────────────
export const fontFamily = "'Inter', system-ui, -apple-system, sans-serif";

// ─────────────────────────────────────────────────────────────────────────────
// ÉCHELLE DE TAILLES — classes Tailwind prêtes à l'emploi
// ─────────────────────────────────────────────────────────────────────────────
export const fontSize = {
  // Titres de page
  h1:        "text-2xl md:text-3xl font-black tracking-tight",   // 24-30px
  h2:        "text-xl font-bold tracking-tight",                   // 20px
  h3:        "text-lg font-bold",                                  // 18px

  // Corps de texte
  body:      "text-[15px]",          // Texte principal — tableaux, listes
  bodyBold:  "text-[15px] font-bold",
  bodyMed:   "text-[15px] font-medium",

  // Texte secondaire
  caption:   "text-[13px]",          // Sous-textes, métadonnées
  captionBold: "text-[13px] font-semibold",

  // Petits éléments
  small:     "text-[12px]",          // Badges, labels compacts
  smallBold: "text-[12px] font-bold",

  // Labels de formulaire
  label:     "text-[13px] font-semibold",

  // En-têtes de tableau
  th:        "text-[13px] font-semibold",

  // Très petit (rarement utilisé)
  tiny:      "text-[11px]",
};

// ─────────────────────────────────────────────────────────────────────────────
// POIDS
// ─────────────────────────────────────────────────────────────────────────────
export const fontWeight = {
  normal:   "font-normal",
  medium:   "font-medium",
  semibold: "font-semibold",
  bold:     "font-bold",
  black:    "font-black",
};

// ─────────────────────────────────────────────────────────────────────────────
// ESPACEMENT / LETTRES
// ─────────────────────────────────────────────────────────────────────────────
export const tracking = {
  tight:  "tracking-tight",
  normal: "tracking-normal",
  wide:   "tracking-wide",
  wider:  "tracking-wider",
};

export default { fontFamily, fontSize, fontWeight, tracking };