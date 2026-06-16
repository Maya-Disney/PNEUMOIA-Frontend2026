import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Eye, Download, Globe, BookMarked, BarChart2,
  Trash2, Loader2, AlertCircle, CheckCircle,
  EyeOff, Tag, Clock, RefreshCw,
} from 'lucide-react';
import NouvellePublicationModal from './NouvellePublicationModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
  return data;
}

/* ─── Toast ──────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-xl ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
    </motion.div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="bg-(--sf) border border-(--ln) rounded-2xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-(--sf2) rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-(--sf2) rounded w-2/3" />
          <div className="h-3 bg-(--sf2) rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-(--sf2) rounded w-full" />
    </div>
  );
}

/* ─── Carte publication ──────────────────────────────────────────── */
function PublicationCard({ r, onToggle, onDelete, busy }) {
  const isBusy = busy === r.id;
  const publie = r.publie;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`group bg-(--sf) border border-(--ln) rounded-2xl p-4 hover:shadow-md transition-all border-l-4 ${
        publie ? 'border-l-emerald-500' : 'border-l-amber-400'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icône */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          publie ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-amber-50 dark:bg-amber-500/10'
        }`}>
          {publie
            ? <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            : <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Ligne titre + badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-(--t1) text-sm">{r.titre}</p>
                {r.has_pdf && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">PDF</span>
                )}
              </div>
              {(r.pathologie || r.niveau) && (
                <p className="text-xs text-(--t3) mt-0.5">
                  {r.pathologie}{r.pathologie && r.niveau ? ' · ' : ''}{r.niveau}
                </p>
              )}
            </div>
            <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
              publie
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            }`}>
              {publie ? 'Publié' : 'Brouillon'}
            </span>
          </div>

          {/* Tags */}
          {Array.isArray(r.tags) && r.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {r.tags.slice(0, 4).map(t => (
                <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-(--sf2) text-(--t4) rounded-full">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          )}

          {/* Footer stats + actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-(--ln)">
            {publie ? (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-(--t4)">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-(--t2)">{r.nb_vues ?? 0}</span> vues
                </span>
                <span className="flex items-center gap-1.5 text-xs text-(--t4)">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-(--t2)">{r.nb_telechargements ?? 0}</span>
                </span>
              </div>
            ) : (
              <span className="text-xs text-(--t4) italic">Non publié · invisible du public</span>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={() => onToggle(r.id)}
                disabled={isBusy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${
                  publie
                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                }`}
              >
                {isBusy
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : publie
                    ? <><EyeOff className="w-3.5 h-3.5" />Retirer</>
                    : <><Globe className="w-3.5 h-3.5" />Publier</>}
              </button>
              <button
                onClick={() => onDelete(r.id)}
                disabled={isBusy}
                className="p-1.5 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Onglets ─────────────────────────────────────────────────────── */
const TABS = [
  { key: 'toutes',     label: 'Toutes'    },
  { key: 'publiees',   label: 'Publiées'  },
  { key: 'brouillons', label: 'Brouillons'},
];

/* ─── Page principale ─────────────────────────────────────────────── */
export default function MesPublications() {
  const [ressources, setRessources] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [busy, setBusy]             = useState(null);
  const [toast, setToast]           = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [tab, setTab]               = useState('toutes');

  const intervalRef = useRef(null);
  const addToast = (msg, type = 'success') => setToast({ message: msg, type });

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/ressources/medecin/mes-ressources');
      setRessources(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    charger();
    intervalRef.current = setInterval(charger, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [charger]);

  const togglePublie = async (id) => {
    setBusy(id);
    try {
      const data = await apiFetch(`/ressources/medecin/${id}/publier`, { method: 'POST' });
      setRessources(rs => rs.map(r => r.id === id ? { ...r, publie: data.publie } : r));
      addToast(data.message || 'Statut mis à jour');
    } catch (e) { addToast(e.message || 'Erreur', 'error'); }
    finally { setBusy(null); }
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cette ressource définitivement ?')) return;
    setBusy(id);
    try {
      await apiFetch(`/ressources/medecin/${id}`, { method: 'DELETE' });
      setRessources(rs => rs.filter(r => r.id !== id));
      addToast('Ressource supprimée');
    } catch (e) { addToast(e.message || 'Erreur', 'error'); }
    finally { setBusy(null); }
  };

  const publiees   = ressources.filter(r => r.publie);
  const brouillons = ressources.filter(r => !r.publie);
  const displayed  = tab === 'publiees' ? publiees : tab === 'brouillons' ? brouillons : ressources;

  const totalVues = publiees.reduce((s, r) => s + (r.nb_vues ?? 0), 0);
  const totalDl   = publiees.reduce((s, r) => s + (r.nb_telechargements ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── En-tête avec stats intégrées ───────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="bg-(--sf) border border-(--ln) rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-1">Bibliothèque médicale</p>
            <h1 className="text-xl font-black text-(--t1)">Mes publications</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={charger} disabled={loading}
              className="p-2 bg-(--sf2) border border-(--ln) rounded-xl text-(--t3) hover:bg-(--sf3) transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors active:scale-95 shadow-sm">
              <Plus className="w-4 h-4" />
              Nouvelle publication
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-8 mt-5 pt-4 border-t border-(--ln)">
            {[
              { label: 'Total',           value: ressources.length, color: 'text-(--t1)'       },
              { label: 'Publiées',        value: publiees.length,   color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Vues totales',    value: totalVues,         color: 'text-blue-600 dark:text-blue-400'      },
              { label: 'Téléchargements', value: totalDl,           color: 'text-amber-600 dark:text-amber-400'    },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-(--t4) mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Corps ────────────────────────────────────────────────────── */}
      {error ? (
        <div className="bg-(--sf) border border-(--ln) rounded-2xl p-10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="font-bold text-(--t2)">{error}</p>
          <button onClick={charger} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold">
            <RefreshCw className="w-3.5 h-3.5" />Réessayer
          </button>
        </div>

      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} />)}
        </div>

      ) : ressources.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto">
            <BookMarked className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-black text-(--t1)">Aucune publication</p>
            <p className="text-sm text-(--t3) mt-1 max-w-sm mx-auto">
              Partagez vos cas cliniques et ressources éducatives avec la communauté médicale PneumoIA.
            </p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />Créer ma première publication
          </button>
        </motion.div>

      ) : (
        <>
          {/* Onglets */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 p-1 bg-(--sf2) border border-(--ln) rounded-xl w-fit">
              {TABS.map(({ key, label }) => {
                const count = key === 'toutes' ? ressources.length : key === 'publiees' ? publiees.length : brouillons.length;
                return (
                  <button key={key} onClick={() => setTab(key)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      tab === key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
                    }`}>
                    {label}
                    <span className={`text-[11px] font-bold px-1.5 rounded-full ${
                      tab === key ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' : 'bg-(--sf3) text-(--t4)'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-(--t4)">{displayed.length} ressource{displayed.length > 1 ? 's' : ''}</p>
          </div>

          {/* Grille publications */}
          <AnimatePresence mode="wait">
            {displayed.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-(--sf) border border-(--ln) rounded-2xl py-12 text-center">
                <BarChart2 className="w-8 h-8 text-(--t4) mx-auto mb-2" />
                <p className="text-sm text-(--t3)">Aucune ressource dans cette catégorie.</p>
              </motion.div>
            ) : (
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3">
                <AnimatePresence>
                  {displayed.map(r => (
                    <PublicationCard key={r.id} r={r} onToggle={togglePublie} onDelete={supprimer} busy={busy} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bannière brouillons */}
          {brouillons.length > 0 && tab !== 'publiees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                <span className="font-bold">{brouillons.length} brouillon{brouillons.length > 1 ? 's' : ''}</span> en attente —{' '}
                <button onClick={() => setTab('brouillons')} className="underline">voir les brouillons</button>
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <NouvellePublicationModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); charger(); addToast('Publication créée !'); }}
        />
      )}

      <AnimatePresence>
        {toast && <Toast key="t" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
