// src/components/modals/LoginModal.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, AlertCircle, Mail, Lock, Eye, EyeOff,
         KeyRound, X, RotateCcw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const API_URL = 'http://localhost:8000/api/v1';

/* ─── 6 cases OTP ─────────────────────────────────────────── */
function OTPBoxes({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits  = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[i]     = char;
    const str   = next.join('');
    onChange(str.replace(/ /g, ''));
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (!digits[i] && i > 0) {
        const next = [...digits];
        next[i - 1] = '';
        onChange(next.join('').replace(/ /g, ''));
        inputs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  useEffect(() => {
    const firstEmpty = digits.findIndex(d => !d);
    inputs.current[firstEmpty >= 0 ? firstEmpty : 5]?.focus();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: '44px',
            height: '48px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            border: d ? '2px solid #3b82f6' : '2px solid #d1d5db',
            borderRadius: '12px',
            outline: 'none',
            backgroundColor: d ? '#eff6ff' : '#f9fafb',
            color: d ? '#1d4ed8' : '#1f2937',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  );
}
/* ─── Compte à rebours 5 min ─────────────────────────────── */
function Countdown({ triggerKey, onExpire }) {
  const [secs, setSecs] = useState(300);

  useEffect(() => {
    setSecs(300);
    const t = setInterval(() => {
      setSecs(r => {
        if (r <= 1) { clearInterval(t); onExpire?.(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [triggerKey]);

  const mm    = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss    = String(secs % 60).padStart(2, '0');
  const isDanger = secs < 60;

  return (
    <span className={`font-mono font-semibold tabular-nums ${isDanger ? 'text-red-500' : 'text-gray-500'}`}>
      {mm}:{ss}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const toast    = useToast();

  /* états */
  const [step,       setStep]       = useState('login'); // 'login' | 'otp'
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [otp,        setOtp]        = useState('');
  const [medecinId,  setMedecinId]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [otpTrigger, setOtpTrigger] = useState(0); // relance le countdown

  /* reset complet à chaque ouverture/fermeture */
  useEffect(() => {
    if (!isOpen) return;
    setStep('login'); setEmail(''); setPassword('');
    setShowPwd(false); setOtp(''); setMedecinId('');
    setLoading(false); setError('');
  }, [isOpen]);

  /* auto-submit quand les 6 chiffres sont saisis */
  useEffect(() => {
    if (step === 'otp' && otp.length === 6 && !loading) {
      handleVerifyOtp();
    }
  }, [otp]);

  const reset = useCallback(() => {
    setStep('login'); setEmail(''); setPassword(''); setShowPwd(false);
    setOtp(''); setMedecinId(''); setLoading(false); setError('');
  }, []);

  /* ─────────────────────────────────────────────────────────
     Étape 1 : email + mot de passe  → /auth/login
  ───────────────────────────────────────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Identifiants incorrects');

      setMedecinId(data.medecin_id);
      setOtp('');
      setOtpTrigger(n => n + 1);
      setStep('otp');
      toast.info('Code OTP envoyé à votre email. Valable 5 minutes.', { title: 'Code envoyé ✉️' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     Étape 2 : OTP → /auth/verify-otp
  ───────────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) return;
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ medecin_id: medecinId, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Code OTP incorrect');

      localStorage.setItem('token',      data.access_token);
      localStorage.setItem('token_type', 'bearer');
      localStorage.setItem('role',       'medecin');

      toast.success('Connexion réussie !', { title: 'Bienvenue 👋' });
      reset();
      onClose();
      navigate('/medecin/dashboard');
    } catch (err) {
      setError(err.message);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     Renvoyer un nouveau code OTP
  ───────────────────────────────────────────────────────── */
  const handleResend = async () => {
    setError(''); setOtp(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMedecinId(data.medecin_id);
      setOtpTrigger(n => n + 1);
      toast.info('Nouveau code envoyé !');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     RENDU
  ───────────────────────────────────────────────────────── */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay-login"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { reset(); onClose(); }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Carte modale */}
          <motion.div
            key="modal-login"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

              {/* ── En-tête couleur ── */}
              <div className={`px-6 pt-6 pb-8 text-center relative transition-colors duration-300
                ${step === 'otp'
                  ? 'bg-linear-to-br from-emerald-500 to-emerald-600'
                  : 'bg-linear-to-br from-blue-600  to-blue-700'}`}>

                {/* Bouton fermer */}
                <button
                  onClick={() => { reset(); onClose(); }}
                  className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>

                {/* Icône */}
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                    {step === 'otp'
                      ? <ShieldCheck className="w-7 h-7 text-white" />
                      : <Stethoscope className="w-7 h-7 text-white" />}
                  </div>
                </div>

                {/* Titre / sous-titre */}
                {step === 'login' ? (
                  <>
                    <h2 className="text-xl font-bold text-white">Connexion</h2>
                    <p className="text-blue-100 text-sm mt-1">Accéder à votre espace médecin</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white">Vérification OTP</h2>
                    <p className="text-emerald-100 text-sm mt-1">
                      Code envoyé à <span className="font-semibold">{email}</span>
                    </p>
                    <p className="text-emerald-200/70 text-xs mt-0.5">
                      Expire dans{' '}
                      <Countdown
                        triggerKey={otpTrigger}
                        onExpire={() => setError('Code expiré. Renvoyez un nouveau code.')}
                      />
                    </p>
                  </>
                )}
              </div>

              {/* ── Corps ── */}
              <div className="px-6 py-6">

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{    opacity: 0, height: 0 }}
                      className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-900/20
                        border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400
                        text-sm rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>

                  {/* ════ Étape 1 : login ════ */}
                  {step === 'login' && (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      exit={{    opacity: 0, x:  16 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email professionnel
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="nom@hopital.cm" required autoComplete="email"
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700
                              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Mot de passe */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Mot de passe
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPwd ? 'text' : 'password'} value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required autoComplete="current-password"
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700
                              rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500
                              bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                          <button type="button" tabIndex={-1}
                            onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Se connecter */}
                      <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700
                          disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium
                          flex items-center justify-center gap-2 mt-1 shadow-sm shadow-blue-100">
                        {loading
                          ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Connexion...</>
                          : 'Se connecter →'
                        }
                      </button>

                      <button type="button" onClick={() => { reset(); onClose(); }}
                        className="w-full py-2.5 border border-gray-200 dark:border-gray-600
                          text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800
                          transition-colors font-medium text-sm">
                        Annuler
                      </button>
                    </motion.form>
                  )}

                  {/* ════ Étape 2 : OTP ════ */}
                  {step === 'otp' && (
                    <motion.div
                      key="otp-form"
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      exit={{    opacity: 0, x:-16 }}
                      className="space-y-5"
                    >
                      {/* Icône */}
                      <div className="flex justify-center">
                        <KeyRound className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Entrez les <strong>6 chiffres</strong> reçus par email
                      </p>

                      {/* 6 cases */}
                      <OTPBoxes value={otp} onChange={setOtp} disabled={loading} />

                      {/* Valider */}
                      <button
                        onClick={handleVerifyOtp}
                        disabled={otp.length < 6 || loading}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700
                          disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium
                          flex items-center justify-center gap-2 shadow-sm shadow-emerald-100">
                        {loading
                          ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Vérification...</>
                          : 'Valider le code ✓'
                        }
                      </button>

                      {/* Actions secondaires */}
                      <div className="flex items-center justify-between text-sm pt-1">
                        <button
                          type="button"
                          onClick={() => { setStep('login'); setOtp(''); setError(''); }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          ← Modifier l'email
                        </button>
                        <button
                          type="button"
                          onClick={handleResend} disabled={loading}
                          className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700
                            font-medium transition-colors disabled:opacity-50">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Renvoyer le code
                        </button>
                      </div>
                    </motion.div>
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
