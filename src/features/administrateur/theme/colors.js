/**
 * colors.js — Palette de couleurs PneumoIA Admin
 *
 * Couleur brand : #1e40af (bleu foncé royal)
 * Toutes les pages/composants importent depuis ce fichier.
 * Ne JAMAIS écrire de couleurs hexadécimales en dur dans les pages.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BRAND — Bleu foncé royal
// ─────────────────────────────────────────────────────────────────────────────
export const brand = {
  DEFAULT: "#1e40af",   // Couleur principale
  light:   "#eff6ff",   // Fond subtil (badges, hover)
  lighter: "#dbeafe",   // Fond plus visible
  dark:    "#1e3a8a",   // Hover / texte sur fond clair
  darker:  "#172554",   // Gradient profond / texte fort

  // Gradient pour bannières (WelcomeBanner, headers de modal)
  gradient: "linear-gradient(135deg, #172554 0%, #1e40af 55%, #2563eb 100%)",
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
    bg:        "#f8faff",   // Fond général de page (légère teinte bleue)
    card:      "#ffffff",   // Cartes / tableaux
    border:    "#e2e8f0",   // Bordures
    borderSoft:"#f1f5f9",   // Bordures très subtiles
    hover:     "#f8faff",   // Hover ligne tableau
  },
  dark: {
    bg:        "#0b0f1a",
    card:      "#111827",
    border:    "#1f2937",
    borderSoft:"#161d2c",
    hover:     "rgba(30,64,175,0.06)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXTE
// ─────────────────────────────────────────────────────────────────────────────
export const text = {
  light: {
    primary:   "#0f172a",   // Titres, texte fort
    secondary: "#1e293b",   // Texte normal
    muted:     "#64748b",   // Texte secondaire
    subtle:    "#94a3b8",   // Texte très discret
  },
  dark: {
    primary:   "#f1f5f9",
    secondary: "#e2e8f0",
    muted:     "#94a3b8",
    subtle:    "#475569",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR — palette dédiée
// ─────────────────────────────────────────────────────────────────────────────
export const sidebar = {
  light: {
    bg:        "#ffffff",
    itemText:  "#374151",
    activeBg:  "rgba(30,64,175,0.08)",
    activeText:brand.dark,
    hoverBg:   "rgba(30,64,175,0.04)",
    sectionLbl:"#94a3b8",
    border:    "rgba(0,0,0,0.06)",
    accentBar: brand.DEFAULT,
  },
  dark: {
    bg:        "#0a0f1e",
    itemText:  "rgba(255,255,255,0.72)",
    activeBg:  "rgba(59,130,246,0.15)",
    activeText:"#93c5fd",
    hoverBg:   "rgba(255,255,255,0.07)",
    sectionLbl:"rgba(255,255,255,0.35)",
    border:    "rgba(255,255,255,0.08)",
    accentBar: "#60a5fa",
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
