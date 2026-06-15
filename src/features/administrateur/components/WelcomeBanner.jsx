import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { brand } from "../theme";

const MESSAGES = [
  "Bon retour, Administrateur",
  "Bienvenue, Administrateur",
  "Tableau de bord, Administrateur",
];

const ADMIN_WORD  = "Administrateur";
// Vert vif frappant, contraste fort sur le dégradé vert foncé
const ADMIN_COLOR = "#00ffcc";

const TYPE_SPEED  = 70;   // ms / lettre
const ERASE_SPEED = 35;   // ms / lettre (effacement plus rapide)
const PAUSE_FULL  = 2200; // pause quand le message est complet
const PAUSE_EMPTY = 350;  // pause avant le prochain message

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

/** Colorie le mot "Administrateur" avec ADMIN_COLOR, laisse le reste en blanc. */
function ColoredText({ text }) {
  const idx = text.indexOf(ADMIN_WORD);
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      <span>{text.slice(0, idx)}</span>
      <span style={{ color: ADMIN_COLOR }}>{text.slice(idx, idx + ADMIN_WORD.length)}</span>
      <span>{text.slice(idx + ADMIN_WORD.length)}</span>
    </>
  );
}

export default function WelcomeBanner({ dark }) {
  const now = new Date();

  // ── Typewriter ──
  const [msgIdx,    setMsgIdx]    = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase,     setPhase]     = useState("typing"); // "typing" | "pausing" | "erasing"
  const timeoutRef = useRef(null);

  useEffect(() => {
    const full = MESSAGES[msgIdx];

    if (phase === "typing") {
      if (displayed.length < full.length) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(full.slice(0, displayed.length + 1)),
          TYPE_SPEED
        );
      } else {
        timeoutRef.current = setTimeout(() => setPhase("erasing"), PAUSE_FULL);
      }
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(d => d.slice(0, -1)),
          ERASE_SPEED
        );
      } else {
        timeoutRef.current = setTimeout(() => {
          setMsgIdx(i => (i + 1) % MESSAGES.length);
          setPhase("typing");
        }, PAUSE_EMPTY);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, phase, msgIdx]);

  // ── Calendrier ──
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

  // ── Infos ──
  const pad      = (n) => String(n).padStart(2, "0");
  const JNOMS    = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
  const dayName  = JNOMS[(now.getDay() || 7) - 1].toUpperCase();
  const dateStr  = `${dayName} ${pad(now.getDate())} ${MOIS_SH[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;
  const semaine  = getWeekNumber(now);
  const pctAnnee = Math.round((now - new Date(now.getFullYear(), 0, 1)) / (365.25 * 86400000) * 100);
  const trim     = `T${Math.ceil((now.getMonth() + 1) / 3)} · ${now.getFullYear()}`;

  const showCursor = phase === "typing" || phase === "erasing";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch"
      style={{ background: brand.gradient, minHeight: 190 }}
    >
      {/* Motif de points discret */}
      <div style={{
        position: "absolute", inset: 0, opacity: .04,
        backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
        backgroundSize: "20px 20px", pointerEvents: "none",
      }} />

      {/* Cercles décoratifs — identiques à l'original */}
      <div style={{
        position: "absolute", top: -60, right: 270, width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,.1), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40, width: 160, height: 160,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Section gauche ── */}
      <div className="relative flex-1 flex flex-col justify-between p-6 md:p-8">

        {/* Date */}
        <p className="text-[12px] font-bold uppercase tracking-widest mb-3"
          style={{ color: "rgba(255,255,255,.5)" }}>
          {dateStr} · SEMAINE {semaine}
        </p>

        {/* Message typewriter */}
        <div className="mb-5 min-h-[76px] flex flex-col justify-center">
          <p className="text-4xl md:text-5xl font-black leading-tight text-white">
            <ColoredText text={displayed} />
            {/* Curseur clignotant */}
            {showCursor && (
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "0.85em",
                  marginLeft: "3px",
                  verticalAlign: "middle",
                  background: ADMIN_COLOR,
                  borderRadius: "1px",
                  animation: "wb-blink 1s step-end infinite",
                }}
              />
            )}
          </p>
        </div>

        {/* Pills info */}
        <div className="flex flex-wrap gap-2">
          {[`Sem. ${semaine}`, `${pctAnnee}% de l'année`, trim].map(p => (
            <span key={p} className="text-[12px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.2)",
              }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── Calendrier ── */}
      <div className="relative shrink-0 m-3 md:m-4 rounded-xl p-3 md:p-4 w-full sm:w-64"
        style={{
          background: dark ? "rgba(13,17,23,.78)" : "rgba(255,255,255,.92)",
          backdropFilter: "blur(10px)",
        }}>

        {/* Header mois */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronLeft size={14} className={dark ? "text-white" : "text-gray-600"} />
          </button>
          <p className={`text-[14px] font-bold ${dark ? "text-white" : "text-gray-800"}`}>
            {MOIS_FR[calMonth]} {calYear}
          </p>
          <button onClick={next}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-black/10">
            <ChevronRight size={14} className={dark ? "text-white" : "text-gray-600"} />
          </button>
        </div>

        {/* Noms des jours */}
        <div className="grid grid-cols-7 mb-1">
          {JOURS.map((j, i) => (
            <p key={i} className={`text-center text-[11px] font-bold py-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>
              {j}
            </p>
          ))}
        </div>

        {/* Cases */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => (
            <div key={i} className="flex items-center justify-center h-7">
              {day ? (
                <button
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold transition-all ${
                    isToday(day)
                      ? "text-white font-black"
                      : dark
                        ? "text-white/70 hover:bg-white/10"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                  style={isToday(day) ? { background: brand.DEFAULT } : {}}
                >
                  {day}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe curseur */}
      <style>{`@keyframes wb-blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
