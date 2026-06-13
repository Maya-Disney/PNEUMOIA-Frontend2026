import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ThumbsUp, Reply, Trash2, Send,
  Search, AlertCircle, BookOpen,
  ChevronDown, ChevronUp, Clock,
  X, Heart, Pin, Star,
  Users, Stethoscope, Eye, Info,
  Loader2,
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'equipe',   label: 'Messages équipe',   icon: Users,       desc: 'Échanges avec votre médecin référent et les aides de votre équipe' },
  { id: 'medecins', label: 'Posts des médecins', icon: Stethoscope, desc: 'Consultez et réagissez aux publications des médecins' },
];

// ─── Mock data équipe ──────────────────────────────────────────────────────────
const MOCK_EQUIPE = [
  {
    id: 1,
    author: { name: 'Dr. Merlin', avatar: 'DM', role: 'Médecin référent', isDoctor: true },
    text: 'Rappel important : bien documenter les saturations en O₂ lors des visites du matin. Le suivi spirométrique du patient PNEU-004821 doit être mis à jour avant vendredi.',
    time: '2026-06-11T09:00:00', likes: 4, liked: false, pinned: true, type: 'info',
    replies: [
      { id: 101, author: { name: 'Marie Nguessie', avatar: 'MN', role: 'Aide soignante' }, text: 'Compris, je m\'en occupe dès ce matin.', time: '2026-06-11T09:30:00', likes: 1, liked: false },
    ],
  },
  {
    id: 2,
    author: { name: 'Marie Nguessie', avatar: 'MN', role: 'Aide soignante', isDoctor: false },
    text: 'Le patient TAGNE Bernard (chambre 12) a présenté une dyspnée ce matin vers 7h30. J\'ai pris ses constantes : SpO2 88%, FR 22/min. Le Dr. Merlin a été alerté.',
    time: '2026-06-12T08:00:00', likes: 2, liked: false, pinned: false, type: 'alerte',
    replies: [
      { id: 201, author: { name: 'Dr. Merlin', avatar: 'DM', role: 'Médecin référent' }, text: 'Merci. Je passerai en visite urgente à 9h. Mettez-lui l\'O₂ à 2L/min en attendant.', time: '2026-06-12T08:15:00', likes: 3, liked: false },
    ],
  },
  {
    id: 3,
    author: { name: 'Tagne Daril', avatar: 'TD', role: 'Aide soignant', isDoctor: false, isMe: true },
    text: 'Pansement du patient chambre 8 refait ce matin, RAS. Prochain pansement prévu samedi.',
    time: '2026-06-12T07:00:00', likes: 0, liked: false, pinned: false, type: 'rapport',
    replies: [],
  },
];

// ─── Mock data posts médecins ──────────────────────────────────────────────────
const MOCK_MEDECINS = [
  {
    id: 1,
    casTitle: 'BPCO stade avancé — Mise à jour protocole',
    casId: 'CAS-2026-041',
    author: { name: 'Dr. Merlin', avatar: 'DM', specialty: 'Pneumologue', hospital: 'CHU Douala' },
    text: 'Mise à jour du protocole BPCO : désormais utiliser la combinaison LABA/LAMA pour les stades 3 et 4. Merci de noter ce changement pour les nouveaux patients. La double bronchodilatation réduit les exacerbations de 25%.',
    time: '2026-06-10T16:00:00', likes: 6, liked: false, pinned: true, type: 'feedback',
    replies: [
      { id: 101, author: { name: 'Marie Nguessie', avatar: 'MN', role: 'Aide soignante' }, text: 'Bien noté, merci pour l\'information. Nous allons mettre à jour nos fiches de suivi.', time: '2026-06-10T17:00:00', likes: 1, liked: false },
    ],
  },
  {
    id: 2,
    casTitle: 'Formation spirométrie — Vendredi 9h',
    casId: 'INFO-2026-012',
    author: { name: 'Dr. Merlin', avatar: 'DM', specialty: 'Pneumologue', hospital: 'CHU Douala' },
    text: 'La formation sur la réalisation et l\'interprétation des spirométries est prévue vendredi prochain à 9h en salle de formation. Présence très fortement recommandée pour toutes les aides soignantes.',
    time: '2026-06-08T11:00:00', likes: 3, liked: true, pinned: false, type: 'question',
    replies: [],
  },
  {
    id: 3,
    casTitle: 'Pneumonie bactérienne — Précautions contact',
    casId: 'CAS-2026-038',
    author: { name: 'Dr. Nkoa', avatar: 'DN', specialty: 'Pneumologue', hospital: 'Clinique La Paix' },
    text: 'Le patient chambre 5 est positif au pneumocoque résistant. Précautions contact niveau 2 obligatoires : blouse, gants, masque FFP2. Merci d\'en informer toute l\'équipe soignante.',
    time: '2026-06-07T14:30:00', likes: 5, liked: false, pinned: false, type: 'question',
    replies: [],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const typeConfigEquipe = {
  rapport: { label: 'Rapport',  color: 'bg-blue-50 text-blue-700',   icon: BookOpen },
  alerte:  { label: 'Alerte',   color: 'bg-red-50 text-red-700',     icon: AlertCircle },
  info:    { label: 'Info',     color: 'bg-amber-50 text-amber-700', icon: Star },
};

const typeConfigMedecin = {
  feedback:   { label: 'Avis',       color: 'bg-blue-50 text-blue-700',    icon: Star },
  question:   { label: 'Question',   color: 'bg-amber-50 text-amber-700',  icon: AlertCircle },
  suggestion: { label: 'Suggestion', color: 'bg-purple-50 text-purple-700',icon: BookOpen },
};

function formatTime(iso) {
  const d    = new Date(iso);
  const diff = Date.now() - d;
  const h    = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (h < 1)   return 'À l\'instant';
  if (h < 24)  return `Il y a ${h}h`;
  if (days === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Onglet Messages équipe ────────────────────────────────────────────────────
function OngletEquipe({ toast }) {
  const aideNom = localStorage.getItem('aide_nom') || 'Aide soignant';
  const initials = aideNom.trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  const [messages, setMessages]       = useState(MOCK_EQUIPE);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [expandedReplies, setExpanded]= useState({});
  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyText, setReplyText]     = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [newText, setNewText]         = useState('');
  const [newType, setNewType]         = useState('rapport');

  const handleLike = (mid, rid = null) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== mid) return m;
      if (rid !== null) return { ...m, replies: m.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 };
    }));
  };

  const handleReply = (mid) => {
    if (!replyText.trim()) return;
    const reply = {
      id: Date.now(),
      author: { name: aideNom, avatar: initials, role: 'Aide soignant (moi)' },
      text: replyText.trim(),
      time: new Date().toISOString(),
      likes: 0,
      liked: false,
    };
    setMessages(prev => prev.map(m => m.id === mid ? { ...m, replies: [...m.replies, reply] } : m));
    setExpanded(prev => ({ ...prev, [mid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const handlePost = () => {
    if (!newText.trim()) { toast.warning('Rédigez votre message'); return; }
    setMessages(prev => [{
      id: Date.now(),
      author: { name: aideNom, avatar: initials, role: 'Aide soignant (moi)', isMe: true },
      text: newText.trim(),
      time: new Date().toISOString(),
      likes: 0, liked: false, pinned: false, type: newType,
      replies: [],
    }, ...prev]);
    setNewText('');
    setShowNew(false);
    toast.success('Message publié');
  };

  const filtered = messages.filter(m => {
    const q = searchTerm.toLowerCase();
    return (m.author.name.toLowerCase().includes(q) || m.text.toLowerCase().includes(q))
      && (filterType === 'all' || m.type === filterType);
  });

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Canal d'équipe</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Vous pouvez écrire à votre médecin référent et aux aides soignants partageant le même médecin. Vos messages sont visibles uniquement par votre équipe.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Messages',       value: messages.length,                       icon: MessageCircle, color: 'text-blue-600' },
          { label: 'J\'aimes reçus', value: messages.reduce((s, m) => s + m.likes, 0), icon: Heart,         color: 'text-pink-600' },
          { label: 'Épinglés',       value: messages.filter(m => m.pinned).length, icon: Pin,           color: 'text-amber-600' },
          { label: 'Alertes',        value: messages.filter(m => m.type === 'alerte').length, icon: AlertCircle, color: 'text-red-600' },
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
          {[{ key: 'all', label: 'Tous' }, { key: 'rapport', label: 'Rapports' }, { key: 'alerte', label: 'Alertes' }, { key: 'info', label: 'Info' }].map(f => (
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

      {/* Nouveau message */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Nouveau message</h3>
              <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
            </div>
            <div className="flex gap-2">
              {Object.entries(typeConfigEquipe).map(([k, v]) => {
                const Icon = v.icon;
                return (
                  <button key={k} onClick={() => setNewType(k)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newType === k ? 'bg-blue-600 text-white border-blue-600' : 'border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
                    <Icon className="w-3.5 h-3.5" />{v.label}
                  </button>
                );
              })}
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Rédigez votre message à l'équipe..." rows={3}
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
            <p className="text-(--t3) font-medium">Aucun message trouvé</p>
          </div>
        ) : filtered.map((m, i) => {
          const tc   = typeConfigEquipe[m.type] || typeConfigEquipe.rapport;
          const TIcon = tc.icon;
          const open  = expandedReplies[m.id];
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
                  <span className="flex items-center gap-1 text-xs text-(--t4)">
                    <Clock className="w-3 h-3" />{formatTime(m.time)}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${m.author.isDoctor ? 'bg-linear-to-br from-blue-500 to-indigo-600' : 'bg-linear-to-br from-rose-500 to-red-600'}`}>
                    {m.author.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">{m.author.name}</p>
                    <p className="text-xs text-(--t4)">{m.author.role}</p>
                  </div>
                </div>
                <p className="text-sm text-(--t2) leading-relaxed">{m.text}</p>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                  <button onClick={() => handleLike(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${m.liked ? 'text-blue-600 bg-blue-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                    <ThumbsUp className="w-4 h-4" />{m.likes}
                  </button>
                  <button onClick={() => { setReplyingTo(replyingTo === m.id ? null : m.id); setReplyText(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                    <Reply className="w-4 h-4" />Répondre
                  </button>
                  {m.replies.length > 0 && (
                    <button onClick={() => setExpanded(p => ({ ...p, [m.id]: !p[m.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {m.replies.length} réponse{m.replies.length > 1 ? 's' : ''}
                    </button>
                  )}
                  {m.author.isMe && (
                    <button onClick={() => { setMessages(prev => prev.filter(x => x.id !== m.id)); toast.info('Message supprimé'); }}
                      className="ml-auto p-1.5 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {replyingTo === m.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{initials}</div>
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(m.id)}
                          placeholder="Écrire une réponse..." autoFocus
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => handleReply(m.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {open && m.replies.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                    {m.replies.map(r => (
                      <div key={r.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{r.author.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-(--t1)">{r.author.name}</span>
                            <span className="text-xs text-(--t4)">{r.author.role}</span>
                            <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                          </div>
                          <p className="text-sm text-(--t2)">{r.text}</p>
                          <button onClick={() => handleLike(m.id, r.id)}
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

// ─── Onglet Posts des médecins ─────────────────────────────────────────────────
function OngletMedecins({ toast }) {
  const aideNom = localStorage.getItem('aide_nom') || 'Aide soignant';
  const initials = aideNom.trim().split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  const [posts, setPosts]             = useState(MOCK_MEDECINS);
  const [searchTerm, setSearchTerm]   = useState('');
  const [expandedReplies, setExpanded]= useState({});
  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyText, setReplyText]     = useState('');

  const handleLike = (pid, rid = null) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== pid) return p;
      if (rid !== null) return { ...p, replies: p.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
    }));
  };

  const handleReply = (pid) => {
    if (!replyText.trim()) return;
    const reply = {
      id: Date.now(),
      author: { name: aideNom, avatar: initials, role: 'Aide soignant' },
      text: replyText.trim(),
      time: new Date().toISOString(),
      likes: 0,
      liked: false,
    };
    setPosts(prev => prev.map(p => p.id === pid ? { ...p, replies: [...p.replies, reply] } : p));
    setExpanded(prev => ({ ...prev, [pid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const filtered = posts.filter(p => {
    const q = searchTerm.toLowerCase();
    return p.casTitle.toLowerCase().includes(q) || p.author.name.toLowerCase().includes(q) || p.text.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Eye className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Lecture et réactions</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Ces publications sont rédigées par les médecins. Vous pouvez les lire, réagir et commenter, mais vous ne pouvez pas en créer de nouvelles dans cet onglet.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Publications',      value: posts.length,                       icon: MessageCircle, color: 'text-blue-600' },
          { label: 'J\'aimes reçus',    value: posts.reduce((s, p) => s + p.likes, 0), icon: Heart,         color: 'text-pink-600' },
          { label: 'Épinglés',          value: posts.filter(p => p.pinned).length, icon: Pin,           color: 'text-amber-600' },
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

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher dans les posts..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-(--sf) border border-(--ln) rounded-xl">
            <Stethoscope className="w-10 h-10 text-(--t4) mx-auto mb-3" />
            <p className="text-(--t3) font-medium">Aucun post médecin trouvé</p>
          </div>
        ) : filtered.map((p, i) => {
          const tc    = typeConfigMedecin[p.type] || typeConfigMedecin.feedback;
          const TIcon = tc.icon;
          const open  = expandedReplies[p.id];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`bg-(--sf) border border-(--ln) rounded-xl overflow-hidden ${p.pinned ? 'border-l-4 border-l-amber-400' : ''}`}>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    <span className="text-xs text-blue-600 font-medium truncate">{p.casTitle}</span>
                    <span className="text-xs text-(--t4) shrink-0 hidden sm:block">{p.casId}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${tc.color}`}>
                    <TIcon className="w-3 h-3" />{tc.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {p.author.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--t1)">{p.author.name}</p>
                    <p className="text-xs text-(--t4)">{p.author.specialty} · {p.author.hospital}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-(--t4)">
                    <Clock className="w-3 h-3" />{formatTime(p.time)}
                  </span>
                </div>
                <p className="text-sm text-(--t2) leading-relaxed">{p.text}</p>
                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                  <button onClick={() => handleLike(p.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p.liked ? 'text-blue-600 bg-blue-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
                    <ThumbsUp className="w-4 h-4" />{p.likes}
                  </button>
                  <button onClick={() => { setReplyingTo(replyingTo === p.id ? null : p.id); setReplyText(''); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                    <Reply className="w-4 h-4" />Commenter
                  </button>
                  {p.replies.length > 0 && (
                    <button onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {p.replies.length} commentaire{p.replies.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {replyingTo === p.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{initials}</div>
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(p.id)}
                          placeholder="Donner votre avis..." autoFocus
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => handleReply(p.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {open && p.replies.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                    {p.replies.map(r => (
                      <div key={r.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{r.author.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-(--t1)">{r.author.name}</span>
                            <span className="text-xs text-(--t4)">{r.author.role}</span>
                            <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                          </div>
                          <p className="text-sm text-(--t2)">{r.text}</p>
                          <button onClick={() => handleLike(p.id, r.id)}
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

// ─── Page principale ───────────────────────────────────────────────────────────
export default function AideCommentaires() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('equipe');
  const current = TABS.find(t => t.id === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-(--t1)">Espace de communication</h1>
        <p className="text-sm text-(--t3) mt-1">
          Messages équipe · Réactions aux posts des médecins
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 border-b border-(--ln)">
          {TABS.map(tab => {
            const Icon   = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1.5 px-4 py-4 text-xs font-semibold border-b-2 transition-all ${
                  active
                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                    : 'border-transparent text-(--t3) hover:text-(--t1) hover:bg-(--sf2)'
                }`}>
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                <span className="leading-tight text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sous-titre */}
        {current && (
          <div className="px-5 py-3 bg-(--sf2) border-b border-(--ln) flex items-center gap-2">
            <current.icon className="w-4 h-4 text-(--t3)" />
            <p className="text-sm text-(--t3)">{current.desc}</p>
          </div>
        )}

        {/* Contenu */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'equipe'   && <OngletEquipe   toast={toast} />}
              {activeTab === 'medecins' && <OngletMedecins toast={toast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
