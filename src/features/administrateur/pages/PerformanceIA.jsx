import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { X } from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import { getTopMedecinsConcordance, getConcordanceEvolution, getConcordancePathologies } from "../api/adminApi";

const MOIS_LABELS = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const MOIS_COURTS = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];
const _curYear = Math.max(new Date().getFullYear(), 2026);
const ANNEES = Array.from({ length: _curYear - 2025 }, (_, i) => 2026 + i);


function col(t) {
  if (t >= 85) return brand.DEFAULT;
  if (t >= 75) return "#f59e0b";
  return "#ef4444";
}

function TipEvol({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark ? "bg-[#161b22] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
      <p className="font-bold">{label}</p>
      <p style={{ color: brand.DEFAULT }}>{payload[0].value}% concordance</p>
    </div>
  );
}

export default function PerformancesIA() {
  const { dark } = useOutletContext() || {};
  const surface  = getSurface(dark);
  const txt      = getText(dark);

  const now = new Date();
  const [mois,  setMois]  = useState(now.getMonth() + 1);
  const [annee, setAnnee] = useState(now.getFullYear() <= 2026 ? now.getFullYear() : 2026);

  const [evol,        setEvol]        = useState([]);
  const [parMaladie,  setParMaladie]  = useState([]);
  const [parMed,      setParMed]      = useState([]);
  const [loadingMed,  setLoadingMed]  = useState(false);
  const [photoZoom,   setPhotoZoom]   = useState(null);

  useEffect(() => {
    setLoadingMed(true);
    setEvol([]);
    setParMaladie([]);
    Promise.all([
      getTopMedecinsConcordance(mois, annee).catch(() => null),
      getConcordanceEvolution().catch(() => null),
      getConcordancePathologies(mois, annee).catch(() => null),
    ])
      .then(([resMed, resEvol, resPatho]) => {
        const docs = Array.isArray(resMed) ? resMed : (resMed?.medecins || []);
        setParMed(docs.map(m => ({
          ini:       `${m.prenom?.[0] || ""}${m.nom?.[0] || ""}`.toUpperCase(),
          nom:       `Dr. ${m.prenom} ${m.nom}`,
          t:         m.concordance_ia ?? m.concordance ?? 0,
          total:     m.nb_consultations ?? m.consultations ?? 0,
          photo_url: m.photo_url || null,
        })));
        if (Array.isArray(resEvol) && resEvol.length) setEvol(resEvol);
        if (Array.isArray(resPatho) && resPatho.length) setParMaladie(resPatho);
      })
      .catch(() => setParMed([]))
      .finally(() => setLoadingMed(false));
  }, [mois, annee]);

  const totC = parMed.reduce((s, m) => s + Math.round(m.total * m.t / 100), 0);
  const totT = parMed.reduce((s, m) => s + m.total, 0);
  const tG   = totT > 0 ? Math.round((totC / totT) * 100) : 0;

  const ax = dark ? "#484f58" : "#9ca3af";
  const gr = dark ? "#21262d" : "#f3f4f6";

  const cardStyle   = { background: surface.card, borderColor: surface.border };
  const selectStyle = {
    background: surface.card,
    color: txt.primary,
    border: `1px solid ${surface.border}`,
    borderRadius: 10,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
  };

  const periodLabel = `${MOIS_LABELS[mois - 1]} ${annee}`;

  // Calcul des 6 mois affichés dans l'évolution
  return (
    <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">

      {/* Header + filtres */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tight" style={{ color: txt.primary }}>
            Performances IA
          </h1>
          <p className="text-[13px] mt-1" style={{ color: txt.muted }}>
            Taux de concordance médecin / modèle IA
          </p>
        </div>

        {/* Sélecteurs mois + année */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: txt.muted }}>Mois</span>
            <select value={mois} onChange={e => setMois(Number(e.target.value))} style={selectStyle}>
              {MOIS_LABELS.map((label, i) => (
                <option key={i + 1} value={i + 1}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold" style={{ color: txt.muted }}>Année</span>
            <select value={annee} onChange={e => setAnnee(Number(e.target.value))} style={selectStyle}>
              {ANNEES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Concordance globale",    v: `${tG}%`,                        accent: true  },
          { l: "Cas analysés",           v: totT.toLocaleString("fr-FR"),    accent: false },
          { l: "Accords médecin / IA",   v: totC.toLocaleString("fr-FR"),    accent: true  },
          { l: "Meilleure concordance",  v: `${parMed.length ? Math.max(...parMed.map(m => m.t)) : 0}%`, accent: true },
        ].map(({ l, v, accent }) => (
          <div key={l} className="rounded-2xl border px-4 py-3" style={cardStyle}>
            <p className="text-2xl font-black" style={{ color: accent ? brand.DEFAULT : txt.primary }}>{v}</p>
            <p className="text-[11px] mt-0.5" style={{ color: txt.subtle }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Évolution + par pathologie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Évolution sur 6 mois glissants */}
        <div className="rounded-2xl border p-5" style={cardStyle}>
          <p className="text-[13px] font-bold mb-1" style={{ color: txt.primary }}>Évolution concordance</p>
          <p className="text-[11px] mb-4" style={{ color: txt.muted }}>6 derniers mois glissants</p>
          {evol.length === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed" style={{ borderColor: surface.border }}>
              <p className="text-[12px] font-medium" style={{ color: txt.subtle }}>Données non disponibles</p>
              <p className="text-[11px]" style={{ color: txt.subtle }}>Endpoint non disponible pour l'évolution mensuelle</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={evol}>
                <CartesianGrid vertical={false} stroke={gr} />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: ax }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: ax }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<TipEvol dark={dark} />} />
                <Line type="monotone" dataKey="v" stroke={brand.DEFAULT} strokeWidth={2.5}
                  dot={{ fill: brand.DEFAULT, r: 3 }}
                  activeDot={{ r: 5, fill: brand.DEFAULT, stroke: "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Par pathologie */}
        <div className="rounded-2xl border p-5" style={cardStyle}>
          <p className="text-[13px] font-bold mb-1" style={{ color: txt.primary }}>Concordance par pathologie</p>
          <p className="text-[11px] mb-4" style={{ color: txt.muted }}>{periodLabel}</p>
          {parMaladie.length === 0 ? (
            <div className="h-[160px] flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed" style={{ borderColor: surface.border }}>
              <p className="text-[12px] font-medium" style={{ color: txt.subtle }}>Données non disponibles</p>
              <p className="text-[11px]" style={{ color: txt.subtle }}>Endpoint non disponible pour les pathologies</p>
            </div>
          ) : (
            [...parMaladie].sort((a, b) => b.t - a.t).map(m => (
              <div key={m.p} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="text-[10px] w-20 shrink-0" style={{ color: txt.muted }}>{m.p}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
                  <div className="h-full rounded-full" style={{ width: `${m.t}%`, background: col(m.t) }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full w-10 text-center"
                  style={{ background: m.t >= 85 ? "#f0fdfa" : m.t >= 75 ? "#fffbeb" : "#fef2f2", color: col(m.t) }}>
                  {m.t}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Par médecin */}
      <div className="rounded-2xl border p-5" style={cardStyle}>
        <p className="text-[13px] font-bold mb-1" style={{ color: txt.primary }}>Concordance par médecin</p>
        <p className="text-[11px] mb-4" style={{ color: txt.muted }}>{periodLabel}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loadingMed
            ? [1,2,3,4].map(i => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: surface.bg }} />
              ))
            : [...parMed].sort((a, b) => b.t - a.t).map((m, i) => (
            <div
              key={m.nom}
              className="flex flex-col gap-3 px-4 py-3 rounded-xl border"
              style={{ background: dark ? "#0d1117" : surface.bg, borderColor: surface.border }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black" style={{ color: txt.subtle }}>#{i + 1}</span>
                {m.photo_url
                  ? <img src={m.photo_url} alt={m.nom}
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPhotoZoom(m)}
                      onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextSibling.style.display="flex"; }} />
                  : null}
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                  style={{ background: col(m.t), display: m.photo_url ? "none" : "flex" }}>
                  {m.ini}
                </div>
                <p className="text-[10px] font-bold truncate" style={{ color: txt.muted }}>{m.nom.replace("Dr. ", "")}</p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: surface.borderSoft }}>
                <div className="h-full rounded-full" style={{ width: `${m.t}%`, background: col(m.t) }} />
              </div>
              <div className="flex items-end justify-between">
                <p className="text-xl font-black" style={{ color: col(m.t) }}>{m.t}%</p>
                <p className="text-[10px]" style={{ color: txt.subtle }}>{m.total} cas</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {photoZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setPhotoZoom(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: surface.border }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: txt.primary }}>{photoZoom.nom}</p>
                <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={() => setPhotoZoom(null)} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex justify-center">
              <img src={photoZoom.photo_url} alt={photoZoom.nom} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
