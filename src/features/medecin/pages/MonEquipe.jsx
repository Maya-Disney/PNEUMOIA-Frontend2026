import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users2, Copy, RefreshCw, CheckCircle, X, Shield,
  UserCheck, UserX, Trash2, Settings2, Check, AlertCircle,
  Clock, Stethoscope, Eye, EyeOff, Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const BRAND = '#00CC66';

const PERMS = [
  { key: 'peut_creer_patient',    label: 'Créer patients',         desc: 'Ajouter de nouveaux patients',       danger: false },
  { key: 'peut_lire_dossier',     label: 'Lire les dossiers',      desc: 'Consulter les fiches patients',       danger: false },
  { key: 'peut_modifier_patient', label: 'Modifier patients',      desc: 'Mettre à jour les informations',      danger: false },
  { key: 'peut_saisir_symptomes', label: 'Saisir symptômes',       desc: 'Enregistrer les symptômes',           danger: false },
  { key: 'peut_voir_diagnostic',  label: 'Diagnostics IA',         desc: 'Accéder aux résultats PneumoIA',      danger: false },
  { key: 'peut_supprimer',        label: 'Supprimer données',      desc: 'Supprimer patients / dossiers',        danger: true  },
  { key: 'peut_prescrire',        label: 'Prescrire',              desc: 'Émettre des prescriptions',            danger: true  },
];

const Toast = ({ toast, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
        toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
      }`}>
      {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
      {toast.msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
    </motion.div>
  );
};

function Chip({ label, danger = false }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
      danger
        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20'
        : 'bg-[var(--pri-lt)] text-[var(--pri)] border-[var(--pri-bd)]'
    }`}>
      <CheckCircle className="w-2.5 h-2.5 shrink-0" />{label}
    </span>
  );
}

function AideAvatar({ nom, prenom }) {
  const t = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
      style={{ backgroundColor: BRAND }}>
      {t}
    </div>
  );
}

function StatusBadge({ statut }) {
  if (statut === 'actif')      return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Actif</span>;
  if (statut === 'en_attente') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />En attente</span>;
  return null;
}

export default function MonEquipe() {
  const [aides,         setAides]         = useState([]);
  const [codeRef,       setCodeRef]       = useState('');
  const [codeActif,     setCodeActif]     = useState(true);
  const [loading,       setLoading]       = useState(true);
  const [copied,        setCopied]        = useState(false);
  const [showCode,      setShowCode]      = useState(false);
  const [regenLoading,  setRegenLoading]  = useState(false);

  // Filtres
  const [search, setSearch] = useState('');
  const [tab,    setTab]    = useState('tous'); // 'tous' | 'en_attente' | 'actif'

  // Modals
  const [permModal,     setPermModal]     = useState(null);
  const [perms,         setPerms]         = useState({});
  const [permLoading,   setPermLoading]   = useState(false);
  const [refuseModal,   setRefuseModal]   = useState(null);
  const [motif,         setMotif]         = useState('');
  const [refuseLoading, setRefuseLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const hdrs = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/aides/mes-aides`,     { headers: hdrs() }),
        fetch(`${API_URL}/aides/code-referent`, { headers: hdrs() }),
      ]);
      if (r1.ok) setAides(await r1.json());
      if (r2.ok) { const d = await r2.json(); setCodeRef(d.code_referent || ''); setCodeActif(d.actif); }
    } catch { showToast('Erreur de chargement', 'error'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtres calculés
  const filtered = aides.filter(a => {
    const q   = search.toLowerCase();
    const hit = !search || `${a.prenom} ${a.nom} ${a.email}`.toLowerCase().includes(q);
    const st  = tab === 'tous' || a.statut === tab;
    return hit && st;
  });

  const pending = filtered.filter(a => a.statut === 'en_attente');
  const actifs  = filtered.filter(a => a.statut === 'actif');
  const allPending = aides.filter(a => a.statut === 'en_attente');
  const allActifs  = aides.filter(a => a.statut === 'actif');

  const copyCode = () => { navigator.clipboard.writeText(codeRef); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const regenerer = async () => {
    setRegenLoading(true);
    try {
      const res = await fetch(`${API_URL}/aides/code-referent/regenerer`, { method: 'POST', headers: hdrs() });
      const d = await res.json(); if (!res.ok) throw new Error(d.detail);
      setCodeRef(d.code_referent); setShowCode(false); showToast('Nouveau code généré');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setRegenLoading(false); }
  };

  const valider = async (aide) => {
    try {
      const res = await fetch(`${API_URL}/aides/${aide.id}/valider`, { method: 'POST', headers: hdrs() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      showToast(`${aide.prenom} validé — email envoyé`); loadData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const refuser = async () => {
    if (!refuseModal) return;
    setRefuseLoading(true);
    try {
      const res = await fetch(`${API_URL}/aides/${refuseModal.id}/refuser`, {
        method: 'POST', headers: hdrs(), body: JSON.stringify({ motif: motif.trim() || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      showToast(`Refus envoyé à ${refuseModal.prenom}`); setRefuseModal(null); setMotif(''); loadData();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setRefuseLoading(false); }
  };

  const supprimer = async (aide) => {
    if (!window.confirm(`Retirer ${aide.prenom} ${aide.nom} de votre équipe ?`)) return;
    try {
      const res = await fetch(`${API_URL}/aides/${aide.id}`, { method: 'DELETE', headers: hdrs() });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      showToast(`${aide.prenom} retiré`); loadData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const openPerm = (aide) => { setPerms({ ...aide.permissions }); setPermModal(aide); };

  const savePerm = async () => {
    if (!permModal) return; setPermLoading(true);
    try {
      const res = await fetch(`${API_URL}/aides/${permModal.id}/permissions`, {
        method: 'PUT', headers: hdrs(), body: JSON.stringify(perms),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      showToast('Permissions mises à jour'); setPermModal(null); loadData();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setPermLoading(false); }
  };

  const maskedCode = codeRef ? '•'.repeat(codeRef.length) : '──────';

  const TABS = [
    { key: 'tous',       label: 'Tous',        count: aides.length    },
    { key: 'en_attente', label: 'En attente',  count: allPending.length },
    { key: 'actif',      label: 'Actifs',       count: allActifs.length  },
  ];

  return (
    <div className="space-y-4">

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Ligne supérieure : stats + code référent ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Stats  (3 colonnes) */}
        <div className="lg:col-span-2 bg-[var(--sf)] border border-[var(--ln)] rounded-xl p-4 flex items-center divide-x divide-[var(--ln)]">
          <div className="flex-1 text-center px-2">
            <p className="text-2xl font-black" style={{ color: BRAND }}>{allActifs.length}</p>
            <p className="text-[11px] font-semibold text-[var(--t3)] mt-0.5">Actifs</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-2xl font-black text-amber-500">{allPending.length}</p>
            <p className="text-[11px] font-semibold text-[var(--t3)] mt-0.5">En attente</p>
          </div>
          <div className="flex-1 text-center px-2">
            <p className="text-2xl font-black text-[var(--t1)]">{aides.length}</p>
            <p className="text-[11px] font-semibold text-[var(--t3)] mt-0.5">Total</p>
          </div>
        </div>

        {/* Code référent (3 colonnes) */}
        <div className="lg:col-span-3 bg-[var(--sf)] border border-[var(--ln)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--t3)]">Code référent</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              codeActif ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                       : 'bg-red-50 text-red-700 border-red-200'
            }`}>{codeActif ? 'Actif' : 'Désactivé'}</span>
          </div>
          <p className="text-xs text-[var(--t3)] mb-3">Partagez ce code avec vos aides soignants.</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[var(--sf2)] border border-[var(--ln)] rounded-lg px-4 py-2 font-mono text-sm font-bold tracking-[0.35em] text-[var(--t1)] text-center select-none">
              {loading ? '──────' : showCode ? codeRef : maskedCode}
            </div>
            <button onClick={() => setShowCode(v => !v)}
              className="p-2 rounded-lg border border-[var(--ln)] hover:bg-[var(--sf2)] text-[var(--t3)] transition-colors"
              title={showCode ? 'Masquer' : 'Révéler'}>
              {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button onClick={copyCode}
              className={`p-2 rounded-lg border transition-colors ${copied
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-[var(--ln)] hover:bg-[var(--sf2)] text-[var(--t3)]'}`}
              title="Copier">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={regenerer} disabled={regenLoading}
              className="p-2 rounded-lg border border-[var(--ln)] hover:bg-[var(--sf2)] text-[var(--t3)] disabled:opacity-40 transition-colors"
              title="Régénérer">
              <RefreshCw className={`w-3.5 h-3.5 ${regenLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Barre de recherche + onglets ── */}
      <div className="bg-[var(--sf)] border border-[var(--ln)] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--t4)]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--sf2)] border border-[var(--ln)] rounded-lg text-sm text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:ring-2 focus:ring-[var(--pri-bd)]"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                tab === t.key
                  ? 'bg-[var(--pri)] text-white'
                  : 'text-[var(--t3)] hover:bg-[var(--sf2)] border border-[var(--ln)]'
              }`}>
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-[var(--sf2)] text-[var(--t4)]'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── En attente ── */}
      {(tab === 'tous' || tab === 'en_attente') && pending.length > 0 && (
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--t3)] mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            En attente ({pending.length})
          </p>
          <div className="space-y-2">
            {pending.map((aide, i) => (
              <motion.div key={aide.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-[var(--sf)] border border-[var(--ln)] rounded-xl flex items-center gap-3 px-4 py-3">
                <AideAvatar nom={aide.nom} prenom={aide.prenom} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--t1)]">{aide.prenom} {aide.nom}</span>
                    <StatusBadge statut={aide.statut} />
                  </div>
                  <p className="text-xs text-[var(--t3)] truncate">{aide.email}</p>
                  {aide.telephone && <p className="text-xs text-[var(--t4)]">{aide.telephone}</p>}
                  <p className="text-xs text-[var(--t4)] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(aide.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => valider(aide)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-lg active:scale-95 transition-all"
                    style={{ backgroundColor: BRAND }}>
                    <UserCheck className="w-3.5 h-3.5" /> Valider
                  </button>
                  <button onClick={() => { setRefuseModal(aide); setMotif(''); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 bg-[var(--sf2)] hover:bg-red-50 rounded-lg border border-[var(--ln)] dark:hover:bg-red-500/10 active:scale-95 transition-all">
                    <UserX className="w-3.5 h-3.5" /> Refuser
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Membres actifs ── */}
      {(tab === 'tous' || tab === 'actif') && (
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--t3)] mb-2 flex items-center gap-1.5">
            <Users2 className="w-3 h-3" style={{ color: BRAND }} />
            Actifs ({actifs.length})
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--pri)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : actifs.length === 0 ? (
            <div className="bg-[var(--sf)] border border-dashed border-[var(--ln)] rounded-xl p-10 text-center">
              <Stethoscope className="w-8 h-8 text-[var(--t4)] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[var(--t2)]">
                {search ? 'Aucun résultat pour cette recherche' : 'Aucun membre actif'}
              </p>
              {!search && <p className="text-xs text-[var(--t4)] mt-1">Partagez votre code référent pour inviter des aides soignants</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {actifs.map((aide, i) => (
                <motion.div key={aide.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-[var(--sf)] border border-[var(--ln)] rounded-xl px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AideAvatar nom={aide.nom} prenom={aide.prenom} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[var(--t1)]">{aide.prenom} {aide.nom}</span>
                        <StatusBadge statut={aide.statut} />
                      </div>
                      <p className="text-xs text-[var(--t3)] truncate">{aide.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {PERMS.filter(p => aide.permissions?.[p.key]).map(p => (
                          <Chip key={p.key} label={p.label} danger={p.danger} />
                        ))}
                        {PERMS.filter(p => !aide.permissions?.[p.key]).length > 0 && (
                          <span className="text-[11px] text-[var(--t4)] px-1.5 py-0.5">
                            +{PERMS.filter(p => !aide.permissions?.[p.key]).length} inactifs
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0 self-center">
                      <button onClick={() => openPerm(aide)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[var(--pri)] bg-[var(--pri-lt)] hover:bg-[var(--pri-bd)] rounded-lg border border-[var(--pri-bd)] transition-colors">
                        <Settings2 className="w-3.5 h-3.5" /> Permissions
                      </button>
                      <button onClick={() => supprimer(aide)}
                        className="p-1.5 text-[var(--t3)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-[var(--ln)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pas de résultats en attente */}
      {tab === 'en_attente' && pending.length === 0 && !loading && (
        <div className="bg-[var(--sf)] border border-dashed border-[var(--ln)] rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-[var(--t2)]">
            {search ? 'Aucune demande ne correspond' : 'Aucune demande en attente'}
          </p>
        </div>
      )}

      {/* ══ MODAL REFUS ══ */}
      <AnimatePresence>
        {refuseModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRefuseModal(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-[var(--sf)] rounded-2xl border border-[var(--ln)] shadow-2xl overflow-hidden">
                <div className="px-5 py-4 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20 flex items-center gap-3">
                  <UserX className="w-4 h-4 text-red-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-red-800 dark:text-red-300">Refuser la demande</p>
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">{refuseModal.prenom} {refuseModal.nom} — {refuseModal.email}</p>
                  </div>
                  <button onClick={() => setRefuseModal(null)} className="text-[var(--t4)] hover:text-[var(--t2)]"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-[var(--t2)] mb-4">Un email sera envoyé automatiquement à l'aide soignant avec votre réponse.</p>
                  <label className="block text-xs font-bold text-[var(--t3)] uppercase tracking-wide mb-1.5">
                    Motif <span className="font-normal normal-case">(optionnel)</span>
                  </label>
                  <textarea value={motif} onChange={e => setMotif(e.target.value)}
                    placeholder="Ex : Équipe complète, poste non disponible…"
                    rows={3} className="w-full px-3 py-2 border border-[var(--ln)] rounded-lg bg-[var(--sf2)] text-sm text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                  />
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setRefuseModal(null)} className="flex-1 py-2 border border-[var(--ln)] text-[var(--t2)] rounded-lg text-sm hover:bg-[var(--sf2)] transition-colors">Annuler</button>
                    <button onClick={refuser} disabled={refuseLoading}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                      {refuseLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ MODAL PERMISSIONS ══ */}
      <AnimatePresence>
        {permModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPermModal(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-[var(--sf)] rounded-2xl border border-[var(--ln)] shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[var(--ln)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: BRAND }} />
                    <div>
                      <p className="font-bold text-sm text-[var(--t1)]">Permissions</p>
                      <p className="text-xs text-[var(--t3)]">{permModal.prenom} {permModal.nom}</p>
                    </div>
                  </div>
                  <button onClick={() => setPermModal(null)} className="text-[var(--t4)] hover:text-[var(--t2)]"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-4 py-3 space-y-2 max-h-[52vh] overflow-y-auto">
                  {PERMS.map(p => (
                    <div key={p.key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      perms[p.key]
                        ? p.danger ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
                                   : 'bg-[var(--pri-lt)] border-[var(--pri-bd)]'
                        : 'bg-[var(--sf2)] border-[var(--ln)]'
                    }`}>
                      <div className="mr-3 min-w-0">
                        <p className={`text-sm font-semibold ${p.danger ? 'text-red-700 dark:text-red-400' : 'text-[var(--t1)]'}`}>{p.label}</p>
                        <p className="text-xs text-[var(--t4)]">{p.desc}</p>
                      </div>
                      <button onClick={() => setPerms(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                        className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${
                          perms[p.key] ? (p.danger ? 'bg-red-500' : 'bg-[var(--pri)]') : 'bg-[var(--ln)]'
                        }`}
                        style={perms[p.key] && !p.danger ? { backgroundColor: BRAND } : undefined}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${perms[p.key] ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[var(--ln)] flex gap-2">
                  <button onClick={() => setPermModal(null)} className="flex-1 py-2 border border-[var(--ln)] text-[var(--t2)] rounded-lg text-sm hover:bg-[var(--sf2)] transition-colors">Annuler</button>
                  <button onClick={savePerm} disabled={permLoading}
                    className="flex-1 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: BRAND }}>
                    {permLoading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
