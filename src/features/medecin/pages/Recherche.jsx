// src/features/medecin/pages/Recherche.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, SlidersHorizontal, X, Users, Stethoscope, FileText,
  ChevronRight, Clock, Calendar, Loader2, Sparkles,
  Activity, TrendingUp, BookOpen, MessageCircle, Eye,
  QrCode, Send, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, UserCheck, Lock, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfil } from '../hooks/useAuth';
import {
  demanderAcces,
  mesDemandesEnvoyees,
  rechercheParCode,
} from '../services/api';

// ── Patients mockés (indépendants du médecin connecté) ──────────────────────
const DEFAULT_PATIENTS = [
  { id:1, name:'Tamo Bernard',    age:47, pathology:'Pneumonie bactérienne', lastVisit:'2026-04-08', status:'actif',     avatar:'TB' },
  { id:2, name:'Fouda Marie',     age:52, pathology:'BPCO stade 3',          lastVisit:'2026-04-08', status:'actif',     avatar:'FM' },
  { id:3, name:'Nguema Paul',     age:63, pathology:'Asthme sévère',         lastVisit:'2026-04-07', status:'actif',     avatar:'NP' },
  { id:4, name:'Mboma Éric',      age:35, pathology:'Bronchite aiguë',       lastVisit:'2026-04-07', status:'en_attente',avatar:'MÉ' },
  { id:5, name:'Kamga Jean',      age:71, pathology:'Tuberculose',           lastVisit:'2026-04-06', status:'critique',  avatar:'KJ' },
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

const ACCES_STYLE = {
  en_attente: { bg:'bg-amber-50 dark:bg-amber-900/20',  border:'border-amber-200 dark:border-amber-800',  dot:'bg-amber-400',  label:'En attente',   text:'text-amber-700 dark:text-amber-400'  },
  accorde:    { bg:'bg-emerald-50 dark:bg-emerald-900/20', border:'border-emerald-200 dark:border-emerald-800', dot:'bg-emerald-500', label:'Accès accordé', text:'text-emerald-700 dark:text-emerald-400' },
  refuse:     { bg:'bg-red-50 dark:bg-red-900/20',      border:'border-red-200 dark:border-red-800',      dot:'bg-red-500',    label:'Refusé',       text:'text-red-700 dark:text-red-400'      },
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' });
};

export default function Recherche() {
  const { profil } = useProfil();

  // ── Tab principal : 'recherche' | 'acces' ──
  const [mainTab, setMainTab] = useState('recherche');

  // ── Onglet recherche (données propres) ──
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [tab,      setTab]      = useState('patients');
  const [filters,  setFilters]  = useState({ status:'all', date:'', pathology:'' });
  const [showFilt, setShowFilt] = useState(false);
  const inputRef = useRef(null);

  // ── Onglet accès partagés ──
  const [code,          setCode]          = useState('');
  const [codeLoading,   setCodeLoading]   = useState(false);
  const [codeResult,    setCodeResult]    = useState(null);   // patient partiel
  const [codeError,     setCodeError]     = useState('');
  const [justificatif,  setJustificatif]  = useState('');
  const [sendLoading,   setSendLoading]   = useState(false);
  const [sendMsg,       setSendMsg]       = useState('');     // succès/erreur
  const [demandes,      setDemandes]      = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(false);

  // ── Charger les demandes envoyées ──
  const loadDemandes = useCallback(async () => {
    setDemandesLoading(true);
    try {
      const data = await mesDemandesEnvoyees();
      setDemandes(data);
    } catch {
      // silencieux
    } finally {
      setDemandesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'acces') loadDemandes();
  }, [mainTab, loadDemandes]);

  // ── Recherche par code ──
  const handleCodeSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setCodeLoading(true); setCodeResult(null); setCodeError(''); setSendMsg('');
    try {
      const data = await rechercheParCode(code.trim().toUpperCase());
      setCodeResult(data);
    } catch (err) {
      setCodeError(err.message || 'Patient introuvable');
    } finally {
      setCodeLoading(false);
    }
  };

  // ── Envoyer demande d'accès ──
  const handleDemanderAcces = async () => {
    if (!codeResult) return;
    setSendLoading(true); setSendMsg('');
    try {
      await demanderAcces({ patient_id: codeResult.id, justificatif: justificatif.trim() || null });
      setSendMsg('ok');
      setCodeResult(null); setCode(''); setJustificatif('');
      loadDemandes();
    } catch (err) {
      setSendMsg('err:' + (err.message || 'Erreur'));
    } finally {
      setSendLoading(false);
    }
  };

  // ── Recherche dans données propres (mocks) ──
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q') || '';
    if (q) { setQuery(q); doSearch(q); }
    inputRef.current?.focus();
  }, []);

  const nomMedecin = profil ? `${profil.civilite || 'Dr'}. ${profil.prenom} ${profil.nom}` : 'Dr.';

  const DEFAULT_CONSULTATIONS = [
    { id:1, patient:'Tamo Bernard', date:'2026-04-08', time:'14:30', status:'completed', pathology:'Pneumonie', doctor: nomMedecin },
    { id:2, patient:'Fouda Marie',  date:'2026-04-08', time:'11:20', status:'completed', pathology:'BPCO',      doctor: nomMedecin },
  ];
  const DEFAULT_CAS = [
    { id:1, title:'BPCO stade avancé', author: nomMedecin, date:'2026-04-01', comments:12, views:89, pathology:'BPCO' },
  ];

  const doSearch = (q) => {
    if (!q.trim()) return;
    setLoading(true); setResults(null);
    const lo = q.toLowerCase();
    setTimeout(() => {
      const pts = DEFAULT_PATIENTS;
      const cns = DEFAULT_CONSULTATIONS;
      const cas = DEFAULT_CAS;
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
      (!filters.pathology || p.pathology.toLowerCase().includes(filters.pathology.toLowerCase()))
    ),
    consultations: results.consultations.filter(c =>
      (filters.status === 'all' || c.status === filters.status) &&
      (!filters.pathology || c.pathology.toLowerCase().includes(filters.pathology.toLowerCase()))
    ),
    cas: results.cas.filter(c =>
      (!filters.pathology || c.pathology.toLowerCase().includes(filters.pathology.toLowerCase()))
    ),
  } : null;

  const total = filtered ? filtered.patients.length + filtered.consultations.length + filtered.cas.length : 0;

  const searchTabs = [
    { id:'patients',      label:'Patients',     icon:Users,       count: filtered?.patients.length      ?? 0 },
    { id:'consultations', label:'Consultations', icon:Stethoscope, count: filtered?.consultations.length ?? 0 },
    { id:'cas',           label:'Cas cliniques', icon:FileText,    count: filtered?.cas.length           ?? 0 },
  ];

  const nbAccordes   = demandes.filter(d => d.statut === 'accorde').length;
  const nbEnAttente  = demandes.filter(d => d.statut === 'en_attente').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── En-tête ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Recherche</h1>
          <p className="text-sm text-(--t3) mt-0.5">Patients, consultations, accès partagés</p>
        </div>
      </div>

      {/* ── Onglets principaux ───────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-(--sf2) rounded-2xl w-fit">
        <button
          onClick={() => setMainTab('recherche')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mainTab === 'recherche'
              ? 'bg-(--sf) text-(--t1) shadow-sm'
              : 'text-(--t3) hover:text-(--t2)'
          }`}
        >
          <Search className="w-4 h-4" />
          Recherche
        </button>
        <button
          onClick={() => setMainTab('acces')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mainTab === 'acces'
              ? 'bg-(--sf) text-(--t1) shadow-sm'
              : 'text-(--t3) hover:text-(--t2)'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Accès partagés
          {nbEnAttente > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full font-bold">
              {nbEnAttente}
            </span>
          )}
          {nbAccordes > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full font-bold">
              {nbAccordes}
            </span>
          )}
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
          ONGLET RECHERCHE (données propres)
      ════════════════════════════════════════════════════════ */}
      {mainTab === 'recherche' && (
        <>
          {/* Barre de recherche */}
          <form onSubmit={e => { e.preventDefault(); doSearch(query); }}
            className="flex gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--t4) group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nom du patient, pathologie, cas clinique…"
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

          {/* Filtres */}
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
                      </select>
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

          {/* Chargement */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-(--t3)">Recherche en cours…</p>
            </div>
          )}

          {/* Résultats */}
          {filtered && !loading && (
            <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} className="space-y-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {total} résultat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                </span>
              </div>

              {/* Onglets résultats */}
              <div className="flex gap-1 p-1 bg-(--sf2) rounded-2xl">
                {searchTabs.map(t => {
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
                      }`}>{t.count}</span>
                    </button>
                  );
                })}
              </div>

              {tab === 'patients' && (
                <div className="space-y-3">
                  {filtered.patients.length > 0 ? filtered.patients.map((p, i) => (
                    <motion.div key={p.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                      <Link to={`/medecin/patients/${p.id}`}
                        className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                          {p.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-(--t1) group-hover:text-blue-600 transition-colors">{p.name}</h3>
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

              {tab === 'consultations' && (
                <div className="space-y-3">
                  {filtered.consultations.length > 0 ? filtered.consultations.map((c, i) => (
                    <motion.div key={c.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                      <div className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-(--t1)">{c.patient}</h3>
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
                      </div>
                    </motion.div>
                  )) : <EmptyState icon={Stethoscope} label="Aucune consultation correspondante" />}
                </div>
              )}

              {tab === 'cas' && (
                <div className="space-y-3">
                  {filtered.cas.length > 0 ? filtered.cas.map((c, i) => (
                    <motion.div key={c.id} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}>
                      <div className="flex items-center gap-4 p-4 bg-(--sf) border border-(--ln) rounded-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-(--t1)">{c.title}</h3>
                          <p className="text-sm text-(--t3) mt-0.5">Par {c.author} · {fmtDate(c.date)}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-(--t4)">
                            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{c.comments}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.views} vues</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )) : <EmptyState icon={FileText} label="Aucun cas clinique correspondant" />}
                </div>
              )}
            </motion.div>
          )}

          {/* État initial */}
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

          {filtered && !loading && total === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="w-10 h-10 text-(--t4) mb-3" />
              <p className="font-semibold text-(--t2)">Aucun résultat pour «&nbsp;{query}&nbsp;»</p>
              <p className="text-sm text-(--t3) mt-1">Essayez un autre terme ou vérifiez l'orthographe.</p>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          ONGLET ACCÈS PARTAGÉS
      ════════════════════════════════════════════════════════ */}
      {mainTab === 'acces' && (
        <div className="space-y-6">

          {/* ── Recherche par code patient ── */}
          <div className="bg-(--sf) border border-(--ln) rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-(--t1)">Recherche par code patient</h2>
                <p className="text-xs text-(--t3)">Entrez le code unique du dossier pour demander l'accès</p>
              </div>
            </div>

            <form onSubmit={handleCodeSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setCodeResult(null); setCodeError(''); setSendMsg(''); }}
                  placeholder="Ex : ABCD1234EF56"
                  maxLength={15}
                  className="w-full px-4 py-2.5 text-sm border-2 border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-widest uppercase"
                />
              </div>
              <button type="submit" disabled={codeLoading || !code.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {codeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Rechercher
              </button>
            </form>

            {/* Erreur de recherche */}
            {codeError && (
              <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}}
                className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                <XCircle className="w-4 h-4 shrink-0" />
                {codeError}
              </motion.div>
            )}

            {/* Succès envoi demande */}
            {sendMsg === 'ok' && (
              <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}}
                className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Demande envoyée avec succès. Le médecin propriétaire sera notifié.
              </motion.div>
            )}
            {sendMsg.startsWith('err:') && (
              <motion.div initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}}
                className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
                <XCircle className="w-4 h-4 shrink-0" />
                {sendMsg.slice(4)}
              </motion.div>
            )}

            {/* Fiche partielle patient trouvé */}
            <AnimatePresence>
              {codeResult && (
                <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0}}
                  className="mt-4 border border-(--ln) rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-(--sf2) border-b border-(--ln) flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-(--t4)" />
                    <span className="text-xs text-(--t3) font-medium">Fiche partielle — accès restreint</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoItem label="Nom" value={`${codeResult.civilite || ''} ${codeResult.prenom} ${codeResult.nom}`} />
                    <InfoItem label="Âge" value={codeResult.age ? `${codeResult.age} ans` : '—'} />
                    <InfoItem label="Sexe" value={codeResult.sexe || '—'} />
                    <InfoItem label="Groupe sanguin" value={codeResult.groupe_sanguin || '—'} />
                    <InfoItem label="Médecin référent" value={codeResult.medecin_referent || '—'} />
                  </div>
                  <div className="px-4 pb-4">
                    <label className="block text-xs font-medium text-(--t3) mb-1.5">
                      Justificatif de la demande <span className="text-(--t4)">(optionnel)</span>
                    </label>
                    <textarea
                      value={justificatif}
                      onChange={e => setJustificatif(e.target.value)}
                      placeholder="Motif médical, urgence, transfert de soin…"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      onClick={handleDemanderAcces}
                      disabled={sendLoading}
                      className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {sendLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi…</>
                        : <><Send className="w-4 h-4" />Demander l'accès au dossier</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mes demandes d'accès ── */}
          <div className="bg-(--sf) border border-(--ln) rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-(--t1)">Mes demandes d'accès</h2>
                  <p className="text-xs text-(--t3)">{demandes.length} demande{demandes.length > 1 ? 's' : ''} au total</p>
                </div>
              </div>
              <button onClick={loadDemandes} disabled={demandesLoading}
                className="p-2 text-(--t3) hover:text-(--t1) transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${demandesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {demandesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : demandes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <UserCheck className="w-10 h-10 text-(--t4) mb-3" />
                <p className="text-sm font-medium text-(--t3)">Aucune demande envoyée</p>
                <p className="text-xs text-(--t4) mt-1">Utilisez la recherche par code pour demander l'accès à un dossier.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {demandes.map((d, i) => {
                  const cfg = ACCES_STYLE[d.statut] || ACCES_STYLE.en_attente;
                  return (
                    <motion.div key={d.id} initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay: i * 0.04}}
                      className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-(--t1) text-sm">
                              {d.patient_prenom} {d.patient_nom}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${cfg.text} bg-white/60 dark:bg-black/20`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>
                          {d.medecin_proprietaire && (
                            <p className="text-xs text-(--t3) mb-1">
                              Médecin référent : <span className="font-medium">{d.medecin_proprietaire}</span>
                            </p>
                          )}
                          {d.justificatif && (
                            <p className="text-xs text-(--t4) italic">« {d.justificatif} »</p>
                          )}
                          {d.statut === 'refuse' && d.motif_refus && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              Motif : {d.motif_refus}
                            </p>
                          )}
                          <p className="text-[10px] text-(--t4) mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Demandé le {fmtDate(d.created_at)}
                            {d.updated_at && d.statut !== 'en_attente' && ` · Répondu le ${fmtDate(d.updated_at)}`}
                          </p>
                        </div>

                        {/* Action : si accordé, lien vers le dossier */}
                        {d.statut === 'accorde' && (
                          <Link
                            to={`/medecin/patients/${d.patient_id}`}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
                            Voir le dossier
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 bg-(--sf) border border-(--ln) rounded-2xl text-center">
      <Icon className="w-10 h-10 text-(--t4) mb-3" />
      <p className="text-sm font-medium text-(--t3)">{label}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-(--t4) uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-(--t1) mt-0.5">{value}</p>
    </div>
  );
}
