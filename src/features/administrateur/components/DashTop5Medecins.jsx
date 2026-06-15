import { useState, useEffect, useRef } from "react";
import Card from "./Card";
import { brand, getSurface, getText } from "../theme";
import { getTopMedecinsConcordance } from "../api/adminapi";

const REFRESH_INTERVAL = 60_000;

const MOIS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];

// ── Mock de secours (remplacé par l'API en production) ───────────────────────
const MOCK_POOL = [
  { id:1,  prenom:"Amara",   nom:"Bensalem"  },
  { id:2,  prenom:"Yassine", nom:"Ouali"     },
  { id:3,  prenom:"Leila",   nom:"Messaoud"  },
  { id:4,  prenom:"Karim",   nom:"Hamidou"   },
  { id:5,  prenom:"Nadia",   nom:"Terbeche"  },
  { id:6,  prenom:"Sofiane", nom:"Cherif"    },
  { id:7,  prenom:"Imane",   nom:"Bouali"    },
  { id:8,  prenom:"Rachid",  nom:"Djebbar"   },
];

function genMockTop5(mois, annee) {
  const rng = (n) => {
    const seed = mois * 31 + annee + n;
    return ((seed * 9301 + 49297) % 233280) / 233280;
  };
  return MOCK_POOL
    .map((doc, i) => ({
      ...doc,
      photo_url:     null,
      concordance:   Math.round(55 + rng(i * 3)     * 43),
      consultations: Math.round(40 + rng(i * 3 + 1) * 260),
      tendance:      Math.round((rng(i * 3 + 2) - 0.4) * 14),
    }))
    .sort((a, b) => b.concordance - a.concordance || b.consultations - a.consultations)
    .slice(0, 5)
    .map((doc, i) => ({ ...doc, rank: i + 1 }));
}

// ── Avatar : photo de profil ou initiales ────────────────────────────────────
function Avatar({ doc }) {
  const [err, setErr] = useState(false);
  const initiales     = `${doc.prenom[0]}${doc.nom[0]}`.toUpperCase();

  return doc.photo_url && !err ? (
    <img
      src={doc.photo_url}
      alt={`${doc.prenom} ${doc.nom}`}
      onError={() => setErr(true)}
      className="w-10 h-10 flex-shrink-0 rounded-full object-cover"
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
  const timerRef = useRef(null);

  const yearList = Array.from(
    { length: Math.max(1, now.getFullYear() - 2024) },
    (_, i) => now.getFullYear() - i,
  );

  async function load(m, a) {
    setLoading(true);
    try {
      const res = await getTopMedecinsConcordance(m + 1, a);
      setData(res.medecins.map((doc, i) => ({ ...doc, rank: i + 1 })));
    } catch {
      setData(genMockTop5(m, a));
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
              <Avatar doc={m} />

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
    </Card>
  );
}
