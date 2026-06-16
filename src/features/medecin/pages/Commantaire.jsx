// src/features/medecin/pages/Commantaire.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfil } from '../hooks/useAuth';
import {
  MessageCircle, ThumbsUp, Reply, Trash2, Send,
  Search, Star, AlertCircle, BookOpen,
  ChevronDown, ChevronUp, Clock, FolderOpen,
  CheckCircle, Pin, X, Heart,
  FileQuestion, LifeBuoy, Quote, ShieldAlert,
  FolderSearch, HelpCircle, Loader2, ThumbsDown,
  Stethoscope, Award, ChevronRight, Info,
  RotateCcw, FileText, User, Users, RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});
import { useToast } from '../../../contexts/ToastContext';

// ─── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'equipe',      label: 'Mon équipe',       icon: Users,         desc: 'Canal partagé avec vos aides soignants' },
  { id: 'comments',    label: 'Commentaires',     icon: MessageCircle, desc: 'Échanges sur vos cas cliniques publiés' },
  { id: 'confreres',   label: 'Confrères',         icon: Stethoscope,   desc: 'Consultez et commentez les publications de vos confrères' },
  { id: 'requests',    label: 'Requêtes admin',   icon: FolderSearch,  desc: 'Récupération de dossiers supprimés' },
  { id: 'questions',   label: 'Questions / FAQ',  icon: HelpCircle,    desc: 'Posez vos questions à l\'administrateur' },
  { id: 'testimonial', label: 'Mon témoignage',   icon: Quote,         desc: 'Partagez votre avis sur la plateforme' },
];

// ─── Config types messages équipe ─────────────────────────────────────────────
const typeConfigEquipeMsg = {
  rapport: { label: 'Rapport',  color: 'bg-blue-50 text-blue-700',   icon: BookOpen    },
  alerte:  { label: 'Alerte',   color: 'bg-red-50 text-red-700',     icon: AlertCircle },
  info:    { label: 'Info',     color: 'bg-amber-50 text-amber-700', icon: Star        },
};

// ─── Mock fallback équipe médecin ──────────────────────────────────────────────
const MOCK_EQUIPE_DR = [
  {
    id: 'mock-1', author: { name: 'Marie Nguessie', avatar: 'MN', role: 'Aide soignante', isDoctor: false },
    text: 'Patient TAGNE Bernard (chambre 12) : dyspnée ce matin, SpO2 88%, FR 22/min. Je l\'ai mis sous O₂ 2L/min en attendant votre passage.',
    time: '2026-06-12T08:00:00', likes: 2, liked: false, pinned: false, type: 'alerte', isMe: false,
    replies: [{ id: 'r1', author: { name: 'Dr. Merlin', avatar: 'DM', role: 'Médecin référent', isDoctor: true }, text: 'Merci. Je passerai à 9h. Bien fait pour l\'O₂.', time: '2026-06-12T08:15:00', likes: 1, liked: false }],
  },
  {
    id: 'mock-2', author: { name: 'Tagne Daril', avatar: 'TD', role: 'Aide soignant', isDoctor: false },
    text: 'Pansement chambre 8 refait ce matin. RAS. Prochain pansement samedi.',
    time: '2026-06-12T07:00:00', likes: 0, liked: false, pinned: false, type: 'rapport', isMe: false,
    replies: [],
  },
];

// ─── Données mock commentaires ─────────────────────────────────────────────────
const MOCK_COMMENTS = [
  {
    id: 1,
    casTitle: 'BPCO stade avancé — Patient 47 ans', casId: 'CAS-2024-042',
    author: { name: 'Dr. Merlin', avatar: 'DM', specialty: 'Pneumologue', hospital: 'CHU Douala' },
    text: 'Excellent cas clinique ! La prise en charge suit parfaitement les recommandations GOLD 2024. La combinaison LABA/LAMA est bien justifiée.',
    time: '2026-05-22T14:30:00', likes: 8, liked: false, pinned: true, type: 'feedback',
    replies: [
      { id: 101, author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue' }, text: 'Merci ! Le suivi EFR a confirmé l\'amélioration du VEMS à +18% après 3 mois.', time: '2026-05-22T15:10:00', likes: 3, liked: false },
    ]
  },
  {
    id: 2,
    casTitle: 'Pneumonie bactérienne — Antibiothérapie probabiliste', casId: 'CAS-2024-038',
    author: { name: 'Dr. Nkoa', avatar: 'DN', specialty: 'Pneumologue', hospital: 'Clinique La Paix' },
    text: 'Envisageriez-vous une extension à 10 jours avec un germe atypique suspecté plutôt que 7 ?',
    time: '2026-05-21T09:15:00', likes: 4, liked: true, pinned: false, type: 'question',
    replies: []
  },
  {
    id: 3,
    casTitle: 'Tuberculose pulmonaire — Suivi thérapeutique', casId: 'CAS-2024-031',
    author: { name: 'Dr. Abanda', avatar: 'DA', specialty: 'Infectiologue', hospital: 'Hôpital Général' },
    text: 'La gestion des effets indésirables hépatiques du traitement antituberculeux est rarement aussi bien documentée.',
    time: '2026-05-20T16:45:00', likes: 12, liked: false, pinned: false, type: 'feedback',
    replies: [
      { id: 201, author: { name: 'Dr. Fouda', avatar: 'DF', specialty: 'Hépatologue' }, text: 'Les transaminases à 3x la normale ont nécessité une adaptation du protocole.', time: '2026-05-20T17:20:00', likes: 5, liked: false },
    ]
  },
];

// ─── Données mock requêtes ─────────────────────────────────────────────────────
const MOCK_REQUESTS = [
  { id: 1, type: 'recuperation', patientNom: 'TAGNE Bernard', dossierId: 'PNEU-004821', dateSuppression: '2026-04-02', statut: 'en_attente', motif: 'Erreur de suppression — suivi en cours pour exacerbation BPCO.', date: '2026-05-12' },
  { id: 2, type: 'recuperation', patientNom: 'FOUDA Marie', dossierId: 'PNEU-001234', dateSuppression: '2026-03-15', statut: 'approuve', motif: 'Reprise du suivi après hospitalisation.', date: '2026-04-20', reponseAdmin: 'Dossier restauré avec succès le 22/04/2026.' },
];

// ─── Données mock questions ────────────────────────────────────────────────────
const MOCK_QUESTIONS = [
  { id: 1, titre: 'Comment exporter les données EFR en PDF ?', message: 'Je souhaiterais exporter les données spirométriques directement depuis la fiche patient.', date: '2026-05-10', statut: 'publiee_faq', reponse: 'Rendez-vous sur la fiche patient > onglet Dossier > bouton Télécharger. Le PDF inclut automatiquement les données EFR disponibles.' },
  { id: 2, titre: 'Délai de synchronisation hors ligne ?', message: 'Après une consultation en mode hors ligne, combien de temps avant la synchronisation ?', date: '2026-05-20', statut: 'en_attente', reponse: null },
];

// ─── Mock data posts confrères ─────────────────────────────────────────────────
const MOCK_CONFRERES = [
  {
    id: 1,
    casTitle: 'BPCO stade IV — Sevrage VNI après exacerbation',
    casId: 'CAS-2026-039',
    author: { name: 'Dr. Nkoa', avatar: 'DN', specialty: 'Pneumologue', hospital: 'Clinique La Paix', verified: true },
    text: 'Patient 68 ans BPCO stade IV, VEMS à 22%, sous triple thérapie inhalée. Exacerbation sévère avec nécessité de ventilation non invasive depuis 5 jours. Votre approche pour le sevrage VNI ? On hésite entre protocole progressif 48-72h vs sevrage nocturne d\'emblée.',
    time: '2026-06-13T10:00:00', likes: 9, liked: false, pinned: true, type: 'question',
    tags: ['BPCO', 'VNI', 'Exacerbation'],
    replies: [
      { id: 101, author: { name: 'Dr. Abanda', avatar: 'DA', specialty: 'Infectiologue' }, text: 'Excellente question. Notre protocole : sevrage progressif sur 72h avec maintien nocturne systématique les 2 premières nuits. La Capnie en réveil est le critère décisionnel clé.', time: '2026-06-13T11:30:00', likes: 4, liked: false },
    ],
  },
  {
    id: 2,
    casTitle: 'Résultats cohorte spirométrie 2025 — 142 patients BPCO',
    casId: 'RES-2026-007',
    author: { name: 'Dr. Fouda', avatar: 'DF', specialty: 'Pneumologue', hospital: 'CHU Yaoundé', verified: true },
    text: 'Résultats préliminaires de notre cohorte 2025 : sur 142 patients BPCO suivis sur 12 mois, 78% montrent une amélioration du VEMS > 12% après optimisation thérapeutique. La compliance au traitement inhalé reste le facteur pronostique dominant — bien devant l\'oxygénothérapie longue durée.',
    time: '2026-06-12T14:00:00', likes: 15, liked: true, pinned: false, type: 'feedback',
    tags: ['Spirométrie', 'Étude', 'VEMS', 'BPCO'],
    replies: [
      { id: 201, author: { name: 'Dr. Mvondo', avatar: 'DM2', specialty: 'Pneumologue' }, text: 'Très intéressant. Comment avez-vous mesuré la compliance ? Auto-déclaratif ou comptage des doses avec les inhalateurs connectés ?', time: '2026-06-12T15:20:00', likes: 2, liked: false },
    ],
  },
  {
    id: 3,
    casTitle: 'Post-COVID long — Séquelles fibrotiques à 18 mois',
    casId: 'CAS-2026-041',
    author: { name: 'Dr. Mvondo', avatar: 'DM2', specialty: 'Pneumologue', hospital: 'Hôpital Central Douala', verified: false },
    text: 'Patient 54 ans, COVID long depuis 18 mois. TDM thoracique : plages de fibrose bilatérale en verre dépoli, prédominance basale. CVF à 61%, DLCO à 52%. Avez-vous des patients similaires ? Quel seuil de progression vous fait basculer vers un antifibrotique ?',
    time: '2026-06-11T09:30:00', likes: 7, liked: false, pinned: false, type: 'question',
    tags: ['COVID', 'Fibrose', 'Post-COVID', 'DLCO'],
    replies: [],
  },
  {
    id: 4,
    casTitle: 'Nouveau protocole antibiothérapie — Pneumonies communautaires',
    casId: 'PROT-2026-003',
    author: { name: 'Dr. Nkoa', avatar: 'DN', specialty: 'Pneumologue', hospital: 'Clinique La Paix', verified: true },
    text: 'Mise à jour de notre protocole pour les pneumonies communautaires sévères (PSI ≥ IV) : association Amoxicilline-Clavulanate + Azithromycine en première intention plutôt que la céphalosporine isolée. Réduction des échecs à J3 de 24% à 11% sur nos 6 derniers mois. Retours ?',
    time: '2026-06-09T16:45:00', likes: 11, liked: false, pinned: false, type: 'suggestion',
    tags: ['Antibiothérapie', 'Pneumonie', 'Protocole'],
    replies: [
      { id: 301, author: { name: 'Dr. Abanda', avatar: 'DA', specialty: 'Infectiologue' }, text: 'Résultats très encourageants. Avez-vous des données sur la durée optimale du relais oral ? On observe des récidives à J10-J14 dans certains cas.', time: '2026-06-09T17:30:00', likes: 3, liked: false },
      { id: 302, author: { name: 'Dr. Fouda', avatar: 'DF', specialty: 'Pneumologue' }, text: 'Conforme aux recommandations ERS 2024. Je valide l\'approche. La surveillance des aminotransférases sous Azithromycine prolongée est cependant à ne pas négliger.', time: '2026-06-09T18:00:00', likes: 5, liked: false },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const typeConfig = {
  feedback:   { label: 'Avis',       color: 'bg-blue-50 text-blue-700',    icon: Star },
  question:   { label: 'Question',   color: 'bg-amber-50 text-amber-700',  icon: AlertCircle },
  suggestion: { label: 'Suggestion', color: 'bg-purple-50 text-purple-700',icon: BookOpen },
};

const typeConfigConfreres = {
  feedback:   { label: 'Résultats',  color: 'bg-blue-50 text-blue-700',    icon: Star },
  question:   { label: 'Question',   color: 'bg-amber-50 text-amber-700',  icon: AlertCircle },
  suggestion: { label: 'Protocole',  color: 'bg-purple-50 text-purple-700',icon: BookOpen },
};

const statutConfig = {
  en_attente:   { label: 'En attente',  color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Clock },
  approuve:     { label: 'Approuvé',    color: 'text-emerald-600',bg: 'bg-emerald-50',icon: CheckCircle },
  refuse:       { label: 'Refusé',      color: 'text-red-600',    bg: 'bg-red-50',    icon: X },
  publiee_faq:  { label: 'Dans la FAQ', color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Star },
};

function formatTime(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d;
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (h < 1) return 'À l\'instant';
  if (h < 24) return `Il y a ${h}h`;
  if (days === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Onglet Messages équipe (vue médecin) ─────────────────────────────────────
function OngletEquipeMedecin({ profil, toast }) {
  const nom      = profil ? `Dr. ${profil.prenom} ${profil.nom}` : 'Dr. Médecin';
  const initials = nom.split(' ').filter(p => /[A-Za-z]/.test(p)).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'DR';

  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expanded, setExpanded]     = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [newText, setNewText]       = useState('');
  const [newType, setNewType]       = useState('info');
  const [sending, setSending]       = useState(false);

  const loadMessages = () => {
    setLoading(true);
    fetch(`${API_URL}/equipe/messages`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadMessages(); }, []);

  const handleLike = async (mid) => {
    try {
      const res = await fetch(`${API_URL}/equipe/messages/${mid}/like`, { method: 'POST', headers: authHeaders() });
      const d = await res.json();
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, liked: d.liked, likes: d.likes_count } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, liked: !m.liked, likes: (m.liked ? m.likes - 1 : m.likes + 1) } : m));
    }
  };

  const handleLikeReply = (mid, rid) =>
    setMessages(prev => prev.map(m => m.id !== mid ? m : {
      ...m, replies: m.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r),
    }));

  const handleReply = async (mid) => {
    if (!replyText.trim()) return;
    setSending(true);
    let reply;
    try {
      const res = await fetch(`${API_URL}/equipe/messages/${mid}/reply`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      reply = await res.json();
    } catch {
      reply = { id: Date.now(), author: { name: nom, avatar: initials, role: 'Médecin référent', isDoctor: true }, text: replyText.trim(), time: new Date().toISOString(), likes: 0, liked: false };
    }
    setMessages(prev => prev.map(m => m.id === mid ? { ...m, replies: [...(m.replies || []), reply] } : m));
    setExpanded(p => ({ ...p, [mid]: true }));
    setReplyText(''); setReplyingTo(null); setSending(false);
    toast.success('Réponse publiée');
  };

  const handlePost = async () => {
    if (!newText.trim()) { toast.warning('Rédigez votre message'); return; }
    setSending(true);
    let msg;
    try {
      const res = await fetch(`${API_URL}/equipe/messages`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ contenu: newText.trim(), type_msg: newType }),
      });
      msg = await res.json();
    } catch {
      msg = { id: Date.now(), author: { name: nom, avatar: initials, role: 'Médecin référent', isDoctor: true, isMe: true }, text: newText.trim(), time: new Date().toISOString(), likes: 0, liked: false, pinned: false, type: newType, replies: [], isMe: true };
    }
    setMessages(prev => [msg, ...prev]);
    setNewText(''); setShowNew(false); setSending(false);
    toast.success('Message publié');
  };

  const handleDelete = async (mid) => {
    try { await fetch(`${API_URL}/equipe/messages/${mid}`, { method: 'DELETE', headers: authHeaders() }); } catch {}
    setMessages(prev => prev.filter(m => m.id !== mid));
    toast.info('Message supprimé');
  };

  const handlePin = async (mid) => {
    try {
      const res = await fetch(`${API_URL}/equipe/messages/${mid}/pin`, { method: 'PATCH', headers: authHeaders() });
      const d = await res.json();
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, pinned: d.pinned } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, pinned: !m.pinned } : m));
    }
  };

  const filtered = messages.filter(m => {
    const q = searchTerm.toLowerCase();
    return (m.author?.name?.toLowerCase().includes(q) || m.text?.toLowerCase().includes(q))
      && (filterType === 'all' || m.type === filterType);
  });
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.time) - new Date(a.time);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Canal d'équipe</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Échangez avec vos aides soignants. Vous pouvez épingler les messages importants et publier des informations, alertes ou rapports pour toute l'équipe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Messages', value: messages.length, icon: MessageCircle, color: 'text-blue-600' },
          { label: 'J\'aimes', value: messages.reduce((s, m) => s + (m.likes || 0), 0), icon: Heart, color: 'text-pink-600' },
          { label: 'Épinglés', value: messages.filter(m => m.pinned).length, icon: Pin, color: 'text-amber-600' },
          { label: 'Alertes', value: messages.filter(m => m.type === 'alerte').length, icon: AlertCircle, color: 'text-red-600' },
        ].map((s, i) => { const Icon = s.icon; return (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="bg-(--sf) border border-(--ln) rounded-xl p-4">
            <Icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-(--t1)">{s.value}</p>
            <p className="text-xs text-(--t4) mt-0.5">{s.label}</p>
          </motion.div>
        ); })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'all', label: 'Tous' }, { key: 'rapport', label: 'Rapports' }, { key: 'alerte', label: 'Alertes' }, { key: 'info', label: 'Info' }].map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${filterType === f.key ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
              {f.label}
            </button>
          ))}
          <button onClick={loadMessages} disabled={loading}
            className="p-2 rounded-xl border border-(--ln) text-(--t3) hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-colors" title="Actualiser">
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <MessageCircle className="w-4 h-4" />Nouveau
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Message à l'équipe</h3>
              <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
            </div>
            <div className="flex gap-2">
              {Object.entries(typeConfigEquipeMsg).map(([k, v]) => { const Icon = v.icon; return (
                <button key={k} onClick={() => setNewType(k)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newType === k ? 'bg-blue-600 text-white border-blue-600' : 'border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
                  <Icon className="w-3.5 h-3.5" />{v.label}
                </button>
              ); })}
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Rédigez votre message à l'équipe..." rows={3}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>
              <button onClick={handlePost} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Publier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}

      {!loading && (
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-12 bg-(--sf) border border-(--ln) rounded-xl">
              <Users className="w-10 h-10 text-(--t4) mx-auto mb-3" />
              <p className="text-(--t3) font-medium">Aucun message d'équipe</p>
            </div>
          ) : sorted.map((m, i) => {
            const tc = typeConfigEquipeMsg[m.type] || typeConfigEquipeMsg.rapport;
            const TIcon = tc.icon;
            const open = expanded[m.id];
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-(--sf) border border-(--ln) rounded-xl overflow-hidden ${m.pinned ? 'border-l-4 border-l-amber-400' : ''}`}>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {m.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${tc.color}`}>
                        <TIcon className="w-3 h-3" />{tc.label}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-(--t4)"><Clock className="w-3 h-3" />{formatTime(m.time)}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${m.author?.isDoctor ? 'bg-linear-to-br from-blue-500 to-indigo-600' : 'bg-linear-to-br from-rose-500 to-red-600'}`}>
                      {m.author?.avatar || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--t1)">{m.author?.name}</p>
                      <p className="text-xs text-(--t4)">{m.author?.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-(--t2) leading-relaxed">{m.text}</p>
                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                    <button onClick={() => handleLike(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${m.liked ? 'text-blue-600 bg-blue-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                      <ThumbsUp className="w-4 h-4" />{m.likes || 0}
                    </button>
                    <button onClick={() => { setReplyingTo(replyingTo === m.id ? null : m.id); setReplyText(''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      <Reply className="w-4 h-4" />Répondre
                    </button>
                    {(m.replies || []).length > 0 && (
                      <button onClick={() => setExpanded(p => ({ ...p, [m.id]: !p[m.id] }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {m.replies.length} réponse{m.replies.length > 1 ? 's' : ''}
                      </button>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => handlePin(m.id)} title={m.pinned ? 'Désépingler' : 'Épingler'}
                        className={`p-1.5 rounded-lg transition-colors ${m.pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-(--t4) hover:text-amber-500 hover:bg-amber-50'}`}>
                        <Pin className="w-4 h-4" />
                      </button>
                      {m.isMe && (
                        <button onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {replyingTo === m.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{initials}</div>
                        <div className="flex-1 flex gap-2">
                          <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(m.id)}
                            placeholder="Écrire une réponse à l'équipe..." autoFocus
                            className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button onClick={() => handleReply(m.id)} disabled={!replyText.trim() || sending}
                            className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {open && (m.replies || []).length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                      {m.replies.map(r => (
                        <div key={r.id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${r.author?.isDoctor ? 'bg-linear-to-br from-blue-500 to-indigo-600' : 'bg-linear-to-br from-emerald-500 to-teal-600'}`}>
                            {r.author?.avatar || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-(--t1)">{r.author?.name}</span>
                              <span className="text-xs text-(--t4)">{r.author?.role}</span>
                              <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                            </div>
                            <p className="text-sm text-(--t2)">{r.text}</p>
                            <button onClick={() => handleLikeReply(m.id, r.id)}
                              className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${r.liked ? 'text-blue-600' : 'text-(--t4) hover:text-(--t2)'}`}>
                              <ThumbsUp className="w-3 h-3" />{r.likes || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Onglet Commentaires ───────────────────────────────────────────────────────
function OngletCommentaires({ toast }) {
  const [comments, setComments]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showNew, setShowNew]     = useState(false);
  const [newText, setNewText]     = useState('');
  const [newCas, setNewCas]       = useState('');
  const [newType, setNewType]     = useState('feedback');

  // Chargement des commentaires reçus sur mes propres publications
  useEffect(() => {
    fetch(`${API_URL}/publications?mine=true`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(pubs => {
        // Aplatir les commentaires de toutes mes publications
        const flat = pubs.flatMap(pub =>
          (pub.commentaires || []).map(c => ({
            id:       c.id,
            casTitle: pub.casTitle || pub.titre || 'Publication',
            casId:    pub.casId   || pub.id,
            author:   { name: c.author?.name || 'Inconnu', avatar: c.author?.avatar || '?', specialty: c.author?.role || '', hospital: '' },
            text:     c.text,
            time:     c.time,
            likes:    c.likes,
            liked:    c.liked,
            pinned:   false,
            type:     pub.type === 'question' ? 'question' : 'feedback',
            replies:  c.replies || [],
          }))
        );
        setComments(flat);
      })
      .catch(() => setComments([]));
  }, []);

  const handleLike = (cid, rid = null) => {
    setComments(prev => prev.map(c => {
      if (c.id !== cid) return c;
      if (rid !== null) return { ...c, replies: c.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
    }));
  };

  const handleReply = (cid) => {
    if (!replyText.trim()) return;
    const reply = { id: Date.now(), author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue' }, text: replyText.trim(), time: new Date().toISOString(), likes: 0, liked: false };
    setComments(prev => prev.map(c => c.id === cid ? { ...c, replies: [...c.replies, reply] } : c));
    setExpandedReplies(prev => ({ ...prev, [cid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const handlePost = () => {
    if (!newText.trim() || !newCas.trim()) { toast.warning('Remplissez le cas et le commentaire'); return; }
    setComments(prev => [{
      id: Date.now(), casTitle: newCas, casId: `CAS-2026-${String(Date.now()).slice(-3)}`,
      author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue', hospital: 'CHU Douala' },
      text: newText.trim(), time: new Date().toISOString(), likes: 0, liked: false, pinned: false, type: newType, replies: []
    }, ...prev]);
    setNewText(''); setNewCas(''); setShowNew(false);
    toast.success('Commentaire publié');
  };

  const filtered = comments.filter(c => {
    const q = searchTerm.toLowerCase();
    return (c.casTitle.toLowerCase().includes(q) || c.author.name.toLowerCase().includes(q) || c.text.toLowerCase().includes(q))
      && (filterType === 'all' || c.type === filterType);
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Commentaires', value: comments.length, icon: MessageCircle, color: 'text-blue-600' },
          { label: 'J\'aimes reçus', value: comments.reduce((s, c) => s + c.likes, 0), icon: Heart, color: 'text-pink-600' },
          { label: 'Épinglés', value: comments.filter(c => c.pinned).length, icon: Pin, color: 'text-amber-600' },
          { label: 'Questions ouvertes', value: comments.filter(c => c.type === 'question').length, icon: AlertCircle, color: 'text-purple-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4">
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-xl font-bold text-(--t1)">{s.value}</p>
              <p className="text-xs text-(--t4) mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'all', label: 'Tous' }, { key: 'feedback', label: 'Avis' }, { key: 'question', label: 'Questions' }, { key: 'suggestion', label: 'Suggestions' }].map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${filterType === f.key ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
              {f.label}
            </button>
          ))}
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <MessageCircle className="w-4 h-4" />Nouveau
          </button>
        </div>
      </div>

      {/* Nouveau commentaire */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Nouveau commentaire</h3>
              <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
            </div>
            <input value={newCas} onChange={e => setNewCas(e.target.value)} placeholder="Cas clinique concerné..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([k, v]) => {
                const Icon = v.icon;
                return (
                  <button key={k} onClick={() => setNewType(k)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newType === k ? 'bg-blue-600 text-white border-blue-600' : 'border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
                    <Icon className="w-3.5 h-3.5" />{v.label}
                  </button>
                );
              })}
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Rédigez votre commentaire..." rows={3}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>
              <button onClick={handlePost} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                <Send className="w-4 h-4" />Publier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-(--sf) border border-(--ln) rounded-xl">
            <MessageCircle className="w-10 h-10 text-(--t4) mx-auto mb-3" />
            <p className="text-(--t3) font-medium">Aucun commentaire trouvé</p>
          </div>
        ) : filtered.map((c, i) => {
          const tc = typeConfig[c.type] || typeConfig.feedback;
          const TIcon = tc.icon;
          const open = expandedReplies[c.id];
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-(--sf) border border-(--ln) rounded-xl overflow-hidden ${c.pinned ? 'border-l-4 border-l-amber-400' : ''}`}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {c.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    <FolderOpen className="w-3.5 h-3.5 text-(--t4) shrink-0" />
                    <span className="text-xs text-blue-600 font-medium truncate">{c.casTitle}</span>
                    <span className="text-xs text-(--t4) shrink-0 hidden sm:block">{c.casId}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${tc.color}`}>
                    <TIcon className="w-3 h-3" />{tc.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {c.author.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">{c.author.name}</p>
                    <p className="text-xs text-(--t4)">{c.author.specialty} · {c.author.hospital}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-(--t4)">
                    <Clock className="w-3 h-3" />{formatTime(c.time)}
                  </span>
                </div>
                <p className="text-sm text-(--t2) leading-relaxed">{c.text}</p>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                  <button onClick={() => handleLike(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${c.liked ? 'text-blue-600 bg-blue-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                    <ThumbsUp className="w-4 h-4" />{c.likes}
                  </button>
                  <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                    <Reply className="w-4 h-4" />Répondre
                  </button>
                  {c.replies.length > 0 && (
                    <button onClick={() => setExpandedReplies(p => ({ ...p, [c.id]: !p[c.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {c.replies.length} réponse{c.replies.length > 1 ? 's' : ''}
                    </button>
                  )}
                  <button onClick={() => { setComments(prev => prev.filter(x => x.id !== c.id)); toast.info('Commentaire supprimé'); }}
                    className="ml-auto p-1.5 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <AnimatePresence>
                  {replyingTo === c.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">JT</div>
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(c.id)}
                          placeholder="Écrire une réponse..." autoFocus
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => handleReply(c.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {open && c.replies.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                    {c.replies.map(r => (
                      <div key={r.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{r.author.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-(--t1)">{r.author.name}</span>
                            <span className="text-xs text-(--t4)">{r.author.specialty}</span>
                            <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                          </div>
                          <p className="text-sm text-(--t2)">{r.text}</p>
                          <button onClick={() => handleLike(c.id, r.id)}
                            className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${r.liked ? 'text-blue-600' : 'text-(--t4) hover:text-(--t2)'}`}>
                            <ThumbsUp className="w-3 h-3" />{r.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Onglet Requêtes admin ─────────────────────────────────────────────────────
function OngletRequetes({ toast }) {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'recuperation',
    patientNom: '', dateNaissance: '', dateSuppression: '',
    motif: '', autreObjet: '', autreMessage: '',
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (form.type === 'recuperation' && (!form.patientNom || !form.dateNaissance || !form.motif)) {
      toast.warning('Remplissez tous les champs obligatoires'); return;
    }
    if (form.type === 'autre' && (!form.autreObjet || !form.autreMessage)) {
      toast.warning('Remplissez l\'objet et le message'); return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    const newReq = {
      id: Date.now(),
      type: form.type,
      patientNom: form.patientNom || '—',
      dateNaissance: form.dateNaissance || '—',
      dateSuppression: form.dateSuppression || '—',
      motif: form.type === 'recuperation' ? form.motif : form.autreMessage,
      objet: form.autreObjet || null,
      statut: 'en_attente',
      date: new Date().toLocaleDateString('fr-FR'),
    };
    setRequests(prev => [newReq, ...prev]);
    setForm({ type: 'recuperation', patientNom: '', dateNaissance: '', dateSuppression: '', motif: '', autreObjet: '', autreMessage: '' });
    setShowForm(false);
    setSending(false);
    toast.success('Requête envoyée à l\'administrateur');
  };

  return (
    <div className="space-y-5">

      {/* Bandeau info */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Récupération après expiration</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Entre J30 et J40 après la suppression d'un dossier, seul l'administrateur peut le restaurer.
            Au-delà de J40 la suppression est définitive. Soumettez une requête ici pour déclencher la procédure.
          </p>
        </div>
      </div>

      {/* Bouton nouvelle requête */}
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
        <FolderSearch className="w-4 h-4" />
        Nouvelle requête à l'admin
      </button>

      {/* Formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Nouvelle requête</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-(--t2) mb-2">Type de requête</label>
              <div className="flex gap-3">
                {[
                  { key: 'recuperation', label: 'Récupération de dossier', icon: RotateCcw },
                  { key: 'autre', label: 'Autre demande', icon: FileText },
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.type === t.key ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
                      <Icon className="w-4 h-4" />{t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.type === 'recuperation' ? (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-(--t2) mb-1">Nom complet du patient <span className="text-red-500">*</span></label>
                    <input value={form.patientNom} onChange={e => setForm(f => ({ ...f, patientNom: e.target.value }))} placeholder="TAGNE Bernard"
                      className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-(--t2) mb-1">Date de naissance <span className="text-red-500">*</span></label>
                    <input type="date" value={form.dateNaissance} onChange={e => setForm(f => ({ ...f, dateNaissance: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-(--t2) mb-1">Date approximative de suppression</label>
                  <input type="date" value={form.dateSuppression} onChange={e => setForm(f => ({ ...f, dateSuppression: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-(--t2) mb-1">Motif de récupération <span className="text-red-500">*</span></label>
                  <textarea value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} rows={3}
                    placeholder="Expliquez pourquoi ce dossier doit être récupéré (suivi en cours, erreur de suppression...)..."
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-(--t2) mb-1">Objet <span className="text-red-500">*</span></label>
                  <input value={form.autreObjet} onChange={e => setForm(f => ({ ...f, autreObjet: e.target.value }))} placeholder="Objet de votre demande..."
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-(--t2) mb-1">Message <span className="text-red-500">*</span></label>
                  <textarea value={form.autreMessage} onChange={e => setForm(f => ({ ...f, autreMessage: e.target.value }))} rows={4}
                    placeholder="Décrivez votre demande..."
                    className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>
              <button onClick={handleSubmit} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer à l'admin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des requêtes */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4)">Mes requêtes ({requests.length})</p>
        {requests.length === 0 ? (
          <div className="text-center py-10 bg-(--sf) border border-(--ln) rounded-xl">
            <FolderSearch className="w-8 h-8 text-(--t4) mx-auto mb-2" />
            <p className="text-sm text-(--t3)">Aucune requête envoyée</p>
          </div>
        ) : requests.map((r, i) => {
          const st = statutConfig[r.statut] || statutConfig.en_attente;
          const StIcon = st.icon;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {r.type === 'recuperation'
                    ? <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                    : <FileText className="w-4 h-4 text-(--t3) shrink-0" />}
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">
                      {r.type === 'recuperation' ? `Récupération — ${r.patientNom}` : (r.objet || 'Autre demande')}
                    </p>
                    {r.type === 'recuperation' && (
                      <p className="text-xs text-(--t4) mt-0.5">Né(e) le {r.dateNaissance || '—'}</p>
                    )}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>
                  <StIcon className="w-3 h-3" />{st.label}
                </span>
              </div>
              <p className="text-xs text-(--t3) leading-relaxed mb-2">{r.motif}</p>
              {r.type === 'recuperation' && r.dateSuppression !== '—' && (
                <p className="text-xs text-(--t4) mb-2">Suppression : <span className="font-medium">{r.dateSuppression}</span></p>
              )}
              {r.reponseAdmin && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Réponse de l'administrateur</p>
                  <p className="text-xs text-emerald-700">{r.reponseAdmin}</p>
                </div>
              )}
              <p className="text-[10px] text-(--t4) mt-2">Envoyée le {r.date}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Onglet Questions / FAQ ────────────────────────────────────────────────────
function OngletQuestions({ toast }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [titre, setTitre]         = useState('');
  const [message, setMessage]     = useState('');
  const [sending, setSending]     = useState(false);

  const loadQuestions = () => {
    setLoading(true);
    fetch(`${API_URL}/questions-admin/mes-questions`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setQuestions(Array.isArray(data) ? data : []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadQuestions(); }, []);

  const handleSubmit = async () => {
    if (!titre.trim() || !message.trim()) { toast.warning('Remplissez le titre et le message'); return; }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/questions-admin`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ titre: titre.trim(), message: message.trim() }),
      });
      const q = await res.json();
      setQuestions(prev => [q, ...prev]);
      toast.success('Question transmise à l\'administrateur');
    } catch {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setTitre(''); setMessage(''); setShowForm(false); setSending(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Bandeau info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Comment fonctionne ce canal ?</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Vos questions sont transmises à l'administrateur de la plateforme. Si une question intéresse la communauté,
            l'admin peut choisir de la publier dans la FAQ officielle de PneumoIA avec sa réponse.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <HelpCircle className="w-4 h-4" />Poser une question
        </button>
        <button onClick={loadQuestions} disabled={loading}
          className="p-2 rounded-xl border border-(--ln) text-(--t3) hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 transition-colors" title="Actualiser">
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Poser une question à l'admin</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--t2) mb-1">Titre de la question <span className="text-red-500">*</span></label>
              <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex : Comment exporter un dossier en PDF ?"
                className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-(--t2) mb-1">Détails <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                placeholder="Décrivez votre question avec le contexte nécessaire..."
                className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <p className="text-xs text-(--t4) flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" />
              Si votre question est publiée en FAQ, elle vous sera créditée anonymement.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>
              <button onClick={handleSubmit} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4)">Mes questions ({questions.length})</p>
        {questions.map((q, i) => {
          const st = statutConfig[q.statut] || statutConfig.en_attente;
          const StIcon = st.icon;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-(--sf) border rounded-xl p-4 ${q.statut === 'publiee_faq' ? 'border-l-4 border-l-blue-500 border-(--ln)' : 'border-(--ln)'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {q.statut === 'publiee_faq' && <Award className="w-4 h-4 text-blue-600 shrink-0" />}
                  <p className="text-sm font-semibold text-(--t1)">{q.titre}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${st.bg} ${st.color}`}>
                  <StIcon className="w-3 h-3" />{st.label}
                </span>
              </div>
              <p className="text-xs text-(--t3) leading-relaxed mb-2">{q.message}</p>
              {q.reponse && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" />Réponse de l'administrateur
                  </p>
                  <p className="text-xs text-blue-700 leading-relaxed">{q.reponse}</p>
                </div>
              )}
              <p className="text-[10px] text-(--t4) mt-2">Envoyée le {q.date}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Onglet Témoignage ────────────────────────────────────────────────────────
function OngletTemoignage({ toast }) {
  const [existing] = useState({
    note: 4,
    texte: '"PneumoIA a transformé ma pratique quotidienne. Un outil indispensable pour tout pneumologue moderne."',
    statut: 'publie',
    date: '2026-03-20',
    ville: 'Douala, Cameroun',
  });
  const [editing, setEditing] = useState(false);
  const [note, setNote]       = useState(existing ? existing.note : 0);
  const [hovered, setHovered] = useState(0);
  const [texte, setTexte]     = useState(existing ? existing.texte.replace(/"/g, '') : '');
  const [ville, setVille]     = useState(existing ? existing.ville : '');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (note === 0 || !texte.trim()) { toast.warning('Donnez une note et rédigez votre témoignage'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setEditing(false);
    toast.success('Témoignage publié sur la page d\'accueil');
  };

  const statutTemoignage = {
    publie:    { label: 'Visible sur la landing page', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    supprime:  { label: 'Retiré par l\'admin',         color: 'text-red-600',     bg: 'bg-red-50',     icon: X },
  };
  const st = existing ? (statutTemoignage[existing.statut] || statutTemoignage.publie) : null;

  return (
    <div className="space-y-5">

      {/* Bandeau info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Quote className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Votre avis est publié immédiatement</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Dès que vous soumettez votre témoignage, il apparaît sur la page d'accueil de PneumoIA dans la section "Témoignages".
            Aucune modération préalable n'est requise.
          </p>
        </div>
      </div>

      {/* Avertissement modération admin */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Charte de publication</p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            L'administrateur de la plateforme se réserve le droit de <strong>supprimer tout témoignage</strong> qui ne respecte pas le cadre professionnel de PneumoIA :
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {[
              'Contenu offensant, diffamatoire ou non professionnel',
              'Publicité ou promotion d\'un tiers',
              'Informations fausses ou trompeuses sur la plateforme',
              'Données personnelles de patients mentionnées',
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                <X className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />{r}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 mt-2 italic">
            En soumettant votre témoignage, vous acceptez ces conditions.
          </p>
        </div>
      </div>

      {/* Témoignage existant */}
      {existing && !editing && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-(--t4) mb-2">Mon témoignage actuel</p>
              {st && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>
                  <st.icon className="w-3.5 h-3.5" />{st.label}
                </span>
              )}
            </div>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-(--ln) rounded-lg text-(--t2) hover:bg-(--sf2) transition-colors">
              Modifier
            </button>
          </div>

          {/* Aperçu carte landing */}
          <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">JT</div>
              <div>
                <p className="font-bold">Dr. Jean Tagne</p>
                <p className="text-blue-300 text-sm">Pneumologue</p>
              </div>
            </div>
            <div className="flex gap-0.5 mb-4">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-5 h-5 ${s <= existing.note ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
              ))}
            </div>
            <p className="text-sm italic text-white/90 leading-relaxed mb-4">{existing.texte}</p>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span>📍 {existing.ville}</span>
              <span>🗓 {existing.date}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Formulaire (nouveau ou édition) */}
      {(!existing || editing) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-(--sf) border border-(--ln) rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-(--t1)">{existing ? 'Modifier mon témoignage' : 'Rédiger mon témoignage'}</h3>
            {editing && <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-(--t2) mb-3">Note globale <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setNote(s)}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 transition-colors ${
                    s <= (hovered || note) ? 'text-yellow-400 fill-yellow-400' : 'text-(--t4)'
                  }`} />
                </button>
              ))}
              {note > 0 && (
                <span className="ml-2 self-center text-sm font-medium text-(--t2)">
                  {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !'][note]}
                </span>
              )}
            </div>
          </div>

          {/* Témoignage */}
          <div>
            <label className="block text-xs font-semibold text-(--t2) mb-1">Votre témoignage <span className="text-red-500">*</span></label>
            <textarea value={texte} onChange={e => setTexte(e.target.value)} rows={5}
              placeholder="Décrivez votre expérience avec PneumoIA, comment la plateforme a changé votre pratique..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className="text-xs text-(--t4) mt-1 text-right">{texte.length}/280 caractères</p>
          </div>

          {/* Ville */}
          <div>
            <label className="block text-xs font-semibold text-(--t2) mb-1">Ville / Pays</label>
            <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Douala, Cameroun"
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Aperçu temps réel */}
          {note > 0 && texte.trim() && (
            <div>
              <p className="text-xs font-semibold text-(--t4) uppercase tracking-widest mb-2">Aperçu sur la landing page</p>
              <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">JT</div>
                  <div>
                    <p className="font-bold text-sm">Dr. Jean Tagne</p>
                    <p className="text-blue-300 text-xs">Pneumologue</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= note ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />)}
                </div>
                <p className="text-sm italic text-white/90 leading-relaxed">"{texte}"</p>
                {ville && <p className="text-xs text-white/40 mt-3">📍 {ville}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {editing && <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>}
            <button onClick={handleSubmit} disabled={sending || note === 0 || !texte.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Publication...' : 'Publier sur la landing page'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Onglet Posts des confrères ────────────────────────────────────────────────
function OngletConfreres({ toast }) {
  const { profil } = useProfil();
  const medecinNom = profil ? `Dr. ${profil.prenom || ''} ${profil.nom || ''}`.trim() : 'Dr. Jean Tagne';
  const initials = medecinNom.split(' ').filter(p => /[A-Za-z]/.test(p)).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'JT';

  const [posts, setPosts]             = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [expandedReplies, setExpanded]= useState({});
  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyText, setReplyText]     = useState('');

  const loadPosts = () => {
    setLoadingPosts(true);
    fetch(`${API_URL}/ressources?limite=50`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setPosts(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const handleLike = async (pid, rid = null) => {
    if (rid !== null) {
      // Like sur un commentaire
      try {
        const res = await fetch(`${API_URL}/publications/${pid}/commentaires/${rid}/like`, { method: 'POST', headers: authHeaders() });
        const d = await res.json();
        setPosts(prev => prev.map(p => p.id !== pid ? p : {
          ...p, replies: (p.replies || []).map(r => r.id === rid ? { ...r, liked: d.liked, likes: d.likes_count } : r),
        }));
      } catch {
        setPosts(prev => prev.map(p => p.id !== pid ? p : {
          ...p, replies: (p.replies || []).map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r),
        }));
      }
      return;
    }
    // Réaction sur la publication (toggle "utile")
    try {
      const res = await fetch(`${API_URL}/publications/${pid}/react`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ type: 'utile' }),
      });
      const d = await res.json();
      setPosts(prev => prev.map(p => p.id === pid ? { ...p, liked: d.reacted, likes: d.nb_reactions } : p));
    } catch {
      setPosts(prev => prev.map(p => p.id === pid ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
    }
  };

  const handleReply = async (pid) => {
    if (!replyText.trim()) return;
    let reply;
    try {
      const res = await fetch(`${API_URL}/publications/${pid}/commentaires`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      const c = await res.json();
      reply = { id: c.id, author: { name: c.author?.name || medecinNom, avatar: c.author?.avatar || initials, specialty: c.author?.role || 'Pneumologue' }, text: c.text || replyText.trim(), time: c.time || new Date().toISOString(), likes: 0, liked: false };
    } catch {
      reply = { id: Date.now(), author: { name: medecinNom, avatar: initials, specialty: profil?.specialite || 'Pneumologue' }, text: replyText.trim(), time: new Date().toISOString(), likes: 0, liked: false };
    }
    setPosts(prev => prev.map(p => p.id === pid ? { ...p, replies: [...(p.replies || []), reply] } : p));
    setExpanded(prev => ({ ...prev, [pid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Commentaire publié');
  };

  const filtered = posts.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.casTitle.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q) || p.text.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q));
    return matchSearch && (filterType === 'all' || p.type === filterType);
  });

  return (
    <div className="space-y-5">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <Stethoscope className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-indigo-800">Espace pair à pair</p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Consultez les publications de vos confrères pneumologues. Partagez votre expertise clinique en commentant leurs cas, résultats et protocoles.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Publications',       value: posts.length,                                   icon: MessageCircle, color: 'text-blue-600'   },
          { label: 'J\'aimes reçus',     value: posts.reduce((s, p) => s + p.likes, 0),         icon: Heart,         color: 'text-pink-600'   },
          { label: 'Questions ouvertes', value: posts.filter(p => p.type === 'question').length, icon: AlertCircle,   color: 'text-amber-600'  },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4">
              <Icon className={`w-5 h-5 ${s.color} mb-2`} />
              <p className="text-xl font-bold text-(--t1)">{s.value}</p>
              <p className="text-xs text-(--t4) mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher dans les publications..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'all', label: 'Tous' }, { key: 'question', label: 'Questions' }, { key: 'feedback', label: 'Résultats' }, { key: 'suggestion', label: 'Protocoles' }].map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${filterType === f.key ? 'bg-indigo-600 text-white' : 'bg-(--sf) border border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
              {f.label}
            </button>
          ))}
          <button onClick={loadPosts} disabled={loadingPosts}
            className="p-2 rounded-xl border border-(--ln) text-(--t3) hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 transition-colors" title="Actualiser">
            <RotateCcw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-(--sf) border border-(--ln) rounded-xl">
            <Stethoscope className="w-10 h-10 text-(--t4) mx-auto mb-3" />
            <p className="text-(--t3) font-medium">Aucune publication trouvée</p>
          </div>
        ) : filtered.map((p, i) => {
          const tc    = typeConfigConfreres[p.type] || typeConfigConfreres.feedback;
          const TIcon = tc.icon;
          const open  = expandedReplies[p.id];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-(--sf) border border-(--ln) rounded-xl overflow-hidden ${p.pinned ? 'border-l-4 border-l-indigo-400' : ''}`}>
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.pinned && <Pin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                    <span className="text-xs text-indigo-600 font-medium truncate">{p.casTitle}</span>
                    <span className="text-xs text-(--t4) shrink-0 hidden sm:block">{p.casId}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${tc.color}`}>
                    <TIcon className="w-3 h-3" />{tc.label}
                  </span>
                </div>
                {/* Author */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {p.author.avatar}
                    </div>
                    {p.author.verified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">{p.author.name}</p>
                    <p className="text-xs text-(--t4)">{p.author.specialty} · {p.author.hospital}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-(--t4) shrink-0">
                    <Clock className="w-3 h-3" />{formatTime(p.time)}
                  </span>
                </div>
                {/* Text */}
                <p className="text-sm text-(--t2) leading-relaxed">{p.text}</p>
                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-medium rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                  <button onClick={() => handleLike(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p.liked ? 'text-indigo-600 bg-indigo-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                    <ThumbsUp className="w-4 h-4" />{p.likes}
                  </button>
                  <button onClick={() => { setReplyingTo(replyingTo === p.id ? null : p.id); setReplyText(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                    <Reply className="w-4 h-4" />Commenter
                  </button>
                  {(p.replies || []).length > 0 && (
                    <button onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {(p.replies || []).length} commentaire{(p.replies || []).length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
                {/* Reply input */}
                <AnimatePresence>
                  {replyingTo === p.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{initials}</div>
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(p.id)}
                          placeholder="Partagez votre expertise clinique..." autoFocus
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button onClick={() => handleReply(p.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Replies */}
              <AnimatePresence>
                {open && (p.replies || []).length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                    {(p.replies || []).map(r => (
                      <div key={r.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{r.author.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-(--t1)">{r.author.name}</span>
                            <span className="text-xs text-(--t4)">{r.author.specialty}</span>
                            <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                          </div>
                          <p className="text-sm text-(--t2)">{r.text}</p>
                          <button onClick={() => handleLike(p.id, r.id)}
                            className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${r.liked ? 'text-indigo-600' : 'text-(--t4) hover:text-(--t2)'}`}>
                            <ThumbsUp className="w-3 h-3" />{r.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Commantaire() {
  const toast = useToast();
  const navigate = useNavigate();
  const { profil, loading: authLoading } = useProfil();
  const [activeTab,  setActiveTab]  = useState('comments');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setRefreshKey(k => k + 1), 30_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshing(false), 800);
  };

  useEffect(() => {
    if (!authLoading && !profil) navigate('/login', { replace: true });
  }, [profil, authLoading, navigate]);

  if (authLoading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profil) return null;

  const current = TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Espace de communication</h1>
          <p className="text-sm text-(--t3) mt-1">
            Commentaires · Posts confrères · Requêtes admin · Questions & FAQ · Témoignages
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-(--ln) scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] flex flex-col items-center gap-1.5 px-3 py-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                    : 'border-transparent text-(--t3) hover:text-(--t1) hover:bg-(--sf2)'
                }`}>
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-600' : ''}`} />
                <span className="leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sous-titre de l'onglet actif */}
        {current && (
          <div className="px-5 py-3 bg-(--sf2) border-b border-(--ln) flex items-center gap-2">
            <current.icon className="w-4 h-4 text-(--t3)" />
            <p className="text-sm text-(--t3)">{current.desc}</p>
          </div>
        )}

        {/* Contenu */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div key={`${activeTab}-${refreshKey}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'equipe'      && <OngletEquipeMedecin profil={profil} toast={toast} />}
              {activeTab === 'comments'    && <OngletCommentaires toast={toast} />}
              {activeTab === 'confreres'   && <OngletConfreres    toast={toast} />}
              {activeTab === 'requests'    && <OngletRequetes     toast={toast} />}
              {activeTab === 'questions'   && <OngletQuestions    toast={toast} />}
              {activeTab === 'testimonial' && <OngletTemoignage   toast={toast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
