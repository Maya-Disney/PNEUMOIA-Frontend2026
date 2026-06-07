// src/features/medecin/pages/Corbeille.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, ChevronRight, LayoutDashboard, AlertTriangle, Clock,
  RotateCcw, User, Calendar, Send, CheckCircle2, X, Info, Loader2
} from 'lucide-react';

const DAYS_MEDECIN = 30;
const DAYS_ADMIN   = 10;

function getDaysInfo(deletedAt) {
  const elapsed = Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000);
  if (elapsed < DAYS_MEDECIN)
    return { status: 'corbeille', daysLeft: DAYS_MEDECIN - elapsed };
  if (elapsed < DAYS_MEDECIN + DAYS_ADMIN)
    return { status: 'admin', daysLeft: DAYS_MEDECIN + DAYS_ADMIN - elapsed };
  return { status: 'permanent', daysLeft: 0 };
}

const STATUS_CFG = {
  corbeille: {
    bg:    'bg-amber-50 dark:bg-amber-500/10',
    border:'border-amber-200 dark:border-amber-500/20',
    badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  admin: {
    bg:    'bg-red-50 dark:bg-red-500/10',
    border:'border-red-200 dark:border-red-500/20',
    badge: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  },
  permanent: {
    bg:    'bg-(--sf2)',
    border:'border-(--ln)',
    badge: 'bg-(--sf2) text-(--t4)',
  },
};

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const getToken = () =>
  localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token');

export default function Corbeille() {
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [restoreModal, setRestoreModal] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [requestSent,  setRequestSent]  = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCorbeille = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/patients/corbeille`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCorbeille(); }, []);

  const handleRestore = async (item) => {
    setActionLoading(item.id);
    try {
      const res = await fetch(`${BASE}/patients/${item.id}/restaurer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Échec restauration');
      setItems(prev => prev.filter(p => p.id !== item.id));
      setRestoreModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendRequest = (item) => {
    setRequestSent(prev => ({ ...prev, [item.id]: true }));
    setRequestModal(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={24} className="animate-spin text-(--t4)" />
    </div>
  );

  if (error) return (
    <div>
      <Breadcrumb />
      <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-700 dark:text-red-300">
        Impossible de charger la corbeille : {error}
        <button onClick={fetchCorbeille} className="ml-3 underline font-semibold">Réessayer</button>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div>
      <Breadcrumb />
      <PageHeader count={0} />
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-16 h-16 rounded-2xl bg-(--sf2) border border-(--ln) flex items-center justify-center mb-4 shadow-sm">
          <Trash2 size={28} className="text-(--t4)" />
        </div>
        <p className="font-semibold text-(--t2)">La corbeille est vide</p>
        <p className="text-sm text-(--t4) mt-1">Les comptes patients supprimés apparaîtront ici.</p>
        <Link to="/medecin/patients"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <ChevronRight size={14} className="rotate-180" />Retour aux patients
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <Breadcrumb />
      <PageHeader count={items.length} />

      {/* Bandeau explicatif */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl flex items-start gap-3">
        <Info size={15} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li><strong>J0 – J30 :</strong> Dossier en corbeille — restauration possible à tout moment.</li>
          <li><strong>J30 – J40 :</strong> Dossier transféré à l'administrateur — demande de récupération possible.</li>
          <li><strong>Après J40 :</strong> Suppression définitive et irrécupérable.</li>
        </ul>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {items.map((item, i) => {
          const info = getDaysInfo(item.deleted_at);
          const cfg  = STATUS_CFG[info.status];
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}
            >
              <div className="w-10 h-10 rounded-xl bg-(--sf) border border-(--ln) flex items-center justify-center shrink-0 shadow-sm">
                <User size={16} className="text-(--t3)" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-(--t1) truncate">
                  {item.civilite} {item.prenom} {item.nom}
                </p>
                <p className="text-xs text-(--t4) mt-0.5 font-mono">ID : {item.id}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {info.status === 'corbeille' && <><Clock size={9} />{info.daysLeft}j restants</>}
                    {info.status === 'admin'     && <><AlertTriangle size={9} />{info.daysLeft}j chez l'admin</>}
                    {info.status === 'permanent' && 'Supprimé définitivement'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-(--t4)">
                    <Calendar size={9} />
                    Supprimé le {new Date(item.deleted_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {info.status === 'corbeille' && (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setRestoreModal(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-(--sf) border border-(--ln) rounded-lg text-xs font-semibold text-(--t2) hover:bg-(--sf2) transition-colors shadow-sm">
                    <RotateCcw size={12} />Restaurer
                  </motion.button>
                )}
                {info.status === 'admin' && (
                  requestSent[item.id]
                    ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
                        <CheckCircle2 size={12} />Demande envoyée
                      </span>
                    : <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setRequestModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                        <Send size={12} />Demander récupération
                      </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal — Restaurer */}
      <AnimatePresence>
        {restoreModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-(--sf) rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-(--ln)">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <RotateCcw size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-(--t1)">Restaurer le patient</h3>
                    <p className="text-xs text-(--t3)">Le dossier redeviendra accessible</p>
                  </div>
                </div>
                <button onClick={() => setRestoreModal(null)} className="text-(--t4) hover:text-(--t1) transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-(--t2) mb-5">
                Voulez-vous restaurer le dossier de{' '}
                <strong className="text-(--t1)">{restoreModal.civilite} {restoreModal.prenom} {restoreModal.nom}</strong> ?
                Le patient sera de nouveau visible dans la liste des patients.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setRestoreModal(null)}
                  className="flex-1 py-2.5 border border-(--ln) rounded-xl text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-colors">
                  Annuler
                </button>
                <button onClick={() => handleRestore(restoreModal)}
                  disabled={actionLoading === restoreModal.id}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60">
                  {actionLoading === restoreModal.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <CheckCircle2 size={14} />}
                  Restaurer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal — Demande de récupération */}
      <AnimatePresence>
        {requestModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-(--sf) rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-(--ln)">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Send size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-(--t1)">Demander récupération</h3>
                    <p className="text-xs text-(--t3)">Envoi à l'administrateur</p>
                  </div>
                </div>
                <button onClick={() => setRequestModal(null)} className="text-(--t4) hover:text-(--t1) transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-(--t2) mb-5">
                Une demande sera envoyée à l'administrateur pour le dossier de{' '}
                <strong className="text-(--t1)">{requestModal.civilite} {requestModal.prenom} {requestModal.nom}</strong>.
                Passé J40, la demande ne sera plus recevable.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setRequestModal(null)}
                  className="flex-1 py-2.5 border border-(--ln) rounded-xl text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-colors">
                  Annuler
                </button>
                <button onClick={() => handleSendRequest(requestModal)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 transition-colors">
                  <Send size={14} />Envoyer la demande
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-(--t3) mb-6">
      <Link to="/medecin/dashboard"
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
        <LayoutDashboard size={12} />Tableau de bord
      </Link>
      <ChevronRight size={11} className="text-(--t4)" />
      <span className="flex items-center gap-1 font-semibold text-(--t1)">
        <Trash2 size={12} className="text-red-500" />Corbeille
      </span>
    </nav>
  );
}

function PageHeader({ count }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
          <Trash2 size={18} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-(--t1)">Corbeille</h1>
          <p className="text-xs text-(--t3)">
            {count} dossier{count > 1 ? 's' : ''} patient{count > 1 ? 's' : ''} supprimé{count > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
