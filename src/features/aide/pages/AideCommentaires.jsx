import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, Trash2, ThumbsUp, Reply,
  Search, Loader2, AlertCircle, Users, BookOpen, X,
  ChevronDown,
} from 'lucide-react';

const P  = '#2563eb';
const P2 = '#1d4ed8';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const tok  = ()  => localStorage.getItem('token') || '';
const hdrs = ()  => ({ 'Content-Type':'application/json', Authorization:`Bearer ${tok()}` });
const nom  = ()  => localStorage.getItem('aide_nom') || 'Aide soignant';

async function api(path, opts = {}) {
  const r = await fetch(`${API_URL}${path}`, { ...opts, headers: { ...hdrs(), ...(opts.headers||{}) } });
  if (!r.ok) { let d; try { d = await r.json(); } catch { throw new Error(`Erreur ${r.status}`); } throw new Error(d.detail || `Erreur ${r.status}`); }
  if (r.status === 204) return null;
  return r.json();
}

const TABS = ['forum', 'equipe'];
const TAB_LABELS = { forum:'Forum patients', equipe:'Messagerie équipe' };
const TAB_ICONS  = { forum:BookOpen, equipe:Users };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60)   return 'À l\'instant';
  if (s < 3600) return `Il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s/3600)}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg,${P2},${P})`,
  'linear-gradient(135deg,#4f46e5,#7c3aed)',
  'linear-gradient(135deg,#0891b2,#0284c7)',
  'linear-gradient(135deg,#7c3aed,#2563eb)',
  'linear-gradient(135deg,#059669,#0891b2)',
];
function avatarGrad(str) {
  const n = (str||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
}
function initials(name) {
  const parts = (name||'').trim().split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : (name||'?').slice(0,2).toUpperCase();
}

function Avatar({ name, size = 9 }) {
  return (
    <div className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0`}
      style={{ background: avatarGrad(name), boxShadow:'0 2px 8px rgba(37,99,235,0.20)' }}>
      {initials(name)}
    </div>
  );
}

function CommentCard({ c, onLike, onDelete, onReply, myName, showReplies = true }) {
  const isOwn  = c.auteur_nom === myName;
  const [open,  setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
      className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <Avatar name={c.auteur_nom || 'Utilisateur'} size={9} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-(--t1)">{c.auteur_nom || 'Anonyme'}</span>
            {isOwn && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'rgba(37,99,235,0.10)', color:P }}>Vous</span>
            )}
            <span className="text-xs text-(--t4) ml-auto">{timeAgo(c.created_at)}</span>
          </div>
          <p className="text-sm text-(--t2) leading-relaxed">{c.contenu}</p>
          <div className="flex items-center gap-3 mt-2.5">
            <button onClick={() => onLike(c.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
                c.liked ? 'border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-(--ln) text-(--t4) hover:bg-(--sf2)'
              }`}>
              <ThumbsUp size={11} /> {c.likes || 0}
            </button>
            {onReply && (
              <button onClick={() => onReply(c)}
                className="flex items-center gap-1 text-xs font-medium text-(--t4) hover:text-(--t2) transition-colors px-2 py-1 rounded-lg hover:bg-(--sf2)">
                <Reply size={11} /> Répondre
              </button>
            )}
            {(c.replies?.length > 0) && (
              <button onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 text-xs font-medium text-(--t4) hover:text-(--t2) transition-colors px-2 py-1 rounded-lg hover:bg-(--sf2)">
                <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                {c.replies.length} réponse{c.replies.length > 1 ? 's' : ''}
              </button>
            )}
            {isOwn && (
              <button onClick={() => onDelete(c.id)}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-red-500/60 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Réponses */}
      <AnimatePresence>
        {open && showReplies && (c.replies||[]).length > 0 && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="overflow-hidden border-t border-(--ln) bg-(--sf2)">
            <div className="p-3 space-y-2 pl-14">
              {(c.replies||[]).map(r => (
                <div key={r.id} className="flex items-start gap-2.5 p-2.5 bg-(--sf) rounded-lg border border-(--ln)">
                  <Avatar name={r.auteur_nom || 'Utilisateur'} size={7} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-(--t1)">{r.auteur_nom || 'Anonyme'}</span>
                      <span className="text-[10px] text-(--t4) ml-auto">{timeAgo(r.created_at)}</span>
                    </div>
                    <p className="text-xs text-(--t2)">{r.contenu}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AideCommentaires() {
  const myName  = nom();
  const [tab,     setTab]     = useState('forum');
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [text,    setText]    = useState('');
  const [sending, setSending] = useState(false);
  const [search,  setSearch]  = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  const endpoint = tab === 'forum' ? '/commentaires/forum' : '/commentaires/equipe';

  const load = () => {
    setLoading(true);
    api(endpoint)
      .then(d => setItems(Array.isArray(d) ? d : (d?.commentaires || d?.messages || [])))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); setSearch(''); setReplyTo(null); setText(''); }, [tab]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const body = { contenu: text.trim(), ...(replyTo ? { parent_id: replyTo.id } : {}) };
      const created = await api(endpoint, { method:'POST', body:JSON.stringify(body) });
      if (replyTo) {
        setItems(prev => prev.map(c => c.id === replyTo.id ? { ...c, replies:[...(c.replies||[]), created] } : c));
      } else {
        setItems(prev => [created, ...prev]);
      }
      setText(''); setReplyTo(null);
    } catch (e) { setError(e.message || 'Erreur envoi'); }
    finally { setSending(false); }
  };

  const handleLike = async (id) => {
    try {
      await api(`${endpoint}/${id}/like`, { method:'POST' });
      setItems(prev => prev.map(c => c.id === id ? { ...c, likes:(c.likes||0)+(c.liked?-1:1), liked:!c.liked } : c));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api(`${endpoint}/${id}`, { method:'DELETE' });
      setItems(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const filtered = items.filter(c => {
    if (!search) return true;
    return `${c.contenu||''} ${c.auteur_nom||''}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5" style={{ height:'calc(100vh - 120px)' }}>

      {/* ── Header ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-2xl overflow-hidden shrink-0"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Communication</p>
              <h1 className="text-lg font-black text-white">Messagerie</h1>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.18)' }}>
            {TABS.map(t => {
              const Icon = TAB_ICONS[t];
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab===t ? 'bg-white text-blue-700 shadow-sm' : 'text-white/70 hover:text-white'}`}>
                  <Icon size={11}/> {TAB_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Recherche ─── */}
      <div className="relative shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans les messages…"
          className="w-full pl-11 pr-10 py-3 bg-(--sf) border border-(--ln) rounded-xl text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:border-blue-400 transition-all shadow-sm" />
        <AnimatePresence>
          {search && (
            <motion.button initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }}
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-(--t4) hover:text-(--t2) transition-all">
              <X size={12}/>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Liste messages ─── */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color:P }} />
            <p className="text-sm text-(--t4)">Chargement…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-(--t2)">Impossible de charger les messages</p>
              <p className="text-xs text-(--t4) mt-0.5">{error}</p>
            </div>
            <button onClick={load} className="text-sm font-bold text-white px-4 py-2 rounded-xl" style={{ background:P }}>
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-(--sf2) border border-(--ln) flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-(--t4)" />
            </div>
            <div>
              <p className="font-semibold text-(--t2)">{search ? 'Aucun résultat' : 'Aucun message'}</p>
              <p className="text-xs text-(--t4) mt-0.5">{search ? `Aucun message pour "${search}"` : 'Soyez le premier à écrire !'}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(c => (
              <CommentCard key={c.id} c={c} myName={myName}
                onLike={handleLike} onDelete={handleDelete}
                onReply={rc => { setReplyTo(rc); setText(''); }} />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Zone de saisie ─── */}
      <div className="shrink-0 space-y-2">
        {/* Répondre à */}
        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Reply size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">{replyTo.auteur_nom}</p>
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate">{replyTo.contenu}</p>
              </div>
              <button onClick={() => setReplyTo(null)}
                className="w-5 h-5 flex items-center justify-center rounded-full text-blue-500 hover:bg-blue-200 dark:hover:bg-blue-500/20 transition-colors">
                <X size={11}/>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2.5 p-2 bg-(--sf) border border-(--ln) rounded-2xl shadow-sm">
          <Avatar name={myName} size={8} />
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={replyTo ? `Répondre à ${replyTo.auteur_nom}…` : tab==='equipe' ? 'Écrire à l\'équipe médicale…' : 'Poster un message dans le forum…'}
            rows={2}
            className="flex-1 bg-transparent text-sm text-(--t1) placeholder:text-(--t4) focus:outline-none resize-none leading-relaxed pt-1.5"
          />
          <button onClick={handleSend} disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${P2},${P})`, boxShadow:`0 3px 12px rgba(37,99,235,0.30)` }}>
            {sending ? <Loader2 size={15} className="text-white animate-spin"/> : <Send size={15} className="text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-(--t4) text-center">Entrée pour envoyer · Maj+Entrée pour sauter une ligne</p>
      </div>
    </div>
  );
}
