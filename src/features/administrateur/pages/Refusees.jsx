import { useState } from "react";
import { useOutletContext } from "react-router-dom";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);
const pad = (n) => String(n).padStart(2, "0");
const MOIS = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function formatDate(d) {
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

const MOCK = [
  {
    id: 1,
    initiales: "TJ",
    nom: "Dr. Tabi Jonas",
    specialite: "Pneumologue",
    cnom: "CM-2024-9999",
    etablissement: "Clinique Alpha, Yaoundé",
    dateDemande: sub(5 * 24 * 3600 * 1000),
    dateRefus: sub(4 * 24 * 3600 * 1000),
    motif: "N° CNOM invalide",
    refusePar: "Super Admin",
  },
];

function ModalSuppression({ row, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d]">
          <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">Supprimer définitivement</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#484f58] hover:bg-gray-100 dark:hover:bg-[#21262d]">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Supprimer définitivement le dossier de <strong className="mx-1">{row.nom}</strong> de la base de données ? Cette action est irréversible.
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d] px-4 py-3 flex flex-col gap-1.5">
            {[
              { l: "Médecin",   v: row.nom },
              { l: "CNOM",      v: row.cnom },
              { l: "Motif",     v: row.motif },
              { l: "Refusé le", v: formatDate(row.dateRefus) },
            ].map(({ l, v }) => (
              <div key={l} className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 dark:text-[#484f58]">{l}</span>
                <span className="text-[10px] font-medium text-gray-700 dark:text-[#8b949e]">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 dark:border-[#21262d]">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-[12px] font-semibold border border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-1.5">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Refusees() {
  useOutletContext();

  const [rows, setRows]     = useState(MOCK);
  const [target, setTarget] = useState(null);
  const [toast, setToast]   = useState(null);

  function handleSupprimer() {
    // ── Remplacer par fetch quand API prête ──
    // await fetch(`/api/admin/demandes/${target.id}`, { method: "DELETE" })
    setRows(prev => prev.filter(r => r.id !== target.id));
    setToast(`Dossier de ${target.nom} supprimé définitivement`);
    setTarget(null);
    setTimeout(() => setToast(null), 3500);
  }

  const th = "px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58]";
  const td = "px-4 py-3.5 border-b border-gray-50 dark:border-[#21262d]";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
          Inscriptions refusées
        </h1>
        <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
          {rows.length} dossier{rows.length > 1 ? "s" : ""} refusé{rows.length > 1 ? "s" : ""} — motifs détaillés ci-dessous
        </p>
      </div>

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Date demande</th>
                <th className={th}>Date refus</th>
                <th className={th}>Motif</th>
                <th className={th}>Refusé par</th>
                <th className={`${th} text-center`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun dossier refusé</td></tr>
                : rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e]">
                          {row.initiales}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">{row.nom}</p>
                          <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{row.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono text-gray-400 dark:text-[#484f58]`}>{row.cnom}</td>
                    <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{row.etablissement}</td>
                    <td className={`${td} text-[11px] text-gray-400 dark:text-[#484f58]`}>{formatDate(row.dateDemande)}</td>
                    <td className={`${td} text-[11px] font-semibold text-red-500 dark:text-red-400`}>{formatDate(row.dateRefus)}</td>
                    <td className={td}>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/40 whitespace-nowrap">
                        {row.motif}
                      </span>
                    </td>
                    <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{row.refusePar}</td>
                    <td className={`${td} text-center`}>
                      <button onClick={() => setTarget(row)}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-[11px] font-bold rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 dark:border-[#21262d] text-[11px] text-gray-300 dark:text-[#484f58]">
            {rows.length} dossier{rows.length > 1 ? "s" : ""} refusé{rows.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {target && (
        <ModalSuppression
          row={target}
          onClose={() => setTarget(null)}
          onConfirm={handleSupprimer}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white bg-red-600">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}