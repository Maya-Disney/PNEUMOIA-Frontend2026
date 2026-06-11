// src/features/medecin/pages/Partage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, FileText, Clock, CheckCircle, XCircle, Share2, UserPlus,
  BookOpen, MessageCircle, Calendar, ChevronRight, ChevronLeft,
  Globe, Lock, Bell, Activity, AlertCircle, Star,
  Sparkles, Eye, Heart, MessageSquare, Send, ArrowRight, Zap,
  Shield, User, Search, QrCode, Copy, Printer, Loader2,
  FolderOpen, Download, X, Tag, RefreshCw, Building, MapPin,
  AlertTriangle, Info, Hash, UserCheck
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('pneumoia_token')
             || localStorage.getItem('access_token')
             || localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Erreur ${res.status}` }));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const cfg = {
    success: { bg: 'bg-emerald-600', Icon: CheckCircle },
    error:   { bg: 'bg-red-600',     Icon: XCircle },
    warning: { bg: 'bg-amber-500',   Icon: AlertCircle },
    info:    { bg: 'bg-blue-600',    Icon: Bell },
  }[type] || { bg: 'bg-blue-600', Icon: Bell };
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl text-white shadow-xl ${cfg.bg}`}>
      <cfg.Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </motion.div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg border border-(--ln) flex items-center justify-center hover:bg-(--sf2) disabled:opacity-40 transition-all">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === p ? 'bg-blue-600 text-white' : 'border border-(--ln) hover:bg-(--sf2)'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg border border-(--ln) flex items-center justify-center hover:bg-(--sf2) disabled:opacity-40 transition-all">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Modal refus avec motif (défini au niveau module pour éviter les re-mounts) ──
function RefusModal({ refusModal, motifRefus, setMotifRefus, setRefusModal, handleRefuser, refusLoading }) {
  return (
    <AnimatePresence>
      {refusModal && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setRefusModal(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-(--sf) rounded-2xl shadow-2xl border border-(--ln) overflow-hidden">
              <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300">Refuser la demande</p>
                  <p className="text-xs text-red-600 dark:text-red-400">{refusModal.medecinNom}</p>
                </div>
                <button onClick={() => setRefusModal(null)} className="ml-auto text-(--t4) hover:text-(--t2)">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-(--t2) mb-1.5">
                    Motif du refus <span className="font-normal text-(--t4)">(optionnel — sera communiqué au demandeur)</span>
                  </label>
                  <textarea
                    value={motifRefus}
                    onChange={e => setMotifRefus(e.target.value)}
                    placeholder="Ex: Patient suivi exclusivement en interne, accès non justifié médicalement..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRefusModal(null)}
                    className="flex-1 py-2.5 border border-(--ln) text-(--t3) rounded-xl text-sm font-semibold hover:bg-(--sf2) transition-all">
                    Annuler
                  </button>
                  <button onClick={handleRefuser} disabled={refusLoading}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {refusLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Confirmer le refus
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Onglet 1 : Demandes reçues ────────────────────────────────────
function OngletDemandes({ addToast, refreshKey, onCountChange }) {
  const [demandes,    setDemandes]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [refusModal,  setRefusModal]  = useState(null); // { demandeId, medecinNom }
  const [motifRefus,  setMotifRefus]  = useState('');
  const [refusLoading,setRefusLoading]= useState(false);
  const PER_PAGE = 5;

  // Ref pour éviter la boucle infinie (onCountChange dans useCallback)
  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => { onCountChangeRef.current = onCountChange; });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/patients/access-requests/recues');
      const list = Array.isArray(data) ? data : [];
      setDemandes(list);
      onCountChangeRef.current?.(list.length);
    } catch { setDemandes([]); onCountChangeRef.current?.(0); } finally { setLoading(false); }
  }, []); // pas de dépendance sur onCountChange

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleAccepter = async (demandeId, medecinNom) => {
    try {
      await apiFetch(`/patients/access-requests/${demandeId}/accepter`, { method: 'POST' });
      setDemandes(prev => prev.filter(d => d.id !== demandeId));
      addToast(`Accès accordé à ${medecinNom}`, 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleRefuser = async () => {
    if (!refusModal) return;
    setRefusLoading(true);
    try {
      await apiFetch(`/patients/access-requests/${refusModal.demandeId}/refuser`, {
        method: 'POST',
        body: JSON.stringify({ motif_refus: motifRefus.trim() || null }),
      });
      setDemandes(prev => prev.filter(d => d.id !== refusModal.demandeId));
      addToast(`Demande de ${refusModal.medecinNom} refusée`, 'error');
      setRefusModal(null); setMotifRefus('');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setRefusLoading(false); }
  };

  const paginated    = demandes.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages   = Math.ceil(demandes.length / PER_PAGE);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (demandes.length === 0) return (
    <>
      <RefusModal
        refusModal={refusModal} motifRefus={motifRefus}
        setMotifRefus={setMotifRefus} setRefusModal={setRefusModal}
        handleRefuser={handleRefuser} refusLoading={refusLoading}
      />
      <div className="bg-(--sf) rounded-2xl p-12 text-center border border-(--ln)">
        <Bell className="w-12 h-12 text-(--t4) mx-auto mb-4" />
        <p className="text-(--t3) font-medium">Aucune demande en attente</p>
        <p className="text-sm text-(--t4) mt-1">Les demandes d'accès à vos dossiers apparaîtront ici</p>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <RefusModal
        refusModal={refusModal} motifRefus={motifRefus}
        setMotifRefus={setMotifRefus} setRefusModal={setRefusModal}
        handleRefuser={handleRefuser} refusLoading={refusLoading}
      />
      {paginated.map((d) => (
        <div key={d.id} className="relative bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
          <div className={`absolute top-0 left-0 w-1.5 h-full ${d.urgent ? 'bg-red-500' : 'bg-amber-400'}`} />
          <div className="p-5 pl-7">
            {/* Patient */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-(--ln)">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {d.patient_nom?.[0]}{d.patient_prenom?.[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-(--t1)">{d.patient_prenom} {d.patient_nom}</span>
                    <span className="text-xs font-mono text-(--t4) bg-(--sf2) px-2 py-0.5 rounded">{d.patient_id?.slice(0, 10)}</span>
                    {d.urgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" /> URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-(--t4) mt-0.5">Demande reçue le {formatDate(d.created_at)}</p>
                </div>
              </div>
              {d.diagnostic && (
                <div className="text-xs text-(--t2) bg-(--sf2) px-3 py-1.5 rounded-lg max-w-xs">
                  <span className="font-semibold">Motif :</span> {d.diagnostic}
                </div>
              )}
            </div>

            {/* Médecin demandeur */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-(--sf2) rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {d.medecin_prenom?.[0]}{d.medecin_nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-(--t1) text-sm">Dr. {d.medecin_prenom} {d.medecin_nom}</p>
                  <p className="text-xs text-(--t4)">{d.medecin_specialite} · {d.medecin_hopital || d.medecin_ville || '—'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setRefusModal({ demandeId: d.id, medecinNom: `Dr. ${d.medecin_nom}` }); setMotifRefus(''); }}
                  className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-all">
                  Refuser
                </button>
                <button onClick={() => handleAccepter(d.id, `Dr. ${d.medecin_nom}`)}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                  Accepter
                </button>
              </div>
            </div>

            {/* Justificatif */}
            {d.justificatif_demande && (
              <p className="mt-3 text-xs text-(--t3) italic bg-blue-50 dark:bg-blue-500/10 rounded-lg px-3 py-2">
                <Info className="w-3.5 h-3.5 inline mr-1" />"{d.justificatif_demande}"
              </p>
            )}
          </div>
        </div>
      ))}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

// ── Onglet 2 : Mes dossiers partagés ─────────────────────────────
function OngletDossiers({ addToast, refreshKey, onCountChange }) {
  const [dossiers, setDossiers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 5;

  const onCountChangeRef = useRef(onCountChange);
  useEffect(() => { onCountChangeRef.current = onCountChange; });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/patients/mes-partages');
      const list = Array.isArray(data) ? data : [];
      setDossiers(list);
      onCountChangeRef.current?.(list.length);
    } catch { setDossiers([]); onCountChangeRef.current?.(0); } finally { setLoading(false); }
  }, []); // pas de dépendance sur onCountChange

  useEffect(() => { load(); }, [load, refreshKey]);

  const revoquer = async (patientId, medecinId, medecinNom) => {
    try {
      await apiFetch(`/patients/${patientId}/acces/${medecinId}`, { method: 'DELETE' });
      setDossiers(prev => prev.map(d =>
        d.patient_id === patientId
          ? { ...d, acces: d.acces.filter(a => a.medecin_id !== medecinId) }
          : d
      ).filter(d => d.acces.length > 0));
      addToast(`Accès révoqué pour Dr. ${medecinNom}`, 'success');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const paginated  = dossiers.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(dossiers.length / PER_PAGE);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (dossiers.length === 0) return (
    <div className="bg-(--sf) rounded-2xl p-12 text-center border border-(--ln)">
      <FolderOpen className="w-12 h-12 text-(--t4) mx-auto mb-4" />
      <p className="text-(--t3) font-medium">Aucun dossier partagé</p>
      <p className="text-sm text-(--t4) mt-1">Les dossiers que vous partagez avec des confrères apparaîtront ici</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {paginated.map((d) => (
        <div key={d.patient_id} className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm">
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-(--ln)">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {d.patient_prenom?.[0]}{d.patient_nom?.[0]}
                </div>
                <div>
                  <p className="font-bold text-(--t1)">{d.patient_prenom} {d.patient_nom}</p>
                  <p className="text-xs font-mono text-(--t4)">{d.patient_id}</p>
                </div>
              </div>
              <span className="text-xs text-(--t4)">
                {d.acces?.length || 0} médecin{(d.acces?.length || 0) > 1 ? 's' : ''} avec accès
              </span>
            </div>
            <div className="space-y-2">
              {(d.acces || []).map((a, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-3 p-2.5 hover:bg-(--sf2) rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-(--sf3) flex items-center justify-center text-(--t2) text-xs font-bold">
                      {a.prenom?.[0]}{a.nom?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-(--t2) text-sm">Dr. {a.prenom} {a.nom}</p>
                      <p className="text-xs text-(--t4)">{a.specialite} · Depuis {formatDate(a.depuis)}</p>
                    </div>
                  </div>
                  <button onClick={() => revoquer(d.patient_id, a.medecin_id, `${a.prenom} ${a.nom}`)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors">
                    <Lock className="w-3 h-3" /> Révoquer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

// ── Onglet 2b : Mes demandes d'accès envoyées ────────────────────
const ACCES_CFG = {
  en_attente: { bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800',   dot: 'bg-amber-400',  label: 'En attente',    text: 'text-amber-700 dark:text-amber-400'  },
  accorde:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Accès accordé', text: 'text-emerald-700 dark:text-emerald-400' },
  refuse:     { bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-800',       dot: 'bg-red-500',    label: 'Refusé',        text: 'text-red-700 dark:text-red-400'      },
};

const FILTRE_ACTIVE = {
  en_attente: 'bg-amber-400 text-white border-amber-400 shadow-sm',
  accorde:    'bg-emerald-500 text-white border-emerald-500 shadow-sm',
  refuse:     'bg-red-500 text-white border-red-500 shadow-sm',
};

function OngletMesAcces({ addToast, refreshKey }) {
  const [demandes, setDemandes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtre,   setFiltre]   = useState(null); // null = tout afficher

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/patients/access-requests/envoyees');
      setDemandes(Array.isArray(data) ? data : []);
    } catch { setDemandes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (demandes.length === 0) return (
    <div className="bg-(--sf) rounded-2xl p-12 text-center border border-(--ln)">
      <ArrowRight className="w-12 h-12 text-(--t4) mx-auto mb-4" />
      <p className="text-(--t3) font-medium">Aucune demande envoyée</p>
      <p className="text-sm text-(--t4) mt-1">Utilisez l'onglet "Patient en déplacement" pour demander l'accès à un dossier.</p>
    </div>
  );

  const demandesFiltrees = filtre ? demandes.filter(d => d.statut === filtre) : demandes;

  return (
    <div className="space-y-4">
      {/* Filtres cliquables */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <button
          onClick={() => setFiltre(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
            filtre === null
              ? 'bg-(--t1) text-(--bg) border-(--t1) shadow-sm'
              : 'bg-(--sf) text-(--t3) border-(--ln) hover:border-(--t3) hover:text-(--t2)'
          }`}
        >
          Tous ({demandes.length})
        </button>
        {['en_attente', 'accorde', 'refuse'].map((s) => {
          const n = demandes.filter(d => d.statut === s).length;
          if (!n) return null;
          const cfg = ACCES_CFG[s];
          const isActive = filtre === s;
          return (
            <button
              key={s}
              onClick={() => setFiltre(isActive ? null : s)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                isActive ? FILTRE_ACTIVE[s] : `${cfg.bg} ${cfg.border} ${cfg.text} hover:shadow-sm`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/80' : cfg.dot}`} />
              {cfg.label} ({n})
            </button>
          );
        })}
      </div>

      {demandesFiltrees.length === 0 && (
        <div className="py-10 text-center bg-(--sf) rounded-2xl border border-(--ln)">
          <p className="text-sm text-(--t4)">Aucune demande pour ce filtre</p>
          <button onClick={() => setFiltre(null)} className="mt-2 text-xs text-blue-600 hover:underline">Voir toutes les demandes</button>
        </div>
      )}

      {demandesFiltrees.map((d, i) => {
        const cfg = ACCES_CFG[d.statut] || ACCES_CFG.en_attente;
        return (
          <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="bg-(--sf) border border-(--ln) rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Bandeau couleur selon statut */}
              <div className={`h-1 w-full ${cfg.dot}`} />
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Infos patient */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${
                      d.statut === 'accorde' ? 'bg-emerald-600' : d.statut === 'refuse' ? 'bg-red-500' : 'bg-blue-600'
                    }`}>
                      {d.patient_prenom?.[0]}{d.patient_nom?.[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-(--t1)">{d.patient_prenom} {d.patient_nom}</span>
                        <span className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      {d.medecin_proprietaire && (
                        <p className="text-xs text-(--t3) mt-0.5">Médecin traitant : <span className="font-semibold text-(--t2)">{d.medecin_proprietaire}</span></p>
                      )}
                      <p className="text-[10px] text-(--t4) mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Demandé le {formatDate(d.created_at)}
                        {d.updated_at && d.statut !== 'en_attente' && ` · Répondu le ${formatDate(d.updated_at)}`}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  {d.statut === 'accorde' && (
                    <Link to={`/medecin/patients/${d.patient_id}`}
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md">
                      Ouvrir le dossier <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Justificatif ou motif refus */}
                {(d.justificatif || (d.statut === 'refuse' && d.motif_refus)) && (
                  <div className={`mt-3 px-3 py-2 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                    d.statut === 'refuse' && d.motif_refus
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                      : 'bg-(--sf2) text-(--t3) border border-(--ln)'
                  }`}>
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {d.statut === 'refuse' && d.motif_refus
                      ? <span><strong>Motif du refus :</strong> {d.motif_refus}</span>
                      : <span><em>Justificatif :</em> {d.justificatif}</span>
                    }
                  </div>
                )}

                {/* En attente — message informatif */}
                {d.statut === 'en_attente' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    En attente de réponse du médecin traitant
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Onglet 3 : Recherche par code patient (MVP) ───────────────────
function OngletRechercheCode({ addToast }) {
  const [code,       setCode]       = useState('');
  const [searching,  setSearching]  = useState(false);
  const [result,     setResult]     = useState(null);   // patient trouvé
  const [notFound,   setNotFound]   = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [justif,     setJustif]     = useState('');
  const [done,       setDone]       = useState(false);

  const handleSearch = async () => {
    if (code.trim().length < 5) { addToast('Entrez un identifiant valide', 'warning'); return; }
    setSearching(true);
    setResult(null);
    setNotFound(false);
    setDone(false);
    try {
      // Recherche par ID exact — endpoint sécurisé (fiche partielle seulement)
      const data = await apiFetch(`/patients/recherche-par-code?code=${encodeURIComponent(code.trim())}`);
      setResult(data);
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('introuvable')) {
        setNotFound(true);
      } else {
        addToast(err.message, 'error');
      }
    } finally { setSearching(false); }
  };

  const handleDemandeAcces = async () => {
    if (!result) return;
    setRequesting(true);
    try {
      await apiFetch('/patients/access-requests', {
        method: 'POST',
        body: JSON.stringify({ patient_id: result.id, justificatif: justif }),
      });
      setDone(true);
      addToast('Demande envoyée — le médecin propriétaire sera notifié', 'success');
    } catch (err) { addToast(err.message, 'error'); }
    finally { setRequesting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Explication */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-(--t1) mb-1">Accéder au dossier d'un patient en déplacement</h3>
            <p className="text-sm text-(--t3)">
              Le patient vous présente son <strong>identifiant dossier</strong> (imprimé sur son ordonnance).
              Entrez ce code pour voir sa fiche partielle et faire une demande d'accès au médecin traitant.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Seul le médecin propriétaire peut valider votre accès</span>
            </div>
          </div>
        </div>
      </div>

      {/* Champ de recherche */}
      <div className="bg-(--sf) rounded-2xl border border-(--ln) p-5">
        <label className="block text-sm font-semibold text-(--t2) mb-2">
          Identifiant patient
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null); setNotFound(false); setDone(false); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: 9TSWYXC93H7A"
              className="w-full pl-9 pr-4 py-2.5 text-sm font-mono border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSearch} disabled={searching || code.trim().length < 5}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rechercher
          </button>
        </div>
        <p className="text-xs text-(--t4) mt-2">
          L'identifiant est visible sur l'ordonnance imprimée du patient (format : 12 caractères alphanumériques)
        </p>
      </div>

      {/* Patient non trouvé */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Identifiant introuvable</p>
            <p className="text-xs text-red-600 mt-0.5">Vérifiez le code avec le patient ou demandez-lui une nouvelle ordonnance.</p>
          </div>
        </div>
      )}

      {/* Résultat : fiche partielle */}
      {result && !done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-(--sf) rounded-2xl border-2 border-blue-200 dark:border-blue-500/40 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-200 dark:border-blue-500/30 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Patient trouvé — fiche partielle</span>
            <span className="ml-auto text-xs text-blue-500 flex items-center gap-1"><Lock className="w-3 h-3" /> Données limitées</span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {result.prenom?.[0]}{result.nom?.[0]}
              </div>
              <div>
                <p className="text-lg font-bold text-(--t1)">{result.prenom} {result.nom}</p>
                <p className="text-sm text-(--t3)">{result.age ? `${result.age} ans` : '—'} · {result.sexe === 'M' ? 'Homme' : 'Femme'}</p>
                <p className="text-xs font-mono text-(--t4) mt-0.5">{result.id}</p>
              </div>
            </div>

            {/* Infos visibles sans accès complet */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { label: 'Groupe sanguin', value: result.groupe_sanguin },
                { label: 'Religion',       value: result.religion },
                { label: 'Médecin traitant', value: result.medecin_referent },
                { label: 'Téléphone urgence', value: result.telephone_urgence || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 bg-(--sf2) rounded-xl">
                  <p className="text-[10px] text-(--t4) uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-(--t1)">{value || '—'}</p>
                </div>
              ))}
            </div>

            {/* Restriction religieuse visible même sans accès */}
            {result.religion === 'temoin_jehovah' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Témoin de Jéhovah</p>
                  <p className="text-[10px] text-amber-700">Transfusion sanguine et dérivés refusés</p>
                </div>
              </div>
            )}

            {/* Demande d'accès */}
            <div className="pt-4 border-t border-(--ln)">
              <p className="text-sm font-semibold text-(--t2) mb-2">Justificatif de la demande <span className="text-(--t4) font-normal">(optionnel)</span></p>
              <textarea
                rows={2}
                value={justif}
                onChange={(e) => setJustif(e.target.value)}
                placeholder="Ex: Patient en urgence, consultation de transit, avis spécialisé..."
                className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
              />
              <button onClick={handleDemandeAcces} disabled={requesting}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer la demande d'accès au médecin propriétaire
              </button>
              <p className="text-[10px] text-center text-(--t4) mt-2">
                Le médecin traitant recevra une notification et devra valider votre accès.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation */}
      {done && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-bold text-emerald-800">Demande envoyée avec succès</p>
          <p className="text-sm text-emerald-600 mt-1">
            Le médecin traitant de {result?.prenom} {result?.nom} a été notifié.
            Vous recevrez une notification dès qu'il aura validé votre accès.
          </p>
          <button onClick={() => { setCode(''); setResult(null); setDone(false); setJustif(''); }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all">
            Nouvelle recherche
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Config statut membre ──────────────────────────────────────────
const STATUT_MEMBRE = {
  accepte:    { label: 'Membre',      bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  en_attente: { label: 'En attente',  bg: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-700 dark:text-amber-400',    border: 'border-amber-200 dark:border-amber-800',    dot: 'bg-amber-400' },
  refuse:     { label: 'Refusé',      bg: 'bg-red-50 dark:bg-red-900/20',        text: 'text-red-700 dark:text-red-400',        border: 'border-red-200 dark:border-red-800',        dot: 'bg-red-500' },
};

// ── Sous-composant : modal demandes en attente (côté créateur) ────
function ModalDemandes({ communaute, onClose, addToast, onUpdated }) {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/communautes/${communaute.id}/membres`)
      .then(d => setMembres(Array.isArray(d) ? d : []))
      .catch(() => setMembres([]))
      .finally(() => setLoading(false));
  }, [communaute.id]);

  const enAttente = membres.filter(m => m.statut === 'en_attente');

  const handleDecision = async (medecinId, action) => {
    try {
      await apiFetch(`/communautes/${communaute.id}/membres/${medecinId}/${action}`, { method: 'POST' });
      setMembres(prev => prev.map(m => m.medecin_id === medecinId ? { ...m, statut: action === 'accepter' ? 'accepte' : 'refuse' } : m));
      addToast(action === 'accepter' ? 'Membre accepté' : 'Demande refusée', action === 'accepter' ? 'success' : 'info');
      onUpdated?.();
    } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-(--sf) rounded-2xl shadow-2xl border border-(--ln) overflow-hidden">
          <div className="px-6 py-4 border-b border-(--ln) flex items-center justify-between">
            <div>
              <p className="font-bold text-(--t1)">Demandes d'adhésion</p>
              <p className="text-xs text-(--t4)">« {communaute.nom} »</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-(--sf2) rounded-lg"><X className="w-4 h-4 text-(--t3)" /></button>
          </div>
          <div className="px-6 py-4 max-h-80 overflow-y-auto space-y-3">
            {loading && <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>}
            {!loading && enAttente.length === 0 && (
              <p className="text-sm text-(--t4) text-center py-4">Aucune demande en attente</p>
            )}
            {enAttente.map(m => (
              <div key={m.medecin_id} className="flex items-center justify-between gap-3 p-3 bg-(--sf2) rounded-xl border border-(--ln)">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {m.prenom?.[0]}{m.nom?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">Dr. {m.prenom} {m.nom}</p>
                    {m.specialite && <p className="text-[10px] text-(--t4)">{m.specialite}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDecision(m.medecin_id, 'accepter')}
                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDecision(m.medecin_id, 'refuser')}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Onglet 4 : Communauté CEMAC ───────────────────────────────────
function OngletCommunaute({ addToast }) {
  const [groupes,    setGroupes]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actioning,  setActioning]  = useState(null); // id du groupe en cours
  const [modalGroupe,setModalGroupe]= useState(null); // groupe sélectionné pour modal demandes

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/communautes');
      setGroupes(Array.isArray(data) ? data : []);
    } catch { setGroupes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRejoindre = async (groupe) => {
    setActioning(groupe.id);
    try {
      const res = await apiFetch(`/communautes/${groupe.id}/rejoindre`, { method: 'POST' });
      const statut = res.statut === 'accepte' ? 'accepte' : 'en_attente';
      setGroupes(prev => prev.map(g => g.id === groupe.id ? { ...g, mon_statut: statut } : g));
      addToast(
        statut === 'accepte'
          ? `Vous avez rejoint « ${groupe.nom} » — rendez-vous dans la messagerie`
          : `Demande envoyée à « ${groupe.nom} »`,
        'success'
      );
    } catch (e) { addToast(e.message, 'error'); }
    finally { setActioning(null); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const mesGroupes = groupes.filter(g => g.mon_statut === 'accepte');
  const autresGroupes = groupes.filter(g => g.mon_statut !== 'accepte');

  return (
    <div className="space-y-8">

      {/* Mes groupes */}
      {mesGroupes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-(--t2) uppercase tracking-widest">Mes groupes ({mesGroupes.length})</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mesGroupes.map(g => (
              <GroupeCard key={g.id} groupe={g} onRejoindre={handleRejoindre} actioning={actioning}
                onVoirDemandes={() => setModalGroupe(g)} addToast={addToast} onUpdated={load} />
            ))}
          </div>
        </div>
      )}

      {/* Tous les groupes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-(--t2) uppercase tracking-widest">
            {mesGroupes.length > 0 ? 'Autres groupes' : 'Tous les groupes'} ({autresGroupes.length})
          </p>
        </div>
        {autresGroupes.length === 0 && mesGroupes.length > 0 && (
          <p className="text-sm text-(--t4) py-4">Vous faites partie de tous les groupes disponibles.</p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {autresGroupes.map(g => (
            <GroupeCard key={g.id} groupe={g} onRejoindre={handleRejoindre} actioning={actioning}
              onVoirDemandes={() => setModalGroupe(g)} addToast={addToast} onUpdated={load} />
          ))}
        </div>
        {groupes.length === 0 && (
          <div className="text-center py-12 bg-(--sf) rounded-2xl border border-(--ln)">
            <Globe className="w-12 h-12 text-(--t4) mx-auto mb-3" />
            <p className="text-(--t2) font-semibold">Aucun groupe disponible</p>
            <p className="text-sm text-(--t4) mt-1">Les groupes créés par vos confrères apparaîtront ici.</p>
          </div>
        )}
      </div>

      {/* Modal demandes en attente */}
      {modalGroupe && (
        <ModalDemandes communaute={modalGroupe} onClose={() => setModalGroupe(null)}
          addToast={addToast} onUpdated={load} />
      )}
    </div>
  );
}

function GroupeCard({ groupe: g, onRejoindre, actioning, onVoirDemandes, addToast, onUpdated }) {
  const cfg = g.mon_statut ? STATUT_MEMBRE[g.mon_statut] : null;
  const typeColors = g.type === 'privee'
    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';

  const initiales = g.nom?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'G';

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Bandeau top coloré selon type */}
      <div className={`h-1 w-full ${g.type === 'privee' ? 'bg-purple-500' : 'bg-blue-500'}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar groupe */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${g.type === 'privee' ? 'bg-purple-600' : 'bg-blue-600'}`}>
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-(--t1) text-sm leading-tight">{g.nom}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${typeColors}`}>
                {g.type === 'privee' ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                {g.type === 'privee' ? 'Privé' : 'Public'}
              </span>
            </div>
            {g.specialite && <p className="text-[10px] text-(--t4) mt-0.5">{g.specialite}</p>}
          </div>
        </div>

        {g.description && (
          <p className="text-xs text-(--t3) leading-relaxed mb-3 line-clamp-2">{g.description}</p>
        )}

        <div className="flex items-center gap-3 text-[11px] text-(--t4) mb-4">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.nb_membres} membre{g.nb_membres !== 1 ? 's' : ''}</span>
          {g.createur && <><span>·</span><span>Créé par {g.createur}</span></>}
          {g.created_at && <><span>·</span><span>{formatDate(g.created_at)}</span></>}
        </div>

        <div className="flex items-center gap-2">
          {/* Statut actuel */}
          {cfg && (
            <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}

          {/* Action selon statut */}
          {g.mon_statut === 'accepte' && (
            <Link to="/medecin/messagerie"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all">
              <MessageCircle className="w-3.5 h-3.5" /> Ouvrir
            </Link>
          )}
          {!g.mon_statut && (
            <button onClick={() => onRejoindre(g)} disabled={actioning === g.id}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-60">
              {actioning === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              {g.type === 'privee' ? 'Demander l\'accès' : 'Rejoindre'}
            </button>
          )}
          {g.mon_statut === 'refuse' && (
            <button onClick={() => onRejoindre(g)} disabled={actioning === g.id}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-(--sf2) border border-(--ln) text-(--t3) text-xs font-semibold rounded-xl transition-all hover:border-(--t3) disabled:opacity-60">
              {actioning === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Redemander
            </button>
          )}

          {/* Bouton demandes (créateur uniquement) */}
          {g.est_createur && g.nb_attente > 0 && (
            <button onClick={onVoirDemandes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-xl hover:shadow-sm transition-all">
              <Bell className="w-3.5 h-3.5" />
              {g.nb_attente} demande{g.nb_attente > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function Partage() {
  const [toast,      setToast]     = useState(null);
  const [activeTab,  setActiveTab] = useState('demandes');
  const [counts,     setCounts]    = useState({ demandes: 0, dossiers: 0, acces: 0, acesPending: 0, communaute: 0 });
  const [refreshKey, setRefreshKey]= useState(0);
  const [refreshing, setRefreshing]= useState(false);

  const addToast = useCallback((message, type) => setToast({ message, type }), []);

  // Callbacks stables pour éviter les boucles infinies de re-rendu
  const onDemandesCount = useCallback((n) => setCounts(p => ({ ...p, demandes: n })), []);
  const onDossiersCount = useCallback((n) => setCounts(p => ({ ...p, dossiers: n })), []);

  const loadCounts = useCallback(async () => {
    try {
      const [dem, dos, acc] = await Promise.allSettled([
        apiFetch('/patients/access-requests/recues'),
        apiFetch('/patients/mes-partages'),
        apiFetch('/patients/access-requests/envoyees'),
      ]);
      const accList = acc.status === 'fulfilled' && Array.isArray(acc.value) ? acc.value : [];
      setCounts(prev => ({
        ...prev,
        dossiers:    dos.status === 'fulfilled' ? (dos.value?.length || 0) : prev.dossiers,
        acces:       accList.length,
        acesPending: accList.filter(d => d.statut === 'en_attente').length,
        communaute:  0,
      }));
    } catch {}
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    await loadCounts();
    setRefreshing(false);
  }, [loadCounts]);

  const tabs = [
    { id: 'demandes',   label: 'Demandes reçues',       icon: Bell,        count: counts.demandes,  urgent: counts.demandes > 0 },
    { id: 'dossiers',   label: 'Mes partages',           icon: FolderOpen,  count: counts.dossiers },
    { id: 'acces',      label: 'Mes accès',              icon: UserCheck,   count: counts.acces,     urgent: counts.acesPending > 0 },
    { id: 'code',       label: 'Patient en déplacement', icon: QrCode,      count: null },
  ];

  return (
    <div className="min-h-screen bg-(--bg)">
      <div className="w-full py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Plateforme collaborative</span>
                <h1 className="text-2xl font-bold text-(--t1)">Partage & Communauté</h1>
              </div>
            </div>
            {/* Bouton rafraîchir global */}
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-(--ln) text-(--t3) hover:text-(--t1) hover:bg-(--sf2) transition-all disabled:opacity-50 text-sm">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 border-b border-(--ln) mb-7">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold transition-all border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-500/10'
                    : 'border-transparent text-(--t3) hover:text-(--t2) hover:bg-(--sf2)'
                }`}>
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline truncate">{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      : tab.urgent
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                        : 'bg-(--sf2) text-(--t4)'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenu */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeTab === 'demandes'   && <OngletDemandes      addToast={addToast} refreshKey={refreshKey}
                                             onCountChange={onDemandesCount} />}
            {activeTab === 'dossiers'   && <OngletDossiers      addToast={addToast} refreshKey={refreshKey}
                                             onCountChange={onDossiersCount} />}
            {activeTab === 'acces'      && <OngletMesAcces      addToast={addToast} refreshKey={refreshKey} />}
            {activeTab === 'code'       && <OngletRechercheCode addToast={addToast} />}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}