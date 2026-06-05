const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method, path, body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("pneumo_admin_token");
    if (!token) throw new Error("Non authentifié. Veuillez vous reconnecter.");
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Erreur serveur.");
  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function adminLogin({ email, password, phone }) {
  const data = await request("POST", "/api/admin/auth/login", { email, password, phone });
  if (data.access_token) {
    localStorage.setItem("pneumo_admin_token", data.access_token);
    localStorage.setItem("pneumo_admin", JSON.stringify(data.admin));
  }
  return data;
}

export function adminLogout() {
  localStorage.removeItem("pneumo_admin_token");
  localStorage.removeItem("pneumo_admin");
}

export async function adminResetRequest({ email, phone }) {
  return request("POST", "/api/admin/auth/reset-request", { email, phone });
}

export async function adminResetConfirm({ email, otp, new_password, confirm_password }) {
  return request("POST", "/api/admin/auth/reset-confirm", {
    email,
    otp,
    new_password,
    confirm_password,
  });
}

// ─── Demandes ──────────────────────────────────────────────────────────────────

// ─── Demandes médecins ────────────────────────────────────────────────────────

/**
 * Récupère tous les médecins en attente (statut: "en_attente")
 * avec leurs documents et photo de profil
 * GET /api/admin/demandes
 */
export async function getDemandes() {
  return request("GET", "/api/admin/demandes", null, true);
}

/**
 * Valide un médecin — statut passe à "valide"
 * POST /api/admin/demandes/{id}/valider
 */
export async function validerMedecin(medecinId) {
  return request("POST", `/api/admin/demandes/${medecinId}/valider`, null, true);
}

/**
 * Rejette un médecin — statut passe à "rejete"
 * POST /api/admin/demandes/{id}/rejeter
 */
export async function rejeterMedecin(medecinId, motif) {
  return request("POST", `/api/admin/demandes/${medecinId}/rejeter`, { motif }, true);
}

// ─── Statistiques ──────────────────────────────────────────────────────────────

export async function getConsultationsSemaine() {
  return request("GET", "/api/admin/stats/consultations/semaine", null, true);
}

export async function getConsultationsAnnee(year) {
  return request("GET", `/api/admin/stats/consultations/annee?year=${year}`, null, true);
}

export async function getConsultationsTotal(from, to) {
  return request("GET", `/api/admin/stats/consultations/total?from=${from}&to=${to}`, null, true);
}

export async function getRepartitionGeo() {
  return request("GET", "/api/admin/stats/repartition-geo", null, true);
}

// ─── Paramètres ────────────────────────────────────────────────────────────────

export async function getParametres() {
  return request("GET", "/api/admin/parametres", null, true);
}

export async function updateParametres(params) {
  return request("PUT", "/api/admin/parametres", params, true);
}