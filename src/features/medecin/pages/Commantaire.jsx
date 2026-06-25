// src/features/medecin/pages/Commantaire.jsx
import { useState, useEffect } from 'react';
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
  FileText, User, Users, Download
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { soumettreRequete, mesRequetes } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const tok = () => localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token') || '';

// ─── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'equipe',      label: 'Équipe',           icon: Users,         desc: 'Messages de vos aides soignants — retours et alertes' },
  { id: 'comments',    label: 'Commentaires',    icon: MessageCircle, desc: 'Échanges sur vos cas cliniques' },
  { id: 'conferes',    label: 'Publications',     icon: Stethoscope,   desc: 'Publications des autres médecins de la communauté' },
  { id: 'requests',    label: 'Requêtes admin',  icon: FolderSearch,  desc: 'Récupération de dossiers supprimés' },
  { id: 'questions',   label: 'Questions / FAQ', icon: HelpCircle,    desc: 'Posez vos questions à l\'administrateur' },
  { id: 'testimonial', label: 'Mon témoignage',  icon: Quote,         desc: 'Partagez votre avis sur la plateforme' },
];


// ─── Helpers ───────────────────────────────────────────────────────────────────
const typeConfig = {
  feedback:   { label: 'Avis',       color: 'bg-blue-50 text-blue-700',    icon: Star },
  question:   { label: 'Question',   color: 'bg-amber-50 text-amber-700',  icon: AlertCircle },
  suggestion: { label: 'Suggestion', color: 'bg-purple-50 text-purple-700',icon: BookOpen },
};

const statutConfig = {
  en_attente:   { label: 'En attente',  color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Clock },
  approuve:     { label: 'Approuvé',    color: 'text-emerald-600',bg: 'bg-emerald-50',icon: CheckCircle },
  refuse:       { label: 'Refusé',      color: 'text-red-600',    bg: 'bg-red-50',    icon: X },
  publiee_faq:  { label: 'Dans la FAQ', color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Star },
};

function formatTime(iso) {
  // Append Z so JS treats server UTC timestamps as UTC, not local time
  const utc = iso && !/Z$|[+-]\d{2}:?\d{2}$/.test(iso) ? iso + 'Z' : iso;
  const d = new Date(utc);
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2)  return 'À l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  if (h < 24)    return `il y a ${h}h`;
  if (days === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Onglet Commentaires ───────────────────────────────────────────────────────
function OngletCommentaires({ toast, profil }) {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [expanded, setExpanded]     = useState({});
  const [showNew, setShowNew]       = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newText, setNewText]       = useState('');

  const myInitials = profil ? `${(profil.prenom || '')[0] || ''}${(profil.nom || '')[0] || ''}`.toUpperCase() : '?';
  const myId       = profil?.id || '';

  useEffect(() => {
    if (!myId) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${tok()}` };
    Promise.all([
      fetch(`${API_URL}/publications?mine=true&with_comments=true`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/publications?with_comments=true`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/publications/mes-commentaires`, { headers }).then(r => r.ok ? r.json() : []),
    ])
      .then(([myPubs, allPubs, myComments]) => {
        const list = [];
        for (const pub of (Array.isArray(myPubs) ? myPubs : [])) {
          for (const com of (pub.commentaires || [])) {
            list.push({
              id:      com.id,
              pub_id:  pub.id,
              context: pub.casTitle || pub.titre || '—',
              author:  com.author,
              text:    com.text,
              time:    com.time,
              likes:   com.likes  || 0,
              liked:   com.liked  || false,
              isMe:    com.isMe   || false,
              replies: com.replies || [],
              kind:    'comment',
            });
          }
        }
        for (const pub of (Array.isArray(allPubs) ? allPubs : [])) {
          if (!['discussion', 'question'].includes(pub.type)) continue;
          list.push({
            id:      pub.id,
            pub_id:  pub.id,
            context: null,
            author:  pub.author,
            text:    pub.text || pub.contenu,
            time:    pub.time || pub.created_at,
            likes:   pub.nb_reactions || 0,
            liked:   pub.liked        || false,
            isMe:    pub.auteur_id === myId,
            replies: (pub.commentaires || []).map(c => ({ id: c.id, author: c.author, text: c.text, time: c.time })),
            kind:    'discussion',
          });
        }
        const existingIds = new Set(list.map(m => m.id));
        for (const com of (Array.isArray(myComments) ? myComments : [])) {
          if (existingIds.has(com.id)) continue;
          list.push({
            id:      com.id,
            pub_id:  com.pub_id,
            context: com.context,
            author:  { name: profil ? `Dr. ${profil.prenom} ${profil.nom}` : 'Moi', avatar: myInitials },
            text:    com.text,
            time:    com.time,
            likes:   com.likes || 0,
            liked:   com.liked || false,
            isMe:    true,
            replies: com.replies || [],
            kind:    'my_comment',
          });
        }
        list.sort((a, b) => new Date(b.time) - new Date(a.time));
        setMessages(list);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [myId]);

  const handleLike = async (msg) => {
    if (msg.kind === 'discussion') {
      try {
        const r = await fetch(`${API_URL}/publications/${msg.pub_id}/react`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'utile' }),
        });
        if (r.ok) {
          const data = await r.json();
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, liked: data.reacted, likes: data.nb_reactions } : m));
        }
      } catch { /* silent */ }
    } else {
      try {
        await fetch(`${API_URL}/publications/${msg.pub_id}/commentaires/${msg.id}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok()}` },
        });
      } catch { /* silent */ }
      setMessages(prev => prev.map(m => m.id === msg.id
        ? { ...m, liked: !m.liked, likes: m.liked ? m.likes - 1 : m.likes + 1 }
        : m));
    }
  };

  const handleReply = async (msg) => {
    if (!replyText.trim()) return;
    const endpoint = msg.kind === 'discussion'
      ? `${API_URL}/publications/${msg.pub_id}/commentaires`
      : `${API_URL}/publications/${msg.pub_id}/commentaires/${msg.id}/reply`;
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      if (!r.ok) { toast.error('Erreur lors de l\'envoi'); return; }
      const saved = await r.json().catch(() => ({}));
      const newReply = {
        id:     saved.id || Date.now(),
        author: saved.author || { name: 'Moi', avatar: myInitials },
        text:   replyText.trim(),
        time:   saved.time || new Date().toISOString(),
      };
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, replies: [...(m.replies || []), newReply] } : m
      ));
      setExpanded(prev => ({ ...prev, [msg.id]: true }));
      setReplyText(''); setReplyingTo(null);
      toast.success('Réponse publiée');
    } catch { toast.error('Erreur réseau'); }
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newText.trim()) { toast.warning('Remplissez le titre et le message'); return; }
    try {
      const r = await fetch(`${API_URL}/publications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre: newTitle.trim(), contenu: newText.trim(), type: 'discussion' }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); toast.error(e.detail || `Erreur ${r.status}`); return; }
      setNewTitle(''); setNewText(''); setShowNew(false);
      toast.success('Discussion publiée');
    } catch { toast.error('Erreur réseau'); }
  };

  const handleDelete = async (msg) => {
    const url = msg.kind === 'discussion'
      ? `${API_URL}/publications/${msg.pub_id}`
      : `${API_URL}/publications/${msg.pub_id}/commentaires/${msg.id}`;
    try {
      const r = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok()}` },
      });
      if (r.ok || r.status === 204) {
        setMessages(prev => prev.filter(m => m.id !== msg.id));
        toast.info(msg.kind === 'discussion' ? 'Discussion supprimée' : 'Commentaire supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch { toast.error('Erreur réseau'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4)">
          Commentaires & discussions ({messages.length})
        </p>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Send className="w-3 h-3" />Nouveau
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-4 space-y-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Sujet de la discussion..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea value={newText} onChange={e => setNewText(e.target.value)} rows={3}
              placeholder="Rédigez votre message..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="text-xs text-(--t3) hover:bg-(--sf2) px-3 py-1 rounded-lg">Annuler</button>
              <button onClick={handlePost} disabled={!newTitle.trim() || !newText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
                <Send className="w-3 h-3" />Publier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 ? (
        <div className="py-14 text-center bg-(--sf) border border-(--ln) rounded-2xl">
          <MessageCircle className="w-10 h-10 text-(--t4) mx-auto mb-3" />
          <p className="text-sm text-(--t3) font-medium">Aucun commentaire ou discussion</p>
          <p className="text-xs text-(--t4) mt-1">Les commentaires sur vos cas cliniques apparaîtront ici.</p>
        </div>
      ) : messages.map((msg, i) => {
        const open = expanded[msg.id];
        return (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {msg.author?.avatar || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-(--t1)">{msg.author?.name}</span>
                    {msg.context ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <FolderOpen className="w-2.5 h-2.5" />{msg.context}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <MessageCircle className="w-2.5 h-2.5" />Discussion
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-(--t2) leading-relaxed">{msg.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-(--t4) flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(msg.time)}</span>
                    <button onClick={() => handleLike(msg)}
                      className={`text-xs flex items-center gap-1 transition-colors ${msg.liked ? 'text-blue-600' : 'text-(--t3) hover:text-blue-600'}`}>
                      <ThumbsUp className="w-3 h-3" />{msg.likes}
                    </button>
                    <button onClick={() => { setReplyingTo(replyingTo === msg.id ? null : msg.id); setReplyText(''); }}
                      className="text-xs text-(--t3) hover:text-blue-600 flex items-center gap-1 transition-colors">
                      <Reply className="w-3 h-3" />Répondre
                    </button>
                    {(msg.replies?.length > 0) && (
                      <button onClick={() => setExpanded(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                        className="text-xs text-blue-600 flex items-center gap-1">
                        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {msg.replies.length} réponse{msg.replies.length > 1 ? 's' : ''}
                      </button>
                    )}
                    {(msg.isMe || msg.kind === 'comment' || msg.kind === 'my_comment') && (
                      <button onClick={() => handleDelete(msg)} className="ml-auto text-(--t4) hover:text-red-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {replyingTo === msg.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-12 space-y-2 overflow-hidden">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2}
                      placeholder="Votre réponse..."
                      className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="text-xs text-(--t3) hover:bg-(--sf2) px-3 py-1 rounded-lg">Annuler</button>
                      <button onClick={() => handleReply(msg)} disabled={!replyText.trim()}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        <Send className="w-3 h-3" />Répondre
                      </button>
                    </div>
                  </motion.div>
                )}

                {open && msg.replies?.map((rep, ri) => (
                  <motion.div key={rep.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ri * 0.03 }}
                    className="mt-2 pl-12 flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {rep.author?.avatar || '?'}
                    </div>
                    <div className="flex-1 bg-(--sf2) border border-(--ln) rounded-xl p-2.5">
                      <span className="text-xs font-bold text-(--t1)">{rep.author?.name}</span>
                      <p className="text-xs text-(--t2) mt-0.5">{rep.text}</p>
                      <span className="text-[10px] text-(--t4)">{formatTime(rep.time)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Onglet Requêtes admin ─────────────────────────────────────────────────────
function OngletRequetes({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ autreObjet: '', autreMessage: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function load(first = false) {
      if (first) setLoading(true);
      mesRequetes()
        .then(data => { if (!cancelled) setRequests(Array.isArray(data) ? data : []); })
        .catch(() => {})
        .finally(() => { if (first && !cancelled) setLoading(false); });
    }
    load(true);
    const t = setInterval(() => load(false), 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const handleSubmit = async () => {
    if (!form.autreObjet || !form.autreMessage) {
      toast.warning("Remplissez l'objet et le message"); return;
    }
    setSending(true);
    try {
      const titre = form.autreObjet;
      const description = form.autreMessage;
      const data = await soumettreRequete({ titre, categorie: 'autre', description });
      setRequests(prev => [{
        id: data.id,
        titre,
        categorie: 'autre',
        description,
        statut: 'en_attente',
        reponse_admin: null,
        action_admin: null,
        repondu_le: null,
        created_at: new Date().toISOString(),
      }, ...prev]);
      setForm({ autreObjet: '', autreMessage: '' });
      setShowForm(false);
      toast.success("Requête envoyée à l'administrateur");
    } catch (e) {
      toast.error?.(e?.message || "Erreur lors de l'envoi") ?? toast.warning(e?.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const reqStatutCfg = {
    en_attente: { label: 'En attente', color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
    en_cours:   { label: 'En cours',   color: 'text-blue-600',    bg: 'bg-blue-50',    icon: MessageCircle },
    resolu:     { label: 'Résolu',     color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    ferme:      { label: 'Fermé',      color: 'text-gray-500',    bg: 'bg-gray-100',   icon: X },
  };

  return (
    <div className="space-y-5">

      {/* Bandeau info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Requêtes à l'administrateur</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Signalez un problème technique, une anomalie ou toute autre demande à l'administrateur.
            Les dossiers patients supprimés sont définitivement effacés après 30 jours — aucune récupération n'est possible au-delà.
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
        {loading ? (
          <div className="text-center py-10 bg-(--sf) border border-(--ln) rounded-xl">
            <Loader2 className="w-6 h-6 text-(--t4) mx-auto mb-2 animate-spin" />
            <p className="text-sm text-(--t3)">Chargement…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 bg-(--sf) border border-(--ln) rounded-xl">
            <FolderSearch className="w-8 h-8 text-(--t4) mx-auto mb-2" />
            <p className="text-sm text-(--t3)">Aucune requête envoyée</p>
          </div>
        ) : requests.map((r, i) => {
          const cfg = reqStatutCfg[r.statut] || reqStatutCfg.en_attente;
          const StIcon = cfg.icon;
          return (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-(--t3) shrink-0" />
                  <p className="text-sm font-semibold text-(--t1) truncate">{r.titre}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <StIcon className="w-3 h-3" />{cfg.label}
                </span>
              </div>
              <p className="text-xs text-(--t3) leading-relaxed mb-2 whitespace-pre-line">{r.description}</p>
              {r.reponse_admin && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Réponse de l'administrateur{r.action_admin ? ` · ${r.action_admin}` : ''}
                  </p>
                  <p className="text-xs text-emerald-700">{r.reponse_admin}</p>
                </div>
              )}
              <p className="text-[10px] text-(--t4) mt-2">Envoyée {formatTime(r.created_at)}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Onglet Questions / FAQ ────────────────────────────────────────────────────
function OngletQuestions({ toast }) {
  const [questions,    setQuestions]    = useState([]);
  const [loadingQ,     setLoadingQ]     = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [titre,        setTitre]        = useState('');
  const [message,      setMessage]      = useState('');
  const [sending,      setSending]      = useState(false);
  const [faqPubList,   setFaqPubList]   = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/questions-admin/mes-questions`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setQuestions(data))
      .catch(() => {})
      .finally(() => setLoadingQ(false));

    fetch(`${API_URL}/questions-admin/faq-publiees`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setFaqPubList(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!titre.trim() || !message.trim()) { toast.warning('Remplissez le titre et le message'); return; }
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/questions-admin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre: titre.trim(), message: message.trim() }),
      });
      if (!r.ok) throw new Error();
      const q = await r.json();
      setQuestions(prev => [q, ...prev]);
      setTitre(''); setMessage(''); setShowForm(false);
      toast.success('Question transmise à l\'administrateur');
    } catch {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
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

      {/* FAQ publiées par l'administrateur */}
      {faqPubList.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-black uppercase tracking-widest text-(--t4)">
              FAQ officielle PneumoIA ({faqPubList.length})
            </p>
          </div>
          <div className="space-y-2">
            {faqPubList.map((f, i) => (
              <div key={f.id}
                className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-(--sf2) transition-colors">
                  <span className="text-sm font-semibold text-(--t1) flex-1 pr-3">{f.question}</span>
                  <ChevronDown className={`w-4 h-4 text-blue-600 shrink-0 transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden">
                      <div className="px-4 pb-4 pt-1 border-t border-(--ln)">
                        <p className="text-xs text-(--t2) leading-relaxed">{f.reponse}</p>
                        {f.categorie && f.categorie !== 'Autre' && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                            {f.categorie}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
        <HelpCircle className="w-4 h-4" />Poser une question
      </button>

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
function OngletTemoignage({ toast, profil }) {
  const myName     = profil ? `Dr. ${profil.prenom} ${profil.nom}` : 'Dr.';
  const myInitials = profil ? `${(profil.prenom || '')[0] || ''}${(profil.nom || '')[0] || ''}`.toUpperCase() : '?';
  const mySpecialty = profil?.specialite || 'Pneumologue';

  const [avisList, setAvisList] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [note, setNote]         = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [texte, setTexte]       = useState('');
  const [ville, setVille]       = useState('');
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/medecins/mes-avis`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAvisList(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingT(false));
  }, []);

  const handleSubmit = async () => {
    if (note === 0 || !texte.trim()) { toast.warning('Donnez une note et rédigez votre témoignage'); return; }
    setSending(true);
    try {
      const r = await fetch(`${API_URL}/medecins/mon-avis`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, commentaire: texte.trim(), ville: ville.trim() }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setAvisList(prev => [data, ...prev]);
      setNote(0); setTexte(''); setVille('');
      setShowForm(false);
      toast.success('Témoignage publié sur la page d\'accueil');
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setSending(false);
    }
  };

  const statutTemoignage = {
    publie:   { label: 'Visible sur la landing page', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    supprime: { label: 'Retiré par l\'admin',         color: 'text-red-600',     bg: 'bg-red-50',     icon: X },
  };

  return (
    <div className="space-y-5">

      {/* Bandeau info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Quote className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Votre avis est publié immédiatement</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Dès que vous soumettez votre témoignage, il apparaît sur la page d'accueil de PneumoIA dans la section "Témoignages".
            L'administrateur peut le retirer s'il ne respecte pas la charte.
          </p>
        </div>
      </div>

      {/* Charte */}
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
          <p className="text-xs text-amber-600 mt-2 italic">En soumettant votre témoignage, vous acceptez ces conditions.</p>
        </div>
      </div>

      {/* Bouton nouveau témoignage */}
      <button onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
        <Quote className="w-4 h-4" />
        {showForm ? 'Annuler' : 'Nouveau témoignage'}
      </button>

      {/* Formulaire nouveau témoignage */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Rédiger un témoignage</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-(--sf2)"><X className="w-4 h-4 text-(--t3)" /></button>
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
                    <Star className={`w-8 h-8 transition-colors ${s <= (hovered || note) ? 'text-yellow-400 fill-yellow-400' : 'text-(--t4)'}`} />
                  </button>
                ))}
                {note > 0 && (
                  <span className="ml-2 self-center text-sm font-medium text-(--t2)">
                    {['', 'Décevant', 'Passable', 'Bien', 'Très bien', 'Excellent !'][note]}
                  </span>
                )}
              </div>
            </div>

            {/* Texte */}
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

            {/* Aperçu */}
            {note > 0 && texte.trim() && (
              <div>
                <p className="text-xs font-semibold text-(--t4) uppercase tracking-widest mb-2">Aperçu sur la landing page</p>
                <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">{myInitials}</div>
                    <div>
                      <p className="font-bold text-sm">{myName}</p>
                      <p className="text-blue-300 text-xs">{mySpecialty}</p>
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

            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={sending || note === 0 || !texte.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Publication...' : 'Publier sur la landing page'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste de tous mes témoignages */}
      {!loadingT && (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-(--t4)">
            Mes témoignages ({avisList.length})
          </p>
          {avisList.length === 0 ? (
            <div className="text-center py-10 bg-(--sf) border border-(--ln) rounded-xl">
              <Quote className="w-8 h-8 text-(--t4) mx-auto mb-2" />
              <p className="text-sm text-(--t3)">Vous n'avez pas encore soumis de témoignage</p>
            </div>
          ) : avisList.map((avis, i) => {
            const st = statutTemoignage[avis.statut] || statutTemoignage.publie;
            const StIcon = st.icon;
            return (
              <motion.div key={avis.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-(--sf) border border-(--ln) rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}>
                    <StIcon className="w-3.5 h-3.5" />{st.label}
                  </span>
                  <span className="text-xs text-(--t4)">🗓 {avis.date}</span>
                </div>
                <div className="bg-linear-to-br from-slate-900 to-blue-950 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">{myInitials}</div>
                    <div>
                      <p className="font-bold text-sm">{myName}</p>
                      <p className="text-blue-300 text-xs">{mySpecialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= avis.note ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
                    ))}
                  </div>
                  <p className="text-sm italic text-white/90 leading-relaxed">"{avis.commentaire}"</p>
                  {avis.ville && <p className="text-xs text-white/40 mt-3">📍 {avis.ville}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Onglet Publications des confrères ────────────────────────────────────────
function OngletConfreres({ toast, profil }) {
  const myId = profil?.id || '';

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');

  useEffect(() => {
    const load = () => {
      fetch(`${API_URL}/publications?with_comments=true`, {
        headers: { Authorization: `Bearer ${tok()}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => {
          const list = Array.isArray(data) ? data : [];
          // Publications tab = cas cliniques et articles des confrères uniquement
          setPosts(list.filter(p =>
            p.auteur_id !== myId &&
            ['cas_clinique', 'article'].includes(p.type)
          ));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [myId]);

  const handleComment = async (pubId) => {
    if (!replyText.trim()) return;
    try {
      const r = await fetch(`${API_URL}/publications/${pubId}/commentaires`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        toast.error(e.detail || `Erreur ${r.status}`);
        return;
      }
      const saved = await r.json().catch(() => ({}));
      setPosts(prev => prev.map(p =>
        p.id !== pubId ? p : {
          ...p,
          commentaires: [...(p.commentaires || []), {
            id: saved.id || Date.now(),
            author: { name: profil ? `Dr. ${profil.prenom} ${profil.nom}` : 'Moi', avatar: profil ? (profil.prenom[0] + profil.nom[0]).toUpperCase() : '?', role: 'Médecin' },
            text: replyText.trim(),
            time: new Date().toISOString(),
            likes: 0, liked: false, isMe: true, replies: [],
          }],
        }
      ));
      setExpandedReplies(prev => ({ ...prev, [pubId]: true }));
      setReplyingTo(null);
      setReplyText('');
      toast.success('Commentaire publié');
    } catch (e) {
      toast.error(`Erreur réseau — ${e?.message || 'vérifiez le backend'}`);
    }
  };

  const filtered = posts.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (p.casTitle || '').toLowerCase().includes(q)
        || (p.author?.name || '').toLowerCase().includes(q)
        || (p.text || '').toLowerCase().includes(q);
  });

  const typeConfigConf = {
    cas_clinique: { label: 'Cas clinique', color: 'bg-blue-50 text-blue-700',    icon: BookOpen },
    question:     { label: 'Question',     color: 'bg-amber-50 text-amber-700',  icon: AlertCircle },
    article:      { label: 'Article',      color: 'bg-emerald-50 text-emerald-700', icon: FileText },
    discussion:   { label: 'Discussion',   color: 'bg-purple-50 text-purple-700', icon: MessageCircle },
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Publications publiées par vos confrères. Vous pouvez commenter et réagir.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher une publication..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-(--sf) border border-(--ln) rounded-xl">
          <Stethoscope className="w-10 h-10 text-(--t4) mx-auto mb-3" />
          <p className="text-(--t3) font-medium">Aucune publication de confrère</p>
          <p className="text-sm text-(--t4) mt-1">Les publications apparaîtront ici dès qu'elles seront publiées.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const tc   = typeConfigConf[p.type] || typeConfigConf.discussion;
            const TIcon = tc.icon;
            const open = expandedReplies[p.id];
            const comments = p.commentaires || [];
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-(--sf) border border-(--ln) rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-sm font-semibold text-(--t1) truncate">{p.casTitle}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${tc.color}`}>
                      <TIcon className="w-3 h-3" />{tc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {p.author?.avatar || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-(--t1)">{p.author?.name}</p>
                      <p className="text-xs text-(--t4)">{p.author?.specialty}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-(--t4) shrink-0">
                      <Clock className="w-3 h-3" />{formatTime(p.time)}
                    </span>
                  </div>
                  <p className="text-sm text-(--t2) leading-relaxed">{p.text}</p>

                  {p.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-(--sf2) text-xs text-(--t3) rounded-full border border-(--ln)">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
                    <button onClick={() => { setReplyingTo(replyingTo === p.id ? null : p.id); setReplyText(''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                      <Reply className="w-4 h-4" />Commenter
                    </button>
                    {comments.length > 0 && (
                      <button onClick={() => setExpandedReplies(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors">
                        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {comments.length} commentaire{comments.length > 1 ? 's' : ''}
                      </button>
                    )}
                    {p.ressource_id && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_URL}/publications/${p.id}/telecharger`, {
                              headers: { Authorization: `Bearer ${tok()}` },
                            });
                            if (!res.ok) { toast.error('Aucun PDF disponible'); return; }
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `${p.casTitle || 'publication'}.pdf`; a.click();
                            URL.revokeObjectURL(url);
                          } catch { toast.error('Erreur lors du téléchargement'); }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Download className="w-4 h-4" />PDF
                      </button>
                    )}
                    <span className="ml-auto text-xs text-(--t4)">{p.nb_reactions || 0} réaction{(p.nb_reactions || 0) > 1 ? 's' : ''}</span>
                  </div>

                  <AnimatePresence>
                    {replyingTo === p.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-3 flex gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                          {profil ? (profil.prenom[0] + profil.nom[0]).toUpperCase() : 'M'}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleComment(p.id)}
                            placeholder="Votre commentaire..." autoFocus
                            className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <button onClick={() => handleComment(p.id)} disabled={!replyText.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {open && comments.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden">
                      {comments.map(c => (
                        <div key={c.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {c.author?.avatar || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-(--t1)">{c.author?.name}</span>
                              <span className="text-xs text-(--t4)">{c.author?.role}</span>
                              <span className="ml-auto text-xs text-(--t4)">{formatTime(c.time)}</span>
                            </div>
                            <p className="text-sm text-(--t2)">{c.text}</p>
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

// ─── Onglet Messages équipe ────────────────────────────────────────────────────
const TYPE_MSG_CFG = {
  rapport: { label: 'Rapport',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: BookOpen },
  alerte:  { label: 'Alerte',   color: 'bg-red-50 text-red-700 border-red-200',             icon: AlertCircle },
  info:    { label: 'Info',     color: 'bg-amber-50 text-amber-700 border-amber-200',       icon: Star },
};

function OngletMessagesEquipe({ toast, profil }) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [replyingTo, setReplyTo]  = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newText, setNewText]     = useState('');
  const [newType, setNewType]     = useState('info');
  const [showNew, setShowNew]     = useState(false);
  const [expanded, setExpanded]   = useState({});

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/equipe/messages`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!newText.trim()) return;
    try {
      const r = await fetch(`${API_URL}/equipe/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: newText.trim(), type_msg: newType }),
      });
      if (r.ok) {
        const msg = await r.json();
        setMessages(prev => [msg, ...prev]);
        setNewText(''); setShowNew(false);
        toast.success('Message envoyé');
      }
    } catch { toast.error('Erreur lors de l\'envoi'); }
  };

  const handleReply = async (mid) => {
    if (!replyText.trim()) return;
    try {
      const r = await fetch(`${API_URL}/equipe/messages/${mid}/reply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      if (r.ok) {
        const rep = await r.json();
        setMessages(prev => prev.map(m => m.id === mid ? { ...m, replies: [...(m.replies || []), rep] } : m));
        setExpanded(prev => ({ ...prev, [mid]: true }));
        setReplyText(''); setReplyTo(null);
        toast.success('Réponse envoyée');
      }
    } catch { toast.error('Erreur lors de l\'envoi'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-(--t4)">Messages de l'équipe ({messages.length})</p>
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
          <Send className="w-3 h-3" />Écrire
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-4 space-y-3">
            <div className="flex gap-2">
              {['rapport', 'alerte', 'info'].map(t => {
                const cfg = TYPE_MSG_CFG[t];
                const Icon = cfg.icon;
                return (
                  <button key={t} onClick={() => setNewType(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${newType === t ? cfg.color : 'bg-(--sf2) border-(--ln) text-(--t3)'}`}>
                    <Icon className="w-3 h-3" />{cfg.label}
                  </button>
                );
              })}
            </div>
            <textarea value={newText} onChange={e => setNewText(e.target.value)} rows={3}
              placeholder="Rédigez votre message à l'équipe..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-xs text-(--t3) hover:bg-(--sf2) rounded-lg">Annuler</button>
              <button onClick={handlePost} disabled={!newText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-50">
                <Send className="w-3 h-3" />Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 ? (
        <div className="py-14 text-center bg-(--sf) border border-(--ln) rounded-2xl">
          <Users className="w-10 h-10 text-(--t4) mx-auto mb-3" />
          <p className="text-sm text-(--t3) font-medium">Aucun message d'équipe</p>
          <p className="text-xs text-(--t4) mt-1">Les messages de vos aides soignants apparaîtront ici.</p>
        </div>
      ) : messages.map((msg, i) => {
        const cfg  = TYPE_MSG_CFG[msg.type] || TYPE_MSG_CFG.info;
        const Icon = cfg.icon;
        const open = expanded[msg.id];
        return (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`bg-(--sf) border rounded-xl overflow-hidden ${msg.pinned ? 'border-l-4 border-l-blue-500 border-(--ln)' : 'border-(--ln)'}`}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${msg.author?.isDoctor ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                  {msg.author?.avatar || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-bold text-(--t1)">{msg.author?.name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                      <Icon className="w-2.5 h-2.5" />{cfg.label}
                    </span>
                    {!msg.author?.isDoctor && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">Aide soignant</span>
                    )}
                  </div>
                  <p className="text-sm text-(--t2) leading-relaxed">{msg.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-(--t4) flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(msg.time)}</span>
                    <button onClick={() => setReplyTo(replyingTo === msg.id ? null : msg.id)}
                      className="text-xs text-(--t3) hover:text-blue-600 flex items-center gap-1 transition-colors">
                      <Reply className="w-3 h-3" />Répondre
                    </button>
                    {(msg.replies?.length > 0) && (
                      <button onClick={() => setExpanded(p => ({ ...p, [msg.id]: !p[msg.id] }))}
                        className="text-xs text-blue-600 flex items-center gap-1">
                        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {msg.replies.length} réponse{msg.replies.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {replyingTo === msg.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-12 space-y-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2}
                      placeholder="Votre réponse..."
                      className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf2) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setReplyTo(null); setReplyText(''); }} className="text-xs text-(--t3) hover:bg-(--sf2) px-3 py-1 rounded-lg">Annuler</button>
                      <button onClick={() => handleReply(msg.id)} disabled={!replyText.trim()}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        <Send className="w-3 h-3" />Répondre
                      </button>
                    </div>
                  </motion.div>
                )}

                {open && msg.replies?.map((rep, ri) => (
                  <motion.div key={rep.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ri * 0.03 }}
                    className="mt-2 pl-12 flex gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${rep.author?.isDoctor ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                      {rep.author?.avatar || '?'}
                    </div>
                    <div className="flex-1 bg-(--sf2) border border-(--ln) rounded-xl p-2.5">
                      <span className="text-xs font-bold text-(--t1)">{rep.author?.name}</span>
                      <p className="text-xs text-(--t2) mt-0.5">{rep.text}</p>
                      <span className="text-[10px] text-(--t4)">{formatTime(rep.time)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Commantaire() {
  const toast = useToast();
  const navigate = useNavigate();
  const { profil, loading: authLoading } = useProfil();
  const [activeTab, setActiveTab] = useState('equipe');

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
      <div>
        <h1 className="text-2xl font-bold text-(--t1)">Espace de communication</h1>
        <p className="text-sm text-(--t3) mt-1">
          Messages équipe · Commentaires cas cliniques · Requêtes admin · Questions & FAQ · Témoignages
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-(--ln)">
          {TABS.map(tab => {
            const Icon = tab.icon;
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
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'equipe'      && <OngletMessagesEquipe toast={toast} profil={profil} />}
              {activeTab === 'comments'    && <OngletCommentaires  toast={toast} profil={profil} />}
              {activeTab === 'conferes'    && <OngletConfreres     toast={toast} profil={profil} />}
              {activeTab === 'requests'    && <OngletRequetes      toast={toast} />}
              {activeTab === 'questions'   && <OngletQuestions     toast={toast} />}
              {activeTab === 'testimonial' && <OngletTemoignage    toast={toast} profil={profil} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
