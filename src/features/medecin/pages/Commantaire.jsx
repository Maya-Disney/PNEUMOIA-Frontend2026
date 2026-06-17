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
  RotateCcw, FileText, User
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const tok = () => localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('pneumoia_token') || '';

// ─── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
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
  const d = new Date(iso);
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
  const [comments, setComments]     = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText]   = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [newText, setNewText]       = useState('');
  const [newCas, setNewCas]         = useState('');
  const [newType, setNewType]       = useState('feedback');

  const myName     = profil ? `Dr. ${profil.prenom} ${profil.nom}` : 'Dr.';
  const myInitials = profil ? `${(profil.prenom || '')[0] || ''}${(profil.nom || '')[0] || ''}`.toUpperCase() : '?';
  const mySpecialty = profil?.specialite || 'Pneumologue';
  const myHospital  = profil?.etablissement || '';

  // Charger les publications du médecin avec leurs commentaires
  useEffect(() => {
    fetch(`${API_URL}/publications?mine=true&with_comments=true`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(pubs => {
        const flat = [];
        for (const pub of pubs) {
          for (const com of (pub.commentaires || [])) {
            flat.push({
              id:       com.id,
              pub_id:   pub.id,
              casTitle: pub.casTitle || pub.titre || '—',
              casId:    pub.casId   || pub.id,
              author:   com.author,
              text:     com.text,
              time:     com.time,
              likes:    com.likes,
              liked:    com.liked,
              pinned:   false,
              type:     'feedback',
              replies:  (com.replies || []).map(r => ({
                id:    r.id,
                author: r.author,
                text:  r.text,
                time:  r.time,
                likes: r.likes,
                liked: r.liked,
              })),
            });
          }
        }
        flat.sort((a, b) => new Date(b.time) - new Date(a.time));
        setComments(flat);
      })
      .catch(() => {});
  }, []);

  const handleLike = (cid, rid = null) => {
    setComments(prev => prev.map(c => {
      if (c.id !== cid) return c;
      if (rid !== null) return { ...c, replies: c.replies.map(r => r.id === rid ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r) };
      return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
    }));
  };

  const handleReply = async (cid) => {
    if (!replyText.trim()) return;
    const comment = comments.find(c => c.id === cid);
    try {
      if (comment?.pub_id) {
        const r = await fetch(`${API_URL}/publications/${comment.pub_id}/commentaires/${cid}/reply`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ contenu: replyText.trim() }),
        });
        if (r.ok) {
          const saved = await r.json();
          const reply = { id: saved.id, author: saved.author || { name: myName, avatar: myInitials, specialty: mySpecialty }, text: saved.text, time: saved.time, likes: 0, liked: false };
          setComments(prev => prev.map(c => c.id === cid ? { ...c, replies: [...c.replies, reply] } : c));
          setExpandedReplies(prev => ({ ...prev, [cid]: true }));
          setReplyText(''); setReplyingTo(null);
          toast.success('Réponse publiée');
          return;
        }
      }
    } catch { /* fallback local */ }
    // Fallback local si pas de pub_id ou erreur API
    const reply = { id: Date.now(), author: { name: myName, avatar: myInitials, specialty: mySpecialty }, text: replyText.trim(), time: new Date().toISOString(), likes: 0, liked: false };
    setComments(prev => prev.map(c => c.id === cid ? { ...c, replies: [...c.replies, reply] } : c));
    setExpandedReplies(prev => ({ ...prev, [cid]: true }));
    setReplyText(''); setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const handlePost = () => {
    if (!newText.trim() || !newCas.trim()) { toast.warning('Remplissez le cas et le commentaire'); return; }
    setComments(prev => [{
      id: Date.now(), pub_id: null, casTitle: newCas, casId: `CAS-2026-${String(Date.now()).slice(-3)}`,
      author: { name: myName, avatar: myInitials, specialty: mySpecialty, hospital: myHospital },
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
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">{myInitials}</div>
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
  const [requests, setRequests] = useState([]);
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
  const [loadingQ, setLoadingQ]   = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [titre, setTitre]         = useState('');
  const [message, setMessage]     = useState('');
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/questions-admin/mes-questions`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setQuestions(data))
      .catch(() => {})
      .finally(() => setLoadingQ(false));
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
            Aucune modération préalable n'est requise.
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
    fetch(`${API_URL}/publications?with_comments=true`, {
      headers: { Authorization: `Bearer ${tok()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setPosts(myId ? list.filter(p => p.auteur_id !== myId) : list);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [myId]);

  const handleComment = async (pubId) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`${API_URL}/publications/${pubId}/commentaires`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: replyText.trim() }),
      });
      setPosts(prev => prev.map(p =>
        p.id !== pubId ? p : {
          ...p,
          commentaires: [...(p.commentaires || []), {
            id: Date.now(),
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
    } catch {
      toast.error('Erreur lors de l\'envoi');
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

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Commantaire() {
  const toast = useToast();
  const navigate = useNavigate();
  const { profil, loading: authLoading } = useProfil();
  const [activeTab, setActiveTab] = useState('comments');

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
          Commentaires cas cliniques · Requêtes admin · Questions & FAQ · Témoignages
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-(--sf) border border-(--ln) rounded-2xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-(--ln)">
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
              {activeTab === 'comments'    && <OngletCommentaires toast={toast} profil={profil} />}
              {activeTab === 'conferes'    && <OngletConfreres    toast={toast} profil={profil} />}
              {activeTab === 'requests'    && <OngletRequetes     toast={toast} />}
              {activeTab === 'questions'   && <OngletQuestions    toast={toast} />}
              {activeTab === 'testimonial' && <OngletTemoignage   toast={toast} profil={profil} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
