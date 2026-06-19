import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle, AlertCircle, Info,
  Loader2, Trash2, BellOff, Clock, Shield, UserCheck, Key,
  MessageCircle, Settings, Check
} from 'lucide-react';

const P  = '#2563eb';
const P2 = '#1d4ed8';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const tok = () => localStorage.getItem('token') || '';

const NOTIF_ICONS = {
  permission:              Shield,
  validation:              UserCheck,
  code:                    Key,
  code_referent:           Key,
  info:                    Info,
  warning:                 AlertCircle,
  success:                 CheckCircle,
  nouveau_message_medecin: MessageCircle,
  nouveau_message_equipe:  MessageCircle,
  nouveau_commentaire:     MessageCircle,
  aide_nouveau_patient:    UserCheck,
  aide_modif_patient:      Shield,
  parametres:              Settings,
};

const NOTIF_CFG = {
  permission:              { bg:'bg-blue-50 dark:bg-blue-500/10',   ic:'text-blue-600 dark:text-blue-400',   dot:'#3b82f6', border:'border-blue-100 dark:border-blue-500/15'   },
  validation:              { bg:'bg-emerald-50 dark:bg-emerald-500/10', ic:'text-emerald-600 dark:text-emerald-400', dot:'#10b981', border:'border-emerald-100 dark:border-emerald-500/15' },
  code:                    { bg:'bg-amber-50 dark:bg-amber-500/10',  ic:'text-amber-600 dark:text-amber-400',  dot:'#f59e0b', border:'border-amber-100 dark:border-amber-500/15'  },
  code_referent:           { bg:'bg-amber-50 dark:bg-amber-500/10',  ic:'text-amber-600 dark:text-amber-400',  dot:'#f59e0b', border:'border-amber-100 dark:border-amber-500/15'  },
  warning:                 { bg:'bg-orange-50 dark:bg-orange-500/10',ic:'text-orange-600 dark:text-orange-400',dot:'#f97316', border:'border-orange-100 dark:border-orange-500/15' },
  success:                 { bg:'bg-emerald-50 dark:bg-emerald-500/10', ic:'text-emerald-600 dark:text-emerald-400', dot:'#10b981', border:'border-emerald-100 dark:border-emerald-500/15' },
  nouveau_message_medecin: { bg:'bg-blue-50 dark:bg-blue-500/10',   ic:'text-blue-600 dark:text-blue-400',   dot:'#3b82f6', border:'border-blue-100 dark:border-blue-500/15'   },
  nouveau_message_equipe:  { bg:'bg-blue-50 dark:bg-blue-500/10',   ic:'text-blue-600 dark:text-blue-400',   dot:'#3b82f6', border:'border-blue-100 dark:border-blue-500/15'   },
  nouveau_commentaire:     { bg:'bg-blue-50 dark:bg-blue-500/10',   ic:'text-blue-600 dark:text-blue-400',   dot:'#3b82f6', border:'border-blue-100 dark:border-blue-500/15'   },
};
const DEF_CFG = { bg:'bg-slate-50 dark:bg-slate-500/10', ic:'text-slate-500 dark:text-slate-400', dot:'#94a3b8', border:'border-slate-100 dark:border-slate-500/15' };

function normalizeNotif(n) {
  return {
    id:    n.id,
    type:  n.type_notif || n.type || 'info',
    title: n.titre      || n.title  || 'Notification',
    body:  n.message    || n.body   || '',
    date:  n.created_at || n.date,
    read:  n.lu         ?? n.read ?? false,
  };
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)    return 'À l\'instant';
  if (s < 3600)  return `Il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s/3600)}h`;
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { Authorization:`Bearer ${tok()}`, 'Content-Type':'application/json', ...(opts.headers||{}) },
  });
  if (!res.ok && res.status !== 204) throw new Error(res.status);
  if (res.status === 204) return null;
  return res.json();
}

export default function AideNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  const fetchNotifs = () =>
    apiFetch('/notifications')
      .then(data => setNotifs((Array.isArray(data) ? data : []).map(normalizeNotif)))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(iv);
  }, []);

  const markAll  = async () => { setNotifs(prev => prev.map(n => ({ ...n, read:true }))); try { await apiFetch('/notifications/tout-lire', { method:'PATCH' }); } catch {} };
  const clearRead = async () => { setNotifs(prev => prev.filter(n => !n.read)); try { await apiFetch('/notifications', { method:'DELETE' }); } catch {} };
  const markOne  = async id  => { setNotifs(prev => prev.map(n => n.id===id ? { ...n, read:true } : n)); try { await apiFetch(`/notifications/${id}/lire`, { method:'PATCH' }); } catch {} };
  const deleteOne = async id => { setNotifs(prev => prev.filter(n => n.id!==id)); try { await apiFetch(`/notifications/${id}`, { method:'DELETE' }); } catch {} };

  const unread   = notifs.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifs : notifs.filter(n => !n.read);

  return (
    <div className="space-y-5 w-full">

      {/* ── Header card ─── */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="relative rounded-2xl overflow-hidden"
        style={{ background:`linear-gradient(135deg,${P2} 0%,${P} 55%,#3b82f6 100%)`, boxShadow:`0 8px 32px rgba(37,99,235,0.25)` }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-15"
          style={{ background:'radial-gradient(circle,#bfdbfe,transparent)' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.06, backgroundImage:'radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)', backgroundSize:'18px 18px' }} />
        <div className="relative px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.18)', border:'1.5px solid rgba(255,255,255,0.28)' }}>
              <Bell size={20} className="text-white" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
            <div>
              <p className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Centre de notifications</p>
              <h1 className="text-xl font-black text-white">
                {loading ? '…' : `${notifs.length} notification${notifs.length > 1 ? 's' : ''}`}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <div className="text-center px-3 py-2 rounded-xl bg-red-500/25 border border-red-400/35">
                <p className="text-xl font-black text-white leading-none">{unread}</p>
                <p className="text-[10px] text-red-200 font-bold">Non lues</p>
              </div>
            )}
            <div className="text-center px-3 py-2 rounded-xl bg-white/10 border border-white/15">
              <p className="text-xl font-black text-white leading-none">{notifs.filter(n=>n.read).length}</p>
              <p className="text-[10px] text-blue-200 font-bold">Lues</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Barre actions/filtres ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-(--sf) rounded-xl p-1 border border-(--ln) shadow-sm">
          {[
            { key:'all',    label:'Toutes',   count:notifs.length },
            { key:'unread', label:'Non lues', count:unread        },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter===f.key ? 'text-white shadow-sm' : 'text-(--t3) hover:text-(--t2)'}`}
              style={filter===f.key ? { background:`linear-gradient(135deg,${P2},${P})` } : {}}>
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter===f.key ? 'bg-white/20 text-white' : 'text-(--t4)'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-(--t2) bg-(--sf) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors shadow-sm">
              <Check size={12} /> Tout marquer lu
            </button>
          )}
          {notifs.some(n => n.read) && (
            <button onClick={clearRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-(--sf) border border-red-100 dark:border-red-500/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm">
              <Trash2 size={12} /> Effacer les lues
            </button>
          )}
        </div>
      </div>

      {/* ── Liste ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color:P }} />
          <p className="text-sm text-(--t4)">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-(--sf2) border border-(--ln) flex items-center justify-center">
            <BellOff className="w-8 h-8 text-(--t4)" />
          </div>
          <div>
            <p className="font-bold text-(--t2) text-lg">
              {filter==='unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
            <p className="text-sm text-(--t4) mt-1">Vous êtes à jour !</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg  = NOTIF_CFG[n.type] || DEF_CFG;
              const Icon = NOTIF_ICONS[n.type] || Info;
              return (
                <motion.div key={n.id}
                  initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:24, scale:0.97 }}
                  transition={{ duration:0.18, delay: i < 8 ? i * 0.04 : 0 }}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    n.read ? 'bg-(--sf) border-(--ln)' : `${cfg.bg} ${cfg.border}`
                  }`}
                  style={{ boxShadow: n.read ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-(--sf2)' : cfg.bg}`}>
                    <Icon size={17} className={n.read ? 'text-(--t4)' : cfg.ic} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-bold leading-tight ${n.read ? 'text-(--t2)' : 'text-(--t1)'}`}>{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: cfg.dot }} />
                      )}
                    </div>
                    {n.body && (
                      <p className={`text-xs mt-1 leading-relaxed ${n.read ? 'text-(--t4)' : 'text-(--t3)'}`}>{n.body}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-(--t4) flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(n.date)}
                      </span>
                      {!n.read && (
                        <button onClick={() => markOne(n.id)}
                          className="text-[10px] font-bold transition-colors hover:underline" style={{ color:P }}>
                          Marquer lu
                        </button>
                      )}
                      <button onClick={() => deleteOne(n.id)}
                        className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-(--t4) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
