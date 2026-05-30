import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Stethoscope } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/v1';

export default function ActivationPage() {
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

    fetch(`${API_URL}/auth/activate?token=${encodeURIComponent(token)}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success');
          setMessage(data.message || 'Compte activé avec succès.');
          // Redirige vers la home page après 2 secondes
          setTimeout(() => navigate('/', { state: { activated: true } }), 2000);
        } else {
          setStatus('error');
          setMessage(data.detail || 'Le lien est invalide ou a expiré.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Header coloré selon l'état */}
        <div className={`px-8 pt-8 pb-10 text-center transition-colors duration-500
          ${status === 'success' ? 'bg-linear-to-br from-emerald-500 to-emerald-600'
          : status === 'error'   ? 'bg-linear-to-br from-red-500 to-red-600'
          :                        'bg-linear-to-br from-blue-600 to-blue-700'}`}>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
              {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
              {status === 'error'   && <XCircle    className="w-8 h-8 text-white" />}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-xs font-bold uppercase tracking-widest">PneumoIA</span>
          </div>

          <h1 className="text-2xl font-bold text-white">
            {status === 'loading' && 'Activation en cours…'}
            {status === 'success' && 'Compte activé !'}
            {status === 'error'   && 'Lien invalide'}
          </h1>
        </div>

        {/* Corps */}
        <div className="px-8 py-8 text-center space-y-4">

          {status === 'loading' && (
            <p className="text-gray-500 text-sm">Vérification de votre lien d'activation…</p>
          )}

          {status === 'success' && (
            <>
              <p className="text-gray-700 font-medium">{message}</p>
              <p className="text-sm text-gray-400">
                Redirection vers la page d'accueil dans quelques secondes…
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[shrink_2s_linear_forwards]"
                  style={{ animation: 'width 2s linear forwards', width: '100%' }} />
              </div>
              <button
                onClick={() => navigate('/', { state: { activated: true } })}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-colors"
              >
                Aller à l'accueil maintenant →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-gray-700">{message}</p>
              <p className="text-sm text-gray-400">
                Si le problème persiste, contactez l'administrateur.
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
