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
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '');

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
// 8b. CORBEILLE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Médecins en corbeille (supprimés mais encore restaurables avant 30 jours).
 * GET /api/admin/corbeille
 */
export async function getCorbeille() {
  return request("GET", "/api/admin/corbeille", null, true);
}

/**
 * Restaure un médecin depuis la corbeille — statut reprend sa valeur précédente.
 * POST /api/admin/corbeille/{id}/restaurer
 */
export async function restaurerMedecin(medecinId) {
  return request("POST", `/api/admin/corbeille/${medecinId}/restaurer`, null, true);
}

/**
 * Suppression définitive et immédiate depuis la corbeille.
 * DELETE /api/admin/corbeille/{id}
 */
export async function supprimerDefinitivement(medecinId) {
  return request("DELETE", `/api/admin/corbeille/${medecinId}`, null, true);
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

export async function supprimerFAQ(faqId) {
  return request("DELETE", `/api/admin/faq/${faqId}`, null, true);
}

export async function viderTouteFAQ() {
  return request("DELETE", "/api/admin/faq/vider", null, true);
}

export async function supprimerQuestion(questionId) {
  return request("DELETE", `/api/admin/faq/questions/${questionId}`, null, true);
}

/**
 * Publie une question de médecin directement en FAQ (landing page + médecins).
 * POST /api/admin/faq/questions/{id}/publier-faq
 */
export async function publierQuestionFAQ(questionId, reponse, categorie = "Autre") {
  return request("POST", `/api/admin/faq/questions/${questionId}/publier-faq`, { reponse, categorie }, true);
}

export async function viderHistoriqueQuestions() {
  return request("DELETE", "/api/admin/faq/questions/historique", null, true);
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
 * Consultations par jour sur une plage de dates quelconque.
 * GET /api/admin/stats/consultations/jours?from=2026-05-11&to=2026-06-17
 */
export async function getConsultationsJours(from, to) {
  return request("GET", `/api/admin/stats/consultations/jours?from=${from}&to=${to}`, null, true);
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
 * Répartition géographique des médecins par ville avec filtres mois/année.
 * GET /api/admin/stats/repartition-geo?mois=6&annee=2026
 */
export async function getRepartitionGeo(mois, annee) {
  const p = new URLSearchParams();
  if (mois)  p.append("mois",  mois);
  if (annee) p.append("annee", annee);
  const qs = p.toString() ? `?${p}` : "";
  return request("GET", `/api/admin/stats/repartition-geo${qs}`, null, true);
}

/**
 * Top 5 médecins classés par taux de concordance IA + consultations pour un mois donné.
 * Retourne : [{ id, prenom, nom, photo_url, concordance, consultations, tendance }]
 * GET /api/admin/stats/top-medecins-concordance?mois=6&annee=2026
 */
export async function getTopMedecinsConcordance(mois, annee) {
  return request("GET", `/api/admin/stats/top-medecins-concordance?mois=${mois}&annee=${annee}`, null, true);
}

/**
 * Concordance IA moyenne par mois sur les 6 derniers mois glissants.
 * GET /api/admin/stats/concordance/evolution
 */
export async function getConcordanceEvolution() {
  return request("GET", "/api/admin/stats/concordance/evolution", null, true);
}

/**
 * Concordance IA moyenne par pathologie pour un mois donné.
 * GET /api/admin/stats/concordance/pathologies?mois=6&annee=2026
 */
export async function getConcordancePathologies(mois, annee) {
  return request("GET", `/api/admin/stats/concordance/pathologies?mois=${mois}&annee=${annee}`, null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 11. COMMENTAIRES / AVIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Avis / commentaires publiés par les médecins sur la plateforme.
 * Chaque avis contient : id, prenom, nom, photo_url, specialite, hopital, ville,
 *   note (1-5), commentaire, created_at, vu (bool).
 * GET /api/admin/avis
 */
export async function getAvis() {
  return request("GET", "/api/admin/avis", null, true);
}

/**
 * Supprime un avis — le médecin est notifié par email.
 * DELETE /api/admin/avis/{id}
 */
export async function supprimerAvis(avisId, raison = null) {
  return request("DELETE", `/api/admin/avis/${avisId}`, raison ? { raison } : null, true);
}

/**
 * Marque tous les avis comme vus.
 * PATCH /api/admin/avis/marquer-vus
 */
export async function marquerAvisVus() {
  return request("PATCH", "/api/admin/avis/marquer-vus", null, true);
}



// ─────────────────────────────────────────────────────────────────────────────
// 12. PARAMÈTRES
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


// ─────────────────────────────────────────────────────────────────────────────
// 13. KPIs DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * KPIs globaux du tableau de bord admin.
 * Retourne : { medecins_actifs, demandes_en_attente, consultations_total, precision_ia }
 * GET /api/admin/stats/kpis
 */
export async function getKpis() {
  return request("GET", "/api/admin/stats/kpis", null, true);
}


// ─────────────────────────────────────────────────────────────────────────────
// 14. JOURNAL D'AUDIT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entrées du journal d'audit avec filtres optionnels.
 * Chaque entrée : { id, date (ISO), acteur, role, action, cible, ip, ville, statut }
 * GET /api/admin/audit/logs?type=Connexion&statut=success
 */
export async function getAuditLogs(type = "", statut = "") {
  const p = new URLSearchParams();
  if (type   && type   !== "Tous") p.append("type",   type);
  if (statut && statut !== "Tous") p.append("statut", statut);
  const qs = p.toString() ? `?${p}` : "";
  return request("GET", `/api/admin/audit/logs${qs}`, null, true);
}

/**
 * Supprime les entrées du journal antérieures à N jours (0 = tout purger).
 * DELETE /api/admin/audit/logs/purger
 */
export async function purgerAuditLogs(days = 30) {
  return request("DELETE", "/api/admin/audit/logs/purger", { days }, true);
}

export async function getAdminNotifications(nonLuesSeulement = false) {
  return request("GET", `/api/admin/notifications${nonLuesSeulement ? "?non_lues_seulement=true" : ""}`, null, true);
}

// ── 13. Requêtes Médecins ─────────────────────────────────────────────────────
export async function getRequetesMedecins(statut = "") {
  const qs = statut ? `?statut=${encodeURIComponent(statut)}` : "";
  return request("GET", `/api/admin/requetes${qs}`, null, true);
}

export async function countRequetesEnAttente() {
  return request("GET", "/api/admin/requetes/count", null, true);
}

export async function repondreRequete(reqId, body) {
  return request("PUT", `/api/admin/requetes/${reqId}/repondre`, body, true);
}

export async function modifierReponseRequete(reqId, body) {
  return request("PUT", `/api/admin/requetes/${reqId}/modifier-reponse`, body, true);
}

export async function changerStatutRequete(reqId, statut) {
  return request("PUT", `/api/admin/requetes/${reqId}/statut`, { statut }, true);
}

