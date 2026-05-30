// src/features/medecin/pages/Commantaire.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ThumbsUp, Reply, Trash2, Send,
  Search, Filter, MoreHorizontal, Star, Flag,
  ChevronDown, ChevronUp, User, Clock, FolderOpen,
  CheckCircle, AlertCircle, BookOpen, TrendingUp,
  Pin, Edit2, X, Heart
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

// ─── Données mock ──────────────────────────────────────────────────────────────
const MOCK_COMMENTS = [
  {
    id: 1,
    casTitle: 'BPCO stade avancé — Patient 47 ans',
    casId: 'CAS-2024-042',
    author: { name: 'Dr. Merlin', avatar: 'DM', specialty: 'Pneumologue', hospital: 'CHU Douala' },
    text: 'Excellent cas clinique ! La prise en charge présentée suit parfaitement les recommandations GOLD 2024. La combinaison LABA/LAMA est bien justifiée pour ce stade.',
    time: '2026-05-22T14:30:00',
    likes: 8,
    liked: false,
    pinned: true,
    type: 'feedback',
    replies: [
      { id: 101, author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue' }, text: 'Merci Dr. Merlin ! Effectivement le suivi EFR a confirmé l\'amélioration du VEMS à +18% après 3 mois.', time: '2026-05-22T15:10:00', likes: 3, liked: false },
    ]
  },
  {
    id: 2,
    casTitle: 'Pneumonie bactérienne — Antibiothérapie probabiliste',
    casId: 'CAS-2024-038',
    author: { name: 'Dr. Nkoa', avatar: 'DN', specialty: 'Pneumologue', hospital: 'Clinique La Paix' },
    text: 'Question sur la durée de l\'antibiothérapie : dans ce cas particulier avec un germe atypique suspecté, envisageriez-vous une extension à 10 jours plutôt que 7 ?',
    time: '2026-05-21T09:15:00',
    likes: 4,
    liked: true,
    pinned: false,
    type: 'question',
    replies: []
  },
  {
    id: 3,
    casTitle: 'Tuberculose pulmonaire — Suivi thérapeutique',
    casId: 'CAS-2024-031',
    author: { name: 'Dr. Abanda', avatar: 'DA', specialty: 'Infectiologue', hospital: 'Hôpital Général' },
    text: 'Cas très instructif. La gestion des effets indésirables hépatiques du traitement antituberculeux est rarement aussi bien documentée. Bravo pour le partage.',
    time: '2026-05-20T16:45:00',
    likes: 12,
    liked: false,
    pinned: false,
    type: 'feedback',
    replies: [
      { id: 201, author: { name: 'Dr. Fouda', avatar: 'DF', specialty: 'Hépatologue' }, text: 'Tout à fait. Les transaminases à 3x la normale ont nécessité une adaptation du protocole.', time: '2026-05-20T17:20:00', likes: 5, liked: false },
      { id: 202, author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue' }, text: 'Merci à tous. Le bilan hépatique hebdomadaire s\'est avéré indispensable dans ce cas.', time: '2026-05-20T18:00:00', likes: 6, liked: false },
    ]
  },
  {
    id: 4,
    casTitle: 'Asthme allergique — Immunothérapie spécifique',
    casId: 'CAS-2024-029',
    author: { name: 'Dr. Mvondo', avatar: 'DV', specialty: 'Allergologue', hospital: 'Polyclinique Bonanjo' },
    text: 'Suggestion : aurait-il été pertinent d\'inclure le bilan allergologique complet avant d\'initier l\'ITS ? Le profil IgE spécifique manque dans la présentation.',
    time: '2026-05-19T11:30:00',
    likes: 6,
    liked: false,
    pinned: false,
    type: 'suggestion',
    replies: []
  },
  {
    id: 5,
    casTitle: 'Fibrose pulmonaire idiopathique — Diagnostic précoce',
    casId: 'CAS-2024-025',
    author: { name: 'Dr. Bello', avatar: 'DB', specialty: 'Radiologue', hospital: 'CHU Yaoundé' },
    text: 'Le pattern tomodensitométrique UIP est parfaitement décrit. Le diagnostic différentiel avec la PHS chronique est bien mené. Ce cas devrait être présenté lors du prochain congrès.',
    time: '2026-05-18T08:00:00',
    likes: 15,
    liked: true,
    pinned: true,
    type: 'feedback',
    replies: []
  },
];

const typeConfig = {
  feedback:   { label: 'Avis',        color: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-300',   icon: Star },
  question:   { label: 'Question',    color: 'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300',  icon: AlertCircle },
  suggestion: { label: 'Suggestion',  color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', icon: BookOpen },
};

// ─── Composant principal ───────────────────────────────────────────────────────
export default function Commantaire() {
  const toast = useToast();
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showNewComment, setShowNewComment] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCas, setNewCas] = useState('');

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    const h = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (h < 1) return 'À l\'instant';
    if (h < 24) return `Il y a ${h}h`;
    if (days === 1) return 'Hier';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const handleLike = (commentId, replyId = null) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      if (replyId !== null) {
        return {
          ...c,
          replies: c.replies.map(r =>
            r.id === replyId
              ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
              : r
          )
        };
      }
      return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
    }));
  };

  const handleReply = (commentId) => {
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue' },
      text: replyText.trim(),
      time: new Date().toISOString(),
      likes: 0,
      liked: false
    };
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
    ));
    setExpandedReplies(prev => ({ ...prev, [commentId]: true }));
    setReplyText('');
    setReplyingTo(null);
    toast.success('Réponse publiée');
  };

  const handleDelete = (commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.info('Commentaire supprimé');
  };

  const handleNewComment = () => {
    if (!newText.trim() || !newCas.trim()) {
      toast.warning('Remplissez le cas clinique et le commentaire');
      return;
    }
    const comment = {
      id: Date.now(),
      casTitle: newCas,
      casId: `CAS-2026-${String(Date.now()).slice(-3)}`,
      author: { name: 'Dr. Jean Tagne', avatar: 'JT', specialty: 'Pneumologue', hospital: 'CHU Douala' },
      text: newText.trim(),
      time: new Date().toISOString(),
      likes: 0,
      liked: false,
      pinned: false,
      type: 'feedback',
      replies: []
    };
    setComments(prev => [comment, ...prev]);
    setNewText('');
    setNewCas('');
    setShowNewComment(false);
    toast.success('Commentaire publié avec succès');
  };

  const filtered = comments.filter(c => {
    const matchSearch = c.casTitle.toLowerCase().includes(searchTerm.toLowerCase())
      || c.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      || c.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchType;
  });

  const pinned = filtered.filter(c => c.pinned);
  const regular = filtered.filter(c => !c.pinned);
  const totalLikes = comments.reduce((s, c) => s + c.likes, 0);

  const stats = [
    { label: 'Commentaires reçus', value: comments.length, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total j\'aime', value: totalLikes, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { label: 'Épinglés', value: comments.filter(c => c.pinned).length, icon: Pin, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Questions ouvertes', value: comments.filter(c => c.type === 'question').length, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const CommentCard = ({ comment, i }) => {
    const TypeCfg = typeConfig[comment.type] || typeConfig.feedback;
    const TypeIcon = TypeCfg.icon;
    const repliesOpen = expandedReplies[comment.id];

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className={`bg-(--sf) border border-(--ln) rounded-xl overflow-hidden hover:shadow-sm transition-all ${comment.pinned ? 'border-l-4 border-l-amber-400' : ''}`}
      >
        <div className="p-5">
          {/* Cas clinique */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              {comment.pinned && <Pin className="w-4 h-4 text-amber-500 shrink-0" />}
              <FolderOpen className="w-4 h-4 text-(--t4) shrink-0" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">{comment.casTitle}</span>
              <span className="text-xs text-(--t4) shrink-0">{comment.casId}</span>
            </div>
            <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0 ${TypeCfg.color}`}>
              <TypeIcon className="w-3 h-3" />
              {TypeCfg.label}
            </span>
          </div>

          {/* Auteur */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {comment.author.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-(--t1)">{comment.author.name}</p>
              <p className="text-xs text-(--t4)">{comment.author.specialty} · {comment.author.hospital}</p>
            </div>
            <span className="ml-auto flex items-center gap-1 text-xs text-(--t4)">
              <Clock className="w-3 h-3" />
              {formatTime(comment.time)}
            </span>
          </div>

          {/* Texte */}
          <p className="text-sm text-(--t2) leading-relaxed">{comment.text}</p>

          {/* Actions */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-(--ln)">
            <button
              onClick={() => handleLike(comment.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                comment.liked
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-(--t3) hover:bg-(--sf2)'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              {comment.likes}
            </button>

            <button
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors"
            >
              <Reply className="w-4 h-4" />
              Répondre
            </button>

            {comment.replies.length > 0 && (
              <button
                onClick={() => setExpandedReplies(p => ({ ...p, [comment.id]: !p[comment.id] }))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-(--t3) hover:bg-(--sf2) transition-colors"
              >
                {repliesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
              </button>
            )}

            <button
              onClick={() => handleDelete(comment.id)}
              className="ml-auto p-1.5 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Zone de réponse */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-3 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                  JT
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReply(comment.id)}
                    placeholder="Écrire une réponse..."
                    className="flex-1 px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Réponses */}
        <AnimatePresence>
          {repliesOpen && comment.replies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-(--ln) bg-(--sf2) px-5 py-4 space-y-4 overflow-hidden"
            >
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {reply.author.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-(--t1)">{reply.author.name}</span>
                      <span className="text-xs text-(--t4)">{reply.author.specialty}</span>
                      <span className="ml-auto text-xs text-(--t4) flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(reply.time)}
                      </span>
                    </div>
                    <p className="text-sm text-(--t2)">{reply.text}</p>
                    <button
                      onClick={() => handleLike(comment.id, reply.id)}
                      className={`flex items-center gap-1 mt-2 text-xs font-medium transition-colors ${reply.liked ? 'text-blue-600' : 'text-(--t4) hover:text-(--t2)'}`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {reply.likes}
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Commentaires</h1>
          <p className="text-sm text-(--t3) mt-1">Retours et échanges sur vos cas cliniques partagés</p>
        </div>
        <button
          onClick={() => setShowNewComment(!showNewComment)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Nouveau commentaire
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-(--sf) border border-(--ln) rounded-xl p-4 hover:shadow-sm transition-all"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg} mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-(--t1)">{s.value}</p>
              <p className="text-xs text-(--t3) mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Nouveau commentaire ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewComment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-(--sf) border border-(--ln) rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-(--t1)">Nouveau commentaire</h3>
              <button onClick={() => setShowNewComment(false)} className="p-1 rounded-lg hover:bg-(--sf3)">
                <X className="w-4 h-4 text-(--t3)" />
              </button>
            </div>
            <input
              type="text"
              value={newCas}
              onChange={e => setNewCas(e.target.value)}
              placeholder="Cas clinique concerné..."
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Rédigez votre commentaire..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewComment(false)}
                className="px-4 py-2 text-sm text-(--t3) hover:bg-(--sf2) rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleNewComment}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Publier
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filtres et recherche ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un commentaire, auteur, cas..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'feedback', label: 'Avis' },
            { key: 'question', label: 'Questions' },
            { key: 'suggestion', label: 'Suggestions' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                filterType === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-(--sf) border border-(--ln) text-(--t3) hover:bg-(--sf2)'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Commentaires épinglés ───────────────────────────────────────── */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black text-(--t4) uppercase tracking-widest flex items-center gap-2">
            <Pin className="w-3.5 h-3.5 text-amber-500" />
            Épinglés
          </p>
          {pinned.map((c, i) => <CommentCard key={c.id} comment={c} i={i} />)}
        </div>
      )}

      {/* ── Tous les commentaires ───────────────────────────────────────── */}
      <div className="space-y-3">
        {pinned.length > 0 && (
          <p className="text-xs font-black text-(--t4) uppercase tracking-widest">Récents</p>
        )}
        {regular.length > 0
          ? regular.map((c, i) => <CommentCard key={c.id} comment={c} i={i + pinned.length} />)
          : (
            <div className="text-center py-12 bg-(--sf) border border-(--ln) rounded-xl">
              <MessageCircle className="w-10 h-10 text-(--t4) mx-auto mb-3" />
              <p className="text-(--t3) font-medium">Aucun commentaire trouvé</p>
              <p className="text-sm text-(--t4) mt-1">Modifiez vos filtres ou partagez un cas clinique</p>
            </div>
          )
        }
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-(--t4)">
          {filtered.length} commentaire{filtered.length > 1 ? 's' : ''} · {comments.reduce((s, c) => s + c.replies.length, 0)} réponse{comments.reduce((s, c) => s + c.replies.length, 0) > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
