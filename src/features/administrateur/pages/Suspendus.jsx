import { useState, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);
const pad = (n) => String(n).padStart(2, "0");
const MOIS = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
function formatDate(d) {
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MOCK = [
  {
    id: 1,
    initiales: "DM",
    nom: "Dr. Mbang",
    specialite: "Pneumologue",
    etablissement: "Clinique Sud, Douala",
    cnom: "CM-2020-0345",
    raison: "Signalement d'un confrère — comportement non conforme à la déontologie",
    duree: "30 jours",
    dureeType: "limitee",
    suspenduLe: sub(24 * 3600 * 1000),
    suspenduPar: "Super Admin",
  },
];

function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 dark:text-[#484f58] hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors">
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  );
}

function ModaleSuppression({ medecin, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d]">
          <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">Supprimer le compte</p>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-red-200 dark:border-red-700/40 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Supprimer définitivement le compte de <strong className="mx-1">{medecin.nom}</strong> ? Toutes ses données seront effacées.
          </div>
          <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold px-1">Cette action est irréversible.</p>
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
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalePhoto({ medecin, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-80 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#21262d] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#21262d]">
          <div>
            <p className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">{medecin.nom}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Photo d'identité (CNI)</p>
          </div>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-8 gap-4">
          <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-[#21262d] bg-gray-50 dark:bg-[#1c2128] text-gray-400 dark:text-[#484f58]">
            <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-[10px] text-center px-2">Photo soumise à l'adhésion</span>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">{medecin.nom}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{medecin.specialite} · CNOM {medecin.cnom}</p>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-[#21262d]">
          <button onClick={onClose}
            className="w-full py-2 rounded-xl text-[12px] font-medium border border-gray-200 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d] transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MedecinsSuspendus() {
  useOutletContext();

  const [suspendus, setSuspendus] = useState(MOCK);
  const [modaleSuppr, setModaleSuppr] = useState(null);
  const [modalePhoto, setModalePhoto] = useState(null);
  const [toast, setToast]             = useState(null);

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

  const handleReactiver = useCallback((id) => {
    // await fetch(`/api/admin/medecins/${id}/reactiver`, { method: "POST" })
    setSuspendus(prev => prev.filter(m => m.id !== id));
    setToast({ msg: "Compte réactivé avec succès", type: "success" });
  }, []);

  const handleSupprimer = useCallback(() => {
    if (!modaleSuppr) return;
    // await fetch(`/api/admin/medecins/${modaleSuppr.id}`, { method: "DELETE" })
    setSuspendus(prev => prev.filter(m => m.id !== modaleSuppr.id));
    setToast({ msg: `Compte de ${modaleSuppr.nom} supprimé définitivement`, type: "error" });
    setModaleSuppr(null);
  }, [modaleSuppr]);

  const th = "px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58]";
  const td = "px-4 py-3.5 border-b border-gray-50 dark:border-[#21262d]";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">
          Comptes suspendus
        </h1>
        <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">
          {suspendus.length} compte{suspendus.length > 1 ? "s" : ""} suspendu{suspendus.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={th}>Médecin</th>
                <th className={th}>CNOM</th>
                <th className={th}>Raison</th>
                <th className={th}>Durée</th>
                <th className={th}>Suspendu le</th>
                <th className={th}>Suspendu par</th>
                <th className={`${th} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suspendus.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`${td} text-center py-14 text-[12px] text-gray-300 dark:text-[#484f58]`}>
                    Aucun compte suspendu
                  </td>
                </tr>
              ) : suspendus.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                  <td className={td}>
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setModalePhoto(m)}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gray-100 dark:bg-[#21262d] text-gray-600 dark:text-[#8b949e] group-hover:opacity-75 transition-opacity">
                        {m.initiales}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3] group-hover:underline underline-offset-2">{m.nom}</p>
                        <p className="text-[10px] text-gray-400 dark:text-[#484f58]">{m.specialite} · {m.etablissement}</p>
                      </div>
                    </div>
                  </td>

                  <td className={`${td} text-[11px] font-mono text-gray-400 dark:text-[#484f58]`}>{m.cnom}</td>

                  <td className={`${td} max-w-xs`}>
                    <span className="text-[11px] font-medium text-orange-500 dark:text-orange-400 leading-snug">{m.raison}</span>
                  </td>

                  <td className={td}>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      m.dureeType === "indefinie"
                        ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        : "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                    }`}>
                      {m.duree}
                    </span>
                  </td>

                  <td className={`${td} text-[11px] text-gray-400 dark:text-[#484f58] whitespace-nowrap`}>
                    {formatDate(m.suspenduLe)}
                  </td>

                  <td className={`${td} text-[11px] text-gray-500 dark:text-[#8b949e]`}>{m.suspenduPar}</td>

                  <td className={`${td} text-center`}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleReactiver(m.id)}
                        className="px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
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
        {suspendus.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 dark:border-[#21262d] text-[11px] text-gray-300 dark:text-[#484f58] text-right">
            Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
          </div>
        )}
      </div>

      {modalePhoto  && <ModalePhoto    medecin={modalePhoto}  onClose={() => setModalePhoto(null)} />}
      {modaleSuppr  && <ModaleSuppression medecin={modaleSuppr} onClose={() => setModaleSuppr(null)} onConfirm={handleSupprimer} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            {toast.type === "success"
              ? <polyline points="20 6 9 17 4 12"/>
              : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}