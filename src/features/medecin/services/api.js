// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getToken = () => localStorage.getItem('token');

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
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Erreur ${res.status}` }));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Patients ──────────────────────────────────────────────────
export const creerPatient = (data) =>
  apiFetch('/patients', { method: 'POST', body: JSON.stringify(data) });

export const rechercherPatient = (q) =>
  apiFetch(`/patients/search?q=${encodeURIComponent(q.trim())}`);

export const demanderAcces = (data) =>
  apiFetch('/patients/access-requests', { method: 'POST', body: JSON.stringify(data) });

export const mesDemandesEnvoyees = () =>
  apiFetch('/patients/access-requests/envoyees');

export const rechercheParCode = (code) =>
  apiFetch(`/patients/recherche-par-code?code=${encodeURIComponent(code)}`);

// ── Consultations ─────────────────────────────────────────────
export const creerConsultation = (patient_id) =>
  apiFetch('/consultations', { method: 'POST', body: JSON.stringify({ patient_id }) });

export const sauvegarderAntecedents = (id, data) =>
  apiFetch(`/consultations/${id}/antecedents`, { method: 'PATCH', body: JSON.stringify(data) });

export const sauvegarderSymptomes = (id, data) =>
  apiFetch(`/consultations/${id}/symptomes`, { method: 'PATCH', body: JSON.stringify(data) });

export const sauvegarderOpinion = (id, data) =>
  apiFetch(`/consultations/${id}/opinion`, { method: 'POST', body: JSON.stringify(data) });

export const listerConsultations = () =>
  apiFetch('/consultations');

// ── Diagnostic IA ─────────────────────────────────────────────
export const lancerDiagnostic = (data) =>
  apiFetch('/diagnostic/predict-and-save', { method: 'POST', body: JSON.stringify(data) });

export const envoyerFeedback = (id, data) =>
  apiFetch(`/diagnostic/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) });

// ── PDF ───────────────────────────────────────────────────────
export const telechargerPDF = async (consultationId) => {
  const res = await fetch(`${BASE_URL}/consultations/${consultationId}/pdf`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Erreur génération PDF');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `bilan_${consultationId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};