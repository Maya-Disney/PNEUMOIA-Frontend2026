import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, ChevronRight, AlertTriangle,
  Loader2, Calendar, Phone, Lock, X, Activity, TrendingUp
} from 'lucide-react';
import { getMesPatientsAide } from '../../../services/patientsApi';

const P  = '#2563eb';
const P2 = '#1d4ed8';

const STATUS_CFG = {
  actif:   { label:'Actif',      cls:'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/15' },
  urgent:  { label:'Urgent',     cls:'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/15' },
  attente: { label:'En attente', cls:'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/15' },
  cloture: { label:'Clôturé',    cls:'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/15' },
};

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg,${P2},${P})`,
  'linear-gradient(135deg,#4f46e5,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#0284c7)',
  'linear-gradient(135deg,#7c3aed,#2563eb)',
  'linear-gradient(135deg,#059669,#0891b2)',
];
function avatarGrad(id) {
  const n = (id||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
}
function initials(nom, prenom) {
  return `${prenom?.[0]||''}${nom?.[0]||''}`.toUpperCase() || '??';
}

export default function AidePatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');

  const perms = (() => { try { return JSON.parse(localStorage.getItem('aide_permissions')||'{}'); } catch { return {}; } })();

  useEffect(() => {
    if (!perms.peut_lire_dossier && !perms.peut_creer_patient && !perms.peut_modifier_patient) {
      setError('access'); setLoading(false); return;
    }
    getMesPatientsAide()
      .then(d => setPatients(Array.isArray(d) ? d : (d?.patients || [])))
      .catch(e => setError(e.message || 'Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${p.prenom||''} ${p.nom||''} ${p.email||''}`.toLowerCase().includes(q);
  });

  const urgentCount  = patients.filter(p => p.statut === 'urgent').length;
  const activeCount  = patients.filter(p => p.statut === 'actif' || !p.statut).length;
  const attenteCount = patients.filter(p => p.statut === 'attente').length;

  if (error === 'access') return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 8px 32px rgba(37,99,235,0.30)` }}>
        <Lock className="w-9 h-9 text-white" />
      </div>
      <div>
        <h2 className="font-black text-xl text-(--t1)">Accès restreint</h2>
        <p className="text-sm text-(--t3) mt-2 max-w-sm">Vous n'avez pas les permissions nécessaires pour accéder aux dossiers patients.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">

      {/* ── Banner ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.28)` }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#93c5fd,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
              <Users size={22} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Liste des patients</p>
              <h1 className="text-2xl font-black text-white">
                {loading ? '…' : `${patients.length} patient${patients.length > 1 ? 's' : ''}`}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { val: activeCount,  lbl:'Actifs',     color:'bg-white/10 border-white/20' },
              ...(urgentCount  > 0 ? [{ val: urgentCount,  lbl:'Urgents',    color:'bg-red-500/30 border-red-400/40' }] : []),
              ...(attenteCount > 0 ? [{ val: attenteCount, lbl:'En attente', color:'bg-amber-500/20 border-amber-400/30' }] : []),
            ].map(s => (
              <div key={s.lbl} className={`text-center px-3 py-2 rounded-xl border ${s.color}`}>
                <p className="text-lg font-black text-white">{s.val}</p>
                <p className="text-[10px] text-white/60 font-bold">{s.lbl}</p>
              </div>
            ))}
            {perms.peut_creer_patient && (
              <Link to="/aide/patients/nouveau"
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all hover:bg-white/25 active:scale-95"
                style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.30)', backdropFilter:'blur(8px)' }}>
                <UserPlus size={14} /> Nouveau patient
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Barre de recherche ─── */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom, email…"
          className="w-full pl-11 pr-10 py-3 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all shadow-sm"
          style={{ '--tw-ring-color':'rgba(37,99,235,0.20)' }} />
        <AnimatePresence>
          {search && (
            <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-(--t4) hover:text-(--t2) hover:bg-(--sf2) transition-all">
              <X size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Contenu ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color:P }} />
          <p className="text-sm text-(--t4)">Chargement des patients…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-(--t1)">Impossible de charger les patients</p>
            <p className="text-sm text-(--t4) mt-1">{error}</p>
          </div>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-colors" style={{ background:P }}>
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-(--sf2) flex items-center justify-center border border-(--ln)">
            <Users className="w-8 h-8 text-(--t4)" />
          </div>
          <div>
            <p className="font-bold text-(--t2) text-lg">{search ? 'Aucun résultat' : 'Aucun patient'}</p>
            <p className="text-sm text-(--t4) mt-1">
              {search ? `Aucun patient pour "${search}"` : 'Commencez par ajouter votre premier patient'}
            </p>
          </div>
          {!search && perms.peut_creer_patient && (
            <Link to="/aide/patients/nouveau"
              className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all"
              style={{ background:`linear-gradient(135deg,${P2},${P})`, boxShadow:`0 4px 16px rgba(37,99,235,0.30)` }}>
              <UserPlus size={15} /> Ajouter un patient
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.25, delay:0.1 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--ln) bg-(--sf2)">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-(--t4)" />
              <span className="text-xs font-bold text-(--t3)">
                {filtered.length} patient{filtered.length > 1 ? 's' : ''}{search ? ' · filtrés' : ''}
              </span>
            </div>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-xs font-bold hover:underline" style={{ color:P }}>
                Effacer
              </button>
            )}
          </div>

          <div className="divide-y divide-(--ln)">
            <AnimatePresence>
              {filtered.map((p, i) => {
                const st  = STATUS_CFG[p.statut] || STATUS_CFG.actif;
                const ini = initials(p.nom, p.prenom);
                const bg  = avatarGrad(p.id || p.nom);
                return (
                  <motion.div key={p.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ duration:0.18, delay: i * 0.04 }}
                    onClick={() => navigate(`/aide/patients/${p.id}`)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-(--sf2) transition-colors cursor-pointer group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                      style={{ background:bg, boxShadow:'0 2px 8px rgba(37,99,235,0.22)' }}>
                      {ini}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-(--t1)">{p.prenom} {p.nom}</span>
                        {p.statut && (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${st.cls}`}>
                            {st.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                        {p.date_naissance && (
                          <span className="text-xs text-(--t4) flex items-center gap-1">
                            <Calendar size={10} /> {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {p.telephone && (
                          <span className="text-xs text-(--t4) flex items-center gap-1">
                            <Phone size={10} /> {p.telephone}
                          </span>
                        )}
                      </div>
                    </div>
                    {perms.peut_lire_dossier && (
                      <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-(--sf2) group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                        <ChevronRight size={14} className="text-(--t4) group-hover:text-blue-600 transition-colors" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
