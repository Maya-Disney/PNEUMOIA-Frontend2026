// src/features/medecin/pages/Settings.jsx
import { useState, useEffect } from 'react';
import {
  User, Bell, Shield, Share2, Lock,
  Eye, EyeOff, CheckCircle, AlertCircle,
  Smartphone, Save, Trash2, X,
  Download, Loader2, ChevronRight
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

export default function Settings() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('compte');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // État des paramètres
  const [settings, setSettings] = useState({
    compte: {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: true,
      rappelsConsultations: true,
      rappelsSuivi: true,
      langue: 'fr',
      theme: 'light',
      timezone: 'Africa/Douala'
    },
    confidentialite: {
      profilPublic: true,
      visibleDansAnnuaire: true,
      partageCasAuto: true,
      anonymisationCas: true,
      accepteDemandes: true,
      visibleStats: true
    },
    partage: {
      partageAutomatique: false,
      partageCommunaute: true,
      partageReseauxSociaux: false,
      notificationPartage: true,
      creditPartage: true,
      telechargementCas: false
    },
    affichage: {
      compactView: false,
      showThumbnails: true,
      defaultView: 'cards',
      itemsPerPage: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    },
    notifications: {
      nouvellesConsultations: true,
      messagesRecus: true,
      commentairesCas: true,
      partagesRecus: true,
      rappelsSysteme: true,
      misesAJour: true,
      evenementsCommunaute: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome sur Windows', browser: 'Chrome', os: 'Windows 11', ip: '192.168.1.1', lastActivity: new Date(), current: true },
    { id: 2, device: 'Safari sur iPhone', browser: 'Safari', os: 'iOS 17', ip: '192.168.1.2', lastActivity: new Date(Date.now() - 86400000), current: false }
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const savedSettings = localStorage.getItem('medecin_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      localStorage.setItem('medecin_settings', JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
    setPasswordSuccess(false);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Mot de passe actuel requis';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'Nouveau mot de passe requis';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Minimum 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Doit contenir majuscule, minuscule et chiffre';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;
    setPasswordLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('medecin_password', passwordData.newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordErrors({ general: 'Erreur lors du changement' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Erreur déconnexion session:', error);
    }
  };

  const handleExportData = async () => {
    const exportData = {
      profile: JSON.parse(localStorage.getItem('medecin_profile') || '{}'),
      settings: settings,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pneumoia_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    toast.error('Pour supprimer votre compte, contactez le support à contact@pneumoia.cm', { duration: 6000 });
  };

  const tabs = [
    { id: 'compte', label: 'Compte', icon: User },
    { id: 'confidentialite', label: 'Confidentialité', icon: Shield },
    { id: 'partage', label: 'Partage', icon: Share2 },
    { id: 'affichage', label: 'Affichage', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'securite', label: 'Sécurité', icon: Lock }
  ];

  const SettingToggle = ({ label, description, category, settingKey, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-(--ln) last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-(--t1)">{label}</p>
        {description && <p className="text-xs text-(--t4) mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => handleSettingChange(category, settingKey, !value)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shrink-0"
        style={{ backgroundColor: value ? '#2563eb' : '#e2e8f0' }}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  const SelectSetting = ({ label, category, settingKey, value, options }) => (
    <div className="flex items-center justify-between py-3 border-b border-(--ln) last:border-0 flex-wrap gap-3">
      <p className="text-sm font-medium text-(--t1)">{label}</p>
      <select
        value={value}
        onChange={(e) => handleSettingChange(category, settingKey, e.target.value)}
        className="px-3 py-1.5 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1)"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Paramètres</h1>
          <p className="text-sm text-(--t3) mt-1">Gérez vos préférences et options de la plateforme</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Messages */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-xl">
          <CheckCircle className="w-4 h-4" />
          Vos paramètres ont été sauvegardés avec succès
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-xl">
          <AlertCircle className="w-4 h-4" />
          Une erreur est survenue lors de la sauvegarde
        </div>
      )}

      {/* Tabs avec overflow horizontal */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-1 border-b border-(--ln) min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-(--t3) hover:text-(--t1)'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu - Version simplifiée sans erreur jsx */}
      <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
        {/* Compte */}
        {activeTab === 'compte' && (
          <div>
            <div className="p-5 border-b border-(--ln)">
              <h3 className="font-semibold text-(--t1) mb-4">Préférences générales</h3>
              <SelectSetting label="Langue" category="compte" settingKey="langue" value={settings.compte.langue} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
              <SelectSetting label="Fuseau horaire" category="compte" settingKey="timezone" value={settings.compte.timezone} options={[{ value: 'Africa/Douala', label: 'Afrique/Douala (GMT+1)' }, { value: 'Europe/Paris', label: 'Europe/Paris' }]} />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-(--t1) mb-4">Notifications</h3>
              <SettingToggle label="Notifications par email" description="Recevoir les notifications importantes par email" category="compte" settingKey="emailNotifications" value={settings.compte.emailNotifications} />
              <SettingToggle label="Notifications par SMS" description="Recevoir les alertes par SMS" category="compte" settingKey="smsNotifications" value={settings.compte.smsNotifications} />
              <SettingToggle label="Newsletter" description="Recevoir la newsletter mensuelle" category="compte" settingKey="newsletter" value={settings.compte.newsletter} />
              <SettingToggle label="Rappels de consultations" description="Recevoir des rappels pour les consultations à venir" category="compte" settingKey="rappelsConsultations" value={settings.compte.rappelsConsultations} />
              <SettingToggle label="Rappels de suivi" description="Recevoir des rappels pour le suivi des patients" category="compte" settingKey="rappelsSuivi" value={settings.compte.rappelsSuivi} />
            </div>
          </div>
        )}

        {/* Confidentialité */}
        {activeTab === 'confidentialite' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Visibilité</h3>
            <SettingToggle label="Profil public" description="Votre profil est visible par les autres médecins" category="confidentialite" settingKey="profilPublic" value={settings.confidentialite.profilPublic} />
            <SettingToggle label="Visible dans l'annuaire" description="Apparaître dans l'annuaire des médecins" category="confidentialite" settingKey="visibleDansAnnuaire" value={settings.confidentialite.visibleDansAnnuaire} />
            <SettingToggle label="Statistiques visibles" description="Les autres médecins voient vos statistiques" category="confidentialite" settingKey="visibleStats" value={settings.confidentialite.visibleStats} />
            <h3 className="font-semibold text-(--t1) mt-6 mb-4">Cas cliniques</h3>
            <SettingToggle label="Partage automatique" description="Partager automatiquement vos cas dans la communauté" category="confidentialite" settingKey="partageCasAuto" value={settings.confidentialite.partageCasAuto} />
            <SettingToggle label="Anonymisation des cas" description="Anonymiser automatiquement les données patients" category="confidentialite" settingKey="anonymisationCas" value={settings.confidentialite.anonymisationCas} />
            <SettingToggle label="Accepter les demandes" description="Accepter les demandes de collaboration" category="confidentialite" settingKey="accepteDemandes" value={settings.confidentialite.accepteDemandes} />
          </div>
        )}

        {/* Partage */}
        {activeTab === 'partage' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Options de partage</h3>
            <SettingToggle label="Partage automatique" description="Partager automatiquement vos publications" category="partage" settingKey="partageAutomatique" value={settings.partage.partageAutomatique} />
            <SettingToggle label="Partage communauté" description="Partager avec la communauté médicale" category="partage" settingKey="partageCommunaute" value={settings.partage.partageCommunaute} />
            <SettingToggle label="Partage réseaux sociaux" description="Partager sur les réseaux sociaux" category="partage" settingKey="partageReseauxSociaux" value={settings.partage.partageReseauxSociaux} />
            <SettingToggle label="Notification de partage" description="Être notifié quand vos contenus sont partagés" category="partage" settingKey="notificationPartage" value={settings.partage.notificationPartage} />
            <SettingToggle label="Crédit de partage" description="Afficher votre nom lors des partages" category="partage" settingKey="creditPartage" value={settings.partage.creditPartage} />
            <SettingToggle label="Téléchargement des cas" description="Permettre le téléchargement de vos cas" category="partage" settingKey="telechargementCas" value={settings.partage.telechargementCas} />
          </div>
        )}

        {/* Affichage */}
        {activeTab === 'affichage' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Préférences d'affichage</h3>
            <SettingToggle label="Vue compacte" description="Afficher plus d'informations par écran" category="affichage" settingKey="compactView" value={settings.affichage.compactView} />
            <SettingToggle label="Afficher les miniatures" description="Afficher les aperçus des images" category="affichage" settingKey="showThumbnails" value={settings.affichage.showThumbnails} />
            <SelectSetting label="Vue par défaut" category="affichage" settingKey="defaultView" value={settings.affichage.defaultView} options={[{ value: 'cards', label: 'Cartes' }, { value: 'list', label: 'Liste' }]} />
            <SelectSetting label="Éléments par page" category="affichage" settingKey="itemsPerPage" value={settings.affichage.itemsPerPage} options={[{ value: 10, label: '10' }, { value: 20, label: '20' }, { value: 50, label: '50' }]} />
            <SelectSetting label="Trier par" category="affichage" settingKey="sortBy" value={settings.affichage.sortBy} options={[{ value: 'date', label: 'Date' }, { value: 'name', label: 'Nom' }, { value: 'status', label: 'Statut' }]} />
            <SelectSetting label="Ordre de tri" category="affichage" settingKey="sortOrder" value={settings.affichage.sortOrder} options={[{ value: 'desc', label: 'Décroissant' }, { value: 'asc', label: 'Croissant' }]} />
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Types de notifications</h3>
            <SettingToggle label="Nouvelles consultations" description="Notification lors d'une nouvelle consultation" category="notifications" settingKey="nouvellesConsultations" value={settings.notifications.nouvellesConsultations} />
            <SettingToggle label="Messages reçus" description="Notification pour les nouveaux messages" category="notifications" settingKey="messagesRecus" value={settings.notifications.messagesRecus} />
            <SettingToggle label="Commentaires sur cas" description="Notification pour les commentaires sur vos cas" category="notifications" settingKey="commentairesCas" value={settings.notifications.commentairesCas} />
            <SettingToggle label="Partages reçus" description="Notification quand vos contenus sont partagés" category="notifications" settingKey="partagesRecus" value={settings.notifications.partagesRecus} />
            <SettingToggle label="Rappels système" description="Notifications système importantes" category="notifications" settingKey="rappelsSysteme" value={settings.notifications.rappelsSysteme} />
            <SettingToggle label="Mises à jour" description="Notifications pour les mises à jour de la plateforme" category="notifications" settingKey="misesAJour" value={settings.notifications.misesAJour} />
            <SettingToggle label="Événements communauté" description="Notifications pour les événements de la communauté" category="notifications" settingKey="evenementsCommunaute" value={settings.notifications.evenementsCommunaute} />
          </div>
        )}

        {/* Sécurité */}
        {activeTab === 'securite' && (
          <div className="divide-y divide-slate-100">
            {/* Changement mot de passe */}
            <div className="p-5">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-semibold text-(--t1)">Mot de passe</h3>
                  <p className="text-xs text-(--t4)">Modifier votre mot de passe</p>
                </div>
                {!showPasswordForm && (
                  <button onClick={() => setShowPasswordForm(true)} className="text-sm text-blue-600 hover:underline">
                    Modifier
                  </button>
                )}  
              </div>
              
              {showPasswordForm && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-(--t2) mb-1">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) ${passwordErrors.currentPassword ? 'border-red-500' : 'border-(--ln)'}`}
                        placeholder="Entrez votre mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-(--t2) mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) ${passwordErrors.newPassword ? 'border-red-500' : 'border-(--ln)'}`}
                        placeholder="8 caractères minimum"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>}
                    <p className="text-xs text-slate-400 mt-1">Doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-(--t2) mb-1">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-(--ln)'}`}
                        placeholder="Répétez le nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>}
                  </div>

                  <div key="settings-content" className="flex gap-3 pt-2" key="loading-state">
                    <button
                      onClick={handleUpdatePassword}
                      disabled={passwordLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mettre à jour'}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordErrors({});
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) bg-(--sf) hover:bg-(--sf2) transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                  
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Mot de passe modifié avec succès !
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sessions actives */}
            <div className="p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Sessions actives</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-(--sf2) rounded-lg flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-(--t3)" />
                      <div>
                        <p className="text-sm font-medium text-(--t1)">{session.device}</p>
                        <p className="text-xs text-(--t4)">
                          Dernière activité : {session.lastActivity.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    {session.current ? (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">En cours</span>
                    ) : (
                      <button
                        onClick={() => handleLogoutSession(session.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Déconnecter
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Export et suppression */}
            <div className="p-5">
              <h3 className="font-semibold text-(--t1) mb-4">Données</h3>
              <button onClick={handleExportData} className="w-full flex items-center justify-between p-3 bg-(--sf2) rounded-lg hover:bg-(--sf2) transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-(--t1)">Exporter mes données</p>
                    <p className="text-xs text-(--t4)">Télécharger toutes vos données personnelles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-(--t4)" />
              </button>
              <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors mt-3">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-300" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">Supprimer mon compte</p>
                    <p className="text-xs text-red-500 dark:text-red-300">Cette action est irréversible</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 dark:text-red-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-(--t4) py-4">
        Dernière modification : {new Date().toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}