// src/services/patientsApi.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  localStorage.getItem('pneumoia_token');

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({ detail: `Erreur ${res.status}` }));
  if (!res.ok) throw new Error(data.detail || `Erreur ${res.status}`);
  return data;
};

// ── Patients ──────────────────────────────────────────────────────
export const getMesPatients         = ()         => apiFetch('/patients/mes-patients');
export const searchPatients         = (q)        => apiFetch(`/patients/search?q=${encodeURIComponent(q)}`);
export const getPatient             = (id)       => apiFetch(`/patients/${id}`);
export const getConsultationsPatient = (id)      => apiFetch(`/patients/${id}/consultations`);
export const getDernierDiagnostic   = (id)       => apiFetch(`/patients/${id}/dernier-diagnostic`);

// ── Partage ───────────────────────────────────────────────────────
export const getMedecins            = ()         => apiFetch('/medecins/liste');
export const getCommunautes         = ()         => apiFetch('/communautes');
export const partagerConsultation   = (id, data) => apiFetch(`/consultations/${id}/partager`, {
  method: 'POST',
  body: JSON.stringify(data),
});
