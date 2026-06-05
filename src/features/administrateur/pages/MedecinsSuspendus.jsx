import { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, X, AlertTriangle, User } from "lucide-react";

const BRAND = "#0f766e";
const NOW   = new Date();
const sub   = (ms) => new Date(NOW.getTime() - ms);
const pad   = (n)  => String(n).padStart(2, "0");
function fmtDT(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }

const MOCK = [
  {
    id: 1, initials: "DM", nom: "Dr. Mbang",
    specialite: "Pneumologue", hopital: "Clinique Sud, Douala",
    cnom: "CM-2020-0345",
    raison: "Signalement d'un confrère — comportement non conforme à la déontologie",
    duree: "30 jours", dureeType: "limitee",
    suspenduLe: sub(24*3600000), suspenduPar: "Super Admin",
  },
  {
    id: 2, initials: "TD", nom: "Dr. Tamba Diallo",
    specialite: "Pneumologue", hopital: "Hôpital Laquintinie",
    cnom: "CM-2021-0789",
    raison: "Vérification d'identité requise — incohérence dans les documents soumis",
    duree: "Indéfinie", dureeType: "indefinie",
    suspenduLe: sub(5*24*3600000), suspenduPar: "Super Admin",
  },
];

// ── Modal générique ────────────────────────────────────────────────────────────
function Modal({ onClose, title, sub: subtitle, children, footer, dark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={13} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className={`flex gap-2 px-5 py-4 border-t ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal photo CNI ────────────────────────────────────────────────────────────
function ModalePhoto({ medecin: m, onClose, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title={m.nom} sub="Photo d'identité (CNI)"
      footer={
        <button onClick={onClose} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Fermer
        </button>
      }>
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed ${dark ? "border-[#21262d] bg-[#0d1117] text-[#484f58]" : "border-gray-200 bg-gray-50 text-gray-300"}`}>
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="text-[10px] text-center px-2">Photo soumise à l'adhésion</span>
        </div>
        <div className="text-center">
          <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{m.nom}</p>
          <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · CNOM {m.cnom}</p>
        </div>
      </div>
    </Modal>
  );
}

// ── Bouton pagination ─────────────────────────────────────────────────────────
function PagBtn({ onClick, disabled, label, dark }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg border text-[11px] transition-colors
        ${disabled
          ? dark?"border-[#21262d] text-[#484f58] cursor-not-allowed":"border-gray-100 text-gray-300 cursor-not-allowed"
          : dark?"border-[#21262d] text-[#8b949e] hover:bg-[#21262d]":"border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
      {label}
    </button>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function MedecinsSuspendus() {
  const { dark } = useOutletContext() || {};
  const [suspendus,   setSuspendus]   = useState(MOCK);
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [modalePhoto, setModalePhoto] = useState(null);
  const [toast,       setToast]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [perPage,     setPerPage]     = useState(10);

  const totalPages = Math.max(1, Math.ceil(suspendus.length / perPage));
  const paginated  = suspendus.slice((page-1)*perPage, page*perPage);
  const from = suspendus.length===0 ? 0 : (page-1)*perPage+1;
  const to   = Math.min(page*perPage, suspendus.length);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const esc = e => { if (e.key === "Escape") { setModaleSuppr(null); setModalePhoto(null); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const reactiver = useCallback((id) => {
    setSuspendus(p => p.filter(m => m.id !== id));
    setToast({ msg: "Compte réactivé avec succès", type: "success" });
  }, []);

  const supprimer = useCallback(() => {
    setSuspendus(p => p.filter(m => m.id !== modaleSuppr.id));
    setToast({ msg: `Compte de ${modaleSuppr.nom} supprimé définitivement`, type: "error" });
    setModaleSuppr(null);
  }, [modaleSuppr]);

  const th = `px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider border-b ${dark ? "text-[#484f58] border-[#21262d] bg-[#0d1117]/50" : "text-gray-400 border-gray-100 bg-gray-50"}`;
  const td = `px-4 py-3 border-b ${dark ? "border-[#21262d]" : "border-gray-50"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      <div>
        <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>
          Comptes suspendus
        </h1>
        <p className={`text-[12px] mt-1 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
          {suspendus.length} compte{suspendus.length > 1 ? "s" : ""} suspendu{suspendus.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                {["Médecin","CNOM","Raison de la suspension","Durée","Suspendu le","Suspendu par","Actions"].map(h => (
                  <th key={h} className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>
                    Aucun compte suspendu
                  </td>
                </tr>
              ) : paginated.map(m => (
                <tr key={m.id} className={`transition-colors ${dark ? "hover:bg-[#0d1117]/60" : "hover:bg-gray-50/80"}`}>

                  {/* Médecin — cliquable → photo CNI */}
                  <td className={td}>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setModalePhoto(m)}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 group-hover:opacity-75 transition-opacity ${dark ? "bg-[#21262d] text-[#8b949e]" : "bg-gray-100 text-gray-600"}`}>
                        {m.initials}
                      </div>
                      <div>
                        <p className={`text-[12px] font-bold group-hover:underline underline-offset-2 ${dark ? "text-white" : "text-gray-800"}`}>{m.nom}</p>
                        <p className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.specialite} · {m.hopital}</p>
                      </div>
                    </div>
                  </td>

                  <td className={`${td} text-[11px] font-mono ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{m.cnom}</td>

                  <td className={`${td} text-[11px] font-medium text-orange-500 dark:text-orange-400 max-w-xs`}>
                    {m.raison}
                  </td>

                  <td className={td}>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${m.dureeType === "indefinie" ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"}`}>
                      {m.duree}
                    </span>
                  </td>

                  <td className={`${td} text-[11px] whitespace-nowrap ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
                    {fmtDT(m.suspenduLe)}
                  </td>

                  <td className={`${td} text-[11px] ${dark ? "text-[#8b949e]" : "text-gray-500"}`}>{m.suspenduPar}</td>

                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => reactiver(m.id)}
                        className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-teal-200 dark:border-teal-700/40 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                        Réactiver
                      </button>
                      <button onClick={() => setModaleSuppr(m)}
                        className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-red-200 dark:border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t text-[11px] ${dark?"border-[#21262d] text-[#484f58]":"border-gray-50 text-gray-400"}`}>
          <span>Affichage {from} à {to} sur {suspendus.length} compte{suspendus.length>1?"s":""}</span>
          <div className="flex items-center gap-2">
            <span>Lignes :</span>
            <select value={perPage} onChange={e=>{setPerPage(Number(e.target.value));setPage(1);}}
              className={`text-[11px] px-2 py-1 rounded-lg border outline-none cursor-pointer ${dark?"bg-[#0d1117] border-[#21262d] text-white":"bg-white border-gray-200 text-gray-700"}`}>
              {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <PagBtn onClick={()=>setPage(1)} disabled={page===1} label="«" dark={dark}/>
            <PagBtn onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} label="‹" dark={dark}/>
            {Array.from({length:totalPages},(_,i)=>i+1)
              .filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1)
              .reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push("…"+idx);acc.push(p);return acc;},[])
              .map(p=>typeof p==="string"
                ? <span key={p} className="px-1 opacity-30">…</span>
                : <button key={p} onClick={()=>setPage(p)}
                    className="w-7 h-7 rounded-lg border text-[11px] font-medium transition-colors"
                    style={p===page?{background:BRAND,borderColor:BRAND,color:"#fff"}:{}}>{p}</button>
              )}
            <PagBtn onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} label="›" dark={dark}/>
            <PagBtn onClick={()=>setPage(totalPages)} disabled={page===totalPages} label="»" dark={dark}/>
          </div>
        </div>
      </div>

      {/* Modale photo CNI */}
      {modalePhoto && (
        <ModalePhoto medecin={modalePhoto} dark={dark} onClose={() => setModalePhoto(null)} />
      )}

      {/* Modale suppression */}
      {modaleSuppr && (
        <Modal dark={dark} onClose={() => setModaleSuppr(null)} title="Supprimer le compte" sub={modaleSuppr.nom}
          footer={
            <>
              <button onClick={() => setModaleSuppr(null)}
                className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Annuler
              </button>
              <button onClick={supprimer}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold transition-colors">
                Supprimer définitivement
              </button>
            </>
          }>
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px] ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              Supprimer définitivement le compte de <strong className="mx-1">{modaleSuppr.nom}</strong> ? Toutes ses données seront effacées.
            </div>
            <div className={`rounded-xl border px-4 py-3 text-[11px] ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
              {[
                { l: "Médecin",      v: modaleSuppr.nom },
                { l: "CNOM",         v: modaleSuppr.cnom },
                { l: "Raison",       v: modaleSuppr.raison },
                { l: "Suspendu le",  v: fmtDT(modaleSuppr.suspenduLe) },
              ].map(({ l, v }) => (
                <div key={l} className={`flex items-start justify-between gap-3 py-1.5 border-b last:border-0 ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
                  <span className={dark ? "text-[#484f58]" : "text-gray-400"}>{l}</span>
                  <span className={`font-semibold text-right max-w-[200px] ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}