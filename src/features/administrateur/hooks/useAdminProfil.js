import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api/v1';

/**
 * Récupère le profil de l'admin connecté depuis GET /api/v1/admin/me
 * en utilisant le token JWT stocké dans localStorage.
 */
export default function useAdminProfil() {
  const [profil, setProfil]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(data => setProfil(data))
      .catch(err => console.error('useAdminProfil:', err))
      .finally(() => setLoading(false));
  }, []);

  return { profil, loading };
}
