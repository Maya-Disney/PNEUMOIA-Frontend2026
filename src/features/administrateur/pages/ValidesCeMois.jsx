import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import * as XLSX from "xlsx";
import { Download, X, FileText, XCircle } from "lucide-react";
import { getMedecinsValides } from "../api/adminApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { brand, getSurface, getText } from "../theme";
import {
  TableCard, TableContainer, Th, Tr, Td, EmptyCell, PersonCell,
  MutedText, SubtleText, StatusText, PaginationBar, PaginationSelect, PaginationButton,
} from "../components/ui/Table";

const MOIS_LONG  = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const MOIS_COURT = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const pad = (n) => String(n).padStart(2, "0");

function formatFull(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatCourt(d) {
  const now = new Date();
  const dm  = Math.floor((now - d) / 60000);
  const dh  = Math.floor(dm / 60);
  const dd  = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  const same = now.getDate()===d.getDate() && now.getMonth()===d.getMonth();
  if (same) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (dd === 1) return "Hier";
  if (dd < 30) return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]} ${d.getFullYear()}`;
}
function formatValidation(d) {
  const now  = new Date();
  const same = now.getDate()===d.getDate() && now.getMonth()===d.getMonth() && now.getFullYear()===d.getFullYear();
  if (same) return `Auj. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
}




function Modal({ onClose, title, sub: subtitle, wide, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
        ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[14px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className={`shrink-0 flex gap-2 px-5 py-4 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ModalePhoto({ doc: m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.name} sub="Photo d'identité (CNI)" wide
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col items-center gap-4">
        {m.photo_url
          ? <img src={m.photo_url} alt={m.name} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow-md" />
          : (
            <div className={`w-full h-44 rounded-xl flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark ? "border-[#21262d] bg-[#0d1117] text-[#484f58]" : "border-gray-200 bg-gray-50 text-gray-300"}`}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[14px] text-center px-2">Aucune photo disponible</span>
            </div>
          )
        }
        <div className="text-center">
          <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.name}</p>
          <p className={`text-[14px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · N° d'ordre {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

function isPdf(url, mime) {
  if (mime) return mime.toLowerCase().includes("pdf");
  if (!url) return false;
  return url.toLowerCase().split("?")[0].endsWith(".pdf");
}

function isOffice(url, mime) {
  if (mime) {
    const m = mime.toLowerCase();
    return m.includes("officedocument") || m.includes("msword") || m.includes("ms-excel") ||
           m.includes("ms-powerpoint") || m.includes("opendocument");
  }
  if (!url) return false;
  return /\.(docx?|xlsx?|pptx?)$/i.test(url.toLowerCase().split("?")[0]);
}

function ModaleApercu({ doc: d, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const fileUrl = d.url || null;
  const pdf     = isPdf(fileUrl, d.mime);
  const office  = !pdf && isOffice(fileUrl, d.mime);
  const officeViewerUrl = fileUrl
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/80" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ background: surface.card, borderBottom: `1px solid ${surface.border}` }}>
        <div>
          <p className="text-[15px] font-bold" style={{ color: txt.primary }}>{d.label}</p>
          <p className="text-[14px] mt-0.5" style={{ color: txt.subtle }}>Aperçu du document</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: txt.subtle }}
          onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
          <XCircle size={18} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {!fileUrl ? (
          <div className="flex flex-col items-center gap-3 text-center px-6 py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[15px]">Document non disponible — connexion backend requise.</p>
          </div>
        ) : pdf ? (
          <iframe src={fileUrl} title={d.label} className="w-full h-full rounded-lg" style={{ background: "#fff", border: "none" }} />
        ) : office ? (
          <iframe src={officeViewerUrl} title={d.label} className="w-full h-full rounded-lg" style={{ background: "#fff", border: "none" }} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6 py-12 rounded-xl border-2 border-dashed"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-[15px]">Format non supporté — seuls les fichiers PDF, Word, Excel et PowerPoint sont acceptés.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModaleDossier({ doc: m, onClose, dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const [apercu, setApercu] = useState(null);

  return (
    <>
    <Modal dark={dark} onClose={onClose} title="Dossier de validation"
      sub={`${m.name} · validé le ${formatValidation(m.dateValidation)}`} wide
      footer={
        <button onClick={onClose}
          className="flex-1 py-2 rounded-xl text-[14px] font-semibold border transition-colors"
          style={{ borderColor: surface.border, color: txt.muted }}
          onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
          Fermer
        </button>
      }>
      <div className="flex flex-col gap-3">

        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[15px] font-medium
          ${dark ? "bg-blue-900/20 border-blue-700/40 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Validé par <strong className="mx-1">{m.validePar}</strong> le {formatFull(m.dateValidation)}
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: surface.bg, borderColor: surface.border }}>
          {[
            { l: "Médecin",       v: m.name },
            { l: "N° d'ordre",    v: m.cnom, mono: true },
            { l: "Établissement", v: m.hopital },
            { l: "Date demande",  v: formatFull(m.dateDemande) },
          ].map(({ l, v, mono }) => (
            <div key={l} className="flex items-center justify-between px-4 py-2.5 border-b last:border-0" style={{ borderColor: surface.borderSoft }}>
              <span className="text-[15px]" style={{ color: txt.subtle }}>{l}</span>
              <span className={`text-[15px] font-medium ${mono ? "font-mono" : ""}`} style={{ color: txt.secondary }}>{v}</span>
            </div>
          ))}
        </div>

        <p className="text-[14px] font-bold uppercase tracking-wider" style={{ color: txt.subtle }}>
          Pièces justificatives
        </p>

        <div className="rounded-xl border overflow-hidden" style={{ background: surface.bg, borderColor: surface.border }}>
          {m.documents.length === 0 ? (
            <div className="px-4 py-6 text-center text-[14px]" style={{ color: txt.subtle }}>
              Aucun document disponible
            </div>
          ) : m.documents.map((d, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: surface.borderSoft }}>
              <span className="text-[14px] font-bold w-5 shrink-0" style={{ color: txt.subtle }}>{i + 1}</span>
              <span className="text-[15px] font-medium flex-1 min-w-0 truncate" style={{ color: txt.secondary }}>{d.label}</span>
              <button
                onClick={() => setApercu(d)}
                title="Voir le document"
                className="flex items-center gap-1 px-2 py-1 text-[14px] font-bold rounded-lg border transition-colors shrink-0"
                style={{ borderColor: surface.border, color: txt.muted }}
                onMouseEnter={e => { e.currentTarget.style.background = surface.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = ""; }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                Voir
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
    {apercu && <ModaleApercu doc={apercu} dark={dark} onClose={() => setApercu(null)} />}
    </>
  );
}


export default function ValideesCeMois() {
  const { dark } = useOutletContext() || {};
  const { searchQuery } = useAdminTheme();

  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [erreur,     setErreur]     = useState(null);
  const [moisSelec,  setMoisSelec]  = useState(new Date().getMonth() + 1);
  const [anneeSelec, setAnneeSelec] = useState(new Date().getFullYear());
  const [page,       setPage]       = useState(1);
  const [perPage,    setPerPage]    = useState(10);
  const [modalePhoto,   setModalePhoto]   = useState(null);
  const [modaleDossier, setModaleDossier] = useState(null);
  const [toast,         setToast]         = useState(null);
  const [prevCount,     setPrevCount]     = useState(null);
  const [chartData,     setChartData]     = useState([]);
  const [loadingChart,  setLoadingChart]  = useState(true);

  useEffect(() => {
    setLoading(true);
    setErreur(null);
    getMedecinsValides(moisSelec, anneeSelec)
      .then(data => {
        const liste = Array.isArray(data) ? data : (data?.items ?? data?.medecins ?? []);
        setRows(liste.map(m => ({
          id:              m.id,
          initials:        `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
          name:            `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
          specialite:      m.specialite || "Pneumologue",
          hopital:         m.etablissement || "—",
          ville:           m.ville || m.adresse || "—",
          email:           m.email,
          telephone:       m.telephone || "—",
          cnom:            m.numero_rpps || "—",
          photo_url:       m.photo_url || null,
          avatarBg:        ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"][Math.abs(m.id?.charCodeAt(0)||0) % 6],
          patients:        m.nb_patients     ?? 0,
          consultations:   m.nb_consultations ?? 0,
          concordanceIA:   m.concordance_ia  ?? 0,
          statut:          "Actif",
          rangCommunaute:  m.rang_communaute  || "—",
          casPartages:     m.cas_partages     || "—",
          creeLE:          m.created_at ? new Date(m.created_at).toLocaleString("fr-FR") : "—",
          valideLE:        m.valide_le  ? new Date(m.valide_le).toLocaleString("fr-FR")  : "—",
          dateDemande:     m.created_at ? new Date(m.created_at) : new Date(),
          dateValidation:  m.valide_le  ? new Date(m.valide_le)  : new Date(),
          validePar:       m.valide_par || "Administrateur",
          documents:       (m.documents || []).map(d => ({ label: d.label, url: d.url })),
          activiteRecente: m.activite_recente || [],
        })));
      })
      .catch(err => {
        console.error("[ValidesCeMois] erreur API:", err);
        setErreur(err.message || "Impossible de charger les données.");
      })
      .finally(() => setLoading(false));
  }, [moisSelec, anneeSelec]);

  useEffect(() => {
    const moisPrec  = moisSelec === 1 ? 12 : moisSelec - 1;
    const anneePrec = moisSelec === 1 ? anneeSelec - 1 : anneeSelec;
    getMedecinsValides(moisPrec, anneePrec)
      .then(data => {
        const liste = Array.isArray(data) ? data : (data?.items ?? data?.medecins ?? []);
        setPrevCount(liste.length);
      })
      .catch(() => setPrevCount(null));
  }, [moisSelec, anneeSelec]);

  useEffect(() => {
    setLoadingChart(true);
    Promise.all(
      Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
        getMedecinsValides(m, anneeSelec)
          .then(data => {
            const liste = Array.isArray(data) ? data : (data?.items ?? data?.medecins ?? []);
            return { label: MOIS_COURT[m - 1], mois: m, count: liste.length };
          })
          .catch(() => ({ label: MOIS_COURT[m - 1], mois: m, count: 0 }))
      )
    )
      .then(results => setChartData(results))
      .finally(() => setLoadingChart(false));
  }, [anneeSelec]);

  const q      = searchQuery.toLowerCase().trim();
  const liste  = rows.filter(r => !q || [r.name, r.cnom, r.hopital, r.ville, r.email]
    .some(v => v && v.toLowerCase().includes(q)));
  const totalPages = Math.max(1, Math.ceil(liste.length / perPage));
  const paginated  = liste.slice((page-1)*perPage, page*perPage);
  const from = liste.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, liste.length);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(rows.map((r, i) => ({
      "#": i+1, Nom: r.name, CNOM: r.cnom, Spécialité: r.specialite,
      Établissement: r.hopital, Ville: r.ville,
      "Date demande": formatFull(r.dateDemande),
      "Date validation": formatFull(r.dateValidation),
      "Validé par": r.validePar,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Validées");
    XLSX.writeFile(wb, `validees_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const surface = getSurface(dark);
  const txt     = getText(dark);

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
            Inscriptions validées — {MOIS_LONG[moisSelec-1].charAt(0).toUpperCase() + MOIS_LONG[moisSelec-1].slice(1)} {anneeSelec}
          </h1>
          <p className={`text-[14px] mt-1 flex items-center gap-2 flex-wrap ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {rows.length} compte{rows.length > 1 ? "s" : ""} médecin{rows.length > 1 ? "s" : ""} activé{rows.length > 1 ? "s" : ""} ce mois
            {prevCount !== null && (() => {
              const diff = rows.length - prevCount;
              const pct  = prevCount === 0 ? null : Math.round(Math.abs(diff) / prevCount * 100);
              if (diff > 0) return (
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  ↑ +{diff}{pct !== null ? ` (${pct}%)` : ""} vs mois préc.
                </span>
              );
              if (diff < 0) return (
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  ↓ {diff}{pct !== null ? ` (−${pct}%)` : ""} vs mois préc.
                </span>
              );
              return (
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  ↔ Stable vs mois préc.
                </span>
              );
            })()}
          </p>
        </div>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[14px] font-semibold transition-all border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e]"
          onMouseEnter={e => { e.currentTarget.style.background = brand.DEFAULT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = brand.DEFAULT; }}
          onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = ""; }}>
          <Download size={13} /> Export Excel
        </button>
      </div>

      {/* ── Graphique évolution 12 mois ── */}
      <div className={`rounded-2xl border p-5 shadow-sm ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100"}`}>

        {/* En-tête du graphique */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <p className={`text-[15px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
              Validations {anneeSelec}
            </p>
            <p className={`text-[13px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
              Évolution mois par mois sur l'année sélectionnée
            </p>
          </div>

          {!loadingChart && chartData.length > 0 && (() => {
            const total = chartData.reduce((s, d) => s + d.count, 0);
            const max   = Math.max(...chartData.map(d => d.count));
            const pic   = chartData.find(d => d.count === max);
            return (
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                  <span className="text-xl font-black" style={{ color: "#009e82" }}>{total}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Total {anneeSelec}</span>
                </div>
                {max > 0 && (
                  <div className={`flex flex-col items-center px-4 py-2 rounded-xl border ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
                    <span className={`text-xl font-black ${dark ? "text-white" : "text-gray-800"}`}>{max}</span>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Pic · {pic?.label}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {loadingChart ? (
          <div className="h-[160px] flex items-center justify-center">
            <span className={`text-[14px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>Chargement…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={20} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#21262d" : "#f3f4f6"} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: dark ? "#484f58" : "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: dark ? "#484f58" : "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: dark ? "#161b22" : "#fff",
                  border: `1px solid ${dark ? "#21262d" : "#e5e7eb"}`,
                  borderRadius: 10,
                  fontSize: 13,
                  color: dark ? "#c9d1d9" : "#374151",
                }}
                formatter={(value) => [`${value} validation${value > 1 ? "s" : ""}`, ""]}
                labelFormatter={(label) => `${label} ${anneeSelec}`}
                cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.mois === moisSelec ? "#009e82" : dark ? "#21262d" : "#e5e7eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <TableCard dark={dark}>
        <div className="flex items-center gap-3 flex-wrap px-5 py-3 border-b" style={{ borderColor: surface.border }}>
          <span className="text-[14px] font-semibold" style={{ color: txt.subtle }}>Période :</span>
          <select
            value={moisSelec}
            onChange={e => { setMoisSelec(Number(e.target.value)); setPage(1); }}
            className={`text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {MOIS_LONG.map((m, i) => (
              <option key={i} value={i+1}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={anneeSelec}
            onChange={e => { setAnneeSelec(Number(e.target.value)); setPage(1); }}
            className={`text-[14px] px-3 py-1.5 rounded-xl border outline-none cursor-pointer font-semibold ${dark?"bg-[#161b22] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
            {Array.from({length: 10}, (_, i) => 2026 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <TableContainer dark={dark}>
          <thead>
            <tr>
              <Th dark={dark}>Médecin</Th>
              <Th dark={dark}>CNOM</Th>
              <Th dark={dark}>Établissement</Th>
              <Th dark={dark}>Ville</Th>
              <Th dark={dark}>Date demande</Th>
              <Th dark={dark}>Date validation</Th>
              <Th dark={dark}>Validé par</Th>
              <Th dark={dark} center style={{ width: 80 }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyCell dark={dark} colSpan={8}>Chargement…</EmptyCell>
            ) : erreur ? (
              <EmptyCell dark={dark} colSpan={8}>
                <span className="text-red-500">{erreur}</span>
              </EmptyCell>
            ) : paginated.length === 0 ? (
              <EmptyCell dark={dark} colSpan={8}>Aucune validation ce mois</EmptyCell>
            ) : paginated.map(doc => (
                <Tr key={doc.id} dark={dark}>
                  <Td dark={dark}>
                    <PersonCell dark={dark} avatarColor={doc.avatarBg} initials={doc.initials}
                      name={doc.name} subtitle={doc.specialite} onClick={() => setModalePhoto(doc)} photoUrl={doc.photo_url} />
                  </Td>
                  <Td dark={dark}><MutedText dark={dark} mono>{doc.cnom}</MutedText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.hopital}</MutedText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.ville}</MutedText></Td>
                  <Td dark={dark}><SubtleText dark={dark}>{formatCourt(doc.dateDemande)}</SubtleText></Td>
                  <Td dark={dark}><StatusText color="success">{formatValidation(doc.dateValidation)}</StatusText></Td>
                  <Td dark={dark}><MutedText dark={dark}>{doc.validePar}</MutedText></Td>

                  <Td dark={dark} center>
                    <button
                      onClick={() => setModaleDossier(doc)}
                      title="Voir le dossier"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-semibold transition-colors
                        ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d] hover:text-white" : "border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
                    >
                      <FileText size={13} />
                      Dossier
                    </button>
                  </Td>
                </Tr>
              ))}
          </tbody>
        </TableContainer>

      </TableCard>

      <PaginationBar dark={dark}>
        <span>Affichage {from} à {to} sur {liste.length} inscription{liste.length>1?"s":""}</span>
        <div className="flex items-center gap-2">
          <span>Lignes :</span>
          <PaginationSelect dark={dark} value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}} />
        </div>
        <div className="flex items-center gap-1">
          <PaginationButton dark={dark} onClick={()=>setPage(1)} disabled={page===1}>«</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>‹</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>›</PaginationButton>
          <PaginationButton dark={dark} onClick={()=>setPage(totalPages)} disabled={page===totalPages}>»</PaginationButton>
        </div>
      </PaginationBar>

      {modalePhoto   && <ModalePhoto   doc={modalePhoto}   dark={dark} onClose={() => setModalePhoto(null)} />}
      {modaleDossier && <ModaleDossier doc={modaleDossier} dark={dark} onClose={() => setModaleDossier(null)} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[14px] font-semibold text-white ${toast.type === "success" ? "bg-blue-700" : toast.type === "warn" ? "bg-orange-500" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}