import { useEffect, useState } from "react";

const PHRASES = [
  "Bon retour, Administrateur",
  "Bienvenue, Administrateur",
  "Bonjour, Administrateur",
];

const CAL = [
  [27,28,29,30,1,2,3],
  [4,5,6,7,8,9,10],
  [11,12,13,14,15,16,17],
  [18,19,20,21,22,23,24],
  [25,26,27,28,29,30,31],
];

export default function HeroBanner() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const [msgIdx, setMsgIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = PHRASES[msgIdx];
    let timeout;

    if (!deleting) {
      if (displayed.length < current.length) {
        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 75);
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
      } else {
        setDeleting(false);
        setMsgIdx((msgIdx + 1) % PHRASES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, msgIdx]);

  return (
    <div className="rounded-xl bg-green-800 dark:bg-[#0f2d18] border border-green-700 dark:border-[#1a3a2a] p-5 grid grid-cols-[1fr_auto] gap-2 items-center relative overflow-hidden">
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{dateStr}</p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
          {displayed}
          <span className="inline-block w-[3px] h-[0.85em] bg-green-300 dark:bg-[#22c55e] ml-1 align-middle animate-pulse" />
        </h1>
        <div className="flex gap-2 mt-4 flex-wrap">
          {["Semaine 22", "41% de l'année", "T2 · 2026"].map(p => (
            <span key={p} className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/70">{p}</span>
          ))}
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/30">
            4 demandes urgentes
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl p-4 min-w-[220px] border border-gray-100 dark:border-[#21262d]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-gray-400 dark:text-[#484f58] cursor-pointer hover:text-gray-600 select-none">‹</span>
          <span className="text-[13px] font-bold text-gray-800 dark:text-[#e6edf3]">Mai 2026</span>
          <span className="text-[11px] text-gray-400 dark:text-[#484f58] cursor-pointer hover:text-gray-600 select-none">›</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {["L","M","M","J","V","S","D"].map((d,i) => (
            <div key={i} className="text-[9px] font-bold text-gray-300 dark:text-[#484f58] py-0.5">{d}</div>
          ))}
          {CAL.map((week, wi) => week.map((d, di) => (
            <div key={`${wi}-${di}`}
              className={`text-[10px] py-1 rounded cursor-pointer leading-none
                ${wi === 4 && d === 30
                  ? "bg-green-600 dark:bg-[#22c55e] text-white font-bold"
                  : wi === 0 && d > 20
                    ? "text-gray-200 dark:text-[#484f58]/50"
                    : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#21262d]"
                }`}
            >{d}</div>
          )))}
        </div>
      </div>
    </div>
  );
}
