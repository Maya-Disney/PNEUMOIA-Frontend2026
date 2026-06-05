import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import {
  ArrowLeft, Download, Printer, Mail, Phone, MapPin, Building2,
  ShieldOff, Trash2, X, AlertTriangle, Users, Stethoscope,
  Brain, Trophy, Share2, Clock
} from "lucide-react";

const BRAND = "#0f766e";
const pad   = (n) => String(n).padStart(2, "0");
function fmt(d) {
  const dt = new Date(d);
  return `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()}`;
}
function fmtHeure(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Hier";
  if (days < 30)  return `Il y a ${days}j`;
  return fmt(iso);
}
function avatarColor(str = "") {
  const colors = ["#0f766e","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

const MOCK_MEDECINS = {
  1: {
    id:1, initials:"JD",
    nom:"Dr. Jean Dupont", specialite:"Pneumologue", cnom:"CM-2019-0847",
    hopital:"H. Général Douala", ville:"Douala",
    email:"j.dupont@hgd.cm", telephone:"+237 699 123 456",
    patients:134, consultations:4821, concordanceIA:88,
    rangCommunaute:"#7/38", casPartages:"247 cas publiés",
    derniereActivite: new Date(Date.now()-2*3600000).toISOString(),
    activiteRecente:[
      {texte:"Consultation #247 enregistrée", quand:"Auj. 14:22"},
      {texte:"Cas #241 partagé",               quand:"Hier"},
    ],
    statut:"Actif",
    creeLE: fmt(new Date(Date.now()-180*86400000)),
    valideLE: fmt(new Date(Date.now()-177*86400000)),
  },
  2: {
    id:2, initials:"DK",
    nom:"Dr. Kamto Diane", specialite:"Pneumologue", cnom:"CM-2017-0432",
    hopital:"CHU Yaoundé", ville:"Yaoundé",
    email:"d.kamto@chu.cm", telephone:"+237 677 234 567",
    patients:198, consultations:3201, concordanceIA:92,
    rangCommunaute:"#3/38", casPartages:"312 cas publiés",
    derniereActivite: new Date(Date.now()-30*60000).toISOString(),
    activiteRecente:[
      {texte:"Consultation #198 enregistrée", quand:"Auj. 09:10"},
    ],
    statut:"Actif",
    creeLE: fmt(new Date(Date.now()-90*86400000)),
    valideLE: fmt(new Date(Date.now()-88*86400000)),
  },
};

const RAISONS_SUSPENSION = [
  "— Choisir une raison —",
  "Signalement d'un confrère",
  "Comportement non conforme",
  "Vérification d'identité requise",
  "Incohérence dans les documents",
  "Inactivité prolongée",
  "Autre",
];

function Modal({ onClose, title, subtitle, children, footer, dark }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden
        ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0
          ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
          <div>
            <p className={`text-[13px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>{title}</p>
            {subtitle && <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors
              ${dark ? "text-[#484f58] hover:bg-[#21262d]" : "text-gray-400 hover:bg-gray-100"}`}>
            <X size={13}/>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className={`shrink-0 flex gap-2 px-5 py-4 border-t
            ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ModaleSuspension({ m, onClose, onConfirm, dark }) {
  const [raison, setRaison] = useState(RAISONS_SUSPENSION[0]);
  const [note, setNote]     = useState("");
  const valid = raison !== RAISONS_SUSPENSION[0];
  return (
    <Modal dark={dark} onClose={onClose} title="Suspendre le compte" subtitle={m.nom}
      footer={<>
        <button onClick={onClose}
          className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border
            ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Annuler
        </button>
        <button disabled={!valid} onClick={() => onConfirm(raison, note)}
          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-[12px] font-bold transition-colors">
          Suspendre
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px]
          ${dark ? "bg-amber-900/20 border-amber-700/40 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          Le médecin ne pourra plus se connecter pendant la suspension.
        </div>
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${dark ? "text-[#484f58]" : "text-gray-500"}`}>
            Raison <span className="text-red-500">*</span>
          </label>
          <select value={raison} onChange={e => setRaison(e.target.value)}
            className={`w-full text-[11px] px-3 py-2 rounded-xl border outline-none
              ${dark ? "bg-[#0d1117] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-700"}`}>
            {RAISONS_SUSPENSION.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={`block text-[10px] font-bold mb-1 ${dark ? "text-[#484f58]" : "text-gray-500"}`}>
            Note interne (optionnel)
          </label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
            placeholder="Précisions supplémentaires…"
            className={`w-full text-[11px] px-3 py-2 rounded-xl border outline-none resize-none
              ${dark ? "bg-[#0d1117] border-[#21262d] text-white placeholder-[#484f58]" : "bg-white border-gray-200 text-gray-700 placeholder-gray-300"}`}/>
        </div>
      </div>
    </Modal>
  );
}

function ModaleSuppression({ m, onClose, onConfirm, dark }) {
  return (
    <Modal dark={dark} onClose={onClose} title="Supprimer le compte" subtitle={m.nom}
      footer={<>
        <button onClick={onClose}
          className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border
            ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
          Annuler
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold">
          Supprimer définitivement
        </button>
      </>}>
      <div className="flex flex-col gap-3">
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-[11px]
          ${dark ? "bg-red-900/20 border-red-700/40 text-red-300" : "bg-red-50 border-red-200 text-red-700"}`}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5"/>
          Supprimer définitivement <strong className="mx-1">{m.nom}</strong> ? Action irréversible.
        </div>
        <div className={`rounded-xl border px-4 py-3 text-[11px]
          ${dark ? "bg-[#0d1117] border-[#21262d]" : "bg-gray-50 border-gray-100"}`}>
          {[
            {l:"Médecin",   v:m.nom},
            {l:"CNOM",      v:m.cnom},
            {l:"Créé le",   v:m.creeLE},
            {l:"Validé le", v:m.valideLE},
          ].map(({l,v}) => (
            <div key={l} className={`flex items-center justify-between py-1.5 border-b last:border-0
              ${dark ? "border-[#21262d]" : "border-gray-100"}`}>
              <span className={dark ? "text-[#484f58]" : "text-gray-400"}>{l}</span>
              <span className={`font-semibold ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{v}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-red-500 font-semibold">Cette action est irréversible.</p>
      </div>
    </Modal>
  );
}

function StatCard({ icon: Icon, label, value, sub, dark }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-4 rounded-2xl border
      ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{background: `${BRAND}20`}}>
        <Icon size={16} style={{color: BRAND}}/>
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-semibold uppercase tracking-wide truncate
          ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{label}</p>
        <p className={`text-xl font-black mt-0.5 ${dark ? "text-white" : "text-gray-900"}`}>{value}</p>
        {sub && <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function ProfilMedecin() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const location       = useLocation();
  const { dark }       = useOutletContext() || {};
  const [m, setM]      = useState(null);
  const [modaleSusp,   setModaleSusp]   = useState(false);
  const [modaleSuppr,  setModaleSuppr]  = useState(false);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    if (location.state?.medecin) {
      setM(location.state.medecin);
      return;
    }
    const mock = MOCK_MEDECINS[Number(id)];
    if (mock) { setM(mock); return; }
    navigate("/administrateur/medecins");
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function telechargerPDF() {
    const style = document.createElement("style");
    style.id = "__print_style";
    style.textContent = `@media print { body * { visibility: hidden } #profil-print, #profil-print * { visibility: visible } #profil-print { position: absolute; top:0; left:0; width:100%; } }`;
    document.head.appendChild(style);
    window.print();
    document.getElementById("__print_style")?.remove();
  }

  function handleSuspension(raison) {
    setM(prev => ({ ...prev, statut: "Suspendu" }));
    setToast({ msg: `${m.nom} suspendu — raison : ${raison}`, type: "warn" });
    setModaleSusp(false);
  }

  function handleSuppression() {
    setToast({ msg: `Compte de ${m.nom} supprimé`, type: "error" });
    setModaleSuppr(false);
    setTimeout(() => navigate("/administrateur/medecins"), 1500);
  }

  if (!m) return (
    <div className={`flex items-center justify-center h-64 text-[13px] ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
      Chargement…
    </div>
  );

  const patients      = m.patients      ?? 0;
  const consultations = m.consultations ?? 0;
  const concordanceIA = m.concordanceIA != null ? `${m.concordanceIA}%` : "—";
  const rangCommunaute= m.rangCommunaute ?? "—";
  const casPartages   = m.casPartages   ?? "—";
  const activiteRecente = Array.isArray(m.activiteRecente) ? m.activiteRecente : [];
  const ac = m.avatarColor || avatarColor(m.nom || "");

  const statutColor = m.statut === "Actif"
    ? "bg-emerald-400/10 text-emerald-600 border-emerald-200"
    : m.statut === "Suspendu"
    ? "bg-amber-400/10 text-amber-600 border-amber-200"
    : "bg-gray-100 text-gray-500 border-gray-200";

  return (
    <div id="profil-print" className="flex flex-col gap-5 max-w-[1100px] mx-auto">

      {/* Breadcrumb / retour */}
      <button onClick={() => navigate("/administrateur/medecins")}
        className={`flex items-center gap-2 text-[12px] font-semibold w-fit px-3 py-1.5 rounded-xl border transition-colors
          ${dark ? "border-[#21262d] text-[#484f58] hover:bg-[#21262d] hover:text-white" : "border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700"}`}>
        <ArrowLeft size={13}/> Retour à la liste
      </button>

      {/* Header médecin */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border
        ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shrink-0"
          style={{background: ac}}>
          {m.initials || (m.nom?.[0]?.toUpperCase() ?? "?")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={`text-xl font-black tracking-tight ${dark ? "text-white" : "text-gray-900"}`}>{m.nom}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statutColor}`}>
              {m.statut || "Actif"}
            </span>
          </div>
          <p className={`text-[12px] mt-0.5 ${dark ? "text-[#8b949e]" : "text-gray-400"}`}>
            {m.specialite} · {m.hopital || "—"} · {m.ville || "—"}
          </p>
          <p className={`text-[11px] mt-1 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
            CNOM : <span className="font-mono font-semibold">{m.cnom}</span>
            {m.creeLE && <> · Créé le {m.creeLE}</>}
            {m.valideLE && <> · Validé le <span style={{color:BRAND}}>{m.valideLE}</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={telechargerPDF}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-semibold transition-colors
              ${dark ? "border-[#21262d] text-[#8b949e] hover:bg-[#21262d]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <Printer size={12}/> PDF
          </button>
          <button onClick={() => setModaleSusp(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold transition-colors">
            <ShieldOff size={12}/> Suspendre
          </button>
          <button onClick={() => setModaleSuppr(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-[11px] font-semibold transition-colors">
            <Trash2 size={12}/> Supprimer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}       label="Patients"       value={patients}      dark={dark}/>
        <StatCard icon={Stethoscope} label="Consultations"  value={consultations} dark={dark}/>
        <StatCard icon={Brain}       label="Concordance IA" value={concordanceIA} dark={dark}/>
        <StatCard icon={Trophy}      label="Rang communauté" value={rangCommunaute} sub={casPartages} dark={dark}/>
      </div>

      {/* Détails + Activité */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Coordonnées */}
        <div className={`rounded-2xl border p-5 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
          <h2 className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
            Coordonnées
          </h2>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: Mail,      label: "Email",        value: m.email     || "—" },
              { icon: Phone,     label: "Téléphone",    value: m.telephone || "—" },
              { icon: Building2, label: "Établissement",value: m.hopital   || "—" },
              { icon: MapPin,    label: "Ville",        value: m.ville     || "—" },
              { icon: Download,  label: "CNOM",         value: m.cnom      || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                  ${dark ? "bg-[#0d1117]" : "bg-gray-50"}`}>
                  <Icon size={12} className={dark ? "text-[#484f58]" : "text-gray-400"}/>
                </div>
                <div className="min-w-0">
                  <p className={`text-[9px] font-bold uppercase tracking-wide ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{label}</p>
                  <p className={`text-[12px] font-semibold truncate ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className={`rounded-2xl border p-5 ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-[11px] font-bold uppercase tracking-wider ${dark ? "text-[#484f58]" : "text-gray-400"}`}>
              Activité récente
            </h2>
            {m.derniereActivite && (
              <span className={`text-[10px] ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
                Dernière : {fmtHeure(m.derniereActivite)}
              </span>
            )}
          </div>
          {activiteRecente.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-8 gap-2 ${dark ? "text-[#484f58]" : "text-gray-300"}`}>
              <Clock size={22}/>
              <p className="text-[11px]">Aucune activité récente</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activiteRecente.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border
                  ${dark ? "border-[#21262d] bg-[#0d1117]/40" : "border-gray-100 bg-gray-50"}`}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{background:BRAND}}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{a.texte}</p>
                    {a.quand && <p className={`text-[10px] mt-0.5 ${dark ? "text-[#484f58]" : "text-gray-400"}`}>{a.quand}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cas partagés */}
          {casPartages !== "—" && (
            <div className={`flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl border
              ${dark ? "border-[#21262d] bg-[#0d1117]/40" : "border-gray-100 bg-gray-50"}`}>
              <Share2 size={12} style={{color:BRAND}} className="shrink-0"/>
              <p className={`text-[11px] font-semibold ${dark ? "text-[#8b949e]" : "text-gray-700"}`}>{casPartages}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modaleSusp  && <ModaleSuspension  m={m} dark={dark} onClose={() => setModaleSusp(false)}  onConfirm={handleSuspension}/>}
      {modaleSuppr && <ModaleSuppression m={m} dark={dark} onClose={() => setModaleSuppr(false)} onConfirm={handleSuppression}/>}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-[12px] font-semibold text-white
          ${toast.type === "error" ? "bg-red-600" : toast.type === "warn" ? "bg-amber-500" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
