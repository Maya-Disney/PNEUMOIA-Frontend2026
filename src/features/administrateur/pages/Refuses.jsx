import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Trash2, X } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmt(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }

const MOCK = [
  { id:1, initials:"DT", nom:"Dr. Tabi Jonas",   specialite:"Pneumologue",       cnom:"CM-2024-9999", hopital:"Clinique Alpha, Yaoundé",  dateDemande:fmt(sub(5*24*3600000)), dateRefus:fmt(sub(4*24*3600000)), motif:"N° CNOM invalide",       refusePar:"Super Admin" },
  { id:2, initials:"BM", nom:"Dr. Bella Martin",  specialite:"Médecine générale", cnom:"CM-2023-0411", hopital:"Cabinet privé, Douala",    dateDemande:fmt(sub(9*24*3600000)), dateRefus:fmt(sub(8*24*3600000)), motif:"Spécialité non couverte", refusePar:"Super Admin" },
  { id:3, initials:"NK", nom:"Dr. Nguele Kali",   specialite:"Pneumologue",       cnom:"CM-2021-0887", hopital:"CHU Garoua",               dateDemande:fmt(sub(14*24*3600000)),dateRefus:fmt(sub(12*24*3600000)),motif:"Attestation expirée",      refusePar:"Super Admin" },
];

export default function Refusees() {
  const { dark } = useOutletContext() || {};
  const [rows,   setRows]   = useState(MOCK);
  const [target, setTarget] = useState(null);
  const [toast,  setToast]  = useState(null);

  function supprimer() {
    setRows(p => p.filter(r => r.id !== target.id));
    setToast(`Dossier de ${target.nom} supprimé`);
    setTarget(null);
    setTimeout(() => setToast(null), 3000);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((r, i) => ({
      "#": i+1, Nom: r.nom, CNOM: r.cnom, Spécialité: r.specialite,
      Établissement: r.hopital, "Date demande": r.dateDemande,
      "Date refus": r.dateRefus, Motif: r.motif, "Refusé par": r.refusePar,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Refusées");
    XLSX.writeFile(wb, `refusees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark ? "text-[#484f58] border-[#21262d] bg-[#0d1117]/50" : "text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark ? "border-[#21262d]" : "border-gray-50"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Inscriptions refusées
          </h1>
          <p className={`text-[12px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {rows.length} dossier{rows.length > 1 ? "s" : ""} refusé{rows.length > 1 ? "s" : ""} — motifs détaillés ci-dessous
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = BRAND; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}>
          <Download size={13} /> Export Excel
        </button>
      </div>

      {/* Tableau */}
      <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 780 }}>
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Établissement</th>
                <th className={th}>Date demande</th>
                <th className={th}>Date refus</th>
                <th className={th}>Motif du refus</th>
                <th className={th}>Refusé par</th>
                <th className={`${th} text-center`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun dossier refusé</td></tr>
                : rows.map(r => (
                  <tr key={r.id} className={`transition-colors ${dark ? "hover:bg-[#0d1117]/60" : "hover:bg-gray-50/80"}`}>
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-600"}`}>
                          {r.initials}
                        </div>
                        <div>
                          <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{r.nom}</p>
                          <p className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{r.specialite}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-[11px] font-mono ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{r.cnom}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{r.hopital}</td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{r.dateDemande}</td>
                    <td className={`${td} text-[11px] font-semibold text-red-500 dark:text-red-400`}>{r.dateRefus}</td>
                    <td className={td}>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/40 whitespace-nowrap">
                        {r.motif}
                      </span>
                    </td>
                    <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{r.refusePar}</td>
                    <td className={`${td} text-center`}>
                      <button onClick={() => setTarget(r)}
                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-[11px] font-bold rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                        <Trash2 size={11} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {rows.length > 0 && (
          <div className={`px-4 py-3 border-t text-[11px] ${dark ? "border-[#21262d] text-[#484f58]" : "border-gray-50 text-gray-300"}`}>
            {rows.length} dossier{rows.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Modal suppression */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setTarget(null)}>
          <div className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>Supprimer définitivement</p>
              <button onClick={() => setTarget(null)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
                <X size={13} />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span>Supprimer définitivement le dossier de <strong>{target.nom}</strong> ? Cette action est irréversible.</span>
                </div>
                <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                  {[
                    { l: "Médecin",       v: target.nom },
                    { l: "CNOM",          v: target.cnom },
                    { l: "Motif",         v: target.motif },
                    { l: "Refusé le",     v: target.dateRefus },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#21262d] last:border-0">
                      <span className={`${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</span>
                      <span className={`font-semibold ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex gap-2 px-5 py-4 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <button onClick={() => setTarget(null)}
                className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Annuler
              </button>
              <button onClick={supprimer}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-1.5">
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white bg-red-600">
          <Trash2 size={13} /> {toast}
        </div>
      )}
    </div>
  );
}