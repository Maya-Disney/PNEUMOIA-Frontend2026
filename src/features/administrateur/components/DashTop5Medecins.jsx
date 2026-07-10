import { useState, useEffect, useRef } from "react";
import Card from "./Card";
import { X } from "lucide-react";
import { brand, getSurface, getText } from "../theme";
import { getTopMedecinsConcordance } from "../api/adminApi";

const REFRESH_INTERVAL = 60_000;

const MOIS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

// ── Avatar : photo de profil ou initiales ────────────────────────────────────
function Avatar({ doc, onClick }) {
  const [err, setErr] = useState(false);
  const initiales     = `${doc.prenom[0]}${doc.nom[0]}`.toUpperCase();

  return doc.photo_url && !err ? (
    <img
      src={doc.photo_url}
      alt={`${doc.prenom} ${doc.nom}`}
      onError={() => setErr(true)}
      onClick={onClick}
      className="w-10 h-10 flex-shrink-0 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
      style={{ border: `2px solid ${brand.DEFAULT}44` }}
    />
  ) : (
    <div
      className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-[12px] font-bold select-none"
      style={{
        background: brand.DEFAULT + "1a",
        color:      brand.dark,
        border:     `2px solid ${brand.DEFAULT}44`,
      }}
    >
      {initiales}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function DashTop5Medecins({ dark }) {
  const surface = getSurface(dark);
  const txt     = getText(dark);
  const now     = new Date();

  const [mois,       setMois]       = useState(now.getMonth());
  const [annee,      setAnnee]      = useState(now.getFullYear());
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [photoZoom,  setPhotoZoom]  = useState(null);
  const timerRef = useRef(null);

  const yearList = Array.from(
    { length: Math.max(1, now.getFullYear() - 2026) },
    (_, i) => now.getFullYear() - i,
  );

  async function load(m, a) {
    setLoading(true);
    try {
      const res  = await getTopMedecinsConcordance(m + 1, a);
      const list = Array.isArray(res) ? res : (res?.medecins || []);
      setData(list.map((doc, i) => ({
        ...doc,
        rank:         i + 1,
        concordance:  doc.concordance_ia  ?? doc.concordance  ?? 0,
        consultations: doc.nb_consultations ?? doc.consultations ?? 0,
        tendance:     typeof doc.tendance === "number" ? doc.tendance : 0,
      })));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  }

  useEffect(() => {
    load(mois, annee);
    timerRef.current = setInterval(() => load(mois, annee), REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [mois, annee]);

  const estMoisCourant = mois === now.getMonth() && annee === now.getFullYear();
  const heureMAJ = lastUpdate
    ? lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <Card dark={dark} className="p-5">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="text-[15px] font-bold" style={{ color: txt.primary }}>
            Top 5 médecins — Concordance IA
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>
            Classement par taux de concordance IA · consultations du mois
            {heureMAJ && <span className="ml-1.5">· {heureMAJ}</span>}
          </p>
        </div>

        {/* Sélecteurs mois / année */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={mois}
            onChange={e => setMois(Number(e.target.value))}
            className="text-[12px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer"
            style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}
          >
            {MOIS_FR.map((label, i) => (
              <option key={i} value={i}>{label}</option>
            ))}
          </select>

          <select
            value={annee}
            onChange={e => setAnnee(Number(e.target.value))}
            className="text-[12px] px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer"
            style={{ background: surface.card, borderColor: surface.border, color: txt.secondary }}
          >
            {yearList.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {estMoisCourant && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: brand.light, color: brand.dark }}
            >
              Mois courant
            </span>
          )}
        </div>
      </div>

      {/* ── Liste ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-[58px] rounded-xl animate-pulse" style={{ background: surface.bg }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 rounded-xl border border-dashed"
          style={{ borderColor: surface.border }}>
          <p className="text-[13px] font-medium" style={{ color: txt.muted }}>Aucune donnée de concordance</p>
          <p className="text-[12px]" style={{ color: txt.subtle }}>Les médecins doivent avoir des diagnostics IA enregistrés</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: surface.bg, border: `1px solid ${surface.border}` }}
            >
              {/* Numéro de rang */}
              <span
                className="w-5 flex-shrink-0 text-center text-[13px] font-black"
                style={{ color: m.rank === 1 ? brand.DEFAULT : txt.muted }}
              >
                {m.rank}
              </span>

              {/* Photo de profil */}
              <Avatar doc={m} onClick={() => m.photo_url && setPhotoZoom(m)} />

              {/* Nom + barre concordance */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: txt.primary }}>
                  Dr. {m.prenom} {m.nom}
                </p>
                <div
                  className="mt-1.5 h-1.5 rounded-full overflow-hidden"
                  style={{ background: surface.card, border: `1px solid ${surface.border}` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.concordance}%`, background: brand.DEFAULT }}
                  />
                </div>
              </div>

              {/* Concordance IA */}
              <div className="flex-shrink-0 text-right w-14">
                <p className="text-[15px] font-black leading-none" style={{ color: brand.DEFAULT }}>
                  {m.concordance}%
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: m.tendance >= 0 ? brand.DEFAULT : "#ef4444" }}>
                  {m.tendance >= 0 ? "▲" : "▼"} {Math.abs(m.tendance)}%
                </p>
              </div>

              {/* Consultations */}
              <div
                className="flex-shrink-0 text-center px-2.5 py-1.5 rounded-lg hidden sm:block"
                style={{ background: surface.card, border: `1px solid ${surface.border}`, minWidth: 52 }}
              >
                <p className="text-[13px] font-bold leading-none" style={{ color: txt.secondary }}>
                  {m.consultations}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: txt.subtle }}>consult.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {photoZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={e => e.target === e.currentTarget && setPhotoZoom(null)}>
          <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden" style={{ background: surface.card, borderColor: surface.border }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: surface.border }}>
              <div>
                <p className="text-[13px] font-bold" style={{ color: txt.primary }}>Dr. {photoZoom.prenom} {photoZoom.nom}</p>
                <p className="text-[12px] mt-0.5" style={{ color: txt.subtle }}>Photo d'identité (CNI)</p>
              </div>
              <button onClick={() => setPhotoZoom(null)} className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ color: txt.subtle }}><X size={15}/></button>
            </div>
            <div className="px-5 py-4 flex justify-center">
              <img src={photoZoom.photo_url} alt={`${photoZoom.prenom} ${photoZoom.nom}`} className="w-full max-h-[42vh] rounded-xl object-contain border-2 border-gray-200 shadow" />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
