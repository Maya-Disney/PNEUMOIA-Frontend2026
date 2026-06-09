import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Cache module-level : tous les composants qui appellent useProfil()
// partagent le même fetch — 1 seul appel réseau par session.
let _cache   = null;   // résultat mis en cache
let _promise = null;   // promise en cours (évite les appels parallèles)

function fetchProfil(token) {
  if (_cache)   return Promise.resolve(_cache);
  if (_promise) return _promise;

  _promise = fetch(`${API_URL}/auth/profil`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => {
      if (r.status === 401) throw new Error('token_expire');
      if (!r.ok)            throw new Error(`http_${r.status}`);
      return r.json();
    })
    .then(data => { _cache = data; return data; })
    .catch(err  => { _promise = null; throw err; });

  return _promise;
}

export function invalidateProfil() {
  _cache   = null;
  _promise = null;
}

export function useProfil() {
  const [profil,  setProfil]  = useState(_cache);
  const [loading, setLoading] = useState(!_cache);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token')
               || localStorage.getItem('access_token')
               || localStorage.getItem('pneumoia_token');
    if (!token) { setLoading(false); setError('non_connecte'); return; }

    if (_cache) { setProfil(_cache); setLoading(false); return; }

    fetchProfil(token)
      .then(data => { setProfil(data); setError(null); })
      .catch(err  => { console.error('[useProfil]', err.message); setError(err.message); })
      .finally(() => setLoading(false));
  }, []);

  return { profil, loading, error };
}

export function useAuth() {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  return {
    isAuthenticated: !!token,
    role,
    logout,
  };
}