import { useState, useEffect } from "react";
import { brand, status, getSurface, getText } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// CARD — enveloppe complète (filtre + table + pagination)
// ─────────────────────────────────────────────────────────────────────────────
export function TableCard({ dark, children, className = "" }) {
  const surface = getSurface(dark);
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{ background: surface.card, borderColor: surface.border, boxShadow: dark ? "none" : "0 2px 8px rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTAINER — enveloppe de <table> uniquement (sans card)
// ─────────────────────────────────────────────────────────────────────────────
export function TableContainer({ dark, children, className = "", fixed = false }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className={`w-full border-collapse ${fixed ? "table-fixed min-w-215" : "min-w-160"}`}>
        {children}
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EN-TÊTE — 14px, semibold, sans uppercase
// ─────────────────────────────────────────────────────────────────────────────
export function Th({ dark, children, center, onClick, style }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <th
      onClick={onClick}
      style={{ color: txt.subtle, borderColor: surface.border, background: dark ? surface.card : surface.bg, ...style }}
      className={`px-4 py-3 text-left text-[14px] font-semibold border-b select-none whitespace-nowrap ${onClick ? "cursor-pointer hover:opacity-75" : ""} ${center ? "text-center" : ""}`}
    >
      {children}
    </th>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGNE — hover subtil
// ─────────────────────────────────────────────────────────────────────────────
export function Tr({ dark, children }) {
  return (
    <tr className={`transition-colors last:border-0 ${dark ? "hover:bg-[rgba(0,158,130,0.06)]" : "hover:bg-gray-50/70"}`}>
      {children}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CELLULE — 14px par défaut, padding aéré
// ─────────────────────────────────────────────────────────────────────────────
export function Td({ dark, children, center }) {
  const surface = getSurface(dark);
  return (
    <td className={`px-4 py-3 border-b text-[14px] ${center ? "text-center" : ""}`} style={{ borderColor: surface.borderSoft }}>
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CELLULE VIDE
// ─────────────────────────────────────────────────────────────────────────────
export function EmptyCell({ dark, colSpan, children }) {
  const txt = getText(dark);
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-14 text-[14px]" style={{ color: txt.subtle }}>
        {children}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CELLULE PERSONNE — avatar + nom + sous-titre
// ─────────────────────────────────────────────────────────────────────────────
export function PersonCell({ dark, avatarColor, initials, name, subtitle, onClick, photoUrl }) {
  const txt = getText(dark);
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [photoUrl]);
  const showImg = photoUrl && !imgError;
  return (
    <div className="flex items-center gap-3">
      {showImg ? (
        <img
          src={photoUrl}
          alt={name}
          className={`w-9 h-9 rounded-full object-cover shrink-0 border ${dark ? "border-[#30363d]" : "border-gray-200"} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={onClick}
          onError={() => setImgError(true)}
        />
      ) : null}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
        style={{ background: avatarColor || brand.DEFAULT, display: showImg ? "none" : "flex" }}
        onClick={onClick}
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p
          className={`text-[14px] font-semibold leading-tight truncate ${onClick ? "cursor-pointer hover:underline underline-offset-2" : ""}`}
          style={{ color: txt.primary }}
          onClick={onClick}
        >
          {name}
        </p>
        {subtitle && (
          <p className="text-[12px] mt-0.5 truncate" style={{ color: txt.subtle }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTES — variantes courantes dans les cellules
// ─────────────────────────────────────────────────────────────────────────────

export function MutedText({ dark, children, mono }) {
  const txt = getText(dark);
  return <span className={`text-[14px] ${mono ? "font-mono" : ""}`} style={{ color: txt.secondary }}>{children}</span>;
}

export function SubtleText({ dark, children }) {
  const txt = getText(dark);
  return <span className="text-[14px]" style={{ color: txt.subtle }}>{children}</span>;
}

export function StatusText({ children, color }) {
  const map = {
    success: brand.dark,
    warning: "#b45309",
    danger:  "#dc2626",
    info:    "#1d4ed8",
    brand:   brand.DEFAULT,
  };
  return <span className="text-[14px] font-semibold whitespace-nowrap" style={{ color: map[color] || map.brand }}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOUTON D'ACTION — outline
// ─────────────────────────────────────────────────────────────────────────────
export function TableActionButton({ dark, children, onClick, variant = "default" }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);

  const variants = {
    default: { border: surface.border, color: txt.secondary, bg: "transparent" },
    brand:   { border: "#bbf7d0", color: brand.dark, bg: dark ? "rgba(0,158,130,0.10)" : "#f0fdf4" },
    success: { border: "#bbf7d0", color: brand.dark, bg: dark ? "rgba(0,158,130,0.10)" : "#f0fdf4" },
    danger:  { border: "#fca5a5", color: "#dc2626",  bg: dark ? "rgba(220,38,38,0.10)" : "#fef2f2" },
  };
  const v = variants[variant] || variants.default;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-colors whitespace-nowrap"
      style={{ borderColor: v.border, color: v.color, background: v.bg }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
export function PaginationBar({ dark, children }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[13px]"
      style={{ borderColor: surface.borderSoft, color: txt.subtle }}>
      {children}
    </div>
  );
}

export function PaginationSelect({ dark, value, onChange, options = [5,10,20,50] }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  return (
    <select value={value} onChange={onChange}
      className="text-[13px] px-2 py-1 rounded-lg border outline-none cursor-pointer"
      style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}>
      {options.map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  );
}

export function PaginationButton({ dark, onClick, disabled, active, children }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);

  if (active) {
    return (
      <button onClick={onClick}
        className="w-7 h-7 rounded-lg text-[13px] font-bold text-white"
        style={{ background: brand.DEFAULT }}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg border text-[13px] transition-colors"
      style={{
        borderColor: surface.border,
        color: disabled ? (dark ? "#30363d" : "#d1d5db") : txt.secondary,
        cursor: disabled ? "not-allowed" : "pointer",
        background: "transparent",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = surface.bg; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );
}

export default {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, TableActionButton,
  PaginationBar, PaginationSelect, PaginationButton,
};
