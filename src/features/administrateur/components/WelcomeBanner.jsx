import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BRAND     = "#0a5c55";
const BRAND_MID = "#0f766e";
const BRAND_L   = "#0d9488";

const PHRASES = [
  "Bon retour parmi nous, Administrateur",
  "Bienvenue, Administrateur",
  "Content de vous revoir, Administrateur",
];

const JOURS   = ["L","M","M","J","V","S","D"];
const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_SH = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day  = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m)    { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

// Hook typewriter — écrit puis efface
function useTypewriter(phrases, typeSpeed = 55, deleteSpeed = 30, pause = 1800) {
  const [display, setDisplay] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [phase, setPhase] = useState("typing"); // "typing" | "pausing" | "deleting"

  useEffect(() => {
    const phrase = phrases[phraseIdx];

    if (phase === "typing") {
      if (display.length < phrase.length) {
        const t = setTimeout(() => setDisplay(phrase.slice(0, display.length + 1)), typeSpeed);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("deleting"), pause);
        return () => clearTimeout(t);
      }
    }

    if (phase === "deleting") {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay(display.slice(0, -1)), deleteSpeed);
        return () => clearTimeout(t);
      } else {
        setPhraseIdx(i => (i + 1) % phrases.length);
        setPhase("typing");
      }
    }
  }, [display, phase, phraseIdx]);

  return display;
}

export default function WelcomeBanner({ dark }) {
  const now = new Date();
  const text = useTypewriter(PHRASES);

  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  const isToday = (d) => d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
  const cells   = Array(getFirstDay(calYear, calMonth)).fill(null)
    .concat(Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1));

  function prev() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }
  function next() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  const pad      = (n) => String(n).padStart(2, "0");
  const JNOMS    = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
  const dayName  = JNOMS[(now.getDay() || 7) - 1].toUpperCase();
  const dateStr  = `${dayName} ${pad(now.getDate())} ${MOIS_SH[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;
  const semaine  = getWeekNumber(now);
  const pctAnnee = Math.round((now - new Date(now.getFullYear(), 0, 1)) / (365.25 * 86400000) * 100);
  const trim     = `T${Math.ceil((now.getMonth() + 1) / 3)} · ${now.getFullYear()}`;

  // Coloriser "Administrateur" en teal clair
  const adminWord = "Administrateur";
  const adminIdx  = text.indexOf(adminWord);
  let before = text, colored = "", after = "";
  if (adminIdx !== -1) {
    before  = text.slice(0, adminIdx);
    colored = text.slice(adminIdx, adminIdx + adminWord.length);
    after   = text.slice(adminIdx + adminWord.length);
  }

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch"
      style={{
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 55%, ${BRAND_L} 100%)`,
        minHeight: 170,
      }}
    >
      {/* Motif */}
      <div style={{ position:"absolute", inset:0, opacity:.04,
        backgroundImage:"radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
        backgroundSize:"20px 20px", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:-60, right:270, width:200, height:200, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(255,255,255,.1), transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%",
        background:"radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)", pointerEvents:"none" }} />

      {/* ── Gauche ── */}
      <div className="relative flex-1 flex flex-col justify-between p-5 md:p-6">

        <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color:"rgba(255,255,255,.5)" }}>
          {dateStr} · SEMAINE {semaine}
        </p>

        {/* Texte typewriter */}
        <div className="mb-5" style={{ minHeight: 90 }}>
          <p style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            color: "#fff",
          }}>
            {before}
            <span style={{ color:"#5eead4", textShadow:"0 0 40px rgba(94,234,212,.4)" }}>
              {colored}
            </span>
            {after}
            {/* Curseur clignotant */}
            <span style={{
              display: "inline-block",
              width: 2,
              height: "0.85em",
              background: "#5eead4",
              marginLeft: 3,
              verticalAlign: "middle",
              borderRadius: 2,
              animation: "blink 1s step-end infinite",
            }}/>
          </p>
        </div>

        {/* Pills */}
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

        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronLeft size={13} className={dark ? "text-white" : "text-gray-600"} />
          </button>
          <p className={`text-[12px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
            {MOIS_FR[calMonth]} {calYear}
          </p>
          <button onClick={next} className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronRight size={13} className={dark ? "text-white" : "text-gray-600"} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {JOURS.map((j, i) => (
            <p key={i} className={`text-center text-[9px] font-bold py-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{j}</p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => (
            <div key={i} className="flex items-center justify-center h-6">
              {day ? (
                <button
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold transition-all ${
                    isToday(day) ? "text-white font-black"
                      : dark ? "text-white/70 hover:bg-white/10"
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

      {/* CSS blink */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}