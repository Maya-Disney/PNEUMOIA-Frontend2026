import { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Share2, Lock,
  Eye, EyeOff, CheckCircle, AlertCircle,
  Smartphone, Save, Trash2, Sun, Moon,
  Download, Loader2, ChevronRight
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const I18N = {
  fr: {
    title: 'Paramètres', subtitle: 'Gérez vos préférences et options de la plateforme',
    save: 'Sauvegarder', saving: 'Sauvegarde…', saved: 'Paramètres sauvegardés sur le serveur.', saveErr: 'Erreur lors de la sauvegarde.',
    tabs: { compte: 'Compte', confidentialite: 'Confidentialité', partage: 'Partage', affichage: 'Affichage', notifications: 'Notifications', securite: 'Sécurité' },
    compte: {
      h1: 'Préférences générales', langue: 'Langue', timezone: 'Fuseau horaire',
      h2: 'Notifications générales',
      emailNotif: ['Notifications par email', 'Recevoir les notifications importantes par email'],
      smsNotif:   ['Notifications par SMS',   'Recevoir les alertes par SMS'],
      newsletter: ['Newsletter',               'Recevoir la newsletter mensuelle'],
      rappelsCons:['Rappels de consultations', 'Recevoir des rappels pour les consultations'],
      rappelsSuivi:['Rappels de suivi',        'Recevoir des rappels pour le suivi patients'],
    },
    confidentialite: {
      h1: 'Visibilité', profilPublic: ['Profil public','Votre profil est visible par les autres médecins'],
      annuaire: ['Visible dans l\'annuaire','Apparaître dans l\'annuaire des médecins'],
      h2: 'Cas cliniques', anonymisation: ['Anonymisation des cas','Anonymiser automatiquement les données patients'],
      accepte: ['Accepter les demandes','Accepter les demandes de collaboration'],
    },
    partage: { desc: 'Les options de partage s\'appliquent à vos publications dans la communauté médicale.', notifPartage: ['Notification de partage','Être notifié quand vos contenus sont partagés'] },
    affichage: {
      h1: 'Thème', themeLabel: 'Thème de l\'interface', dark: 'Mode sombre activé', light: 'Mode clair activé', toDark: 'Mode sombre', toLight: 'Mode clair',
      h2: 'Préférences d\'affichage', compact: ['Vue compacte','Afficher plus d\'informations par écran'],
      thumbnails: ['Afficher les miniatures','Afficher les aperçus des images'],
      defaultView: 'Vue par défaut', cards: 'Cartes', list: 'Liste',
      perPage: 'Éléments/page', sortBy: 'Trier par', date: 'Date', name: 'Nom', status: 'Statut',
      order: 'Ordre', desc: 'Décroissant', asc: 'Croissant',
    },
    notifications: {
      h1: 'Types de notifications',
      nouvellesCons:  ['Nouvelles consultations','Notification lors d\'une nouvelle consultation'],
      messagesRecus:  ['Messages reçus','Notification pour les nouveaux messages'],
      commentaires:   ['Commentaires sur cas','Notification pour les commentaires sur vos cas'],
      partages:       ['Partages reçus','Notification quand vos contenus sont partagés'],
      systeme:        ['Rappels système','Notifications système importantes'],
      mises_a_jour:   ['Mises à jour','Notifications pour les mises à jour'],
      evenements:     ['Événements communauté','Notifications pour les événements'],
    },
    securite: {
      h1: 'Mot de passe', h1sub: 'Modifier votre mot de passe de connexion', modifier: 'Modifier',
      currentPw: 'Mot de passe actuel', newPw: 'Nouveau mot de passe', confirmPw: 'Confirmer le mot de passe',
      cancel: 'Annuler', update: 'Mettre à jour', updating: 'Mise à jour…', pwSuccess: 'Mot de passe mis à jour avec succès !',
      h2: 'Sessions actives', currentSession: 'Session actuelle', lastActivity: 'Dernière activité',
      revokeAll: 'Révoquer toutes les sessions', exportData: 'Exporter mes données', deleteAccount: 'Supprimer le compte',
    },
  },
  en: {
    title: 'Settings', subtitle: 'Manage your preferences and platform options',
    save: 'Save', saving: 'Saving…', saved: 'Settings saved on the server.', saveErr: 'Error while saving.',
    tabs: { compte: 'Account', confidentialite: 'Privacy', partage: 'Sharing', affichage: 'Display', notifications: 'Notifications', securite: 'Security' },
    compte: {
      h1: 'General preferences', langue: 'Language', timezone: 'Timezone',
      h2: 'General notifications',
      emailNotif:  ['Email notifications',    'Receive important notifications by email'],
      smsNotif:    ['SMS notifications',      'Receive alerts by SMS'],
      newsletter:  ['Newsletter',             'Receive the monthly newsletter'],
      rappelsCons: ['Consultation reminders', 'Receive reminders for consultations'],
      rappelsSuivi:['Follow-up reminders',    'Receive reminders for patient follow-up'],
    },
    confidentialite: {
      h1: 'Visibility', profilPublic: ['Public profile','Your profile is visible to other doctors'],
      annuaire: ['Visible in directory','Appear in the doctors directory'],
      h2: 'Clinical cases', anonymisation: ['Case anonymisation','Automatically anonymise patient data'],
      accepte: ['Accept requests','Accept collaboration requests'],
    },
    partage: { desc: 'Sharing options apply to your publications in the medical community.', notifPartage: ['Share notification','Be notified when your content is shared'] },
    affichage: {
      h1: 'Theme', themeLabel: 'Interface theme', dark: 'Dark mode enabled', light: 'Light mode enabled', toDark: 'Dark mode', toLight: 'Light mode',
      h2: 'Display preferences', compact: ['Compact view','Show more information per screen'],
      thumbnails: ['Show thumbnails','Show image previews'],
      defaultView: 'Default view', cards: 'Cards', list: 'List',
      perPage: 'Items/page', sortBy: 'Sort by', date: 'Date', name: 'Name', status: 'Status',
      order: 'Order', desc: 'Descending', asc: 'Ascending',
    },
    notifications: {
      h1: 'Notification types',
      nouvellesCons: ['New consultations','Notification for a new consultation'],
      messagesRecus: ['Received messages','Notification for new messages'],
      commentaires:  ['Case comments','Notification for comments on your cases'],
      partages:      ['Received shares','Notification when your content is shared'],
      systeme:       ['System reminders','Important system notifications'],
      mises_a_jour:  ['Updates','Notifications for updates'],
      evenements:    ['Community events','Notifications for events'],
    },
    securite: {
      h1: 'Password', h1sub: 'Change your login password', modifier: 'Change',
      currentPw: 'Current password', newPw: 'New password', confirmPw: 'Confirm password',
      cancel: 'Cancel', update: 'Update', updating: 'Updating…', pwSuccess: 'Password updated successfully!',
      h2: 'Active sessions', currentSession: 'Current session', lastActivity: 'Last activity',
      revokeAll: 'Revoke all sessions', exportData: 'Export my data', deleteAccount: 'Delete account',
    },
  },
};

const hdrs = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const DEFAULT_PREFS = {
  emailNotifications:          true,
  smsNotifications:            false,
  newsletter:                  true,
  rappelsConsultations:        true,
  rappelsSuivi:                true,
  notifNouvellesConsultations: true,
  notifMessagesRecus:          true,
  notifCommentairesCas:        true,
  notifPartagesRecus:          true,
  notifRappelsSysteme:         true,
  notifMisesAJour:             true,
  notifEvenements:             false,
  langue:                      'fr',
  timezone:                    'Africa/Douala',
  compactView:                 false,
  showThumbnails:              true,
  defaultView:                 'cards',
  itemsPerPage:                10,
  sortBy:                      'date',
  sortOrder:                   'desc',
  profilPublic:                true,
  visibleDansAnnuaire:         true,
  anonymisationCas:            true,
  accepteDemandes:             true,
};

export default function Settings() {
  const toast = useToast();
  const { theme, toggleTheme } = useTheme();
  const [activeTab,    setActiveTab]    = useState('compte');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);
  const [saveError,    setSaveError]    = useState(false);

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  const [showPasswordForm,    setShowPasswordForm]    = useState(false);
  const [passwordData,        setPasswordData]        = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors,      setPasswordErrors]      = useState({});
  const [passwordSuccess,     setPasswordSuccess]     = useState(false);
  const [passwordLoading,     setPasswordLoading]     = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword,     setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sessions] = useState([
    { id: 1, device: 'Chrome sur Windows', lastActivity: new Date(), current: true },
    { id: 2, device: 'Safari sur iPhone',  lastActivity: new Date(Date.now() - 86400000), current: false },
  ]);

  // ── Charger depuis le backend ──────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/medecins/me/preferences`, { headers: hdrs() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const merged = { ...DEFAULT_PREFS, ...d };
          setPrefs(merged);
          localStorage.setItem('medecin_prefs', JSON.stringify(merged));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Sauvegarder sur le backend ─────────────────────────────────
  const handleSave = async () => {
    setSaving(true); setSaveError(false);
    try {
      const res  = await fetch(`${API_URL}/medecins/me/preferences`, {
        method: 'PATCH', headers: hdrs(), body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setPrefs(data);
      localStorage.setItem('medecin_prefs', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('pneumoia-prefs-updated', { detail: data }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const setPref = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  const t = I18N[prefs.langue] || I18N.fr;

  // ── Mot de passe ───────────────────────────────────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    setPasswordSuccess(false);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Mot de passe actuel requis';
    if (!passwordData.newPassword) errors.newPassword = 'Nouveau mot de passe requis';
    else if (passwordData.newPassword.length < 8) errors.newPassword = 'Minimum 8 caractères';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwordData.newPassword))
      errors.newPassword = 'Doit contenir majuscule, minuscule et chiffre';
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PATCH', headers: hdrs(),
        body: JSON.stringify({ current_password: passwordData.currentPassword, new_password: passwordData.newPassword }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPasswordErrors({ general: d.detail || 'Erreur lors du changement' });
        return;
      }
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordSuccess(false);
      }, 2000);
    } catch {
      setPasswordErrors({ general: 'Erreur réseau' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = () => {
    const data = JSON.stringify({ preferences: prefs, exportDate: new Date().toISOString() }, null, 2);
    const url  = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const a    = document.createElement('a');
    a.href = url; a.download = `pneumoia_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    toast.error('Pour supprimer votre compte, contactez le support à contact@pneumoia.cm', { duration: 6000 });
  };

  const tabs = [
    { id: 'compte',         label: t.tabs.compte,          icon: User   },
    { id: 'confidentialite',label: t.tabs.confidentialite, icon: Shield },
    { id: 'partage',        label: t.tabs.partage,         icon: Share2 },
    { id: 'affichage',      label: t.tabs.affichage,       icon: Eye    },
    { id: 'notifications',  label: t.tabs.notifications,   icon: Bell   },
    { id: 'securite',       label: t.tabs.securite,        icon: Lock   },
  ];

  const ToggleRow = ({ label, description, prefKey }) => (
    <div className="flex items-center justify-between py-3 border-b border-(--ln) last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-(--t1)">{label}</p>
        {description && <p className="text-xs text-(--t4) mt-0.5">{description}</p>}
      </div>
      <button onClick={() => setPref(prefKey, !prefs[prefKey])}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shrink-0"
        style={{ backgroundColor: prefs[prefKey] ? '#2563eb' : '#e2e8f0' }}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${prefs[prefKey] ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const SelectRow = ({ label, prefKey, options }) => (
    <div className="flex items-center justify-between py-3 border-b border-(--ln) last:border-0 flex-wrap gap-3">
      <p className="text-sm font-medium text-(--t1)">{label}</p>
      <select value={prefs[prefKey]} onChange={e => setPref(prefKey, e.target.value)}
        className="px-3 py-1.5 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1)">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  return (
    <div className="w-full space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">{t.title}</h1>
          <p className="text-sm text-(--t3) mt-1">{t.subtitle}</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t.saving : t.save}
        </button>
      </div>

      {/* Messages feedback */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-xl">
          <CheckCircle className="w-4 h-4" /> {t.saved}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-xl">
          <AlertCircle className="w-4 h-4" /> {t.saveErr}
        </div>
      )}

      {/* Tabs */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-1 border-b border-(--ln) min-w-max">
          {tabs.map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-(--t3) hover:text-(--t1)'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu */}
      <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">

        {/* Compte */}
        {activeTab === 'compte' && (
          <div>
            <div className="p-5 border-b border-(--ln)">
              <h3 className="font-semibold text-(--t1) mb-4">{t.compte.h1}</h3>
              <SelectRow label={t.compte.langue} prefKey="langue" options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
              <SelectRow label={t.compte.timezone} prefKey="timezone" options={[{ value: 'Africa/Douala', label: 'Afrique/Douala (GMT+1)' }, { value: 'Europe/Paris', label: 'Europe/Paris' }]} />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-(--t1) mb-4">{t.compte.h2}</h3>
              <ToggleRow label={t.compte.emailNotif[0]}   description={t.compte.emailNotif[1]}   prefKey="emailNotifications" />
              <ToggleRow label={t.compte.smsNotif[0]}     description={t.compte.smsNotif[1]}     prefKey="smsNotifications" />
              <ToggleRow label={t.compte.newsletter[0]}   description={t.compte.newsletter[1]}   prefKey="newsletter" />
              <ToggleRow label={t.compte.rappelsCons[0]}  description={t.compte.rappelsCons[1]}  prefKey="rappelsConsultations" />
              <ToggleRow label={t.compte.rappelsSuivi[0]} description={t.compte.rappelsSuivi[1]} prefKey="rappelsSuivi" />
            </div>
          </div>
        )}

        {/* Confidentialité */}
        {activeTab === 'confidentialite' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">{t.confidentialite.h1}</h3>
            <ToggleRow label={t.confidentialite.profilPublic[0]} description={t.confidentialite.profilPublic[1]} prefKey="profilPublic" />
            <ToggleRow label={t.confidentialite.annuaire[0]}     description={t.confidentialite.annuaire[1]}     prefKey="visibleDansAnnuaire" />
            <h3 className="font-semibold text-(--t1) mt-6 mb-4">{t.confidentialite.h2}</h3>
            <ToggleRow label={t.confidentialite.anonymisation[0]} description={t.confidentialite.anonymisation[1]} prefKey="anonymisationCas" />
            <ToggleRow label={t.confidentialite.accepte[0]}       description={t.confidentialite.accepte[1]}       prefKey="accepteDemandes" />
          </div>
        )}

        {/* Partage */}
        {activeTab === 'partage' && (
          <div className="p-5">
            <p className="text-sm text-(--t3) mb-4">{t.partage.desc}</p>
            <ToggleRow label={t.partage.notifPartage[0]} description={t.partage.notifPartage[1]} prefKey="notifPartagesRecus" />
          </div>
        )}

        {/* Affichage */}
        {activeTab === 'affichage' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">{t.affichage.h1}</h3>
            <div className="flex items-center justify-between py-3 border-b border-(--ln) mb-4">
              <div>
                <p className="text-sm font-medium text-(--t1)">{t.affichage.themeLabel}</p>
                <p className="text-xs text-(--t4) mt-0.5">{theme === 'dark' ? t.affichage.dark : t.affichage.light}</p>
              </div>
              <button onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-(--ln) hover:bg-(--sf2) transition-colors text-sm font-medium text-(--t2)">
                {theme === 'dark'
                  ? <><Sun className="w-4 h-4" /> {t.affichage.toLight}</>
                  : <><Moon className="w-4 h-4" /> {t.affichage.toDark}</>}
              </button>
            </div>
            <h3 className="font-semibold text-(--t1) mb-4">{t.affichage.h2}</h3>
            <ToggleRow label={t.affichage.compact[0]}    description={t.affichage.compact[1]}    prefKey="compactView" />
            <ToggleRow label={t.affichage.thumbnails[0]} description={t.affichage.thumbnails[1]} prefKey="showThumbnails" />
            <SelectRow label={t.affichage.defaultView} prefKey="defaultView"  options={[{ value: 'cards', label: t.affichage.cards }, { value: 'list', label: t.affichage.list }]} />
            <SelectRow label={t.affichage.perPage}     prefKey="itemsPerPage" options={[{ value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }]} />
            <SelectRow label={t.affichage.sortBy}      prefKey="sortBy"       options={[{ value: 'date', label: t.affichage.date }, { value: 'name', label: t.affichage.name }, { value: 'status', label: t.affichage.status }]} />
            <SelectRow label={t.affichage.order}       prefKey="sortOrder"    options={[{ value: 'desc', label: t.affichage.desc }, { value: 'asc', label: t.affichage.asc }]} />
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">{t.notifications.h1}</h3>
            <ToggleRow label={t.notifications.nouvellesCons[0]} description={t.notifications.nouvellesCons[1]} prefKey="notifNouvellesConsultations" />
            <ToggleRow label={t.notifications.messagesRecus[0]} description={t.notifications.messagesRecus[1]} prefKey="notifMessagesRecus" />
            <ToggleRow label={t.notifications.commentaires[0]}  description={t.notifications.commentaires[1]}  prefKey="notifCommentairesCas" />
            <ToggleRow label={t.notifications.partages[0]}      description={t.notifications.partages[1]}      prefKey="notifPartagesRecus" />
            <ToggleRow label={t.notifications.systeme[0]}       description={t.notifications.systeme[1]}       prefKey="notifRappelsSysteme" />
            <ToggleRow label={t.notifications.mises_a_jour[0]}  description={t.notifications.mises_a_jour[1]}  prefKey="notifMisesAJour" />
            <ToggleRow label={t.notifications.evenements[0]}    description={t.notifications.evenements[1]}    prefKey="notifEvenements" />
          </div>
        )}

        {/* Sécurité */}
        {activeTab === 'securite' && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Mot de passe */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-(--t1)">{t.securite.h1}</h3>
                  <p className="text-xs text-(--t4)">{t.securite.h1sub}</p>
                </div>
                {!showPasswordForm && (
                  <button onClick={() => setShowPasswordForm(true)} className="text-sm text-blue-600 hover:underline">
                    {t.securite.modifier}
                  </button>
                )}
              </div>
              {showPasswordForm && (
                <div className="space-y-4 mt-4">
                  {passwordErrors.general && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      <AlertCircle className="w-4 h-4" />{passwordErrors.general}
                    </div>
                  )}
                  {['currentPassword','newPassword','confirmPassword'].map((field, i) => {
                    const labels  = [t.securite.currentPw, t.securite.newPw, t.securite.confirmPw];
                    const shows   = [showCurrentPassword, showNewPassword, showConfirmPassword];
                    const setters = [setShowCurrentPassword, setShowNewPassword, setShowConfirmPassword];
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium text-(--t2) mb-1">{labels[i]}</label>
                        <div className="relative">
                          <input type={shows[i] ? 'text' : 'password'} name={field}
                            value={passwordData[field]} onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) ${passwordErrors[field] ? 'border-red-500' : 'border-(--ln)'}`}
                            placeholder={labels[i]} />
                          <button type="button" onClick={() => setters[i](v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2">
                            {shows[i] ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                          </button>
                        </div>
                        {passwordErrors[field] && <p className="text-xs text-red-500 mt-1">{passwordErrors[field]}</p>}
                      </div>
                    );
                  })}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleUpdatePassword} disabled={passwordLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.securite.update}
                    </button>
                    <button onClick={() => { setShowPasswordForm(false); setPasswordErrors({}); setPasswordData({ currentPassword:'',newPassword:'',confirmPassword:'' }); }}
                      className="px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) bg-(--sf) hover:bg-(--sf2)">
                      {t.securite.cancel}
                    </button>
                  </div>
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" /> {t.securite.pwSuccess}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sessions */}
            <div className="p-5">
              <h3 className="font-semibold text-(--t1) mb-4">{t.securite.h2}</h3>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-(--sf2) rounded-lg flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-(--t3)" />
                      <div>
                        <p className="text-sm font-medium text-(--t1)">{s.device}</p>
                        <p className="text-xs text-(--t4)">{t.securite.lastActivity} : {s.lastActivity.toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    {s.current
                      ? <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{t.securite.currentSession}</span>
                      : <button className="text-xs text-red-600 hover:underline">{t.securite.revokeAll}</button>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Données */}
            <div className="p-5">
              <h3 className="font-semibold text-(--t1) mb-4">Données</h3>
              <button onClick={handleExportData}
                className="w-full flex items-center justify-between p-3 bg-(--sf2) rounded-lg hover:bg-(--sf2) transition-colors mb-3">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-(--t1)">{t.securite.exportData}</p>
                    <p className="text-xs text-(--t4)">Télécharger vos préférences en JSON</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-(--t4)" />
              </button>
              <button onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">{t.securite.deleteAccount}</p>
                    <p className="text-xs text-red-500">Cette action est irréversible</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-(--t4) py-4">
        Dernière modification : {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}
