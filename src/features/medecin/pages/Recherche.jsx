// src/features/medecin/pages/Recherche.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Search, SlidersHorizontal, X, Users, Stethoscope, FileText,
  ChevronRight, Clock, Calendar, Loader2, Sparkles,
  Activity, TrendingUp, BookOpen, MessageCircle, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfil } from '../hooks/useAuth';

// ── Patients mockés (indépendants du médecin connecté) ──────────────────────
const DEFAULT_PATIENTS = [
  { id:1, name:'Tamo Bernard',    age:47, pathology:'Pneumonie bactérienne', lastVisit:'2026-04-08', status:'actif',     avatar:'TB' },
  { id:2, name:'Fouda Marie',     age:52, pathology:'BPCO stade 3',          lastVisit:'2026-04-08', status:'actif',     avatar:'FM' },
  { id:3, name:'Nguema Paul',     age:63, pathology:'Asthme sévère',         lastVisit:'2026-04-07', status:'actif',     avatar:'NP' },
  { id:4, name:'Mboma Éric',      age:35, pathology:'Bronchite aiguë',       lastVisit:'2026-04-07', status:'en_attente',avatar:'MÉ' },
  { id:5, name:'Kamga Jean',      age:71, pathology:'Tuberculose',           lastVisit:'2026-04-06', status:'critique',  avatar:'KJ' },
  { id:6, name:'Manga Honorine',  age:58, pathology:'Fibrose pulmonaire',    lastVisit:'2026-04-05', status:'actif',     avatar:'MH' },
  { id:7, name:'Essomba Patrice', age:44, pathology:'Apnée du sommeil',      lastVisit:'2026-04-04', status:'actif',     avatar:'EP' },
  { id:8, name:'Biya Christine',  age:29, pathology:'Pneumonie',             lastVisit:'2026-04-03', status:'en_attente',avatar:'BC' },
];

const SUGGESTIONS = ['Pneumonie', 'BPCO', 'Asthme', 'Tuberculose', 'Bronchite'];

const STATUS_STYLE = {
  actif:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_attente: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  critique:   'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};
const STATUS_LABEL = { actif:'Actif', en_attente:'En attente', critique:'Critique', completed:'Terminée', cancelled:'Annulée' };

const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });

export default function Recherche() {
  const { profil } = useProfil();
  const nomMedecin = profil
    ? `${profil.civilite || 'Dr'}. ${profil.prenom} ${profil.nom}`
    : 'Dr.';

  const DEFAULT_CONSULTATIONS = [
    { id:1, patient:'Tamo Bernard', date:'2026-04-08', time:'14:30', status:'completed', pathology:'Pneumonie',  doctor: nomMedecin },
    { id:2, patient:'Fouda Marie',  date:'2026-04-08', time:'11:20', status:'completed', pathology:'BPCO',       doctor: nomMedecin },
    { id:3, patient:'Nguema Paul',  date:'2026-04-07', time:'09:15', status:'completed', pathology:'Asthme',     doctor: nomMedecin },
    { id:4, patient:'Mboma Éric',   date:'2026-04-07', time:'16:45', status:'cancelled', pathology:'Bronchite',  doctor: nomMedecin },
    { id:5, patient:'Kamga Jean',   date:'2026-04-06', time:'10:00', status:'completed', pathology:'Tuberculose',doctor: nomMedecin },
  ];

  const DEFAULT_CAS = [
    { id:1, title:'BPCO stade avancé',                     author: nomMedecin, date:'2026-04-01', comments:12, views:89,  pathology:'BPCO'       },
    { id:2, title:'Pneumonie résistante aux antibiotiques', author: nomMedecin, date:'2026-03-25', comments:8,  views:67,  pathology:'Pneumonie'  },
    { id:3, title:"Asthme sévère chez l'adulte",           author: nomMedecin, date:'2026-03-20', comments:15, views:124, pathology:'Asthme'     },
    { id:4, title:'Tuberculose multirésistante',            author: nomMedecin, date:'2026-03-15', comments:10, views:56,  pathology:'Tuberculose'},
  ];

  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [tab,      setTab]      = useState('patients');
  const [filters,  setFilters]  = useState({ status:'all', date:'', pathology:'' });
  const [showFilt, setShowFilt] = useState(false);
  const inputRef = useRef(null);

  // Lire le param URL au montage
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') || '';
    if (q) { setQuery(q); doSearch(q); }
    inputRef.current?.focus();
  }, []);

  const doSearch = (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setResults(null);
    const lo = q.toLowerCase();
    setTimeout(() => {
      const pts = JSON.parse(localStorage.getItem('medecin_patients')  || 'null') || DEFAULT_PATIENTS;
      const cns = JSON.parse(localStorage.getItem('medecin_consultations') || 'null') || DEFAULT_CONSULTATIONS;
      const cas = JSON.parse(localStorage.getItem('medecin_cas')       || 'null') || DEFAULT_CAS;
      setResults({
        patients:      pts.filter(p => p.name.toLowerCase().includes(lo) || p.pathology.toLowerCase().includes(lo)),
        consultations: cns.filter(c => c.patient.toLowerCase().includes(lo) || c.pathology.toLowerCase().includes(lo)),
        cas:           cas.filter(c => c.title.toLowerCase().includes(lo) || c.pathology.toLowerCase().includes(lo)),
      });
      setLoading(false);
    }, 350);
  };

  const filtered = results ? {
    patients:      results.patients.filter(p =>
      (filters.status === 'all' || p.status === filters.status) &&
      (!filters.pathology || p.pathology.toLowerCase().includes(filters.pathology.toLowerCase())) &&
      (!filters.date || p.lastVisit === filters.date)
    ),
    consultations: results.consultations.filter(c =>
      (filters.status === 'all' || c.status === filters.status) &&
      (!filters.pathology || c.pathology.toLowerCase().includes(filters.pathology.toLowerCase())) &&
      (!filters.date || c.date === filters.date)
    ),
    cas: results.cas.filter(c =>
      (!filters.pathology || c.pathology.toLowerCase().includes(filters.pathology.toLowerCase())) &&
      (!filters.date || c.date === filters.date)
    ),
  } : null;

  const total = filtered ? filtered.patients.length + filtered.consultations.length + filtered.cas.length : 0;

  const tabs = [
    { id:'patients',      label:'Patients',      icon:Users,       count: filtered?.patients.length      ?? 0 },
    { id:'consultations', label:'Consultations',  icon:Stethoscope, count: filtered?.consultations.length ?? 0 },
    { id:'cas',           label:'Cas cliniques',  icon:FileText,    count: filtered?.cas.length           ?? 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Recherche</h1>
          <p className="text-sm text-(--t3) mt-0.5">Patients, consultations, cas cliniques</p>
        </div>
        {filtered && (
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            {total} résultat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
          </motion.div>
        )}
      </div>

      {/* ── Barre de recherche ───────────────────────────────────────────────── */}
      <form onSubmit={e => { e.preventDefault(); doSearch(query); window.history.pushState({}, '', `/medecin/recherche?q=${encodeURIComponent(query)}`); }}
        className="flex gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--t4) group-focus-within:text-blue-500 transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nom, pathologie, cas clinique…"
            className="w-full pl-12 pr-10 py-3.5 text-sm border-2 border-(--ln) rounded-2xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--t4) hover:text-(--t2) transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit"
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95">
          Rechercher
        </button>
        <button type="button" onClick={() => setShowFilt(!showFilt)}
          className={`px-4 py-3.5 rounded-2xl border-2 transition-all ${showFilt ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-(--ln) bg-(--sf) text-(--t3) hover:border-(--ln2)'}`}>
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </form>

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilt && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}}
            className="overflow-hidden">
            <div className="bg-(--sf) border border-(--ln) rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-(--t1)">Filtres avancés</span>
                <button onClick={() => setFilters({ status:'all', date:'', pathology:'' })}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-(--t3) mb-1.5">Statut</label>
                  <select value={filters.status} onChange={e => setFilters(p => ({...p, status:e.target.value}))}
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">Tous</option>
                    <option value="actif">Actif</option>
                    <option value="en_attente">En attente</option>
                    <option value="critique">Critique</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--t3) mb-1.5">Date</label>
                  <input type="date" value={filters.date} onChange={e => setFilters(p => ({...p, date:e.target.value}))}
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-(--t3) mb-1.5">Pathologie</label>
                  <input type="text" value={filters.pathology} onChange={e => setFilters(p => ({...p, pathology:e.target.value}))}
                    placeholder="Pneumonie, BPCO…"
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chargement ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-(--t3)">Recherche en cours…</p>
        </div>
      )}

      {/* ── Résultats ────────────────────────────────────────────────────────── */}
      {filtered && !loading && (
        <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} className="space-y-5">

          {/* Onglets */}
          <div className="flex gap-1 p-1 bg-(--sf2) rounded-2xl">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-(--sf3) text-(--t4)'
                  }`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── PATIENTS ── */}
          {tab === 'patients' && (
            <div className="space-y-3">
              {filtered.patients.length > 0 ? filtered.patients.map((p, i) => (
                <motion.div key={p.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                  <Link to={`/medecin/patients/${p.id}`}
                    className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                      {p.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-(--t1) group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {p.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[p.status]}`}>
                          {STATUS_LABEL[p.status]}
                        </span>
                      </div>
                      <p className="text-sm text-(--t3) mt-0.5">{p.age} ans • {p.pathology}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-(--t4)">
                        <Calendar className="w-3 h-3" />
                        Dernière visite : {fmtDate(p.lastVisit)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-(--t4) group-hover:text-blue-500 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              )) : <EmptyState icon={Users} label="Aucun patient correspondant" />}
            </div>
          )}

          {/* ── CONSULTATIONS ── */}
          {tab === 'consultations' && (
            <div className="space-y-3">
              {filtered.consultations.length > 0 ? filtered.consultations.map((c, i) => (
                <motion.div key={c.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                  <Link to={`/medecin/consultation/${c.id}`}
                    className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-(--t1) group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {c.patient}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[c.status]}`}>
                          {STATUS_LABEL[c.status]}
                        </span>
                      </div>
                      <p className="text-sm text-(--t3) mt-0.5">{c.pathology}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-(--t4)">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(c.date)} · {c.time}</span>
                        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{c.doctor}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-(--t4) group-hover:text-blue-500 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              )) : <EmptyState icon={Stethoscope} label="Aucune consultation correspondante" />}
            </div>
          )}

          {/* ── CAS CLINIQUES ── */}
          {tab === 'cas' && (
            <div className="space-y-3">
              {filtered.cas.length > 0 ? filtered.cas.map((c, i) => (
                <motion.div key={c.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                  <Link to={`/medecin/cas-cliniques/${c.id}`}
                    className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl hover:border-purple-300 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-(--t1) group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-sm text-(--t3) mt-0.5">Par {c.author} · {fmtDate(c.date)}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-(--t4)">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{c.comments}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.views} vues</span>
                        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
                          {c.pathology}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-(--t4) group-hover:text-purple-500 transition-colors shrink-0" />
                  </Link>
                </motion.div>
              )) : <EmptyState icon={FileText} label="Aucun cas clinique correspondant" />}
            </div>
          )}
        </motion.div>
      )}

      {/* ── État initial (sans recherche) ────────────────────────────────────── */}
      {!query && !loading && !results && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-5">
            <Search className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-(--t1) mb-2">Lancez votre recherche</h3>
          <p className="text-sm text-(--t3) mb-6 max-w-sm">
            Trouvez un patient, une consultation passée ou un cas clinique partagé.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-(--t4) self-center">Suggestions :</span>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                className="px-3 py-1.5 bg-(--sf2) hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-(--ln) hover:border-blue-300 text-(--t2) hover:text-blue-700 dark:hover:text-blue-300 text-xs rounded-full transition-all font-medium">
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Aucun résultat global ────────────────────────────────────────────── */}
      {filtered && !loading && total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="w-10 h-10 text-(--t4) mb-3" />
          <p className="font-semibold text-(--t2)">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
          <p className="text-sm text-(--t3) mt-1">Essayez un autre terme ou vérifiez l'orthographe.</p>
        </div>
      )}
    </div>
  );
}

// ── Composant vide ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 bg-(--sf) border border-(--ln) rounded-2xl text-center">
      <Icon className="w-10 h-10 text-(--t4) mb-3" />
      <p className="text-sm font-medium text-(--t3)">{label}</p>
    </div>
  );
}
