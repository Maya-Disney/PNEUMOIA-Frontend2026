import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, ChevronRight, AlertTriangle,
  Loader2, Calendar, Phone, Lock
} from 'lucide-react';
import { getMesPatientsAide } from '../../../services/patientsApi';

const RED = '#DC2626';

const STATUS_CFG = {
  actif:   { label:'Actif',      cls:'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/15' },
  urgent:  { label:'Urgent',     cls:'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/15' },
  attente: { label:'En attente', cls:'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/15' },
  cloture: { label:'Clôturé',    cls:'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/15' },
};

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

  if (error === 'access') return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h2 className="font-bold text-lg text-(--t1)">Accès restreint</h2>
        <p className="text-sm text-(--t3) mt-1 max-w-xs">Vous n'avez pas les permissions nécessaires pour accéder aux dossiers patients.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-5">

      {/* ── En-tête ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-(--t4) mb-0.5">Mes patients</p>
          <h1 className="text-xl font-black text-(--t1)">
            {loading ? '—' : `${patients.length} patient${patients.length > 1 ? 's' : ''}`}
          </h1>
        </div>
        {perms.peut_creer_patient && (
          <Link to="/aide/patients/nouveau"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors active:scale-95 shadow-sm">
            <UserPlus className="w-4 h-4" /> Nouveau patient
          </Link>
        )}
      </motion.div>

      {/* ── Barre de recherche ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.06 }}
        className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom, email…"
          className="w-full pl-10 pr-4 py-2.5 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-red-400/25 focus:border-red-400 transition-all" />
      </motion.div>

      {/* ── Contenu ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-red-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
          <div>
            <p className="font-semibold text-(--t2)">Impossible de charger les patients</p>
            <p className="text-xs text-(--t4) mt-1">{error}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-(--sf2) flex items-center justify-center">
            <Users className="w-7 h-7 text-(--t4)" />
          </div>
          <div>
            <p className="font-semibold text-(--t2)">{search ? 'Aucun résultat' : 'Aucun patient'}</p>
            <p className="text-xs text-(--t4) mt-0.5">
              {search ? `Aucun patient correspondant à "${search}"` : 'Commencez par ajouter un patient'}
            </p>
          </div>
          {!search && perms.peut_creer_patient && (
            <Link to="/aide/patients/nouveau"
              className="mt-1 text-sm font-bold text-white px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-colors">
              Ajouter un patient
            </Link>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: 0.1 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
          {/* Compteur */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-(--ln) bg-(--sf2)">
            <span className="text-xs font-bold text-(--t3) uppercase tracking-widest">
              {filtered.length} patient{filtered.length > 1 ? 's' : ''}
            </span>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-xs text-(--t4) hover:text-(--t2) transition-colors">
                Effacer la recherche
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="divide-y divide-(--ln)">
            {filtered.map(p => {
              const st  = STATUS_CFG[p.statut] || STATUS_CFG.actif;
              const ini = initials(p.nom, p.prenom);
              return (
                <div key={p.id} onClick={() => navigate(`/aide/patients/${p.id}`)}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-(--sf2) transition-colors cursor-pointer group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {ini}
                  </div>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-(--t1)">{p.prenom} {p.nom}</span>
                      {p.statut && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.cls}`}>
                          {st.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-0.5 flex-wrap">
                      {p.date_naissance && (
                        <span className="text-xs text-(--t3) flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.date_naissance).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {p.telephone && (
                        <span className="text-xs text-(--t3) flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {p.telephone}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Flèche */}
                  {perms.peut_lire_dossier && (
                    <ChevronRight className="w-4 h-4 text-(--t4) group-hover:text-red-500 shrink-0 transition-colors" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
