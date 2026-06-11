/**
 * adminApi.js — Client HTTP pour l'API PneumoIA Admin
 *
 * Organisation :
 *   1.  Config & helper request()
 *   2.  Auth (login, logout, reset mot de passe)
 *   3.  Demandes en attente (valider, rejeter)
 *   4.  Validées ce mois
 *   5.  Refusées (liste, supprimer, relancer)
 *   6.  Médecins actifs / suspendus
 *   7.  Médecin par ID (profil complet)
 *   8.  Actions sur les médecins (suspendre, réactiver, supprimer)
 *   9.  FAQ — questions médecins + FAQ publiées admin
 *   10. Statistiques
 *   11. Paramètres
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONFIG & HELPER
// ─────────────────────────────────────────────────────────────────────────────

/** URL de base du backend — définie dans .env (VITE_API_URL) */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fonction centrale pour tous les appels HTTP.
 * @param {string}  method  - GET | POST | PUT | PATCH | DELETE
 * @param {string}  path    - Chemin de l'endpoint
 * @param {object}  body    - Corps de la requête (null si pas de body)
 * @param {boolean} auth    - Ajoute le Bearer token si true
 * @returns {Promise<any>}
 * @throws {Error} si la réponse est 4xx / 5xx
 */
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


// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connexion admin — stocke le token JWT dans localStorage.
 * POST /api/admin/auth/login
 */
export async function adminLogin({ email, password, phone }) {
  const data = await request("POST", "/api/admin/auth/login", { email, password, phone });
  if (data.access_token) {
    localStorage.setItem("pneumo_admin_token", data.access_token);
    localStorage.setItem("pneumo_admin", JSON.stringify(data.admin));
  }
  return data;
}

/**
 * Déconnexion admin — supprime le token du localStorage (pas d'appel API).
 */
export function adminLogout() {
  localStorage.removeItem("pneumo_admin_token");
  localStorage.removeItem("pneumo_admin");
}

/**
 * Demande de réinitialisation — envoie un OTP par SMS via Twilio.
 * POST /api/admin/auth/reset-request
 */
export async function adminResetRequest({ email, phone }) {
  return request("POST", "/api/admin/auth/reset-request", { email, phone });
}

/**
 * Confirmation OTP + mise à jour du mot de passe.
 * POST /api/admin/auth/reset-confirm
 */
export async function adminResetConfirm({ email, otp, new_password, confirm_password }) {
  return request("POST", "/api/admin/auth/reset-confirm", {
    email, otp, new_password, confirm_password,
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. DEMANDES EN ATTENTE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère tous les médecins en attente avec documents et photo.
 * GET /api/admin/demandes
 */
export async function getDemandes() {
  return request("GET", "/api/admin/demandes", null, true);
}

/**
 * Valide un médecin — statut passe à "valide" + email d'activation Brevo.
 * POST /api/admin/demandes/{id}/valider
 */
export async function validerMedecin(medecinId) {
  return request("POST", `/api/admin/demandes/${medecinId}/valider`, null, true);
}

/**
 * Refuse un médecin — statut passe à "rejete" + email Brevo avec motif.
 * POST /api/admin/demandes/{id}/rejeter
 */
export async function rejeterMedecin(medecinId, motif) {
  return request("POST", `/api/admin/demandes/${medecinId}/rejeter`, { motif }, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. VALIDÉES CE MOIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Médecins validés pour un mois/année donnés (mois en cours si omis).
 * GET /api/admin/demandes/valides?mois=6&annee=2026
 */
export async function getMedecinsValides(mois, annee) {
  const params = mois && annee ? `?mois=${mois}&annee=${annee}` : "";
  return request("GET", `/api/admin/demandes/valides${params}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. REFUSÉES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dossiers refusés avec filtres optionnels ville / motif.
 * GET /api/admin/demandes/refusees?ville=Douala&motif=CNOM invalide
 */
export async function getMedecinsRefuses(ville = "", motif = "") {
  const p = new URLSearchParams();
  if (ville && ville !== "Toutes") p.append("ville", ville);
  if (motif && motif !== "Tous")   p.append("motif", motif);
  const qs = p.toString() ? `?${p}` : "";
  return request("GET", `/api/admin/demandes/refusees${qs}`, null, true);
}

/**
 * Supprime définitivement un dossier refusé.
 * DELETE /api/admin/demandes/{id}/refusees
 */
export async function supprimerDossierRefuse(medecinId) {
  return request("DELETE", `/api/admin/demandes/${medecinId}/refusees`, null, true);
}

/**
 * Envoie un e-mail de relance au médecin refusé via Brevo.
 * relance_sent passe à true → bouton grisé côté frontend.
 * POST /api/admin/demandes/{id}/relancer
 */
export async function relancerMedecin(medecinId, message) {
  return request("POST", `/api/admin/demandes/${medecinId}/relancer`, { message }, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 6. MÉDECINS ACTIFS / SUSPENDUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Médecins validés enrichis avec leurs stats d'activité.
 * Le statut Actif/Inactif est calculé côté frontend (règle > 14j sans connexion).
 * GET /api/admin/medecins/actifs
 */
export async function getMedecinsActifs() {
  return request("GET", "/api/admin/medecins/actifs", null, true);
}

/**
 * Médecins avec statut "suspendu" + champs suspension (raison, durée, date).
 * GET /api/admin/demandes/statut/suspendu
 */
export async function getMedecinsSuspendus() {
  return request("GET", "/api/admin/demandes/statut/suspendu", null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 7. MÉDECIN PAR ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Profil complet d'un médecin avec stats + documents.
 * Utilisé par ProfilMedecin.jsx pour hydrater la page depuis le backend.
 * GET /api/admin/medecins/{id}
 */
export async function getMedecinById(medecinId) {
  return request("GET", `/api/admin/medecins/${medecinId}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 8. ACTIONS SUR LES MÉDECINS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Suspend un médecin — statut passe à "suspendu".
 * Email de notification envoyé via Brevo avec raison + durée.
 * POST /api/admin/medecins/{id}/suspendre
 */
export async function suspendreMedecin(medecinId, raison, duree, message) {
  return request("POST", `/api/admin/medecins/${medecinId}/suspendre`, { raison, duree, message }, true);
}

/**
 * Réactive un médecin suspendu — statut repasse à "valide".
 * Email de notification envoyé via Brevo avec motif initial.
 * POST /api/admin/medecins/{id}/reactiver
 */
export async function reactiverMedecin(medecinId) {
  return request("POST", `/api/admin/medecins/${medecinId}/reactiver`, null, true);
}

/**
 * Supprime définitivement un médecin et toutes ses données.
 * Email de notification envoyé via Brevo. Action irréversible.
 * DELETE /api/admin/medecins/{id}
 */
export async function supprimerMedecin(medecinId) {
  return request("DELETE", `/api/admin/medecins/${medecinId}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 9. FAQ
// ─────────────────────────────────────────────────────────────────────────────

// ── Questions posées par les médecins ────────────────────────────────────────

/**
 * Questions des médecins avec filtres optionnels.
 * GET /api/admin/faq/questions?statut=en_attente&categorie=IA&ville=Douala
 */
export async function getQuestions(statut = "", categorie = "", ville = "") {
  const p = new URLSearchParams();
  if (statut)                  p.append("statut",    statut);
  if (categorie)               p.append("categorie", categorie);
  if (ville && ville !== "Toutes") p.append("ville", ville);
  const qs = p.toString() ? `?${p}` : "";
  return request("GET", `/api/admin/faq/questions${qs}`, null, true);
}

/**
 * Répond à une question de médecin.
 * Email de réponse envoyé automatiquement via Brevo.
 * POST /api/admin/faq/questions/{id}/repondre
 */
export async function repondreQuestion(questionId, reponse) {
  return request("POST", `/api/admin/faq/questions/${questionId}/repondre`, { reponse }, true);
}

// ── FAQ publiées par l'admin ─────────────────────────────────────────────────

/**
 * Toutes les entrées FAQ (publiées + brouillons).
 * GET /api/admin/faq
 */
export async function getFAQ() {
  return request("GET", "/api/admin/faq", null, true);
}

/**
 * Crée une nouvelle entrée FAQ.
 * POST /api/admin/faq
 */
export async function creerFAQ(question, reponse, categorie, publie) {
  return request("POST", "/api/admin/faq", { question, reponse, categorie, publie }, true);
}

/**
 * Modifie une entrée FAQ existante.
 * PUT /api/admin/faq/{id}
 */
export async function modifierFAQ(faqId, question, reponse, categorie, publie) {
  return request("PUT", `/api/admin/faq/${faqId}`, { question, reponse, categorie, publie }, true);
}

/**
 * Publie ou dépublie une entrée FAQ (toggle).
 * PATCH /api/admin/faq/{id}/toggle
 */
export async function toggleFAQPublie(faqId) {
  return request("PATCH", `/api/admin/faq/${faqId}/toggle`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 10. STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consultations par jour sur les 30 derniers jours.
 * GET /api/admin/stats/consultations/semaine
 */
export async function getConsultationsSemaine() {
  return request("GET", "/api/admin/stats/consultations/semaine", null, true);
}

/**
 * Consultations par mois pour une année donnée.
 * GET /api/admin/stats/consultations/annee?year=2026
 */
export async function getConsultationsAnnee(year) {
  return request("GET", `/api/admin/stats/consultations/annee?year=${year}`, null, true);
}

/**
 * Consultations totales sur une période personnalisée.
 * GET /api/admin/stats/consultations/total?from=2026-01-01&to=2026-06-30
 */
export async function getConsultationsTotal(from, to) {
  return request("GET", `/api/admin/stats/consultations/total?from=${from}&to=${to}`, null, true);
}

/**
 * Répartition géographique des médecins par ville.
 * GET /api/admin/stats/repartition-geo
 */
export async function getRepartitionGeo() {
  return request("GET", "/api/admin/stats/repartition-geo", null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 11. PARAMÈTRES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère les paramètres globaux de la plateforme.
 * GET /api/admin/parametres
 */
export async function getParametres() {
  return request("GET", "/api/admin/parametres", null, true);
}

/**
 * Met à jour les paramètres globaux de la plateforme.
 * PUT /api/admin/parametres
 */
export async function updateParametres(params) {
  return request("PUT", "/api/admin/parametres", params, true);
}