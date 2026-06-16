import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle, AlertCircle, Info,
  Loader2, Trash2, BellOff, Clock, Shield, UserCheck, Key, CheckCheck, MessageSquare, RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const NOTIF_CFG = {
  permission:  { icon: Shield,        bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconCls: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20', dot: 'bg-emerald-500'},
  validation:  { icon: UserCheck,     bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconCls: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20', dot: 'bg-emerald-500'},
  code:        { icon: Key,           bg: 'bg-amber-50 dark:bg-amber-500/10',     iconCls: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-100 dark:border-amber-500/20',   dot: 'bg-amber-500'  },
  warning:     { icon: AlertCircle,   bg: 'bg-orange-50 dark:bg-orange-500/10',   iconCls: 'text-orange-600 dark:text-orange-400',   border: 'border-orange-100 dark:border-orange-500/20', dot: 'bg-orange-500' },
  success:     { icon: CheckCircle,   bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconCls: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20', dot: 'bg-emerald-500'},
  commentaire: { icon: MessageSquare, bg: 'bg-violet-50 dark:bg-violet-500/10',   iconCls: 'text-violet-600 dark:text-violet-400',   border: 'border-violet-100 dark:border-violet-500/20', dot: 'bg-violet-500' },
  info:        { icon: Info,          bg: 'bg-slate-50 dark:bg-slate-500/10',     iconCls: 'text-slate-500 dark:text-slate-400',     border: 'border-slate-200 dark:border-slate-500/20',   dot: 'bg-slate-400'  },
};

const TYPE_MAP = {
  permission:              'permission',
  validation:              'validation',
  code_referent:           'code',
  patient_modif:           'warning',
  modif_patient:           'warning',
  aide_modif_patient:      'warning',
  referent_publication:    'success',
  referent_like:           'success',
  nouveau_commentaire:     'commentaire',
  nouveau_message_medecin: 'commentaire',
  parametres:              'info',
};

const getCfg = (type_notif) => NOTIF_CFG[TYPE_MAP[type_notif] || 'info'] || NOTIF_CFG.info;

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60)    return "à l'instant";
  if (s < 3600)  return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)}h`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AideNotifications() {
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('all');
  const intervalRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch(`${API_URL}/notifications?limite=100`, { headers: hdrs() });
      if (r.ok) setNotifs(await r.json());
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(true), 30_000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const markAll = async () => {
    try {
      await fetch(`${API_URL}/notifications/tout-lire`, { method: 'PATCH', headers: hdrs() });
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
    } catch {}
  };

  const deleteAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications`, { method: 'DELETE', headers: hdrs() });
      setNotifs(prev => prev.filter(n => !n.lu));
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/lire`, { method: 'PATCH', headers: hdrs() });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
    } catch {}
  };

  const deleteOne = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: hdrs() });
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const unread   = notifs.filter(n => !n.lu).length;
  const filtered = filter === 'all' ? notifs : notifs.filter(n => !n.lu);

  return (
    <div className="w-full space-y-4">

      {/* En-tête */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--t1) flex items-center gap-2.5">
            Notifications
            {unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold text-white bg-emerald-600">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-(--t3) mt-1">Centre de notifications de votre espace</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />Actualiser
          </button>
          {unread > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors">
              <CheckCheck className="w-3.5 h-3.5" />Tout marquer lu
            </button>
          )}
          {notifs.some(n => n.lu) && (
            <button onClick={deleteAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 dark:border-red-500/25 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Supprimer les lues
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs filtre */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex gap-1 bg-(--sf2) rounded-xl p-1 border border-(--ln) w-fit">
        {[{ key: 'all', label: 'Toutes', count: notifs.length }, { key: 'unread', label: 'Non lues', count: unread }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
            }`}>
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              filter === f.key ? 'bg-emerald-600 text-white' : 'bg-(--sf3) text-(--t4)'
            }`}>{f.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-(--sf2) border border-(--ln) flex items-center justify-center">
            <BellOff className="w-7 h-7 text-(--t4)" />
          </div>
          <div>
            <p className="font-semibold text-(--t2)">{filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}</p>
            <p className="text-xs text-(--t4) mt-0.5">Vous êtes à jour</p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          <AnimatePresence>
            {filtered.map(n => {
              const cfg  = getCfg(n.type_notif);
              const Icon = cfg.icon;
              return (
                <motion.div key={n.id} variants={item}
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    n.lu ? 'bg-(--sf) border-(--ln)' : `${cfg.bg} ${cfg.border}`
                  }`}>

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.lu ? 'bg-(--sf2)' : cfg.bg}`}>
                    <Icon className={`w-4 h-4 ${n.lu ? 'text-(--t3)' : cfg.iconCls}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${n.lu ? 'text-(--t2)' : 'text-(--t1)'}`}>{n.titre}</p>
                      {!n.lu && <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${cfg.dot}`} />}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${n.lu ? 'text-(--t4)' : 'text-(--t3)'}`}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-(--t4) flex items-center gap-1">
                        <Clock className="w-3 h-3" />{timeAgo(n.created_at)}
                      </span>
                      {!n.lu && (
                        <button onClick={() => markOne(n.id)}
                          className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                          Marquer lu
                        </button>
                      )}
                      <button onClick={() => deleteOne(n.id)}
                        className="ml-auto p-1 rounded-lg text-(--t4) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
