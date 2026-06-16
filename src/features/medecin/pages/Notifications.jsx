// src/features/medecin/pages/Notifications.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Users, Stethoscope, Award,
  Clock, CheckCircle, AlertCircle, Info, Settings,
  ChevronRight, CheckCheck, BellOff, Trash2, Loader2, RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const hdrs = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const TYPE_CFG = {
  aide_nouveau_patient:    { Icon: Users,          link: '/medecin/patients'         },
  aide_post:               { Icon: MessageCircle,  link: '/medecin/commentaires'     },
  aide_like:               { Icon: Award,          link: '/medecin/commentaires'     },
  aide_commentaire:        { Icon: MessageCircle,  link: '/medecin/commentaires'     },
  aide_modif_patient:      { Icon: AlertCircle,    link: '/medecin/patients'         },
  aide_demande:            { Icon: Users,          link: '/medecin/parametres'       },
  nouveau_message_equipe:  { Icon: MessageCircle,  link: '/medecin/commentaires'     },
  nouveau_commentaire:     { Icon: MessageCircle,  link: '/medecin/commentaires'     },
  referent_like:           { Icon: Award,          link: '/medecin/commentaires'     },
  classement:              { Icon: Award,          link: '/medecin/profil'           },
  demande_partage:         { Icon: Users,          link: '/medecin/partage'          },
  parametres:              { Icon: Settings,       link: '/medecin/parametres'       },
  faq_admin:               { Icon: Info,           link: '/medecin/dashboard'        },
  consultation_hors_ligne: { Icon: Stethoscope,    link: '/medecin/historique'       },
  patient_archive:         { Icon: AlertCircle,    link: '/medecin/patients'         },
  publication:             { Icon: MessageCircle,  link: '/medecin/mes-publications' },
  default:                 { Icon: Bell,           link: '/medecin/dashboard'        },
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now   = new Date();
  const diff  = now - date;
  const min   = Math.floor(diff / 60000);
  const h     = Math.floor(diff / 3600000);
  const d     = Math.floor(diff / 86400000);
  if (min < 1)  return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  if (h   < 24) return `Il y a ${h}h`;
  if (d === 1)  return 'Hier';
  return date.toLocaleDateString('fr-FR');
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter,  setActiveFilter]  = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch(`${API_URL}/notifications?limite=100`, { headers: hdrs() });
      if (r.ok) setNotifications(await r.json());
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

  const markAsRead = async (notif) => {
    if (!notif.lu) {
      try {
        await fetch(`${API_URL}/notifications/${notif.id}/lire`, { method: 'PATCH', headers: hdrs() });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, lu: true } : n));
      } catch {}
    }
    const cfg  = TYPE_CFG[notif.type_notif] || TYPE_CFG.default;
    const link = notif.meta?.lien || cfg.link;
    navigate(link);
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/tout-lire`, { method: 'PATCH', headers: hdrs() });
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch {}
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE', headers: hdrs() });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const clearRead = async () => {
    try {
      await fetch(`${API_URL}/notifications`, { method: 'DELETE', headers: hdrs() });
      setNotifications(prev => prev.filter(n => !n.lu));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.lu).length;

  const filtered = activeFilter === 'all'
    ? notifications
    : activeFilter === 'unread'
    ? notifications.filter(n => !n.lu)
    : notifications.filter(n => n.lu);

  const filters = [
    { id: 'all',    label: 'Toutes',   count: notifications.length },
    { id: 'unread', label: 'Non lues', count: unreadCount },
    { id: 'read',   label: 'Lues',     count: notifications.filter(n => n.lu).length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Notifications</h1>
          <p className="text-sm text-(--t3) mt-1">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : 'Toutes vos notifications sont lues'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-(--t3) hover:bg-(--sf3) rounded-lg transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          )}
          {notifications.some(n => n.lu) && (
            <button onClick={clearRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-(--t3) hover:bg-(--sf3) rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
              Nettoyer les lues
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 border-b border-(--ln)">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button key={filter.id} onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium transition-all relative
                ${isActive ? 'text-blue-600' : 'text-(--t3) hover:text-(--t1)'}`}>
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full
                  ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-(--sf3) text-(--t3)'}`}>
                  {filter.count}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Liste */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((notification, index) => {
            const cfg    = TYPE_CFG[notification.type_notif] || TYPE_CFG.default;
            const Icon   = cfg.Icon;
            const isUnread = !notification.lu;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.04 }}
                className={`group relative rounded-xl border transition-all hover:shadow-sm cursor-pointer
                  ${isUnread
                    ? 'bg-(--sf) border-l-4 border-l-blue-500 border-(--ln)'
                    : 'bg-(--sf2) border-(--ln) opacity-80 hover:opacity-100'}`}
                onClick={() => markAsRead(notification)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      ${isUnread ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-(--sf3)'}`}>
                      <Icon className={`w-5 h-5 ${isUnread ? 'text-blue-600 dark:text-blue-300' : 'text-(--t4)'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isUnread ? 'text-(--t1)' : 'text-(--t3)'}`}>
                          {notification.titre}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shrink-0" />
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${isUnread ? 'text-(--t2)' : 'text-(--t4)'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-(--t4)">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(notification.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => deleteNotification(notification.id, e)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-(--t4) hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-(--t4)" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-(--sf2) rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-(--t4)" />
            </div>
            <p className="text-(--t3) font-medium">Aucune notification</p>
            <p className="text-sm text-(--t4) mt-1">
              {activeFilter === 'unread'
                ? 'Vous avez lu toutes vos notifications'
                : "Vous n'avez pas encore de notifications"}
            </p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="text-center text-xs text-(--t4) pt-4 border-t border-(--ln)">
          {unreadCount} non lue(s) · {notifications.filter(n => n.lu).length} lue(s)
        </div>
      )}
    </div>
  );
}
