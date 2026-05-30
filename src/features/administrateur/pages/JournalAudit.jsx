import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);
const pad = (n) => String(n).padStart(2, "0");

function formatDT(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function elapsed(d) {
  const dm = Math.floor((NOW - d) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 1)  return "À l'instant";
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h`;
  if (dd === 1) return "Hier";
  return `Il y a ${dd}j`;
}

const MOCK = [
  { id:1,  date: sub(2*60000),           acteur:"Dr. Aminata Sow",    role:"Médecin",  action:"Connexion réussie",             cible:"Compte médecin",           ip:"197.234.56.78",  ville:"Douala",  statut:"success" },
  { id:2,  date: sub(15*60000),          acteur:"Super Admin",        role:"Admin",    action:"Compte médecin validé",         cible:"Dr. Paul Essomba",         ip:"192.168.1.1",    ville:"Local",   statut:"success" },
  { id:3,  date: sub(34*60000),          acteur:"Inconnu",            role:"—",        action:"Tentative connexion échouée",   cible:"admin@pneumoia.cm",        ip:"105.112.43.21",  ville:"Lagos",   statut:"danger"  },
  { id:4,  date: sub(2*3600000),         acteur:"Super Admin",        role:"Admin",    action:"Compte médecin rejeté",         cible:"Dr. Tabi Jonas",           ip:"192.168.1.1",    ville:"Local",   statut:"warning" },
  { id:5,  date: sub(3*3600000),         acteur:"Dr. Jean Dupont",    role:"Médecin",  action:"Consultation enregistrée",      cible:"Patient #247",             ip:"197.234.12.55",  ville:"Douala",  statut:"success" },
  { id:6,  date: sub(5*3600000),         acteur:"Super Admin",        role:"Admin",    action:"Dr. Fokou suspendu",            cible:"Dr. Fokou Emmanuel",       ip:"192.168.1.1",    ville:"Local",   statut:"warning" },
  { id:7,  date: sub(8*3600000),         acteur:"Dr. Kamto Diane",    role:"Médecin",  action:"Connexion réussie",             cible:"Compte médecin",           ip:"41.202.219.67",  ville:"Yaoundé", statut:"success" },
  { id:8,  date: sub(12*3600000),        acteur:"Système",            role:"Système",  action:"Modèle IA mis à jour",          cible:"Model v2.4.1",             ip:"—",              ville:"—",       statut:"info"    },
  { id:9,  date: sub(24*3600000),        acteur:"Dr. Mbang",          role:"Médecin",  action:"Demande accès patient refusée", cible:"Patient #102",             ip:"197.234.99.12",  ville:"Douala",  statut:"danger"  },
  { id:10, date: sub(2*24*3600000),      acteur:"Super Admin",        role:"Admin",    action:"Paramètres mis à jour",         cible:"Config plateforme",        ip:"192.168.1.1",    ville:"Local",   statut:"info"    },
  { id:11, date: sub(3*24*3600000),      acteur:"Dr. Aminata Sow",    role:"Médecin",  action:"Cas publié communauté",         cible:"Cas #64",                  ip:"197.234.56.78",  ville:"Douala",  statut:"success" },
  { id:12, date: sub(5*24*3600000),      acteur:"Inconnu",            role:"—",        action:"Tentative connexion échouée",   cible:"d.kamto@chu.cm",           ip:"102.89.45.200",  ville:"Abidjan", statut:"danger"  },
];

const TYPE_FILTERS = ["Tous","Connexion","Validation","Suspension","Consultation","Système","Erreur"];

const STATUT_CFG = {
  success: { cls: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700/40", dot: "bg-green-500", label: "Succès"    },
  warning: { cls: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700/40", dot: "bg-orange-500", label: "Warning"   },
  danger:  { cls: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700/40", dot: "bg-red-500", label: "Erreur"     },
  info:    { cls: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700/40", dot: "bg-blue-400", label: "Info"       },
};

function matchType(log, type) {
  if (type === "Tous") return true;
  if (type === "Connexion")   return log.action.toLowerCase().includes("connexion");
  if (type === "Validation")  return log.action.toLowerCase().includes("valid") || log.action.toLowerCase().includes("rejeté");
  if (type === "Suspension")  return log.action.toLowerCase().includes("suspendu");
  if (type === "Consultation") return log.action.toLowerCase().includes("consultation") || log.action.toLowerCase().includes("cas");
  if (type === "Système")     return log.role === "Système" || log.action.toLowerCase().includes("mis à jour") || log.action.toLowerCase().includes("paramètre");
  if (type === "Erreur")      return log.statut === "danger";
  return true;
}

function PagBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg border text-[11px] transition-colors border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d] disabled:opacity-30 disabled:cursor-not-allowed">
      {label}
    </button>
  );
}

export default function JournalAudit() {
  useOutletContext();

  const [search, setSearch]   = useState("");
  const [type, setType]       = useState("Tous");
  const [page, setPage]       = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK
      .filter(l => matchType(l, type))
      .filter(l => !q || l.acteur.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.ip.includes(q) || l.cible.toLowerCase().includes(q));
  }, [search, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, filtered.length);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map((l, i) => ({
      "#":           i + 1,
      "Date/heure":  formatDT(l.date),
      "Acteur":      l.acteur,
      "Rôle":        l.role,
      "Action":      l.action,
      "Cible":       l.cible,
      "IP":          l.ip,
      "Ville":       l.ville,
      "Statut":      STATUT_CFG[l.statut]?.label || l.statut,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit");
    XLSX.writeFile(wb, `audit_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const th = "px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58] whitespace-nowrap";
  const td = "px-4 py-3 border-b border-gray-50 dark:border-[#21262d]";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">Journal d'audit</h1>
          <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
            Traçabilité complète de chaque action effectuée sur la plateforme
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-green-600 hover:border-green-600 hover:text-white dark:hover:bg-green-700 shrink-0">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Excel
        </button>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total événements",   val: MOCK.length,                                       color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: "Succès",             val: MOCK.filter(l => l.statut === "success").length,   color: "text-green-600 dark:text-[#22c55e]" },
          { label: "Erreurs / Échecs",   val: MOCK.filter(l => l.statut === "danger").length,    color: "text-red-600 dark:text-red-400" },
          { label: "IPs suspectes",      val: MOCK.filter(l => l.statut === "danger" && l.ip !== "—").map(l => l.ip).filter((v,i,a) => a.indexOf(v) === i).length, color: "text-orange-500" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl px-4 py-3">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-100 dark:border-[#21262d] flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_FILTERS.map(t => (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                  type === t
                    ? "bg-green-600 dark:bg-green-700 border-green-600 text-white"
                    : "border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]"
                }`}>{t}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher acteur, action, IP…"
            className="w-56 text-[12px] px-3 py-1.5 rounded-lg border outline-none bg-gray-50 dark:bg-[#0d1117] border-gray-200 dark:border-[#21262d] text-gray-800 dark:text-[#e6edf3] placeholder-gray-300 dark:placeholder-[#484f58] focus:border-green-500 dark:focus:border-[#22c55e]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Date / Heure</th>
                <th className={th}>Acteur</th>
                <th className={th}>Rôle</th>
                <th className={th}>Action</th>
                <th className={th}>Cible</th>
                <th className={th}>IP</th>
                <th className={th}>Ville</th>
                <th className={th}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>Aucun événement trouvé</td></tr>
              ) : paginated.map(l => {
                const s = STATUT_CFG[l.statut] || STATUT_CFG.info;
                return (
                  <tr key={l.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                    <td className={td}>
                      <p className="text-[11px] font-mono text-gray-700 dark:text-[#8b949e] whitespace-nowrap">{formatDT(l.date)}</p>
                      <p className="text-[9px] text-gray-300 dark:text-[#484f58]">{elapsed(l.date)}</p>
                    </td>
                    <td className={`${td} text-[11px] font-semibold text-gray-800 dark:text-[#e6edf3]`}>{l.acteur}</td>
                    <td className={td}>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        l.role === "Admin"   ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" :
                        l.role === "Médecin" ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" :
                        l.role === "Système" ? "bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e]" :
                        "bg-gray-100 dark:bg-[#21262d] text-gray-400 dark:text-[#484f58]"
                      }`}>{l.role}</span>
                    </td>
                    <td className={`${td} text-[11px] text-gray-700 dark:text-[#8b949e] max-w-[220px]`}>
                      <p className="truncate">{l.action}</p>
                    </td>
                    <td className={`${td} text-[11px] text-gray-500 dark:text-[#484f58] max-w-[160px]`}>
                      <p className="truncate">{l.cible}</p>
                    </td>
                    <td className={td}>
                      <p className="text-[10px] font-mono text-gray-600 dark:text-[#8b949e] whitespace-nowrap">{l.ip}</p>
                    </td>
                    <td className={`${td} text-[10px] text-gray-500 dark:text-[#484f58]`}>{l.ville}</td>
                    <td className={td}>
                      <span className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded-full border w-fit ${s.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-[#21262d]">
          <span className="text-[11px] text-gray-400 dark:text-[#484f58]">{from} – {to} sur {filtered.length} événement{filtered.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-[#484f58]">
            <span>Lignes</span>
            <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-[#21262d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-[#8b949e] outline-none text-[11px] cursor-pointer">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage(1)}                           disabled={page === 1}          label="«" />
            <PagBtn onClick={() => setPage(p => Math.max(1, p-1))}      disabled={page === 1}          label="‹" />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
              .map((p, i) => typeof p === "string"
                ? <span key={i} className="px-1 text-[11px] text-gray-300 dark:text-[#484f58]">…</span>
                : <button key={p} onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg border text-[11px] font-semibold transition-colors ${
                      p === page
                        ? "bg-green-600 dark:bg-green-700 border-green-600 text-white"
                        : "border-gray-200 dark:border-[#21262d] text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]"
                    }`}>{p}</button>
              )}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} label="›" />
            <PagBtn onClick={() => setPage(totalPages)}                  disabled={page === totalPages} label="»" />
          </div>
        </div>
      </div>
    </div>
  );
}