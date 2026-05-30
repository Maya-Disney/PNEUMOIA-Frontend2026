import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CONSULTATIONS_SEMAINE = [
  { jour: "L 24", val: 420 }, { jour: "M 25", val: 510 },
  { jour: "M 26", val: 480 }, { jour: "J 27", val: 590 },
  { jour: "V 28", val: 735 }, { jour: "S 29", val: 620 },
  { jour: "D 30", val: 680 },
];

const INSCRIPTIONS_MOIS = [
  { mois: "Jan", val: 2 }, { mois: "Fév", val: 4 },
  { mois: "Mar", val: 3 }, { mois: "Avr", val: 6 },
  { mois: "Mai", val: 8 }, { mois: "Juin", val: 5 },
];

const VILLES = [
  { ville: "Douala",     medecins: 18, consultations: 2240 },
  { ville: "Yaoundé",   medecins: 12, consultations: 1540 },
  { ville: "Bafoussam", medecins: 4,  consultations: 580  },
  { ville: "Garoua",    medecins: 3,  consultations: 320  },
  { ville: "Bertoua",   medecins: 1,  consultations: 141  },
];

const TOP_MEDECINS = [
  { initiales: "DK", couleur: "bg-blue-600",   nom: "Dr. Kamto Diane",   consultations: 3201, concordance: 92, statut: "Actif"    },
  { initiales: "JD", couleur: "bg-teal-600",   nom: "Dr. Jean Dupont",   consultations: 4821, concordance: 88, statut: "Actif"    },
  { initiales: "AS", couleur: "bg-emerald-600",nom: "Dr. Aminata Sow",   consultations: 1243, concordance: 82, statut: "Actif"    },
  { initiales: "DM", couleur: "bg-purple-600", nom: "Dr. Mbang",         consultations: 987,  concordance: 74, statut: "Suspendu" },
];

const KPIS = [
  { label: "Médecins actifs",       val: "38",    sub: "+3 ce mois",  color: "text-green-600 dark:text-[#22c55e]",  ibg: "bg-green-50 dark:bg-green-900/20",  icolor: "text-green-600 dark:text-[#22c55e]"  },
  { label: "Consultations totales", val: "4 821", sub: "+247 ce mois", color: "text-gray-800 dark:text-[#e6edf3]",  ibg: "bg-blue-50 dark:bg-blue-900/20",    icolor: "text-blue-500 dark:text-blue-400"    },
  { label: "Précision modèle IA",   val: "94%",   sub: "+1.2% ce mois",color: "text-gray-800 dark:text-[#e6edf3]",  ibg: "bg-purple-50 dark:bg-purple-900/20",icolor: "text-purple-500 dark:text-purple-400"},
  { label: "Taux de concordance",   val: "84%",   sub: "Moy. médecins", color: "text-gray-800 dark:text-[#e6edf3]",  ibg: "bg-amber-50 dark:bg-amber-900/20",  icolor: "text-amber-500 dark:text-amber-400"  },
];

const ICONES = {
  stethoscope: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4.8 2.3A.3.3 0 105 2H4"/><path d="M8 2h-.2a.3.3 0 100 .6"/><path d="M6 2v6a6 6 0 006 6v0a6 6 0 006-6V8"/><circle cx="18" cy="11" r="3"/></svg>,
  activity:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  brain:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.58A3 3 0 015 10a3 3 0 013-3 2.5 2.5 0 011.5-5zM14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.58A3 3 0 0019 10a3 3 0 00-3-3 2.5 2.5 0 00-1.5-5z"/></svg>,
  trending:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

const ICONE_LIST = [ICONES.stethoscope, ICONES.activity, ICONES.brain, ICONES.trending];

const maxVille = Math.max(...VILLES.map(v => v.consultations));

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-[11px] shadow-md ${dark ? "bg-[#161b22] border-[#21262d] text-[#e6edf3]" : "bg-white border-gray-200 text-gray-800"}`}>
      <p className="font-bold">{label}</p>
      <p className={dark ? "text-[#22c55e]" : "text-green-600"}>{payload[0].value} consultations</p>
    </div>
  );
}

export default function Statistiques() {
  const { dark } = useOutletContext();
  const [periodeActif, setPeriodeActif] = useState("Semaine");
  const chartData = periodeActif === "Semaine" ? CONSULTATIONS_SEMAINE : INSCRIPTIONS_MOIS;
  const chartKey  = periodeActif === "Semaine" ? "jour" : "mois";

  const axisColor  = dark ? "#484f58" : "#9ca3af";
  const gridColor  = dark ? "#21262d" : "#f3f4f6";
  const barColor   = "#16a34a";
  const lineColor  = "#16a34a";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">Statistiques</h1>
        <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">Vue globale de l'activité de la plateforme PneumoIA CEMAC</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {KPIS.map(({ label, val, sub, color, ibg, icolor }, i) => (
          <div key={label} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${ibg}`}>
              <span className={icolor}>{ICONE_LIST[i]}</span>
            </div>
            <p className={`text-xl font-black tracking-tight ${color}`}>{val}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{label}</p>
            <p className="text-[9px] text-green-600 dark:text-[#22c55e] font-semibold mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-2 gap-4">

        {/* Consultations */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Activité consultations</p>
              <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Nombre de consultations enregistrées</p>
            </div>
            <div className="flex gap-1">
              {["Semaine","Inscriptions"].map(p => (
                <button key={p} onClick={() => setPeriodeActif(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    periodeActif === p
                      ? "bg-green-600 dark:bg-green-700 border-green-600 text-white"
                      : "border-gray-200 dark:border-[#21262d] text-gray-400 dark:text-[#484f58] hover:text-gray-700 dark:hover:text-[#e6edf3]"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey={chartKey} tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: dark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)" }} />
              <Bar dataKey="val" fill={barColor} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution inscriptions */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Évolution des inscriptions</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Nouveaux médecins validés par mois</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={INSCRIPTIONS_MOIS}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="mois" tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ stroke: gridColor }} />
              <Line type="monotone" dataKey="val" stroke={lineColor} strokeWidth={2} dot={{ fill: lineColor, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ligne 2 */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-4">

        {/* Répartition géo */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Répartition géographique</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Médecins & consultations par ville</p>
          </div>
          <div className="flex flex-col gap-3">
            {VILLES.map(v => (
              <div key={v.ville}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-gray-700 dark:text-[#8b949e]">{v.ville}</span>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-[#484f58]">
                    <span>{v.medecins} médecin{v.medecins > 1 ? "s" : ""}</span>
                    <span className="font-bold text-gray-700 dark:text-[#e6edf3]">{v.consultations.toLocaleString("fr-FR")}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 dark:bg-[#22c55e] transition-all"
                    style={{ width: `${Math.round((v.consultations / maxVille) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top médecins */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Top médecins par activité</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Classés par nombre de consultations</p>
          </div>
          <div className="flex flex-col gap-2">
            {[...TOP_MEDECINS].sort((a,b) => b.consultations - a.consultations).map((m, i) => (
              <div key={m.nom} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#1c2128] border border-gray-100 dark:border-[#21262d]">
                <span className="text-[10px] font-black text-gray-300 dark:text-[#484f58] w-4 text-center">#{i+1}</span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${m.couleur}`}>{m.initiales}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 dark:text-[#e6edf3] truncate">{m.nom}</p>
                  <p className="text-[9px] text-gray-400 dark:text-[#484f58]">Concordance IA : {m.concordance}%</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-black text-gray-800 dark:text-[#e6edf3]">{m.consultations.toLocaleString("fr-FR")}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    m.statut === "Actif"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  }`}>{m.statut}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Concordance IA */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
        <div className="mb-4">
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Concordance médecin / modèle IA</p>
          <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">Taux d'accord entre le diagnostic IA et l'avis du médecin</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {TOP_MEDECINS.map(m => (
            <div key={m.nom} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 ${m.couleur}`}>{m.initiales}</div>
                <p className="text-[10px] font-semibold text-gray-700 dark:text-[#8b949e] truncate">{m.nom.replace("Dr. ","")}</p>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${m.concordance}%`, background: m.concordance >= 85 ? "#16a34a" : m.concordance >= 75 ? "#f59e0b" : "#ef4444" }} />
              </div>
              <p className={`text-[11px] font-black ${m.concordance >= 85 ? "text-green-600 dark:text-[#22c55e]" : m.concordance >= 75 ? "text-amber-500" : "text-red-500"}`}>
                {m.concordance}%
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}