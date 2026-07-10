/**
 * colors.js — Palette de couleurs PneumoIA Admin
 *
 * Couleur brand : #009e82 (vert médical)
 * Toutes les pages/composants importent depuis ce fichier.
 * Ne JAMAIS écrire de couleurs hexadécimales en dur dans les pages.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BRAND — Vert médical #009e82
// ─────────────────────────────────────────────────────────────────────────────
export const brand = {
  DEFAULT: "#009e82",   // Couleur principale
  light:   "#e6f7f4",   // Fond subtil (badges, hover)
  lighter: "#ccefe9",   // Fond plus visible
  dark:    "#007a64",   // Hover / texte sur fond clair
  darker:  "#005c4b",   // Gradient profond / texte fort

  // Gradient pour bannières (WelcomeBanner, headers de modal)
  gradient: "linear-gradient(135deg, #005c4b 0%, #009e82 55%, #00c2a0 100%)",
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUTS — utilisés pour badges et indicateurs
// ─────────────────────────────────────────────────────────────────────────────
export const status = {
  success: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" }, // Validé / Actif
  warning: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" }, // En attente
  danger:  { bg: "#fef2f2", text: "#991b1b", border: "#fca5a5" }, // Refusé / Erreur
  info:    { bg: "#eff6ff", text: "#1d4ed8", border: "#93c5fd" }, // Info
  neutral: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" }, // Inconnu / Inactif
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACES — fonds et bordures (mode clair / sombre)
// ─────────────────────────────────────────────────────────────────────────────
export const surface = {
  light: {
    bg:        "#f9fafb",   // Fond général de page
    card:      "#ffffff",   // Cartes / tableaux
    border:    "#e5e7eb",   // Bordures
    borderSoft:"#f3f4f6",   // Bordures très subtiles
    hover:     "#f9fafb",   // Hover ligne tableau
  },
  dark: {
    bg:        "#0d1117",
    card:      "#161b22",
    border:    "#21262d",
    borderSoft:"#1c2128",
    hover:     "rgba(0,158,130,0.06)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXTE
// ─────────────────────────────────────────────────────────────────────────────
export const text = {
  light: {
    primary:   "#111827",   // Titres, texte fort
    secondary: "#374151",   // Texte normal
    muted:     "#6b7280",   // Texte secondaire
    subtle:    "#9ca3af",   // Texte très discret
  },
  dark: {
    primary:   "#f3f4f6",
    secondary: "#e6edf3",
    muted:     "#8b949e",
    subtle:    "#484f58",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — palette dédiée
// ─────────────────────────────────────────────────────────────────────────────
export const sidebar = {
  light: {
    bg:        "#ffffff",
    itemText:  "#374151",
    activeBg:  "rgba(0,158,130,0.10)",
    activeText:brand.dark,
    hoverBg:   "rgba(0,158,130,0.05)",
    sectionLbl:"#9ca3af",
    border:    "rgba(0,0,0,0.06)",
    accentBar: brand.DEFAULT,
  },
  dark: {
    bg:        "#0a1a18",
    itemText:  "rgba(255,255,255,0.72)",
    activeBg:  "rgba(0,158,130,0.18)",
    activeText:"#5eead4",
    hoverBg:   "rgba(255,255,255,0.09)",
    sectionLbl:"rgba(255,255,255,0.35)",
    border:    "rgba(255,255,255,0.08)",
    accentBar: "#5eead4",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Retourne la palette de surface selon le mode */
export const getSurface = (dark) => (dark ? surface.dark : surface.light);

/** Retourne la palette de texte selon le mode */
export const getText = (dark) => (dark ? text.dark : text.light);

/** Retourne la palette sidebar selon le mode */
export const getSidebar = (dark) => (dark ? sidebar.dark : sidebar.light);

export default { brand, status, surface, text, sidebar, getSurface, getText, getSidebar };
