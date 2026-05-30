import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

const MOCKS = [
  {
    id: 1,
    initials: "AS",
    name: "Dr. Aminata Sow",
    specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala",
    ville: "Douala",
    email: "a.sow@laquintinie.cm",
    telephone: "+237 677 111 222",
    cnom: "CM-2024-1122",
    submittedAt: sub(47 * 60 * 1000),
    status: "pending",
    avatarBg: "#1D9E75",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
  {
    id: 2,
    initials: "PE",
    name: "Dr. Paul Essomba",
    specialite: "Pneumologue",
    hopital: "CHU de Yaoundé",
    ville: "Yaoundé",
    email: "p.essomba@chuyde.cm",
    telephone: "+237 699 333 444",
    cnom: "CM-2023-0988",
    submittedAt: sub(18 * 3600 * 1000),
    status: "pending",
    avatarBg: "#185FA5",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "missing"  },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "pending"  },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
];

const pad   = (n) => String(n).padStart(2, "0");
const MOIS  = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const JOURS = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function elapsed(d) {
  const dm = Math.floor((Date.now() - d.getTime()) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h${pad(dm % 60)}`;
  return `Il y a ${dd}j ${dh % 24}h`;
}
function docState(doc) {
  if (doc.documents.some(d => d.status === "missing")) return "miss";
  if (doc.documents.some(d => d.status === "pending")) return "wait";
  return "ok";
}

const DOC_BADGE = {
  ok:   { label: "Dossier complet", cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700/40" },
  wait: { label: "Docs en attente", cls: "bg-amber-50   dark:bg-amber-900/20   text-amber-700   dark:text-amber-400   border-amber-200   dark:border-amber-700/40"   },
  miss: { label: "Docs manquants",  cls: "bg-red-50     dark:bg-red-900/20     text-red-600     dark:text-red-400     border-red-200     dark:border-red-700/40"     },
};

function PagBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d] disabled:opacity-30 disabled:cursor-not-allowed">
      {label}
    </button>
  );
}

export default function NouvellesDemandes() {
  const { dark } = useOutletContext();

  const [demandes, setDemandes]       = useState(MOCKS);
  const [search, setSearch]           = useState("");
  const [sortField, setSortField]     = useState("submittedAt");
  const [sortDir, setSortDir]         = useState("desc");
  const [page, setPage]               = useState(1);
  const [perPage, setPerPage]         = useState(10);
  const [clock, setClock]             = useState(new Date());
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [refusDoc, setRefusDoc]       = useState(null);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pending = useMemo(() => demandes.filter(d => d.status === "pending"), [demandes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...pending]
      .filter(d => !q || d.name.toLowerCase().includes(q) || d.email.includes(q) || d.cnom.toLowerCase().includes(q))
      .sort((a, b) => {
        let va = a[sortField], vb = b[sortField];
        if (sortField === "name") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
        return sortDir === "asc" ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
      });
  }, [pending, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, filtered.length);

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1 text-green-500">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function handleAction(id, action, motif = "") {
    // ── Remplacer par fetch quand API prête ──
    // await fetch(`/api/admin/demandes/${id}/${action}`, { method: "POST", ... })
    setDemandes(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
    setSelectedDossier(null);
    setRefusDoc(null);
  }

  function exportExcel() {
    const rows = pending.map((d, i) => ({
      "#":               i + 1,
      "Nom":             d.name,
      "CNOM":            d.cnom,
      "Spécialité":      d.specialite,
      "Établissement":   d.hopital,
      "Ville":           d.ville,
      "Email":           d.email,
      "Téléphone":       d.telephone,
      "Statut dossier":  DOC_BADGE[docState(d)].label,
      "Soumis le":       formatFull(d.submittedAt),
      "En attente":      elapsed(d.submittedAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Demandes");
    XLSX.writeFile(wb, `nouvelles_demandes_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b text-gray-400 dark:text-[#484f58] border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] select-none";
  const td = "px-4 py-3 text-sm border-b border-gray-50 dark:border-[#21262d]";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
            Nouvelles demandes
          </h1>
          <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
            Validation manuelle obligatoire · chaque dossier est vérifié avant activation
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] tabular-nums text-gray-300 dark:text-[#484f58]">
            {JOURS[clock.getDay()]} {clock.getDate()} {MOIS[clock.getMonth()]} {clock.getFullYear()}
            &nbsp;{pad(clock.getHours())}:{pad(clock.getMinutes())}:{pad(clock.getSeconds())}
          </span>
          <button onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-green-600 hover:border-green-600 hover:text-white dark:hover:bg-green-700 dark:hover:border-green-700">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Excel
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 dark:border-[#21262d]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Demandes en attente</span>
            <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, email, CNOM…"
            className="w-64 text-[12px] px-3 py-1.5 rounded-lg border outline-none bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#21262d] text-gray-800 dark:text-[#e6edf3] placeholder-gray-300 dark:placeholder-[#484f58] focus:border-green-500 dark:focus:border-[#22c55e]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={`${th} w-10 text-center`}>#</th>
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("name")}>Médecin <SortIcon field="name" /></th>
                <th className={th}>Contact</th>
                <th className={th}>Spécialité</th>
                <th className={th}>Dossier</th>
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("submittedAt")}>Soumis <SortIcon field="submittedAt" /></th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>
                    Aucune demande en attente
                  </td>
                </tr>
              ) : paginated.map((doc, i) => {
                const ds  = docState(doc);
                const num = (page - 1) * perPage + i + 1;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                    <td className={`${td} text-center text-[11px] text-gray-300 dark:text-[#484f58]`}>{num}</td>

                    <td className={td}>
                      <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setSelectedDossier(doc)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: doc.avatarBg }}>
                          {doc.initials}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3] group-hover:underline underline-offset-2">{doc.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{doc.hopital}</p>
                        </div>
                      </div>
                    </td>

                    <td className={td}>
                      <p className="text-[12px] text-gray-700 dark:text-[#8b949e]">{doc.email}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{doc.telephone}</p>
                    </td>

                    <td className={td}>
                      <p className="text-[12px] text-gray-700 dark:text-[#8b949e]">{doc.specialite}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58]">CNOM {doc.cnom}</p>
                    </td>

                    <td className={td}>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${DOC_BADGE[ds].cls}`}>
                        {DOC_BADGE[ds].label}
                      </span>
                    </td>

                    <td className={td}>
                      <p className="text-[12px] text-gray-700 dark:text-[#8b949e]">{formatFull(doc.submittedAt)}</p>
                      <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{elapsed(doc.submittedAt)}</p>
                    </td>

                    <td className={`${td} text-center`}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setSelectedDossier(doc)} title="Voir le dossier"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#21262d] text-gray-400 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>

                        {ds === "ok" && (
                          <button onClick={() => handleAction(doc.id, "validated")} title="Valider"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-green-200 dark:border-green-700/40 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </button>
                        )}

                        {ds !== "ok" && (
                          <button title="Relancer par email"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-blue-200 dark:border-blue-700/40 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                            </svg>
                          </button>
                        )}

                        <button onClick={() => setRefusDoc(doc)} title="Refuser"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-[#21262d]">
          <span className="text-[11px] text-gray-400 dark:text-[#484f58]">
            {from} – {to} sur {filtered.length} demande{filtered.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-[#484f58]">
            <span>Lignes</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-[#21262d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-[#8b949e] outline-none text-[11px] cursor-pointer">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage(1)}                          disabled={page === 1}          label="«" />
            <PagBtn onClick={() => setPage(p => Math.max(1, p-1))}     disabled={page === 1}          label="‹" />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx-1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => typeof p === "string"
                ? <span key={i} className="px-1 text-[11px] text-gray-300 dark:text-[#484f58]">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg border text-[11px] font-semibold transition-colors
                      ${p === page
                        ? "bg-green-600 dark:bg-green-700 border-green-600 dark:border-green-700 text-white"
                        : "border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]"
                      }`}>{p}</button>
              )}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} label="›" />
            <PagBtn onClick={() => setPage(totalPages)}                 disabled={page === totalPages} label="»" />
          </div>
        </div>
      </div>

      {/* Modal dossier */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setSelectedDossier(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: selectedDossier.avatarBg }}>{selectedDossier.initials}</div>
                <div>
                  <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">{selectedDossier.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{selectedDossier.hopital}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDossier(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#484f58] hover:bg-gray-100 dark:hover:bg-[#21262d]">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-2">
              {selectedDossier.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-[#21262d] last:border-0">
                  <span className="text-[11px] text-gray-600 dark:text-[#8b949e]">{doc.label}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full
                    ${doc.status === "verified" ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : doc.status === "pending"  ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                    {doc.status === "verified" ? "Vérifié" : doc.status === "pending" ? "En attente" : "Manquant"}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-5 py-3 border-t border-gray-100 dark:border-[#21262d]">
              {docState(selectedDossier) === "ok" && (
                <button onClick={() => handleAction(selectedDossier.id, "validated")}
                  className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-green-600 hover:bg-green-700 text-white transition-colors">
                  Valider le compte
                </button>
              )}
              <button onClick={() => { setRefusDoc(selectedDossier); setSelectedDossier(null); }}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold border border-red-200 dark:border-red-700/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal refus */}
      {refusDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setRefusDoc(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl p-5">
            <p className="text-[14px] font-bold text-gray-800 dark:text-[#e6edf3] mb-1">Refuser la demande</p>
            <p className="text-[11px] text-gray-400 dark:text-[#484f58] mb-4">{refusDoc.name}</p>
            <textarea rows={3} placeholder="Motif du refus…"
              id="motif-refus"
              className="w-full text-[12px] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#21262d] bg-gray-50 dark:bg-[#0d1117] text-gray-800 dark:text-[#e6edf3] placeholder-gray-300 dark:placeholder-[#484f58] outline-none focus:border-red-400 dark:focus:border-red-700 resize-none mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setRefusDoc(null)}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold border border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">
                Annuler
              </button>
              <button onClick={() => handleAction(refusDoc.id, "refused", document.getElementById("motif-refus")?.value)}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-red-600 hover:bg-red-700 text-white transition-colors">
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}