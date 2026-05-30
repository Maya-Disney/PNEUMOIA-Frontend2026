// src/features/medecin/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useProfil } from '../hooks/useAuth';
import {
  User, Mail, Phone, MapPin, Calendar, Award,
  Stethoscope, Users, Clock, Edit2, Save,
  Camera, Globe, Briefcase,
  CheckCircle, Activity, Heart, FileText,
  Building2, IdCard, Link2, Share2,
  Lock, KeyRound, Eye, EyeOff, AlertCircle, X, Download
} from 'lucide-react';

export default function Profile() {
  const { profil, loading: profilLoading, error: profilError } = useProfil();
  const originalData = useRef(null); // snapshot avant édition
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    civilite: 'Dr',
    nom: '',
    prenom: '',
    specialite: '',
    numeroRPPS: '',
    etablissement: '',
    emailPro: '',
    telephone: '',
    adresse: '',
    bio: '',
    social: { linkedin: '', website: '' }
  });

  useEffect(() => {
    if (profil) {
      setFormData(prev => ({
        ...prev,
        civilite:      profil.civilite       || 'Dr',
        nom:           profil.nom            || '',
        prenom:        profil.prenom         || '',
        specialite:    profil.specialite     || '',
        numeroRPPS:    profil.numero_rpps    || '',
        etablissement: profil.etablissement  || '',
        emailPro:      profil.email          || '',
        telephone:     profil.telephone      || '',
        adresse:       profil.adresse        || '',
        bio:           profil.bio            || '',
        social: {
          linkedin: profil.linkedin || '',
          website:  profil.website  || '',
        },
      }));
    }
  }, [profil]);

  // ── Documents ────────────────────────────────────────────────
  const [documents,     setDocuments]     = useState([]);
  const [docsLoading,   setDocsLoading]   = useState(true);

  useEffect(() => {
    if (!profil) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:8000/api/v1/auth/documents', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, [profil]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const stats = [
    { label: 'Années d\'expérience', value: '12+', icon: Clock },
    { label: 'Patients traités', value: '2 847', icon: Users },
    { label: 'Cas partagés', value: '124', icon: Activity },
    { label: 'Taux de satisfaction', value: '98%', icon: Heart }
  ];

  const achievements = [
    { title: 'Expert en Pneumonie', date: '2025', icon: Award, color: 'blue' },
    { title: 'Top Contributeur', date: '2024', icon: Award, color: 'purple' },
    { title: '100 Cas partagés', date: '2024', icon: Award, color: 'emerald' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    setPasswordSuccess(false);
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Le mot de passe actuel est requis';
    if (!passwordData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Doit contenir majuscule, minuscule et chiffre';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le mot de passe';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = () => {
    if (validatePassword()) {
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordSuccess(false);
      }, 2000);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError,   setSaveError]   = useState('');

  const startEditing = () => {
    originalData.current = JSON.parse(JSON.stringify(formData)); // snapshot deep copy
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (originalData.current) setFormData(originalData.current); // restaure
    setPhotoPreview(null);
    setSaveError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        civilite:      formData.civilite      || null,
        etablissement: formData.etablissement  || null,
        telephone:     formData.telephone      || null,
        adresse:       formData.adresse        || null,
        bio:           formData.bio            || null,
        linkedin:      formData.social?.linkedin || null,
        website:       formData.social?.website  || null,
      };

      const res = await fetch('http://localhost:8000/api/v1/auth/profil', {
        method:  'PATCH',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);

      // Mettre à jour le formData avec la réponse du serveur
      setFormData(prev => ({
        ...prev,
        civilite:      data.civilite       || prev.civilite,
        etablissement: data.etablissement  || prev.etablissement,
        telephone:     data.telephone      || prev.telephone,
        adresse:       data.adresse        || prev.adresse,
        bio:           data.bio            || prev.bio,
        social: {
          linkedin: data.linkedin || prev.social?.linkedin,
          website:  data.website  || prev.social?.website,
        },
      }));

      originalData.current = null;
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message || 'Impossible de sauvegarder. Vérifiez que le backend est démarré.');
      console.error('[handleSave]', err);
    } finally {
      setSaveLoading(false);
    }
  };

  /* ─── Input/Select helpers ─────────────────────────────────── */
  const inputCls = 'w-full px-3 py-2 text-sm border border-(--ln) rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-(--sf) text-(--t1) placeholder:text-(--t4)';
  const labelCls = 'block text-xs font-medium text-(--t3) mb-1';

  const colorClasses = {
    blue:    'bg-blue-50    dark:bg-blue-900/20    text-blue-600    dark:text-blue-300',
    purple:  'bg-purple-50  dark:bg-purple-900/20  text-purple-600  dark:text-purple-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300',
  };

  if (profilLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-(--t3)">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Chargement du profil…</p>
        </div>
      </div>
    );
  }

  if (profilError) {
    const msg = profilError === 'token_expire'
      ? 'Votre session a expiré. Veuillez vous reconnecter.'
      : profilError === 'non_connecte'
      ? 'Vous n\'êtes pas connecté.'
      : 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8000';
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-(--t1) mb-1">Données non disponibles</p>
            <p className="text-sm text-(--t3)">{msg}</p>
          </div>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Mon profil</h1>
          <p className="text-sm text-(--t3) mt-1">Gérez vos informations professionnelles</p>
        </div>
        <div className="flex gap-3">
          {!isEditing && !isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-(--ln) text-(--t2) hover:bg-(--sf2) transition-all"
            >
              <KeyRound className="w-4 h-4" />
              Changer le mot de passe
            </button>
          )}
          {isEditing && (
            <button
              onClick={handleCancel}
              disabled={saveLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-(--ln) text-(--t2) hover:bg-(--sf2) transition-all disabled:opacity-60"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
          <button
            onClick={() => isEditing ? handleSave() : startEditing()}
            disabled={saveLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60
              ${isEditing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isEditing
              ? saveLoading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sauvegarde…</>
                : <><Save className="w-4 h-4" />Sauvegarder</>
              : <><Edit2 className="w-4 h-4" />Modifier</>}
          </button>
        </div>
      </div>

      {/* Formulaire changement de mot de passe */}
      {isChangingPassword && (
        <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
          <div className="p-5 border-b border-(--ln) bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                <h3 className="font-semibold text-(--t1)">Changer le mot de passe</h3>
              </div>
              <button
                onClick={() => { setIsChangingPassword(false); setPasswordErrors({}); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="text-sm text-(--t3) hover:text-(--t1)"
              >
                Annuler
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4" />
                Mot de passe modifié avec succès !
              </div>
            )}

            {/* Mot de passe actuel */}
            <div>
              <label className={labelCls}>Mot de passe actuel</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="currentPassword"
                  value={passwordData.currentPassword} onChange={handlePasswordChange}
                  className={`${inputCls} pr-10 ${passwordErrors.currentPassword ? 'border-red-500' : ''}`}
                  placeholder="Entrez votre mot de passe actuel" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2)">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} name="newPassword"
                  value={passwordData.newPassword} onChange={handlePasswordChange}
                  className={`${inputCls} pr-10 ${passwordErrors.newPassword ? 'border-red-500' : ''}`}
                  placeholder="8 caractères minimum" />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2)">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{passwordErrors.newPassword}
                </p>
              )}
              <p className="text-xs text-(--t4) mt-1">Doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre</p>
            </div>

            {/* Confirmation */}
            <div>
              <label className={labelCls}>Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  value={passwordData.confirmPassword} onChange={handlePasswordChange}
                  className={`${inputCls} pr-10 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Répétez le nouveau mot de passe" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--t4) hover:text-(--t2)">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleUpdatePassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                Mettre à jour le mot de passe
              </button>
              <button onClick={() => { setIsChangingPassword(false); setPasswordErrors({}); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-4 py-2 border border-(--ln) rounded-lg text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Carte photo */}
          <div className="bg-(--sf) rounded-xl border border-(--ln) p-6 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
                ) : profil?.photo_url ? (
                  <>
                    <img src={profil.photo_url} alt="Profil" className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='block'; }} />
                    <span className="text-4xl font-bold text-white" style={{ display: 'none' }}>
                      {formData.prenom?.[0]}{formData.nom?.[0]}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-white">{formData.prenom?.[0]}{formData.nom?.[0]}</span>
                )}
              </div>
              {isEditing && (
                <>
                  <label htmlFor="photoInput"
                    className="absolute bottom-0 right-0 p-2 bg-(--sf) rounded-full shadow-md border border-(--ln) hover:bg-(--sf2) transition-colors cursor-pointer">
                    <Camera className="w-4 h-4 text-(--t2)" />
                  </label>
                  <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-(--t1) mt-4">
              {formData.civilite}. {formData.prenom} {formData.nom}
            </h2>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">{formData.specialite}</p>
            <p className="text-sm text-(--t3) mt-2">{formData.etablissement}</p>
            <p className="text-xs text-(--t4) mt-1">RPPS: {formData.numeroRPPS}</p>

            <div className="flex justify-center gap-3 mt-4">
              {[Briefcase, Globe, Share2, Link2].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-(--sf2) text-(--t3) hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-(--sf) rounded-xl border border-(--ln) p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <p className="text-xl font-bold text-(--t1)">{stat.value}</p>
                  <p className="text-xs text-(--t3)">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Récompenses */}
          <div className="bg-(--sf) rounded-xl border border-(--ln) p-5">
            <h3 className="font-semibold text-(--t1) mb-4">Récompenses</h3>
            <div className="space-y-3">
              {achievements.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${colorClasses[a.color]} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-(--t1)">{a.title}</p>
                      <p className="text-xs text-(--t4)">{a.date}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations professionnelles */}
          <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="p-5 border-b border-(--ln)">
              <h3 className="font-semibold text-(--t1)">Informations professionnelles</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Civilité</label>
                  {isEditing
                    ? <select name="civilite" value={formData.civilite} onChange={handleInputChange} className={inputCls}>
                        <option value="Dr">Dr</option><option value="Pr">Pr</option>
                        <option value="Mme">Mme</option><option value="M">M</option>
                      </select>
                    : <p className="text-sm text-(--t1)">{formData.civilite}</p>}
                </div>
                <div>
                  <label className={labelCls}>Spécialité</label>
                  {isEditing
                    ? <select name="specialite" value={formData.specialite} onChange={handleInputChange} className={inputCls}>
                        <option value="Pneumologie">Pneumologie</option>
                        <option value="Médecine générale">Médecine générale</option>
                        <option value="Cardiologie">Cardiologie</option>
                        <option value="Pédiatrie">Pédiatrie</option>
                      </select>
                    : <p className="text-sm text-(--t1)">{formData.specialite}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom</label>
                  {isEditing
                    ? <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} className={inputCls} />
                    : <p className="text-sm text-(--t1)">{formData.nom}</p>}
                </div>
                <div>
                  <label className={labelCls}>Prénom</label>
                  {isEditing
                    ? <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} className={inputCls} />
                    : <p className="text-sm text-(--t1)">{formData.prenom}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>Numéro RPPS</label>
                {isEditing
                  ? <input type="text" name="numeroRPPS" value={formData.numeroRPPS} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><IdCard className="w-4 h-4 text-(--t4)" /><p className="text-sm text-(--t1)">{formData.numeroRPPS}</p></div>}
              </div>

              <div>
                <label className={labelCls}>Établissement</label>
                {isEditing
                  ? <input type="text" name="etablissement" value={formData.etablissement} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-(--t4)" /><p className="text-sm text-(--t1)">{formData.etablissement}</p></div>}
              </div>

              <div>
                <label className={labelCls}>Email professionnel</label>
                {isEditing
                  ? <input type="email" name="emailPro" value={formData.emailPro} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-(--t4)" /><p className="text-sm text-(--t1)">{formData.emailPro}</p></div>}
              </div>

              <div>
                <label className={labelCls}>Téléphone</label>
                {isEditing
                  ? <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-(--t4)" /><p className="text-sm text-(--t1)">{formData.telephone}</p></div>}
              </div>

              <div>
                <label className={labelCls}>Biographie</label>
                {isEditing
                  ? <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3}
                      className={`${inputCls} resize-none`} />
                  : <p className="text-sm text-(--t2)">{formData.bio}</p>}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="p-5 border-b border-(--ln)">
              <h3 className="font-semibold text-(--t1)">Documents justificatifs</h3>
            </div>
            <div className="p-5 space-y-2">
              {docsLoading ? (
                <div className="flex items-center gap-2 text-(--t3) text-sm py-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Chargement des documents…
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-(--t4) text-center py-4">Aucun document disponible.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-(--sf2) rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-(--t1)">{doc.label}</p>
                        <p className="text-xs text-(--t3)">
                          {doc.nom_fichier}
                          {doc.taille_ko && ` · ${doc.taille_ko} Ko`}
                          {doc.date && ` · Déposé le ${doc.date}`}
                        </p>
                      </div>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0">
                      <Download className="w-3 h-3" /> Voir
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Liens sociaux */}
          <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
            <div className="p-5 border-b border-(--ln)">
              <h3 className="font-semibold text-(--t1)">Liens professionnels</h3>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className={labelCls}>LinkedIn / Portfolio</label>
                {isEditing
                  ? <input type="text" name="social.linkedin" value={formData.social.linkedin} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-(--t4)" /><a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{formData.social.linkedin}</a></div>}
              </div>
              <div>
                <label className={labelCls}>Site web</label>
                {isEditing
                  ? <input type="text" name="social.website" value={formData.social.website} onChange={handleInputChange} className={inputCls} />
                  : <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-(--t4)" /><a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{formData.social.website}</a></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
