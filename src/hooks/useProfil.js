import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api/v1';

export function useProfil() {
  const [profil, setProfil]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/auth/profil`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setProfil(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { profil, loading };
}