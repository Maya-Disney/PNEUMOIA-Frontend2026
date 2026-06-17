import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import * as XLSX from "xlsx";
import { Download, Search, ChevronLeft, ChevronRight, Trash2, X, AlertTriangle, Activity, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import {
  Th, Tr, Td, EmptyCell, MutedText, SubtleText, PaginationBar,
} from "../components/ui/Table";
import { getAuditLogs, purgerAuditLogs } from "../api/adminapi";

const pad = (n) => String(n).padStart(2, "0");
function fmtDT(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
function elapsed(d) { const dm = Math.floor((Date.now() - d) / 60000), dh = Math.floor(dm / 60), dd = Math.floor(dh / 24); if (dm < 60) return `${dm} min`; if (dh < 24) return `${dh}h`; if (dd === 1) return "Hier"; return `${dd}j`; }

const TYPES = ["Tous","Connexion","Validation","Suspension","Consultation","Système","Erreur"];
const STATUT_CFG = {
  success: { cls:"bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/25", dot:"bg-emerald-500 dark:bg-emerald-400", label:"Succès"  },
  warning: { cls:"bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/25",           dot:"bg-amber-500 dark:bg-amber-400",   label:"Warning" },
  danger:  { cls:"bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/25",                 dot:"bg-rose-500 dark:bg-rose-400",     label:"Erreur"  },
  info:    { cls:"bg-slate-50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/30",            dot:"bg-slate-400 dark:bg-slate-500",   label:"Info"    },
};

function matchType(l, t) {
  if (t === "Tous") return true;
  if (t === "Connexion") return l.action.toLowerCase().includes("connexion");
  if (t === "Validation") return l.action.toLowerCase().includes("valid") || l.action.toLowerCase().includes("rejeté");
  if (t === "Suspension") return l.action.toLowerCase().includes("suspendu");
  if (t === "Consultation") return l.action.toLowerCase().includes("consultation") || l.action.toLowerCase().includes("cas");
  if (t === "Système") return l.role === "Système" || l.action.toLowerCase().includes("mis à jour") || l.action.toLowerCase().includes("sauvegarde") || l.action.toLowerCase().includes("paramètre");
  if (t === "Erreur") return l.statut === "danger";
  return true;
}

const ROLE_BADGE = {
  Admin:   "bg-violet-50 text-violet-600 border border-violet-200 dark:bg-violet-900/10 dark:text-violet-400 dark:border-violet-800/25",
  Médecin: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/10 dark:text-sky-400 dark:border-sky-800/25",
  Système: "bg-zinc-100 text-zinc-500 border border-zinc-200 dark:bg-zinc-800/20 dark:text-zinc-400 dark:border-zinc-700/30",
  default: "bg-gray-50 text-gray-400 border border-gray-200 dark:bg-gray-800/10 dark:text-gray-500 dark:border-gray-700/20",
};

function RoleBadge({ role }) {
  const cls = ROLE_BADGE[role] ?? ROLE_BADGE.default;
  return <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-md ${cls}`}>{role}</span>;
}

function CleanModal({ dark, onClean, onClose, lastClean }) {
  const fmtDate = (iso) => {
    if (!iso) return "Jamais";
    const d = new Date(iso);
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  };

  const opts = [
    { label: "Entrées de plus de 7 jours",  days: 7,  color: "text-orange-600" },
    { label: "Entrées de plus de 30 jours", days: 30, color: "text-orange-500" },
    { label: "Tout effacer",                days: 0,  color: "text-red-600"    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className={`w-[340px] rounded-2xl shadow-xl border p-5 flex flex-col gap-4 ${dark ? "bg-[#161b22] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-900"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 size={16} className="text-red-500" />
            <span className="font-bold text-[15px]">Nettoyer le journal</span>
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg ${dark ? "hover:bg-[#21262d]" : "hover:bg-gray-100"}`}><X size={14} /></button>
        </div>

        <div className={`flex items-center gap-2 text-[13px] px-3 py-2 rounded-xl ${dark ? "bg-[#21262d]" : "bg-gray-50"}`}>
          <AlertTriangle size={13} className="text-orange-500 shrink-0" />
          <span className={dark ? "text-[#8b949e]" : "text-gray-500"}>
            Dernier nettoyage&nbsp;: <strong>{fmtDate(lastClean)}</strong>
          </span>
        </div>

        <p className={`text-[13px] ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
          Choisissez quelles entrées supprimer. Cette action est irréversible.
        </p>

        <div className="flex flex-col gap-2">
          {opts.map(o => (
            <button
              key={o.days}
              onClick={() => onClean(o.days)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-[14px] font-semibold transition-colors ${dark ? "border-[#21262d] hover:bg-[#21262d]" : "border-gray-200 hover:bg-gray-50"}`}
            >
              <span>{o.label}</span>
              <span className={o.color}>{o.days === 0 ? "Tout" : `> ${o.days}j`}</span>
            </button>
          ))}
        </div>

        <p className={`text-[12px] text-center ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
          Nettoyage automatique chaque semaine activé
        </p>
      </div>
    </div>
  );
}

function normalizeLog(l) {
  return {
    id:     l.id,
    date:   l.date instanceof Date ? l.date : new Date(l.date),
    acteur: l.acteur,
    role:   l.role,
    action: l.action,
    cible:  l.cible,
    ip:     l.ip,
    ville:  l.ville,
    statut: l.statut,
  };
}

export default function JournalAudit() {
  const { dark } = useOutletContext() || {};
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Tous");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClean, setShowClean] = useState(false);
  const [lastClean, setLastClean] = useState(() => localStorage.getItem("auditLastClean") || null);
  const PER_PAGE = 8;

  useEffect(() => {
    setLoading(true);
    getAuditLogs()
      .then(res => {
        const entries = Array.isArray(res) ? res : (res?.logs ?? []);
        setData(entries.map(normalizeLog));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleClean(days) {
    try {
      await purgerAuditLogs(days);
    } catch {}
    // Recharge les données après purge
    const res = await getAuditLogs().catch(() => null);
    const entries = Array.isArray(res) ? res : (res?.logs ?? []);
    setData(entries.map(normalizeLog));
    const now = new Date().toISOString();
    localStorage.setItem("auditLastClean", now);
    setLastClean(now);
    setShowClean(false);
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(l => matchType(l, type) && (!q || l.acteur.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.ip.includes(q) || l.cible.toLowerCase().includes(q)));
  }, [search, type, data]);

  const total = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, filtered.length);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(filtered.map((l, i) => ({ "#": i + 1, "Date/heure": fmtDT(l.date), Acteur: l.acteur, Rôle: l.role, Action: l.action, Cible: l.cible, IP: l.ip, Ville: l.ville, Statut: STATUT_CFG[l.statut]?.label || l.statut })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit");
    XLSX.writeFile(wb, `audit_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  const txt = getText(dark);

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
      {showClean && (
        <CleanModal
          dark={dark}
          onClean={handleClean}
          onClose={() => setShowClean(false)}
          lastClean={lastClean}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>Journal d'audit</h1>
          <p className={`text-[15px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>Traçabilité complète de chaque action</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClean(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-red-900/20 hover:border-red-700/40 hover:text-red-400" : "border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500"}`}
          >
            <Trash2 size={13} />Nettoyer
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[15px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
            onMouseEnter={e => { e.currentTarget.style.background = brand.DEFAULT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = brand.DEFAULT; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}
          >
            <Download size={13} />Export Excel
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            l: "Total événements",
            v: data.length,
            Icon: Activity,
            num: dark ? "text-white" : "text-gray-800",
            iconBg: dark ? "bg-slate-800/60 text-slate-400" : "bg-slate-100 text-slate-500",
          },
          {
            l: "Succès",
            v: data.filter(l => l.statut === "success").length,
            Icon: CheckCircle2,
            num: dark ? "text-emerald-400" : "text-emerald-600",
            iconBg: dark ? "bg-emerald-900/20 text-emerald-400" : "bg-emerald-50 text-emerald-500",
          },
          {
            l: "Erreurs",
            v: data.filter(l => l.statut === "danger").length,
            Icon: XCircle,
            num: dark ? "text-rose-400" : "text-rose-600",
            iconBg: dark ? "bg-rose-900/20 text-rose-400" : "bg-rose-50 text-rose-500",
          },
          {
            l: "IPs suspectes",
            v: [...new Set(data.filter(l => l.statut === "danger" && l.ip !== "—").map(l => l.ip))].length,
            Icon: ShieldAlert,
            num: dark ? "text-amber-400" : "text-amber-600",
            iconBg: dark ? "bg-amber-900/20 text-amber-400" : "bg-amber-50 text-amber-500",
          },
        ].map(({ l, v, Icon, num, iconBg }) => (
          <div key={l} className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className={`text-xl font-black leading-tight ${num}`}>{v}</p>
              <p className={`text-[12px] mt-0.5 leading-tight ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className={`rounded-2xl border ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 dark:border-[#21262d]">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => { setType(t); setPage(1); }}
                className="px-3 py-1 rounded-lg text-[14px] font-semibold border transition-colors"
                style={
                  type === t
                    ? { background: brand.DEFAULT, borderColor: brand.DEFAULT, color: "#fff" }
                    : { background: dark ? "transparent" : "#fff", borderColor: dark ? "#30363d" : "#e5e7eb", color: dark ? "#6e7681" : "#9ca3af" }
                }
              >{t}</button>
            ))}
          </div>

          <div className={`flex items-center gap-2 h-8 px-3 rounded-lg border w-full sm:w-56 ${dark ? "bg-[#1c2128] border-[#30363d]" : "bg-gray-50 border-gray-200"}`}>
            <Search size={12} className={`shrink-0 ${dark ? "text-[#6e7681]" : "text-gray-400"}`} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Acteur, action, IP…"
              className={`flex-1 bg-transparent text-[14px] outline-none ${dark ? "text-[#cdd5de] placeholder-[#6e7681]" : "text-gray-700 placeholder-gray-400"}`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-5">
            {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: dark ? "#21262d" : "#f3f4f6" }} />)}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th dark={dark}>Date / Heure</Th>
                <Th dark={dark}>Acteur</Th>
                <Th dark={dark}>Rôle</Th>
                <Th dark={dark}>Action</Th>
                <Th dark={dark}>Cible</Th>
                <Th dark={dark}>IP</Th>
                <Th dark={dark}>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0
                ? <EmptyCell dark={dark} colSpan={7}>Aucun événement trouvé</EmptyCell>
                : paginated.map(l => {
                    const s = STATUT_CFG[l.statut] || STATUT_CFG.info;
                    return (
                      <Tr key={l.id} dark={dark}>
                        <Td dark={dark}>
                          <p className="text-[14px] font-mono whitespace-nowrap" style={{ color: txt.secondary }}>{fmtDT(l.date)}</p>
                          <SubtleText dark={dark}>{elapsed(l.date)}</SubtleText>
                        </Td>
                        <Td dark={dark}>
                          <span className="text-[14px] font-semibold" style={{ color: txt.primary }}>{l.acteur}</span>
                        </Td>
                        <Td dark={dark}>
                          <RoleBadge role={l.role} />
                        </Td>
                        <Td dark={dark}>
                          <p className="truncate text-[14px]" style={{ color: txt.muted, maxWidth: 200 }}>{l.action}</p>
                        </Td>
                        <Td dark={dark}>
                          <p className="truncate text-[14px]" style={{ color: txt.subtle, maxWidth: 140 }}>{l.cible}</p>
                        </Td>
                        <Td dark={dark}><MutedText dark={dark} mono>{l.ip}</MutedText></Td>
                        <Td dark={dark}>
                          <span className={`flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-0.5 rounded-md border w-fit ${s.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />{s.label}
                          </span>
                        </Td>
                      </Tr>
                    );
                  })
              }
            </tbody>
          </table>
        )}
      </div>

      <PaginationBar dark={dark}>
        <span>{from}–{to} sur {filtered.length} événement{filtered.length > 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[14px] ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-100"} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}><ChevronLeft size={13} /></button>
          <span className={`text-[14px] px-2 ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{page}/{total}</span>
          <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total} className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[14px] ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-100"} disabled:opacity-30 disabled:cursor-not-allowed transition-colors`}><ChevronRight size={13} /></button>
        </div>
      </PaginationBar>
    </div>
  );
}
