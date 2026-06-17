// src/features/medecin/pages/Notifications.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, Users, Stethoscope, Award,
  Clock, CheckCircle, AlertCircle, FileText,
  ChevronRight, CheckCheck, BellOff, Trash2, RefreshCw
} from 'lucide-react';
import {
  getNotifications, marquerNotifLue, marquerToutesLues,
  supprimerNotif, supprimerNotifsLues
} from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  const TYPE_ICON = {
    nouveau_commentaire:        'MessageCircle',
    nouveau_message_equipe:     'MessageCircle',
    nouveau_message_medecin:    'MessageCircle',
    nouveau_post:               'FileText',
    referent_like:              'Award',
    validation:                 'CheckCircle',
    groupe_accepte:             'CheckCircle',
    demande_groupe:             'Users',
    aide_demande:               'Users',
    nouvelle_inscription_medecin: 'Users',
    aide_nouveau_patient:       'Stethoscope',
    aide_modif_patient:         'Stethoscope',
    permission:                 'AlertCircle',
    parametres:                 'AlertCircle',
    code_referent:              'Award',
  };

  const normalizeNotif = (n) => ({
    id:         n.id,
    type:       n.type_notif || n.type || 'info',
    title:      n.titre      || n.title   || 'Notification',
    message:    n.message,
    time:       n.created_at || n.time,
    read:       n.lu         ?? n.read ?? false,
    icon:       TYPE_ICON[n.type_notif] || n.icon || 'Bell',
    actionLink: n.meta?.actionLink || n.actionLink || null,
  });

  const loadNotifications = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : (data.items ?? []);
      setNotifications(list.map(normalizeNotif));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setRefreshing(false), 600);
    }
  };

  const markAsRead = async (notificationId, actionLink) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    try { await marquerNotifLue(notificationId); } catch { /* optimistic */ }
    if (actionLink) navigate(actionLink);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await marquerToutesLues(); } catch { /* optimistic */ }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    try { await supprimerNotif(notificationId); } catch { /* optimistic */ }
  };

  const clearReadNotifications = async () => {
    setNotifications(prev => prev.filter(n => !n.read));
    try { await supprimerNotifsLues(); } catch { /* optimistic */ }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getIcon = (iconName) => {
    const icons = { Stethoscope, AlertCircle, MessageCircle, Users, Award, CheckCircle, FileText, Bell };
    return icons[iconName] || Bell;
  };

  const filters = [
    { id: 'all',    label: 'Toutes',   count: notifications.length },
    { id: 'unread', label: 'Non lues', count: notifications.filter(n => !n.read).length },
    { id: 'read',   label: 'Lues',     count: notifications.filter(n => n.read).length }
  ];

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : activeFilter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
        <div className="flex gap-2 items-center">
          <button
            onClick={() => loadNotifications(true)}
            title="Rafraîchir"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-(--t3) hover:bg-(--sf3) rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          )}
          {notifications.some(n => n.read) && (
            <button
              onClick={clearReadNotifications}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-(--t3) hover:bg-(--sf3) rounded-lg transition-colors"
            >
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
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium transition-all relative
                ${isActive ? 'text-blue-600' : 'text-(--t3) hover:text-(--t1)'}`}
            >
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
          {filteredNotifications.map((notification, index) => {
            const Icon = getIcon(notification.icon);
            const isUnread = !notification.read;

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative rounded-xl border transition-all hover:shadow-sm cursor-pointer
                  ${isUnread
                    ? 'bg-(--sf) border-l-4 border-l-blue-500 border-(--ln)'
                    : 'bg-(--sf2) border-(--ln) opacity-80 hover:opacity-100'}`}
                onClick={() => markAsRead(notification.id, notification.actionLink)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      ${isUnread ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-(--sf3)'}`}>
                      <Icon className={`w-5 h-5 ${isUnread ? 'text-blue-600 dark:text-blue-300' : 'text-(--t4)'}`} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${isUnread ? 'text-(--t1)' : 'text-(--t3)'}`}>
                          {notification.title}
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
                        <span>{formatTime(notification.time)}</span>
                      </div>
                    </div>

                    {/* Actions au hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => deleteNotification(notification.id, e)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-(--t4) hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        title="Supprimer"
                      >
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

        {/* État vide */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-(--sf2) rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-(--t4)" />
            </div>
            <p className="text-(--t3) font-medium">Aucune notification</p>
            <p className="text-sm text-(--t4) mt-1">
              {activeFilter === 'unread'
                ? 'Vous avez lu toutes vos notifications'
                : 'Vous n\'avez pas encore de notifications'}
            </p>
          </div>
        )}
      </div>

      {/* Compteur */}
      {notifications.length > 0 && (
        <div className="text-center text-xs text-(--t4) pt-4 border-t border-(--ln)">
          {notifications.filter(n => !n.read).length} non lue(s) · {notifications.filter(n => n.read).length} lue(s)
        </div>
      )}
    </div>
  );
}
