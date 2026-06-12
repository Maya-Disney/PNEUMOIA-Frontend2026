import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle, AlertCircle, Info,
  Loader2, Trash2, BellOff, Clock, Shield, UserCheck, Key
} from 'lucide-react';

const RED = '#DC2626';

const NOTIF_ICONS = {
  permission: Shield,
  validation: UserCheck,
  code:       Key,
  info:       Info,
  warning:    AlertCircle,
  success:    CheckCircle,
};

const NOTIF_COLORS = {
  permission: { bg:'bg-blue-50 dark:bg-blue-500/10',     icon:'text-blue-600 dark:text-blue-400',     border:'border-blue-100 dark:border-blue-500/15'     },
  validation: { bg:'bg-emerald-50 dark:bg-emerald-500/10', icon:'text-emerald-600 dark:text-emerald-400', border:'border-emerald-100 dark:border-emerald-500/15' },
  code:       { bg:'bg-amber-50 dark:bg-amber-500/10',   icon:'text-amber-600 dark:text-amber-400',   border:'border-amber-100 dark:border-amber-500/15'   },
  info:       { bg:'bg-slate-50 dark:bg-slate-500/10',   icon:'text-slate-600 dark:text-slate-400',   border:'border-slate-100 dark:border-slate-500/15'   },
  warning:    { bg:'bg-orange-50 dark:bg-orange-500/10', icon:'text-orange-600 dark:text-orange-400', border:'border-orange-100 dark:border-orange-500/15' },
  success:    { bg:'bg-emerald-50 dark:bg-emerald-500/10', icon:'text-emerald-600 dark:text-emerald-400', border:'border-emerald-100 dark:border-emerald-500/15' },
};

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)    return 'à l\'instant';
  if (s < 3600)  return `il y a ${Math.floor(s/60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s/3600)}h`;
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
}

const DEMO_NOTIFS = [
  { id:1, type:'validation', title:'Compte validé',              body:'Votre compte aide soignant a été approuvé par votre médecin référent.',           date: new Date(Date.now()-3600000).toISOString(),   read:false },
  { id:2, type:'permission', title:'Permissions mises à jour',   body:'Votre médecin a modifié vos permissions d\'accès à la plateforme.',              date: new Date(Date.now()-86400000).toISOString(),  read:true  },
  { id:3, type:'code',       title:'Code référent régénéré',     body:'Le code référent de votre médecin a été renouvelé. Vérifiez vos emails.',         date: new Date(Date.now()-172800000).toISOString(), read:true  },
  { id:4, type:'info',       title:'Bienvenue sur PneumoIA',     body:'Votre espace aide soignant est prêt. Explorez le tableau de bord pour commencer.', date: new Date(Date.now()-259200000).toISOString(), read:true  },
];

export default function AideNotifications() {
  const aideId = localStorage.getItem('aide_id') || '';
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`aide_notifs_${aideId}`) || 'null');
    setNotifs(saved ?? DEMO_NOTIFS);
    if (!saved) localStorage.setItem(`aide_notifs_${aideId}`, JSON.stringify(DEMO_NOTIFS));
    setLoading(false);
  }, [aideId]);

  const save = (list) => {
    setNotifs(list);
    localStorage.setItem(`aide_notifs_${aideId}`, JSON.stringify(list));
  };

  const markAll   = ()    => save(notifs.map(n => ({ ...n, read:true })));
  const deleteAll = ()    => save([]);
  const markOne   = (id)  => save(notifs.map(n => n.id === id ? { ...n, read:true } : n));
  const deleteOne = (id)  => save(notifs.filter(n => n.id !== id));

  const unread   = notifs.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifs : notifs.filter(n => !n.read);

  const FILTERS = [
    { key:'all',    label:'Toutes',   count: notifs.length },
    { key:'unread', label:'Non lues', count: unread },
  ];

  return (
    <div className="space-y-4 w-full max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-(--t3) flex items-center gap-1.5 mb-0.5">
            <Bell className="w-3 h-3" style={{ color:RED }} /> Centre de notifications
          </p>
          <h1 className="text-xl font-black text-(--t1) flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor:RED }}>
                {unread}
              </span>
            )}
          </h1>
        </div>

        {/* Actions groupées */}
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-(--t2) border border-(--ln) rounded-xl hover:bg-(--sf2) transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Tout marquer lu
            </button>
          )}
          {notifs.length > 0 && (
            <button onClick={deleteAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 dark:border-red-500/25 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Tout supprimer
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-(--sf2) rounded-xl p-1 border border-(--ln)">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-(--sf) text-(--t1) shadow-sm' : 'text-(--t3) hover:text-(--t2)'
            }`}>
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              filter === f.key ? 'bg-(--sf2) text-(--t2)' : 'text-(--t4)'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Notifs */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color:RED }} />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex flex-col items-center justify-center py-20 text-center">
          <BellOff className="w-10 h-10 text-(--t4) mb-3" />
          <p className="font-semibold text-(--t2)">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n, i) => {
              const col  = NOTIF_COLORS[n.type] || NOTIF_COLORS.info;
              const Icon = NOTIF_ICONS[n.type]  || Info;
              return (
                <motion.div key={n.id}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:20 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    n.read ? 'bg-(--sf) border-(--ln)' : `${col.bg} ${col.border}`
                  }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.read ? 'bg-(--sf2)' : col.bg
                  }`}>
                    <Icon className={`w-4 h-4 ${n.read ? 'text-(--t3)' : col.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-bold ${n.read ? 'text-(--t2)' : 'text-(--t1)'}`}>{n.title}</p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ backgroundColor:RED }} />
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${n.read ? 'text-(--t4)' : 'text-(--t3)'}`}>{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-(--t4) flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(n.date)}
                      </span>
                      {!n.read && (
                        <button onClick={() => markOne(n.id)}
                          className="text-[10px] font-semibold text-(--t3) hover:text-(--t1) transition-colors">
                          Marquer lu
                        </button>
                      )}
                      <button onClick={() => deleteOne(n.id)}
                        className="ml-auto text-(--t4) hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
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
