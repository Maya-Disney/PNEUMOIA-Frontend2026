/**
 * adminApi.js — Client HTTP pour l'API PneumoIA Admin
 *
 * Organisation :
 *   1. Config & helper request()
 *   2. Auth (login, logout, reset mot de passe)
 *   3. Demandes en attente (valider, rejeter)
 *   4. Validées ce mois
 *   5. Refusées (liste, supprimer, relancer)
 *   6. Médecins actifs / suspendus
 *   7. Actions sur les médecins (suspendre, réactiver, supprimer)
 *   8. Statistiques
 *   9. Paramètres
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONFIG & HELPER
// ─────────────────────────────────────────────────────────────────────────────

/** URL de base du backend — définie dans .env (VITE_API_URL) */
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fonction centrale pour tous les appels HTTP.
 *
 * @param {string}  method  - Méthode HTTP : GET | POST | PUT | DELETE
 * @param {string}  path    - Chemin de l'endpoint, ex: "/api/admin/demandes"
 * @param {object}  body    - Corps de la requête (null si GET/DELETE sans body)
 * @param {boolean} auth    - Si true, ajoute le Bearer token depuis localStorage
 * @returns {Promise<any>}  - Données JSON de la réponse
 * @throws {Error}          - Si la réponse n'est pas ok (4xx / 5xx)
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
 * Connexion admin — stocke le token JWT et les infos admin dans localStorage.
 * POST /api/admin/auth/login
 * @param {{ email, password, phone }} credentials
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
 * Déconnexion admin — supprime le token et les infos du localStorage.
 * (Pas d'appel API — invalidation côté client uniquement)
 */
export function adminLogout() {
  localStorage.removeItem("pneumo_admin_token");
  localStorage.removeItem("pneumo_admin");
}

/**
 * Demande de réinitialisation du mot de passe.
 * Envoie un OTP par SMS via Twilio.
 * POST /api/admin/auth/reset-request
 * @param {{ email, phone }} body
 */
export async function adminResetRequest({ email, phone }) {
  return request("POST", "/api/admin/auth/reset-request", { email, phone });
}

/**
 * Confirmation de réinitialisation — vérifie l'OTP et change le mot de passe.
 * POST /api/admin/auth/reset-confirm
 * @param {{ email, otp, new_password, confirm_password }} body
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
 * Récupère tous les médecins en attente de validation.
 * Inclut : données personnelles, photo de profil, documents joints.
 * GET /api/admin/demandes
 */
export async function getDemandes() {
  return request("GET", "/api/admin/demandes", null, true);
}

/**
 * Valide un médecin — statut passe à "valide".
 * Génère un lien d'activation envoyé par email (binôme SMTP).
 * POST /api/admin/demandes/{id}/valider
 * @param {string} medecinId
 */
export async function validerMedecin(medecinId) {
  return request("POST", `/api/admin/demandes/${medecinId}/valider`, null, true);
}

/**
 * Refuse un médecin — statut passe à "rejete".
 * Le motif est stocké en base et envoyé par email au médecin.
 * POST /api/admin/demandes/{id}/rejeter
 * @param {string} medecinId
 * @param {string} motif     - Raison du refus
 */
export async function rejeterMedecin(medecinId, motif) {
  return request("POST", `/api/admin/demandes/${medecinId}/rejeter`, { motif }, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 4. VALIDÉES CE MOIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère les médecins validés pour un mois et une année donnés.
 * Si mois/annee non fournis, retourne le mois en cours.
 * GET /api/admin/demandes/valides?mois=6&annee=2026
 * @param {number} mois   - 1 à 12
 * @param {number} annee  - ex: 2026
 */
export async function getMedecinsValides(mois, annee) {
  const params = mois && annee ? `?mois=${mois}&annee=${annee}` : "";
  return request("GET", `/api/admin/demandes/valides${params}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. REFUSÉES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère les dossiers refusés avec filtres optionnels.
 * GET /api/admin/demandes/refusees?ville=Douala&motif=CNOM invalide
 * @param {string} ville  - Filtre par ville (optionnel)
 * @param {string} motif  - Filtre par motif de refus (optionnel)
 */
export async function getMedecinsRefuses(ville = "", motif = "") {
  const params = new URLSearchParams();
  if (ville && ville !== "Toutes") params.append("ville", ville);
  if (motif && motif !== "Tous")   params.append("motif", motif);
  const qs = params.toString() ? `?${params}` : "";
  return request("GET", `/api/admin/demandes/refusees${qs}`, null, true);
}

/**
 * Supprime définitivement un dossier refusé de la base.
 * Action irréversible — le médecin devra re-soumettre une nouvelle demande.
 * DELETE /api/admin/demandes/{id}/refusees
 * @param {string} medecinId
 */
export async function supprimerDossierRefuse(medecinId) {
  return request("DELETE", `/api/admin/demandes/${medecinId}/refusees`, null, true);
}

/**
 * Envoie un e-mail de relance au médecin refusé.
 * Le médecin peut corriger son dossier et re-soumettre.
 * Marque relance_sent=true en base — le bouton "Relancer" devient grisé.
 * POST /api/admin/demandes/{id}/relancer
 * @param {string} medecinId
 * @param {string} message   - Corps de l'e-mail (modifié par l'admin)
 */
export async function relancerMedecin(medecinId, message) {
  return request("POST", `/api/admin/demandes/${medecinId}/relancer`, { message }, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 6. MÉDECINS ACTIFS / SUSPENDUS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère tous les médecins avec statut "valide".
 * Inclut les stats d'activité (patients, consultations, concordance IA).
 * GET /api/admin/demandes/statut/valide
 */
export async function getMedecinsActifs() {
  return request("GET", "/api/admin/demandes/statut/valide", null, true);
}

/**
 * Récupère tous les médecins avec statut "suspendu".
 * GET /api/admin/demandes/statut/suspendu
 */
export async function getMedecinsSuspendus() {
  return request("GET", "/api/admin/demandes/statut/suspendu", null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 7. ACTIONS SUR LES MÉDECINS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Suspend un médecin actif — statut passe à "suspendu".
 * Le médecin ne peut plus se connecter pendant la durée indiquée.
 * Un email de notification est envoyé (binôme SMTP).
 * POST /api/admin/medecins/{id}/suspendre
 * @param {string} medecinId
 * @param {string} raison    - Motif de la suspension
 * @param {string} duree     - Durée : "7 jours" | "30 jours" | "Indéfinie" etc.
 * @param {string} message   - Message optionnel envoyé au médecin
 */
export async function suspendreMedecin(medecinId, raison, duree, message) {
  return request("POST", `/api/admin/medecins/${medecinId}/suspendre`, { raison, duree, message }, true);
}

/**
 * Réactive un médecin suspendu — statut repasse à "valide".
 * Efface les champs de suspension en base.
 * POST /api/admin/medecins/{id}/reactiver
 * @param {string} medecinId
 */
export async function reactiverMedecin(medecinId) {
  return request("POST", `/api/admin/medecins/${medecinId}/reactiver`, null, true);
}

/**
 * Supprime définitivement un médecin et toutes ses données.
 * Action irréversible — toutes les consultations et documents associés sont supprimés.
 * DELETE /api/admin/medecins/{id}
 * @param {string} medecinId
 */
export async function supprimerMedecin(medecinId) {
  return request("DELETE", `/api/admin/medecins/${medecinId}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 8. STATISTIQUES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Consultations par jour sur les 30 derniers jours.
 * Utilisé par la page Courbe d'activité.
 * GET /api/admin/stats/consultations/semaine
 */
export async function getConsultationsSemaine() {
  return request("GET", "/api/admin/stats/consultations/semaine", null, true);
}

/**
 * Consultations agrégées par mois pour une année donnée.
 * GET /api/admin/stats/consultations/annee?year=2026
 * @param {number} year
 */
export async function getConsultationsAnnee(year) {
  return request("GET", `/api/admin/stats/consultations/annee?year=${year}`, null, true);
}

/**
 * Consultations totales sur une période personnalisée.
 * GET /api/admin/stats/consultations/total?from=2026-01-01&to=2026-06-30
 * @param {string} from - Date ISO de début
 * @param {string} to   - Date ISO de fin
 */
export async function getConsultationsTotal(from, to) {
  return request("GET", `/api/admin/stats/consultations/total?from=${from}&to=${to}`, null, true);
}

/**
 * Répartition géographique des médecins par ville.
 * Utilisé par la page Répartition géo.
 * GET /api/admin/stats/repartition-geo
 */
export async function getRepartitionGeo() {
  return request("GET", "/api/admin/stats/repartition-geo", null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 9. PARAMÈTRES
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
 * @param {object} params - Objet paramètres à mettre à jour
 */
export async function updateParametres(params) {
  return request("PUT", "/api/admin/parametres", params, true);
}