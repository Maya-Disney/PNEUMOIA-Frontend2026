import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ThumbsUp, Reply, Trash2, Send,
  Search, AlertCircle, BookOpen,
  ChevronDown, ChevronUp, Clock,
  X, Heart, Pin, Star,
  Users, Stethoscope, Eye, Info,
  Loader2, RotateCcw, RefreshCw,
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

// ─── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'equipe',   label: 'Messages équipe',   icon: Users,       desc: 'Échanges avec votre médecin référent et les aides de votre équipe' },
  { id: 'medecins', label: 'Posts des médecins', icon: Stethoscope, desc: 'Consultez et réagissez aux publications des médecins' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const typeConfigEquipe = {
  rapport: { label: 'Rapport',  color: 'bg-emerald-50 text-emerald-700',   icon: BookOpen },
  alerte:  { label: 'Alerte',   color: 'bg-red-50 text-red-700',           icon: AlertCircle },
  info:    { label: 'Info',     color: 'bg-amber-50 text-amber-700',       icon: Star },
};

const typeConfigMedecin = {
  feedback:   { label: 'Avis',       color: 'bg-emerald-50 text-emerald-700',  icon: Star },
  question:   { label: 'Question',   color: 'bg-amber-50 text-amber-700',      icon: AlertCircle },
  suggestion: { label: 'Suggestion', color: 'bg-purple-50 text-purple-700',    icon: BookOpen },
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

  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [expandedReplies, setExpanded]= useState({});
  const [replyingTo, setReplyingTo]   = useState(null);
  const [replyText, setReplyText]     = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [newText, setNewText]         = useState('');
  const [newType, setNewType]         = useState('rapport');

  const loadMessages = () => {
    setLoading(true);
    fetch(`${API_URL}/equipe/messages`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadMessages(); }, []);

  const handleLikeAPI = async (mid) => {
    try {
      const res = await fetch(`${API_URL}/equipe/messages/${mid}/like`, { method: 'POST', headers: authHeaders() });
      const d = await res.json();
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, liked: d.liked, likes: d.likes_count } : m));
    } catch {
      setMessages(prev => prev.map(m => m.id === mid ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 } : m));
    }
  };

  const handlePostAPI = async (text, type) => {
    try {
      const res = await fetch(`${API_URL}/equipe/messages`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ contenu: text, type_msg: type }),
      });
      return await res.json();
    } catch {
      return { id: Date.now(), author: { name: aideNom, avatar: initials, role: 'Aide soignant (moi)', isDoctor: false, isMe: true }, text, time: new Date().toISOString(), likes: 0, liked: false, pinned: false, type, replies: [], isMe: true };
    }
  };

  const handleReplyAPI = async (mid, text) => {
    try {
      const res = await fetch(`${API_URL}/equipe/messages/${mid}/reply`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ contenu: text }),
      });
      return await res.json();
    } catch {
      return { id: Date.now(), author: { name: aideNom, avatar: initials, role: 'Aide soignant (moi)' }, text, time: new Date().toISOString(), likes: 0, liked: false };
    }
  };

  const handleDeleteAPI = async (mid) => {
    try { await fetch(`${API_URL}/equipe/messages/${mid}`, { method: 'DELETE', headers: authHeaders() }); } catch {}
  };

  const handleLike = (mid, rid = null) => {
    if (rid === null) { handleLikeAPI(mid); return; }
    setMessages(prev => prev.map(m => {
      if (m.id !== mid) return m;
      if (rid !== null) return { ...m, replies: m.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 };
    }));
  };

  const handleReply = async (mid) => {
    if (!replyText.trim()) return;
    const reply = await handleReplyAPI(mid, replyText.trim());
    setMessages(prev => prev.map(m => m.id === mid ? { ...m, replies: [...(m.replies || []), reply] } : m));
    setExpanded(prev => ({ ...prev, [mid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const handlePost = async () => {
    if (!newText.trim()) { toast.warning('Rédigez votre message'); return; }
    const msg = await handlePostAPI(newText.trim(), newType);
    setMessages(prev => [msg, ...prev]);
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
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Canal d'équipe</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Vous pouvez écrire à votre médecin référent et aux aides soignants partageant le même médecin. Vos messages sont visibles uniquement par votre équipe.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Messages',       value: messages.length,                       icon: MessageCircle, color: 'text-emerald-600' },
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'all', label: 'Tous' }, { key: 'rapport', label: 'Rapports' }, { key: 'alerte', label: 'Alertes' }, { key: 'info', label: 'Info' }].map(f => (
            <button key={f.key} onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${filterType === f.key ? 'bg-emerald-600 text-white' : 'bg-(--sf) border border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
              {f.label}
            </button>
          ))}
          <button onClick={loadMessages} disabled={loading}
            className="p-2 rounded-xl border border-(--ln) text-(--t3) hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors" title="Actualiser">
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
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
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newType === k ? 'bg-emerald-600 text-white border-emerald-600' : 'border-(--ln) text-(--t3) hover:bg-(--sf2)'}`}>
                    <Icon className="w-3.5 h-3.5" />{v.label}
                  </button>
                );
              })}
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Rédigez votre message à l'équipe..." rows={3}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl">Annuler</button>
              <button onClick={handlePost} className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${m.liked ? 'text-emerald-600 bg-emerald-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
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
                    <button onClick={async () => { await handleDeleteAPI(m.id); setMessages(prev => prev.filter(x => x.id !== m.id)); toast.info('Message supprimé'); }}
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
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        <button onClick={() => handleReply(m.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors">
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
                            className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${r.liked ? 'text-emerald-600' : 'text-(--t4) hover:text-(--t2)'}`}>
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

  const [posts, setPosts]             = useState([]);
  const [loadingPosts, setLoadingPosts]= useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
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

  const handleLike = (pid, rid = null) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== pid) return p;
      if (rid !== null) return { ...p, replies: (p.replies || []).map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
    }));
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
      reply = { id: c.id, author: { name: aideNom, avatar: initials, role: 'Aide soignant' }, text: c.text || replyText.trim(), time: c.time || new Date().toISOString(), likes: 0, liked: false };
    } catch {
      reply = { id: Date.now(), author: { name: aideNom, avatar: initials, role: 'Aide soignant' }, text: replyText.trim(), time: new Date().toISOString(), likes: 0, liked: false };
    }
    setPosts(prev => prev.map(p => p.id === pid ? { ...p, replies: [...(p.replies || []), reply] } : p));
    setExpanded(prev => ({ ...prev, [pid]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Commentaire publié');
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
          { label: 'Publications',      value: posts.length,                       icon: MessageCircle, color: 'text-emerald-600' },
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher dans les posts..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button onClick={loadPosts} disabled={loadingPosts}
          className="p-2 rounded-xl border border-(--ln) text-(--t3) hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors" title="Actualiser">
          <RotateCcw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
        </button>
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
                    <span className="text-xs text-emerald-600 font-medium truncate">{p.casTitle}</span>
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p.liked ? 'text-emerald-600 bg-emerald-50' : 'text-(--t3) hover:bg-(--sf2)'}`}>
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
                <AnimatePresence>
                  {replyingTo === p.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{initials}</div>
                      <div className="flex-1 flex gap-2">
                        <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReply(p.id)}
                          placeholder="Donner votre avis..." autoFocus
                          className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        <button onClick={() => handleReply(p.id)} disabled={!replyText.trim()}
                          className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                            <span className="text-xs text-(--t4)">{r.author.role}</span>
                            <span className="ml-auto text-xs text-(--t4)">{formatTime(r.time)}</span>
                          </div>
                          <p className="text-sm text-(--t2)">{r.text}</p>
                          <button onClick={() => handleLike(p.id, r.id)}
                            className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${r.liked ? 'text-emerald-600' : 'text-(--t4) hover:text-(--t2)'}`}>
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
  const [activeTab,   setActiveTab]   = useState('equipe');
  const [refreshKey,  setRefreshKey]  = useState(0);
  const [refreshing,  setRefreshing]  = useState(false);
  const intervalRef = useRef(null);
  const current = TABS.find(t => t.id === activeTab);

  useEffect(() => {
    intervalRef.current = setInterval(() => setRefreshKey(k => k + 1), 30_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Espace de communication</h1>
          <p className="text-sm text-(--t3) mt-1">
            Messages équipe · Réactions aux posts des médecins
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Actualiser
        </button>
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
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                    : 'border-transparent text-(--t3) hover:text-(--t1) hover:bg-(--sf2)'
                }`}>
                <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : ''}`} />
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
            <motion.div key={`${activeTab}-${refreshKey}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'equipe'   && <OngletEquipe   toast={toast} />}
              {activeTab === 'medecins' && <OngletMedecins toast={toast} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
