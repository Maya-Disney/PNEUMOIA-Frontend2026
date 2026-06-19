import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Thermometer, Heart, Wind, Loader2,
  RefreshCw, Search, User, Brain, Clock,
  AlertCircle, DropletIcon, Stethoscope, Hospital,
  ShieldAlert, Zap, FolderHeart,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function apiFetch(endpoint) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
  return data;
}

/* ─── Config gravité — couleurs atténuées ─────────────────────────── */
const GRAVITE = {
  critique: {
    label:      'Critique',
    dotColor:   '#ef4444',
    leftBorder: 'rgba(239,68,68,0.35)',
    badgeBg:    'bg-red-50 dark:bg-red-500/10',
    badgeTx:    'text-red-600 dark:text-red-400',
    avatarBg:   '#7f1d1d',
    avatarTx:   '#fca5a5',
    icon:       ShieldAlert,
  },
  urgent: {
    label:      'Urgent',
    dotColor:   '#f59e0b',
    leftBorder: 'rgba(245,158,11,0.35)',
    badgeBg:    'bg-amber-50 dark:bg-amber-500/10',
    badgeTx:    'text-amber-600 dark:text-amber-400',
    avatarBg:   '#78350f',
    avatarTx:   '#fcd34d',
    icon:       Zap,
  },
};

/* ─── Signe vital ─────────────────────────────────────────────────── */
function Vital({ icon: Icon, label, value, unit, alert }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex flex-col items-center px-2.5 py-2 rounded-lg text-center bg-(--sf2) min-w-13.5">
      <Icon className={`w-3.5 h-3.5 mb-0.5 ${alert ? 'text-red-400' : 'text-(--t4)'}`} />
      <p className={`text-sm font-bold leading-none ${alert ? 'text-red-500 dark:text-red-400' : 'text-(--t1)'}`}>
        {value}
        <span className="text-[10px] font-normal ml-px">{unit}</span>
      </p>
      <p className="text-[10px] text-(--t4) mt-0.5 leading-none">{label}</p>
    </div>
  );
}

/* ─── Carte cas clinique ──────────────────────────────────────────── */
function CasCard({ cas, idx }) {
  const navigate  = useNavigate();
  const g         = cas.statut_clinique === 'critique' ? GRAVITE.critique : GRAVITE.urgent;
  const GIcon     = g.icon;
  const sv        = cas.signes_vitaux || {};
  const diag      = cas.diagnostic;
  const initiales = `${cas.patient_prenom?.[0] || ''}${cas.patient_nom?.[0] || ''}`.toUpperCase();

  const alertSao2 = sv.saturation_o2        && Number(sv.saturation_o2)        < 94;
  const alertTemp = sv.temperature          && Number(sv.temperature)          >= 38.5;
  const alertFC   = sv.frequence_cardiaque  && (Number(sv.frequence_cardiaque) > 100 || Number(sv.frequence_cardiaque) < 50);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderLeft: `3px solid ${g.leftBorder}` }}
    >
      <div className="p-5">

        {/* ── Ligne patient ── */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: g.avatarBg, color: g.avatarTx }}
          >
            {initiales || <User className="w-4 h-4" />}
          </div>

          {/* Nom + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-(--t1)">
                {cas.patient_prenom} {cas.patient_nom}
              </span>
              {/* Badge gravité */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${g.badgeBg} ${g.badgeTx}`}>
                <GIcon className="w-3 h-3" />
                {g.label}
              </span>
              {cas.hospitalisation && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <Hospital className="w-3 h-3" />Hospitalisé
                </span>
              )}
            </div>
            <p className="text-xs text-(--t3) mt-0.5">
              {[
                cas.patient_age && `${cas.patient_age} ans`,
                cas.patient_sexe === 'M' ? 'Homme' : cas.patient_sexe === 'F' ? 'Femme' : null,
                cas.patient_groupe_sanguin,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>

          {/* Date */}
          <p className="text-[11px] text-(--t4) shrink-0 pt-0.5">
            {new Date(cas.updated_at || cas.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </p>
        </div>

        {/* ── Motif ── */}
        {cas.motif && (
          <p className="text-xs text-(--t2) italic bg-(--sf2) rounded-lg px-3 py-2 mb-3 line-clamp-2 border-l-2 border-(--ln)">
            {cas.motif}
          </p>
        )}

        {/* ── Diagnostic IA ── */}
        {diag?.pathologie && (
          <div className="flex items-center gap-2.5 p-2.5 bg-(--sf2) rounded-xl mb-3">
            <Brain className="w-4 h-4 text-(--t3) shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-(--t1) truncate">{diag.pathologie}</p>
              <p className="text-[10px] text-(--t4)">Diagnostic IA principal</p>
            </div>
            {diag.confidence && (
              <span className={`text-xs font-bold tabular-nums ${diag.confidence >= 85 ? 'text-red-500' : diag.confidence >= 65 ? 'text-amber-500' : 'text-(--t3)'}`}>
                {Math.round(diag.confidence)}%
              </span>
            )}
          </div>
        )}

        {/* ── Signes vitaux ── */}
        {(sv.temperature || sv.saturation_o2 || sv.frequence_cardiaque || sv.frequence_respiratoire) && (
          <div className="flex gap-2 flex-wrap mb-3">
            <Vital icon={Thermometer} label="Temp."  value={sv.temperature}            unit="°C"   alert={alertTemp} />
            <Vital icon={DropletIcon} label="SpO₂"   value={sv.saturation_o2}          unit="%"    alert={alertSao2} />
            <Vital icon={Heart}       label="FC"      value={sv.frequence_cardiaque}    unit="bpm"  alert={alertFC}   />
            <Vital icon={Wind}        label="FR"      value={sv.frequence_respiratoire} unit="/min" alert={false}     />
          </div>
        )}

        {/* ── Diagnostics différentiels ── */}
        {diag?.maladies?.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {diag.maladies.slice(1).map((m, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-(--sf2) border border-(--ln) rounded-full text-(--t3)">
                {m.nom} · {Math.round(m.pct)}%
              </span>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-3 border-t border-(--ln)">
          <span className="flex items-center gap-1.5 text-[11px] text-(--t4)">
            <Clock className="w-3 h-3" />
            {cas.statut === 'terminee' ? 'Consultation terminée' : 'En attente'}
          </span>
          {cas.patient_id && (
            <button
              onClick={() => navigate(`/medecin/patients/${cas.patient_id}`)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
            >
              Voir le dossier
              <span className="text-(--t4)">→</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-(--sf) border border-(--ln) rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-(--sf2)" />
        <div className="flex-1 space-y-1.5">
          <div className="w-2/3 h-3.5 bg-(--sf2) rounded" />
          <div className="w-1/3 h-3 bg-(--sf2) rounded" />
        </div>
      </div>
      <div className="h-10 bg-(--sf2) rounded-lg" />
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <div key={i} className="w-14 h-12 bg-(--sf2) rounded-lg" />)}
      </div>
    </div>
  );
}

/* ─── Page principale ─────────────────────────────────────────────── */
const FILTRES = [
  { key: 'tous',     label: 'Tous'        },
  { key: 'critique', label: 'Critiques'   },
  { key: 'urgent',   label: 'Urgents'     },
  { key: 'hospit',   label: 'Hospitalisés'},
];

export default function CasCliniques() {
  const [cas, setCas]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filtre, setFiltre]   = useState('tous');
  const [search, setSearch]   = useState('');

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/consultations/cas-graves');
      setCas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const critiques = cas.filter(c => c.statut_clinique === 'critique' || c.diagnostic?.etat_patient === 'critique');
  const urgents   = cas.filter(c => {
    const isCrit = c.statut_clinique === 'critique' || c.diagnostic?.etat_patient === 'critique';
    return !isCrit && (c.statut_clinique === 'urgent' || c.diagnostic?.etat_patient === 'urgent');
  });
  const hospit = cas.filter(c => c.hospitalisation);

  const displayed = cas
    .filter(c => {
      if (filtre === 'critique') return c.statut_clinique === 'critique' || c.diagnostic?.etat_patient === 'critique';
      if (filtre === 'urgent')   return !critiques.find(x => x.consultation_id === c.consultation_id) &&
                                        (c.statut_clinique === 'urgent' || c.diagnostic?.etat_patient === 'urgent');
      if (filtre === 'hospit')   return c.hospitalisation;
      return true;
    })
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return `${c.patient_prenom} ${c.patient_nom} ${c.motif || ''} ${c.diagnostic?.pathologie || ''}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const poids = { critique: 2, urgent: 1 };
      const pa = poids[a.statut_clinique] || 0;
      const pb = poids[b.statut_clinique] || 0;
      if (pa !== pb) return pb - pa;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="space-y-5">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-0.5">Suivi clinique</p>
            <h1 className="text-xl font-black text-(--t1)">Cas cliniques</h1>
            <p className="text-sm text-(--t3) mt-0.5">
              Patients nécessitant une surveillance renforcée
            </p>
          </div>
          <button onClick={charger} disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      {!loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Cas surveillés',  value: cas.length,        bg: 'bg-(--sf2)' },
            { label: 'Critiques',       value: critiques.length,  bg: 'bg-red-50 dark:bg-red-500/8',    tx: 'text-red-600 dark:text-red-400'    },
            { label: 'Urgents',         value: urgents.length,    bg: 'bg-amber-50 dark:bg-amber-500/8', tx: 'text-amber-600 dark:text-amber-400' },
            { label: 'Hospitalisés',    value: hospit.length,     bg: 'bg-purple-50 dark:bg-purple-500/8', tx: 'text-purple-600 dark:text-purple-400' },
          ].map(({ label, value, bg, tx }) => (
            <div key={label} className={`${bg} border border-(--ln) rounded-2xl p-4`}>
              <p className={`text-2xl font-black ${tx || 'text-(--t1)'}`}>{value}</p>
              <p className="text-xs text-(--t3) mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Filtres + recherche ── */}
      {!loading && !error && cas.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-(--sf2) border border-(--ln) rounded-xl">
            {FILTRES.map(({ key, label }) => {
              const count = key === 'tous' ? cas.length : key === 'critique' ? critiques.length : key === 'urgent' ? urgents.length : hospit.length;
              return (
                <button key={key} onClick={() => setFiltre(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    filtre === key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
                  }`}>
                  {label}
                  <span className={`text-[11px] font-bold px-1.5 rounded-full ${
                    filtre === key
                      ? 'bg-(--sf3) text-(--t3)'
                      : 'bg-(--sf3) text-(--t4)'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Patient, pathologie, motif…"
              className="w-full pl-9 pr-4 py-2 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Corps ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>

      ) : error ? (
        <div className="bg-(--sf) border border-(--ln) rounded-2xl p-12 text-center space-y-3">
          <AlertCircle className="w-9 h-9 text-(--t4) mx-auto" />
          <p className="font-semibold text-(--t2)">{error}</p>
          <button onClick={charger}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--sf2) border border-(--ln) text-(--t2) rounded-xl text-sm font-semibold hover:bg-(--sf3) transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />Réessayer
          </button>
        </div>

      ) : cas.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl p-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-(--sf2) flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7 text-(--t4)" />
          </div>
          <p className="font-bold text-(--t1)">Aucun cas clinique grave</p>
          <p className="text-sm text-(--t3) max-w-sm mx-auto">
            Tous vos patients sont actuellement en état stable ou sous surveillance normale.
          </p>
        </motion.div>

      ) : displayed.length === 0 ? (
        <div className="py-12 text-center text-sm text-(--t3)">
          Aucun cas ne correspond à ce filtre.
        </div>

      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filtre + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {displayed.map((c, i) => (
              <CasCard key={c.consultation_id} cas={c} idx={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
