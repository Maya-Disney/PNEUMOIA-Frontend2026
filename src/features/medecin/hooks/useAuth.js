import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api/v1';

export function useProfil() {
  const [profil,  setProfil]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); setError('non_connecte'); return; }

    fetch(`${API_URL}/auth/profil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (r.status === 401) throw new Error('token_expire');
        if (!r.ok)           throw new Error(`http_${r.status}`);
        return r.json();
      })
      .then(data => { setProfil(data); setError(null); })
      .catch(err => {
        console.error('[useProfil]', err.message);
        setError(err.message);
      })
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