import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Teal moins vif
const BRAND     = "#0a5c55";
const BRAND_MID = "#0f766e";
const BRAND_L   = "#0d9488";

// Message complet animé (préfixe + Administrateur ensemble)
const MESSAGES = [
  "Bon retour, Administrateur",
  "Bienvenue, Administrateur",
];

const JOURS    = ["L","M","M","J","V","S","D"];
const MOIS_FR  = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_SH  = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day  = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

export default function WelcomeBanner({ dark }) {
  const now = new Date();

  // ── Message animé ──
  const [msgIdx,  setMsgIdx]  = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setMsgIdx(i => (i + 1) % MESSAGES.length); setVisible(true); }, 500);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // ── Calendrier ──
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const isToday  = (d) => d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
  const cells    = Array(getFirstDay(calYear, calMonth)).fill(null)
    .concat(Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1));

  function prev() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function next() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  // ── Infos ──
  const pad      = (n) => String(n).padStart(2, "0");
  const JNOMS    = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
  const dayName  = JNOMS[(now.getDay() || 7) - 1].toUpperCase();
  const dateStr  = `${dayName} ${pad(now.getDate())} ${MOIS_SH[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;
  const semaine  = getWeekNumber(now);
  const pctAnnee = Math.round((now - new Date(now.getFullYear(), 0, 1)) / (365.25 * 86400000) * 100);
  const trim     = `T${Math.ceil((now.getMonth() + 1) / 3)} · ${now.getFullYear()}`;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch"
      style={{
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 55%, ${BRAND_L} 100%)`,
        minHeight: 160,
      }}
    >
      {/* Motif */}
      <div style={{ position:"absolute", inset:0, opacity:.04,
        backgroundImage:"radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
        backgroundSize:"20px 20px", pointerEvents:"none" }} />
      {/* Cercles déco */}
      <div style={{ position:"absolute", top:-60, right:270, width:200, height:200, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(255,255,255,.1), transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)", pointerEvents:"none" }} />

      {/* ── Gauche ── */}
      <div className="relative flex-1 flex flex-col justify-between p-5 md:p-6">

        {/* Date */}
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color:"rgba(255,255,255,.5)" }}>
          {dateStr} · SEMAINE {semaine}
        </p>

        {/* Message animé — tout le bloc s'anime */}
        <div className="mb-5 min-h-[76px] flex flex-col justify-center">
          <div
            className="transition-all duration-500"
            style={{
              opacity:   visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <p className="text-2xl md:text-3xl font-black leading-tight text-white">
              {MESSAGES[msgIdx]}
            </p>
          </div>
        </div>

        {/* Pills — sans demande urgente */}
        <div className="flex flex-wrap gap-2">
          {[`Sem. ${semaine}`, `${pctAnnee}% de l'année`, trim].map(p => (
            <span key={p} className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background:"rgba(255,255,255,.14)", color:"#fff", border:"1px solid rgba(255,255,255,.2)" }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Calendrier ── */}
      <div className="relative shrink-0 m-3 md:m-4 rounded-xl p-3 md:p-4 w-full sm:w-60"
        style={{
          background:     dark ? "rgba(13,17,23,.78)" : "rgba(255,255,255,.92)",
          backdropFilter: "blur(10px)",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev}
            className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronLeft size={13} className={dark ? "text-white" : "text-gray-600"} />
          </button>
          <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
            {MOIS_FR[calMonth]} {calYear}
          </p>
          <button onClick={next}
            className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronRight size={13} className={dark ? "text-white" : "text-gray-600"} />
          </button>
        </div>

        {/* Noms jours */}
        <div className="grid grid-cols-7 mb-1">
          {JOURS.map((j, i) => (
            <p key={i} className={`text-center text-[9px] font-bold py-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>
              {j}
            </p>
          ))}
        </div>

        {/* Cases */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => (
            <div key={i} className="flex items-center justify-center h-6">
              {day ? (
                <button
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold transition-all ${
                    isToday(day)
                      ? "text-white font-black"
                      : dark
                        ? "text-white/70 hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={isToday(day) ? { background: BRAND_MID } : {}}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}