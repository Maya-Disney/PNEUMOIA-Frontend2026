// src/components/modals/LoginModal.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope, AlertCircle, Mail, Lock, Eye, EyeOff,
  KeyRound, X, RotateCcw, ShieldCheck, CheckCircle2,
  XCircle, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ── Restrictions mot de passe (identiques à l'inscription) ───────────────────
const PWD_RULES = [
  { test: (p) => p.length >= 8,  label: '8 caractères minimum' },
  { test: (p) => /[A-Z]/.test(p), label: 'Une majuscule' },
  { test: (p) => /[a-z]/.test(p), label: 'Une minuscule' },
  { test: (p) => /\d/.test(p),    label: 'Un chiffre' },
];
const isPwdValid = (p) => PWD_RULES.every(r => r.test(p));

/* ─── 6 cases OTP ─────────────────────────────────────────── */
function OTPBoxes({ value, onChange, disabled, color = 'emerald' }) {
  const inputs = useRef([]);
  const digits  = Array.from({ length: 6 }, (_, i) => value[i] || '');
  const active  = color === 'amber' ? '#d97706' : '#059669';
  const activeBg = color === 'amber' ? '#fffbeb' : '#f0fdf4';

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next  = [...digits]; next[i] = char;
    const str   = next.join('');
    onChange(str.replace(/ /g, ''));
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]; next[i - 1] = '';
      onChange(next.join('').replace(/ /g, ''));
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowLeft'  && i > 0) inputs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };
  useEffect(() => {
    const first = digits.findIndex(d => !d);
    inputs.current[first >= 0 ? first : 5]?.focus();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i} ref={el => (inputs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={d} disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: '44px', height: '48px', textAlign: 'center',
            fontSize: '20px', fontWeight: 'bold',
            border: d ? `2px solid ${active}` : '2px solid #d1d5db',
            borderRadius: '12px', outline: 'none',
            backgroundColor: d ? activeBg : '#f9fafb',
            color: d ? active : '#1f2937',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Compte à rebours ───────────────────────────────────── */
function Countdown({ triggerKey, onExpire }) {
  const [secs, setSecs] = useState(300);
  useEffect(() => {
    setSecs(300);
    const t = setInterval(() => {
      setSecs(r => { if (r <= 1) { clearInterval(t); onExpire?.(); return 0; } return r - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [triggerKey]);
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  return (
    <span className={`font-mono font-semibold tabular-nums ${secs < 60 ? 'text-red-500' : 'text-gray-500'}`}>
      {mm}:{ss}
    </span>
  );
}

/* ─── Indicateur force mot de passe ─────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      {PWD_RULES.map((r, i) => {
        const ok = r.test(password);
        return (
          <div key={i} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
            {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            {r.label}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const toast    = useToast();

  // Steps : 'login' | 'otp' | 'forgot_email' | 'forgot_otp' | 'forgot_pwd'
  const [step,        setStep]        = useState('login');
  const [role,        setRole]        = useState('medecin'); // 'medecin' | 'aide'
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [otp,         setOtp]         = useState('');
  const [medecinId,   setMedecinId]   = useState('');
  const [aideId,      setAideId]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [otpTrigger,  setOtpTrigger]  = useState(0);
  // Reset flow
  const [resetEmail,     setResetEmail]     = useState('');
  const [resetOtp,       setResetOtp]       = useState('');
  const [resetMedecinId, setResetMedecinId] = useState('');
  const [resetToken,     setResetToken]     = useState('');
  const [resetAttempts,  setResetAttempts]  = useState(0); // local counter for UX
  const [newPwd,         setNewPwd]         = useState('');
  const [confirmPwd,     setConfirmPwd]     = useState('');
  const [showNewPwd,     setShowNewPwd]     = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [otpTriggerReset, setOtpTriggerReset] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStep('login'); setRole('medecin'); setEmail(''); setPassword(''); setShowPwd(false);
    setOtp(''); setMedecinId(''); setAideId(''); setLoading(false); setError('');
    setResetEmail(''); setResetOtp(''); setResetMedecinId('');
    setResetToken(''); setResetAttempts(0);
    setNewPwd(''); setConfirmPwd(''); setShowNewPwd(false); setShowConfirmPwd(false);
  }, [isOpen]);

  // Auto-submit OTP login
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !loading) handleVerifyOtp();
  }, [otp]);

  // Auto-submit OTP reset
  useEffect(() => {
    if (step === 'forgot_otp' && resetOtp.length === 6 && !loading) handleResetVerifyOtp();
  }, [resetOtp]);

  const reset = useCallback(() => {
    setStep('login'); setRole('medecin'); setEmail(''); setPassword(''); setShowPwd(false);
    setOtp(''); setMedecinId(''); setAideId(''); setLoading(false); setError('');
  }, []);

  /* ── Login étape 1 — auto-détection du rôle ────────── */
  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      // 1. Essayer médecin en premier
      const resMedecin = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(20000),
      });

      if (resMedecin.ok) {
        const data = await resMedecin.json();
        setRole('medecin'); setMedecinId(data.medecin_id); setOtp('');
        setOtpTrigger(n => n + 1); setStep('otp');
        toast.info('Code OTP envoyé à votre email. Valable 5 minutes.', { title: 'Code envoyé ✉️' });
        return;
      }

      // 403 = compte médecin trouvé mais non actif → afficher l'erreur directement
      if (resMedecin.status === 403) {
        const data = await resMedecin.json();
        throw new Error(data.detail || 'Compte non activé');
      }

      // 401 = email non trouvé chez les médecins → essayer aide soignant
      const resAide = await fetch(`${API_URL}/aides/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(20000),
      });
      const dataAide = await resAide.json();
      if (!resAide.ok) throw new Error(dataAide.detail || 'Identifiants incorrects');

      setRole('aide'); setAideId(dataAide.aide_id); setOtp('');
      setOtpTrigger(n => n + 1); setStep('otp');
      toast.info('Code OTP envoyé à votre email. Valable 5 minutes.', { title: 'Code envoyé ✉️' });

    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError')
        setError('Le serveur ne répond pas. Réessayez dans quelques secondes.');
      else
        setError(err.message);
    }
    finally { setLoading(false); }
  };

  /* ── Login étape 2 (OTP) ───────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e?.preventDefault(); if (otp.length < 6) return;
    setError(''); setLoading(true);
    try {
      if (role === 'aide') {
        const res  = await fetch(`${API_URL}/aides/verify-otp`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aide_id: aideId, code: otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Code OTP incorrect');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('token_type', 'bearer');
        localStorage.setItem('role', 'aide_soignant');
        localStorage.setItem('aide_id', data.aide.id);
        localStorage.setItem('aide_nom', `${data.aide.prenom} ${data.aide.nom}`);
        localStorage.setItem('aide_permissions', JSON.stringify(data.permissions));
        toast.success('Connexion réussie !', { title: 'Bienvenue 👋' });
        reset(); onClose(); navigate('/aide/dashboard');
      } else {
        const res  = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medecin_id: medecinId, code: otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Code OTP incorrect');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('token_type', 'bearer');
        localStorage.setItem('role', 'medecin');
        toast.success('Connexion réussie !', { title: 'Bienvenue 👋' });
        reset(); onClose(); navigate('/medecin/dashboard');
      }
    } catch (err) { setError(err.message); setOtp(''); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setOtp(''); setLoading(true);
    try {
      const endpoint = role === 'aide' ? `${API_URL}/aides/login` : `${API_URL}/auth/login`;
      const res  = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      if (role === 'aide') setAideId(data.aide_id); else setMedecinId(data.medecin_id);
      setOtpTrigger(n => n + 1);
      toast.info('Nouveau code envoyé !');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── Reset : étape 1 — vérifier l'email ───────────── */
  const handleForgotEmail = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      setResetMedecinId(data.medecin_id); setResetOtp('');
      setResetAttempts(0); setOtpTriggerReset(n => n + 1); setStep('forgot_otp');
      toast.info('Code OTP envoyé à votre email.', { title: 'Code envoyé ✉️' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── Reset : étape 2 — vérifier l'OTP ─────────────── */
  const handleResetVerifyOtp = async (e) => {
    e?.preventDefault(); if (resetOtp.length < 6) return;
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/reset-verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medecin_id: resetMedecinId, code: resetOtp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const newAttempts = resetAttempts + 1;
        setResetAttempts(newAttempts);
        throw new Error(data.detail || 'Code incorrect');
      }
      setResetToken(data.reset_token);
      setNewPwd(''); setConfirmPwd(''); setStep('forgot_pwd');
    } catch (err) { setError(err.message); setResetOtp(''); }
    finally { setLoading(false); }
  };

  const handleResendResetOtp = async () => {
    setError(''); setResetOtp(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setResetMedecinId(data.medecin_id);
      setResetAttempts(0); setOtpTriggerReset(n => n + 1);
      toast.info('Nouveau code envoyé !');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── Reset : étape 3 — nouveau mot de passe ────────── */
  const handleResetPassword = async (e) => {
    e.preventDefault(); setError('');
    if (!isPwdValid(newPwd)) {
      setError('Le mot de passe ne respecte pas toutes les conditions requises.'); return;
    }
    if (newPwd !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      toast.success('Mot de passe réinitialisé !', { title: 'Succès ✅' });
      // Retour au login
      setStep('login'); setResetEmail(''); setResetOtp('');
      setResetToken(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  /* ── Couleurs en-tête selon l'étape ─────────────────── */
  const headerColor = {
    login:       'bg-gradient-to-br from-blue-600 to-blue-700',
    otp:         'bg-gradient-to-br from-emerald-500 to-emerald-600',
    forgot_email:'bg-gradient-to-br from-amber-500 to-orange-500',
    forgot_otp:  'bg-gradient-to-br from-amber-500 to-orange-500',
    forgot_pwd:  'bg-gradient-to-br from-blue-600 to-blue-700',
  }[step] || 'bg-gradient-to-br from-blue-600 to-blue-700';

  /* ─────────────────────────────────────────────────────
     RENDU
  ───────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay-login"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { reset(); onClose(); }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            key="modal-login"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

              {/* ── En-tête ── */}
              <div className={`px-6 pt-6 pb-8 text-center relative transition-colors duration-300 ${headerColor}`}>
                <button onClick={() => { reset(); onClose(); }}
                  className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                    {step === 'otp' || step === 'forgot_otp'
                      ? <ShieldCheck className="w-7 h-7 text-white" />
                      : step === 'forgot_email' || step === 'forgot_pwd'
                      ? <KeyRound className="w-7 h-7 text-white" />
                      : <Stethoscope className="w-7 h-7 text-white" />}
                  </div>
                </div>

                {step === 'login' && (
                  <>
                    <h2 className="text-xl font-bold text-white">Connexion</h2>
                    <p className="text-blue-100 text-sm mt-1">Accéder à votre espace PneumoIA</p>
                  </>
                )}
                {step === 'otp' && (
                  <>
                    <h2 className="text-xl font-bold text-white">Vérification OTP</h2>
                    <p className="text-emerald-100 text-sm mt-1">Code envoyé à <span className="font-semibold">{email}</span></p>
                    <p className="text-emerald-200/70 text-xs mt-0.5">
                      Expire dans <Countdown triggerKey={otpTrigger} onExpire={() => setError('Code expiré. Renvoyez un nouveau code.')} />
                    </p>
                  </>
                )}
                {step === 'forgot_email' && (
                  <>
                    <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
                    <p className="text-orange-100 text-sm mt-1">Entrez votre email professionnel</p>
                  </>
                )}
                {step === 'forgot_otp' && (
                  <>
                    <h2 className="text-xl font-bold text-white">Code de vérification</h2>
                    <p className="text-orange-100 text-sm mt-1">Envoyé à <span className="font-semibold">{resetEmail}</span></p>
                    <p className="text-orange-200/70 text-xs mt-0.5">
                      Expire dans <Countdown triggerKey={otpTriggerReset} onExpire={() => setError('Code expiré. Demandez un nouveau code.')} />
                    </p>
                  </>
                )}
                {step === 'forgot_pwd' && (
                  <>
                    <h2 className="text-xl font-bold text-white">Nouveau mot de passe</h2>
                    <p className="text-blue-100 text-sm mt-1">Créez un mot de passe sécurisé</p>
                  </>
                )}
              </div>

              {/* ── Corps ── */}
              <div className="px-6 py-6">

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">

                  {/* ════ login ════ */}
                  {step === 'login' && (
                    <motion.form key="login-form"
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                      onSubmit={handleLogin} className="space-y-4">

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email professionnel</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="nom@hopital.cm" required autoComplete="email"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required autoComplete="current-password"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                          <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Mot de passe oublié */}
                      <div className="text-right -mt-1">
                        <button type="button" onClick={() => { setError(''); setResetEmail(email); setStep('forgot_email'); }}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium transition-colors">
                          Mot de passe oublié ?
                        </button>
                      </div>

                      <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-sm shadow-blue-100">
                        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Connexion...</> : 'Se connecter →'}
                      </button>
                      <button type="button" onClick={() => { reset(); onClose(); }}
                        className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm">
                        Annuler
                      </button>
                    </motion.form>
                  )}

                  {/* ════ OTP login ════ */}
                  {step === 'otp' && (
                    <motion.div key="otp-form"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      className="space-y-5">
                      <div className="flex justify-center"><KeyRound className="w-6 h-6 text-emerald-500" /></div>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Entrez les <strong>6 chiffres</strong> reçus par email</p>
                      <OTPBoxes value={otp} onChange={setOtp} disabled={loading} color="emerald" />
                      <button onClick={handleVerifyOtp} disabled={otp.length < 6 || loading}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-sm shadow-emerald-100">
                        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Vérification...</> : 'Valider le code ✓'}
                      </button>
                      <div className="flex items-center justify-between text-sm pt-1">
                        <button type="button" onClick={() => { setStep('login'); setOtp(''); setError(''); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">← Modifier l'email</button>
                        <button type="button" onClick={handleResend} disabled={loading}
                          className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50">
                          <RotateCcw className="w-3.5 h-3.5" />Renvoyer le code
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ Forgot — email ════ */}
                  {step === 'forgot_email' && (
                    <motion.form key="forgot-email-form"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      onSubmit={handleForgotEmail} className="space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Entrez l'adresse email associée à votre compte médecin.
                        Nous vous enverrons un code de vérification.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email professionnel</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                            placeholder="nom@hopital.cm" required autoComplete="email"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>
                      <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2">
                        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Vérification...</> : 'Envoyer le code →'}
                      </button>
                      <button type="button" onClick={() => { setError(''); setStep('login'); }}
                        className="w-full py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm">
                        ← Retour à la connexion
                      </button>
                    </motion.form>
                  )}

                  {/* ════ Forgot — OTP ════ */}
                  {step === 'forgot_otp' && (
                    <motion.div key="forgot-otp-form"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      className="space-y-5">
                      <div className="flex justify-center"><AlertTriangle className="w-6 h-6 text-amber-500" /></div>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">Entrez les <strong>6 chiffres</strong> reçus par email</p>

                      {/* Compteur tentatives */}
                      {resetAttempts > 0 && (
                        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle size={12} />
                          <span>{resetAttempts}/3 tentative{resetAttempts > 1 ? 's' : ''} incorrecte{resetAttempts > 1 ? 's' : ''}</span>
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < resetAttempts ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-600'}`} />
                            ))}
                          </div>
                        </div>
                      )}

                      <OTPBoxes value={resetOtp} onChange={setResetOtp} disabled={loading} color="amber" />

                      <button onClick={handleResetVerifyOtp} disabled={resetOtp.length < 6 || loading}
                        className="w-full py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2">
                        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Vérification...</> : 'Valider le code ✓'}
                      </button>

                      <div className="flex items-center justify-between text-sm pt-1">
                        <button type="button" onClick={() => { setStep('forgot_email'); setResetOtp(''); setError(''); setResetAttempts(0); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">← Modifier l'email</button>
                        <button type="button" onClick={handleResendResetOtp} disabled={loading}
                          className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium transition-colors disabled:opacity-50">
                          <RotateCcw className="w-3.5 h-3.5" />Renvoyer le code
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ════ Forgot — nouveau mot de passe ════ */}
                  {step === 'forgot_pwd' && (
                    <motion.form key="forgot-pwd-form"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                      onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nouveau mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showNewPwd ? 'text' : 'password'} value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                            placeholder="••••••••" required
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
                          <button type="button" tabIndex={-1} onClick={() => setShowNewPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <PasswordStrength password={newPwd} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input type={showConfirmPwd ? 'text' : 'password'} value={confirmPwd}
                            onChange={e => setConfirmPwd(e.target.value)}
                            placeholder="••••••••" required
                            className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${
                              confirmPwd && (confirmPwd === newPwd ? 'border-emerald-400 focus:ring-emerald-400' : 'border-red-400 focus:ring-red-400')
                            } ${!confirmPwd ? 'border-gray-200 dark:border-gray-700 focus:ring-blue-500' : ''}`} />
                          <button type="button" tabIndex={-1} onClick={() => setShowConfirmPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {confirmPwd && confirmPwd === newPwd && (
                            <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </div>
                      <button type="submit" disabled={loading || !isPwdValid(newPwd) || newPwd !== confirmPwd}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-sm shadow-blue-100">
                        {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Réinitialisation...</> : 'Réinitialiser le mot de passe ✓'}
                      </button>
                    </motion.form>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
