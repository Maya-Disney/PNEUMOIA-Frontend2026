import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { getConsultationsSemaine } from "../api/adminApi";

const BRAND   = "#0f766e";
const COMPARE = "#8b5cf6";
const NOW     = new Date();
const pad     = (n) => String(n).padStart(2, "0");
const MOIS    = ["jan","fév","mar","avr","mai","juin","juil","août","sep","oct","nov","déc"];
const MOIS_LONG = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const PERIODES = [
  { key:"7j",  label:"7 jours",  nb:7  },
  { key:"14j", label:"14 jours", nb:14 },
  { key:"30j", label:"30 jours", nb:30 },
];

// ── Tooltip custom ──────────────────────────────────────────────────────────
function Tip({ active, payload, dark, nomActuel, nomPrec }) {
  if (!active || !payload?.length) return null;
  const a = payload.find(p => p.dataKey === "actuel");
  const p = payload.find(p => p.dataKey === "precedent");
  const ecart = a && p ? Math.round((a.value - p.value) / p.value * 100) : null;
  return (
    <div style={{
      background: dark?"#161b22":"#fff",
      border: `1px solid ${dark?"#21262d":"#e5e7eb"}`,
      borderRadius: 14, padding:"12px 16px", minWidth:180,
      boxShadow:"0 8px 32px rgba(0,0,0,.12)"
    }}>
      <div style={{marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <span style={{width:8,height:2,borderRadius:99,background:BRAND,display:"inline-block"}}/>
          <span style={{fontSize:10,fontWeight:700,color:BRAND}}>{payload[0]?.payload?.date}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{width:8,height:2,borderRadius:99,background:COMPARE,opacity:0.7,display:"inline-block"}}/>
          <span style={{fontSize:10,fontWeight:700,color:COMPARE}}>{payload[0]?.payload?.datePrec}</span>
        </div>
      </div>
      {a && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:8,height:8,borderRadius:99,background:BRAND,display:"inline-block"}}/>
            <span style={{fontSize:11,color:dark?"#8b949e":"#6b7280"}}>{nomActuel}</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:BRAND}}>{a.value?.toLocaleString("fr-FR")}</span>
        </div>
      )}
      {p && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,marginBottom:ecart!==null?8:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:8,height:8,borderRadius:99,background:COMPARE,display:"inline-block"}}/>
            <span style={{fontSize:11,color:dark?"#8b949e":"#6b7280"}}>{nomPrec}</span>
          </div>
          <span style={{fontSize:12,fontWeight:700,color:COMPARE}}>{p.value?.toLocaleString("fr-FR")}</span>
        </div>
      )}
      {ecart !== null && (
        <div style={{
          borderTop:`1px solid ${dark?"#21262d":"#f3f4f6"}`,
          paddingTop:8,
          display:"flex",alignItems:"center",justifyContent:"space-between"
        }}>
          <span style={{fontSize:10,color:dark?"#484f58":"#9ca3af"}}>Écart</span>
          <span style={{fontSize:11,fontWeight:700,color:ecart>=0?BRAND:"#dc2626"}}>
            {ecart>=0?"+":""}{ecart}%
          </span>
        </div>
      )}
    </div>
  );
}

// Génère des données mock depuis le 1er du mois sur N jours
function genMockData(annee, mois, nbJours) {
  // mois = 0-indexed
  return Array.from({ length: nbJours }, (_, i) => {
    const d  = new Date(annee, mois, i + 1); // 1er du mois + i jours
    const we = d.getDay() === 0 || d.getDay() === 6;
    const base = we ? 280 : 540;
    const noise = (Math.random() - 0.5) * 180;
    return {
      jour:  i + 1,
      label: `${pad(i + 1)} ${MOIS[mois]}`,
      date:  `${pad(i + 1)} ${MOIS[mois]}`,
      val:   Math.max(60, Math.round(base + noise)),
    };
  });
}

export default function CourbeActivite() {
  const { dark }    = useOutletContext() || {};
  const [periode,   setPeriode]  = useState("30j");
  const [loading,   setLoading]  = useState(true);
  const [dataActuel, setDataActuel] = useState([]);
  const [dataPrec,   setDataPrec]   = useState([]);

  const nb          = PERIODES.find(p => p.key === periode)?.nb || 30;
  const moisActuel  = MOIS_LONG[NOW.getMonth()];
  const moisPrec    = MOIS_LONG[new Date(NOW.getFullYear(), NOW.getMonth() - 1).getMonth()];

  useEffect(() => {
    setLoading(true);
    // Appel API réel
    Promise.all([
      getConsultationsSemaine(), // TODO: adapter endpoint pour mois actuel
      getConsultationsSemaine(), // TODO: adapter endpoint pour mois précédent
    ])
      .then(() => {
        // Fallback mock en attendant le backend
        // Mois actuel et mois précédent depuis le 1er de chaque mois
        const moisActuelIdx = NOW.getMonth();
        const moisPrecIdx   = moisActuelIdx === 0 ? 11 : moisActuelIdx - 1;
        const anneeActuel   = NOW.getFullYear();
        const anneePrec     = moisActuelIdx === 0 ? anneeActuel - 1 : anneeActuel;
        setDataActuel(genMockData(anneeActuel, moisActuelIdx, nb));
        setDataPrec(genMockData(anneePrec,    moisPrecIdx,   nb));
      })
      .catch(() => {
        const moisActuelIdx = NOW.getMonth();
        const moisPrecIdx   = moisActuelIdx === 0 ? 11 : moisActuelIdx - 1;
        const anneeActuel   = NOW.getFullYear();
        const anneePrec     = moisActuelIdx === 0 ? anneeActuel - 1 : anneeActuel;
        setDataActuel(genMockData(anneeActuel, moisActuelIdx, nb));
        setDataPrec(genMockData(anneePrec,    moisPrecIdx,   nb));
      })
      .finally(() => setLoading(false));
  }, [nb]);

  // Fusionner les données — label = date du mois actuel
  // tooltip montre date actuel ET date équivalente mois précédent
  const data = Array.from({ length: nb }, (_, i) => ({
    label:     dataActuel[i]?.label || `J${i+1}`,
    date:      dataActuel[i]?.date  || `J${i+1}`,
    datePrec:  dataPrec[i]?.date    || `J${i+1}`,
    actuel:    dataActuel[i]?.val   || 0,
    precedent: dataPrec[i]?.val     || 0,
  }));

  // Stats
  const totalActuel = data.reduce((s,d) => s + d.actuel, 0);
  const totalPrec   = data.reduce((s,d) => s + d.precedent, 0);
  const moyActuel   = Math.round(totalActuel / nb);
  const moyPrec     = Math.round(totalPrec   / nb);
  const variation   = totalPrec > 0 ? Math.round((totalActuel - totalPrec) / totalPrec * 100) : 0;
  const picActuel   = data.reduce((m,d) => d.actuel > m.actuel ? d : m, data[0] || {actuel:0});

  const ax = dark ? "#484f58" : "#cbd5e1";
  const gr = dark ? "#1e2836" : "#f8fafc";

  const card = `rounded-2xl border ${dark?"bg-[#161b22] border-[#21262d]":"bg-white border-gray-100 shadow-sm"}`;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-xl md:text-2xl font-black tracking-tight ${dark?"text-white":"text-gray-900"}`}>
            Courbe d'activité
          </h1>
          <p className={`text-[12px] mt-1 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
            <span style={{color:BRAND,fontWeight:700}}>{moisActuel}</span>
            {" "}vs{" "}
            <span style={{color:COMPARE,fontWeight:700}}>{moisPrec}</span>
            {" "}— {nb} derniers jours
          </p>
        </div>
        {/* Sélecteur */}
        <div className={`flex gap-1 p-1 rounded-xl border ${dark?"bg-[#0d1117] border-[#21262d]":"bg-gray-100 border-gray-200"}`}>
          {PERIODES.map(p => (
            <button key={p.key} onClick={() => setPeriode(p.key)}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={periode === p.key
                ? {background: BRAND, color:"#fff", boxShadow:"0 2px 8px rgba(15,118,110,.3)"}
                : {color: dark?"#484f58":"#9ca3af", background:"transparent"}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: `Total ${moisActuel}`,
            value: totalActuel.toLocaleString("fr-FR"),
            sub:   `${variation>=0?"+":""}${variation}% vs ${moisPrec}`,
            subColor: variation>=0?BRAND:"#dc2626",
            color: dark?"text-white":"text-gray-900",
          },
          {
            label: `Total ${moisPrec}`,
            value: totalPrec.toLocaleString("fr-FR"),
            sub:   "Période de référence",
            subColor: dark?"#484f58":"#9ca3af",
            color: dark?"text-[#8b949e]":"text-gray-500",
          },
          {
            label: "Moyenne / jour",
            value: moyActuel.toLocaleString("fr-FR"),
            sub:   `vs ${moyPrec.toLocaleString("fr-FR")} (${moisPrec})`,
            subColor: dark?"#484f58":"#9ca3af",
            color: "text-teal-600",
          },
          {
            label: `Pic — ${picActuel.date||""}`,
            value: picActuel.actuel?.toLocaleString("fr-FR") || "—",
            sub:   moisActuel,
            subColor: dark?"#484f58":"#9ca3af",
            color: "text-teal-600",
          },
        ].map(({ label, value, sub, subColor, color }) => (
          <div key={label} className={`${card} px-5 py-4`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark?"text-[#484f58]":"text-gray-400"}`}>{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] mt-1.5 font-medium" style={{color: subColor}}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique area */}
      <div className={`${card} p-6`}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className={`text-[13px] font-bold ${dark?"text-white":"text-gray-800"}`}>Consultations par jour</p>
            <p className={`text-[11px] mt-0.5 ${dark?"text-[#8b949e]":"text-gray-400"}`}>
              Courbes superposées — survol pour détails
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div style={{width:24,height:3,borderRadius:99,background:BRAND}}/>
              <span className={`text-[11px] font-medium ${dark?"text-[#8b949e]":"text-gray-500"}`}>{moisActuel}</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{width:24,height:3,borderRadius:99,background:COMPARE,opacity:0.7}}/>
              <span className={`text-[11px] font-medium ${dark?"text-[#8b949e]":"text-gray-500"}`}>{moisPrec}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p className={`text-[12px] ${dark?"text-[#484f58]":"text-gray-300"}`}>Chargement…</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{top:8,right:4,bottom:0,left:0}}>
              <defs>
                <linearGradient id="gradActuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={BRAND}   stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={BRAND}   stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradPrec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COMPARE} stopOpacity={0.12}/>
                  <stop offset="95%" stopColor={COMPARE} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gr}/>
              <XAxis
                dataKey="label" tick={{fontSize:9,fill:ax}}
                axisLine={false} tickLine={false}
                interval={nb===7?0:nb===14?1:4}
              />
              <YAxis tick={{fontSize:9,fill:ax}} axisLine={false} tickLine={false} width={36}/>
              <Tooltip content={<Tip dark={dark} nomActuel={moisActuel} nomPrec={moisPrec}/>} cursor={{stroke:gr,strokeWidth:2}}/>

              {/* Mois précédent */}
              <Area
                type="monotone" dataKey="precedent"
                stroke={COMPARE} strokeWidth={2} strokeOpacity={0.6}
                strokeDasharray="6 3"
                fill="url(#gradPrec)"
                dot={false}
                activeDot={{r:4,fill:COMPARE,stroke:"#fff",strokeWidth:2}}
              />
              {/* Mois actuel */}
              <Area
                type="monotone" dataKey="actuel"
                stroke={BRAND} strokeWidth={2.5}
                fill="url(#gradActuel)"
                dot={false}
                activeDot={{r:5,fill:BRAND,stroke:"#fff",strokeWidth:2}}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tableau semaines */}
      <div className={`${card} overflow-hidden`}>
        <div className={`px-5 py-3.5 border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
          <p className={`text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>Récapitulatif par semaine</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b ${dark?"border-[#21262d]":"border-gray-100"}`}>
                {["Semaine","Période","Total "+moisActuel,"Total "+moisPrec,"Écart","Tendance"].map(h=>(
                  <th key={h} className={`px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider ${dark?"text-[#484f58]":"text-gray-400"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({length:Math.ceil(nb/7)},(_,i)=>{
                const s = i*7, e = Math.min(s+7,nb);
                const sl  = data.slice(s,e);
                const tA  = sl.reduce((acc,d)=>acc+d.actuel,0);
                const tP  = sl.reduce((acc,d)=>acc+d.precedent,0);
                const ec  = tP>0?Math.round((tA-tP)/tP*100):0;
                return (
                  <tr key={i} className={`border-b last:border-0 transition-colors ${dark?"border-[#21262d] hover:bg-[#0d1117]/40":"border-gray-50 hover:bg-gray-50/60"}`}>
                    <td className={`px-5 py-3 text-[12px] font-bold ${dark?"text-white":"text-gray-800"}`}>S{i+1}</td>
                    <td className={`px-5 py-3 text-[11px]`}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                          <span style={{width:6,height:6,borderRadius:99,background:BRAND,flexShrink:0,display:"inline-block"}}/>
                          <span style={{color:dark?"#8b949e":"#374151",fontSize:11}}>
                            {sl[0]?.date} → {sl[sl.length-1]?.date}
                          </span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{width:6,height:6,borderRadius:99,background:COMPARE,opacity:0.7,flexShrink:0,display:"inline-block"}}/>
                          <span style={{color:dark?"#484f58":"#9ca3af",fontSize:10}}>
                            {sl[0]?.datePrec} → {sl[sl.length-1]?.datePrec}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] font-bold" style={{color:BRAND}}>
                      {tA.toLocaleString("fr-FR")}
                    </td>
                    <td className={`px-5 py-3 text-[12px] font-medium ${dark?"text-[#8b949e]":"text-gray-500"}`}>
                      {tP.toLocaleString("fr-FR")}
                    </td>
                    <td className={`px-5 py-3 text-[12px] font-bold ${ec>=0?"text-teal-600":"text-red-500"}`}>
                      {ec>=0?"+":""}{ec}%
                    </td>
                    <td className="px-5 py-3">
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div className={`h-1.5 rounded-full overflow-hidden ${dark?"bg-[#21262d]":"bg-gray-100"}`} style={{width:80}}>
                          <div style={{
                            width:`${Math.min(100,50+ec*2)}%`,
                            height:"100%",borderRadius:99,
                            background:ec>=0?BRAND:"#dc2626",
                            transition:"width .4s ease"
                          }}/>
                        </div>
                        <span style={{fontSize:10,color:ec>=0?BRAND:"#dc2626",fontWeight:700}}>
                          {ec>=0?"▲":"▼"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}