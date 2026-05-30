import { useOutletContext } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const VILLES = [
  { ville: "Douala",      region: "Littoral",    medecins: 18, consultations: 2240, patients: 524 },
  { ville: "Yaoundé",     region: "Centre",      medecins: 12, consultations: 1540, patients: 367 },
  { ville: "Bafoussam",   region: "Ouest",       medecins: 4,  consultations: 580,  patients: 142 },
  { ville: "Garoua",      region: "Nord",        medecins: 3,  consultations: 320,  patients: 89  },
  { ville: "Bertoua",     region: "Est",         medecins: 1,  consultations: 141,  patients: 41  },
];

const REGIONS = [
  { region: "Littoral",  medecins: 18, couverture: 94 },
  { region: "Centre",    medecins: 12, couverture: 88 },
  { region: "Ouest",     medecins: 4,  couverture: 52 },
  { region: "Nord",      medecins: 3,  couverture: 31 },
  { region: "Est",       medecins: 1,  couverture: 18 },
  { region: "Sud",       medecins: 0,  couverture: 0  },
  { region: "Adamaoua",  medecins: 0,  couverture: 0  },
  { region: "Extrême-N", medecins: 0,  couverture: 0  },
  { region: "N-Ouest",   medecins: 0,  couverture: 0  },
  { region: "S-Ouest",   medecins: 0,  couverture: 0  },
];

const maxC = Math.max(...VILLES.map(v => v.consultations));

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-[11px] shadow-md ${dark ? "bg-[#161b22] border-[#21262d] text-[#e6edf3]" : "bg-white border-gray-200 text-gray-800"}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.stroke }}>{p.name} : {p.value.toLocaleString("fr-FR")}</p>
      ))}
    </div>
  );
}

export default function RepartitionGeo() {
  const { dark } = useOutletContext();
  const axisColor = dark ? "#484f58" : "#9ca3af";
  const gridColor = dark ? "#21262d" : "#f3f4f6";
  const totalMedecins = VILLES.reduce((s, v) => s + v.medecins, 0);
  const totalConsult  = VILLES.reduce((s, v) => s + v.consultations, 0);
  const totalPatients = VILLES.reduce((s, v) => s + v.patients, 0);
  const regionsCouvertes = REGIONS.filter(r => r.medecins > 0).length;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#e6edf3]">Répartition géographique</h1>
        <p className="text-[12px] mt-1 text-gray-400 dark:text-[#484f58]">Distribution des médecins et consultations au Cameroun</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Médecins au Cameroun",    val: totalMedecins,                          color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: "Consultations totales",   val: totalConsult.toLocaleString("fr-FR"),   color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: "Patients enregistrés",    val: totalPatients.toLocaleString("fr-FR"),  color: "text-gray-800 dark:text-[#e6edf3]" },
          { label: "Régions couvertes",       val: `${regionsCouvertes}/10`,               color: regionsCouvertes >= 7 ? "text-green-600 dark:text-[#22c55e]" : "text-orange-500" },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl px-4 py-3">
            <p className={`text-xl font-black ${color}`}>{val}</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Graphique + carte textuelle */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        {/* Graphique barres groupées */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Consultations par ville</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">5 villes actives sur la plateforme</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VILLES} barSize={32}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="ville" tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: axisColor }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: dark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)" }} />
              <Bar dataKey="consultations" name="Consultations" fill="#16a34a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Couverture régions */}
        <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl p-5">
          <div className="mb-4">
            <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Couverture par région</p>
            <p className="text-[10px] text-gray-400 dark:text-[#484f58] mt-0.5">10 régions du Cameroun</p>
          </div>
          <div className="flex flex-col gap-2">
            {REGIONS.map(r => (
              <div key={r.region} className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-[#8b949e] w-20 shrink-0 truncate">{r.region}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${r.couverture}%`, background: r.couverture === 0 ? "transparent" : r.couverture >= 70 ? "#16a34a" : r.couverture >= 40 ? "#f59e0b" : "#ef4444" }} />
                </div>
                {r.medecins > 0
                  ? <span className="text-[9px] font-bold text-gray-500 dark:text-[#8b949e] shrink-0 w-16 text-right">{r.medecins} médecin{r.medecins > 1 ? "s" : ""}</span>
                  : <span className="text-[9px] font-bold text-red-400 dark:text-red-500 shrink-0 w-16 text-right">Non couvert</span>
                }
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50 dark:border-[#21262d]">
            {[["#16a34a","≥ 70%"],["#f59e0b","40–70%"],["#ef4444","< 40%"],["#d1d5db","Non couvert"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[8px] text-gray-400 dark:text-[#484f58]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau détaillé villes */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#21262d] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-[#21262d]">
          <p className="text-[12px] font-bold text-gray-800 dark:text-[#e6edf3]">Détail par ville</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Ville","Région","Médecins","Consultations","Patients","Part consultations","Barre"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider border-b border-gray-100 dark:border-[#21262d] bg-gray-50 dark:bg-[#161b22] text-gray-400 dark:text-[#484f58]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VILLES.map((v, i) => {
              const part = Math.round((v.consultations / totalConsult) * 100);
              return (
                <tr key={i} className="hover:bg-gray-50/80 dark:hover:bg-[#0d1117]/60 transition-colors">
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[12px] font-black text-gray-800 dark:text-[#e6edf3]">{v.ville}</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[11px] text-gray-400 dark:text-[#484f58]">{v.region}</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[11px] font-semibold text-gray-700 dark:text-[#8b949e]">{v.medecins}</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[11px] font-bold text-gray-800 dark:text-[#e6edf3]">{v.consultations.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[11px] text-gray-500 dark:text-[#8b949e]">{v.patients}</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d] text-[11px] font-bold text-green-600 dark:text-[#22c55e]">{part}%</td>
                  <td className="px-4 py-2.5 border-b border-gray-50 dark:border-[#21262d]">
                    <div className="h-1.5 bg-gray-100 dark:bg-[#21262d] rounded-full overflow-hidden w-24">
                      <div className="h-full rounded-full bg-green-500 dark:bg-[#22c55e]"
                        style={{ width: `${Math.round((v.consultations / maxC) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-50 dark:border-[#21262d]">
          <p className="text-[10px] text-orange-500 font-semibold">
            ⚠ 6 régions non couvertes — envisager le recrutement de médecins dans le Nord, l'Est, l'Adamaoua, l'Extrême-Nord, le Nord-Ouest et le Sud-Ouest.
          </p>
        </div>
      </div>
    </div>
  );
}