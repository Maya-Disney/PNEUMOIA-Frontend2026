import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ShieldOff, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function DeblocageEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');

  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide : aucun token trouvé.');
      return;
    }

    fetch(`${API_URL}/auth/demande-deblocage-token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success');
          setMessage(data.message || 'Votre demande a bien été envoyée à l\'administrateur.');
        } else {
          setStatus('error');
          setMessage(data.detail || 'Le lien est invalide ou a expiré.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Impossible de contacter le serveur. Réessayez dans quelques instants.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

        <div className={`px-8 pt-8 pb-10 text-center transition-colors duration-500
          ${status === 'success' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          : status === 'error'   ? 'bg-gradient-to-br from-red-500 to-red-600'
          :                        'bg-gradient-to-br from-blue-600 to-blue-700'}`}>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              {status === 'loading' && <Loader2  className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
              {status === 'error'   && <XCircle    className="w-8 h-8 text-white" />}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldOff className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">PneumoIA</span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            {status === 'loading' && 'Envoi en cours…'}
            {status === 'success' && 'Demande envoyée !'}
            {status === 'error'   && 'Lien invalide'}
          </h1>
        </div>

        <div className="px-8 py-8 text-center space-y-4">

          {status === 'loading' && (
            <p className="text-gray-500 text-sm">Envoi de votre demande à l'administrateur…</p>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-gray-700 font-medium">{message}</p>
              <p className="text-sm text-gray-400">
                L'administrateur examinera votre demande et vous contactera par email pour rétablir votre accès.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-colors"
              >
                Retour à l'accueil
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-gray-700">{message}</p>
              <p className="text-sm text-gray-400">
                Si votre lien a expiré, demandez un nouvel email en tentant de vous connecter.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
              >
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
