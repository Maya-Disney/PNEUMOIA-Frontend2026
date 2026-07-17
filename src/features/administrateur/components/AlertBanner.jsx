import React, { useState } from "react";

export default function AlerteBanner({ darkMode }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm mb-4 ${
      darkMode
        ?"bg-orange-900/20 border-orange-700/40 text-orange-300"
        : "bg-orange-50 border-orange-200 text-orange-700"
    }`}>
      <div className="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-orange-500">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>
          <strong>4 demandes d'inscription</strong> en attente de validation â€”{" "}
          <button className="underline underline-offset-2 hover:no-underline font-semibold">
            Traiter maintenant â†’
          </button>
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
