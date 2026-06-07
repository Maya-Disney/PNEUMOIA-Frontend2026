// src/services/offlineManager.js
// ================================================================
// Gestionnaire offline-first — IndexedDB + sync automatique
// ================================================================

const DB_NAME    = 'pneumoia-offline';
const DB_VERSION = 2;

function ouvrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('patients_pending')) {
        db.createObjectStore('patients_pending', { keyPath: 'local_id' });
      }
      if (!db.objectStoreNames.contains('consultations_pending')) {
        db.createObjectStore('consultations_pending', { keyPath: 'local_id' });
      }
      if (!db.objectStoreNames.contains('actions_pending')) {
        const store = db.createObjectStore('actions_pending', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbAdd(store, data) {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetAll(store) {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbDelete(store, key) {
  const db = await ouvrirDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── Générer un ID local temporaire ────────────────────────────────
export function genLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Vérifier si c'est une erreur réseau ───────────────────────────
export function isNetworkError(err) {
  if (!err) return false;
  if (err.name === 'TypeError' || err.name === 'AbortError' || err.name === 'NetworkError') return true;
  if (err.message === 'offline') return true;
  if (typeof err.message === 'string') {
    const msg = err.message.toLowerCase();
    return msg.includes('failed to fetch')
        || msg.includes('network')
        || msg.includes('err_internet')
        || msg.includes('err_connection')
        || msg.includes('connexion')
        || msg.match(/erreur (0|5\d\d|408|429)/) !== null;
  }
  return false;
}

// ── Sauvegarder une action en attente ─────────────────────────────
export async function sauvegarderAction(type, payload) {
  const id = await dbAdd('actions_pending', {
    type,
    payload,
    timestamp: Date.now(),
  });
  console.log(`📦 Action offline [${type}] sauvegardée, id=${id}`);
  return id;
}

// ── Synchroniser avec le serveur ──────────────────────────────────
export async function synchroniserAvecServeur() {
  const actions = await dbGetAll('actions_pending');
  if (!actions.length) {
    console.log('Aucune action en attente de synchronisation');
    return;
  }

  const token = localStorage.getItem('pneumoia_token')
             || localStorage.getItem('token')
             || localStorage.getItem('access_token');
  const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  console.log(`🔄 Synchronisation de ${actions.length} action(s) offline...`);

  // Map IDs locaux → IDs serveur, persisté sur toute la session de sync
  const idMap = {};
  // IDs bloqués suite à un échec critique (ex: CREATE_PATIENT raté)
  const blockedLocalIds = new Set();

  for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      // Vérifier si cette action dépend d'un ID bloqué
      const depId = action.payload.patient_local_id
                 || action.payload.consultation_local_id;
      if (depId && blockedLocalIds.has(depId)) {
        console.warn(`⏭️  [${action.type}] ignorée — dépendance bloquée (${depId})`);
        continue; // Ne pas supprimer, réessayer à la prochaine sync
      }

      // ── CREATE_PATIENT ───────────────────────────────────────────
      if (action.type === 'CREATE_PATIENT') {
        const r = await fetch(`${BASE}/patients`, {
          method: 'POST', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Patient: ${r.status}`);
        const p = await r.json();
        idMap[action.payload.local_id] = p.id;
        console.log(`✅ Patient créé: ${action.payload.local_id} → ${p.id}`);
      }

      // ── UPDATE_PATIENT (retour étape 1 pour modifier) ────────────
      else if (action.type === 'UPDATE_PATIENT') {
        // Résoudre l'ID réel si c'était un local_id
        const realPatientId = idMap[action.payload.local_id] || action.payload.local_id;

        if (String(realPatientId).startsWith('local-')) {
          // L'ID local n'a pas encore été résolu → chercher dans un CREATE_PATIENT précédent
          // qui aurait déjà été traité. Si pas trouvé, on skip sans bloquer.
          console.warn(`⏭️  UPDATE_PATIENT ignoré — patient local pas encore créé (${realPatientId})`);
          await dbDelete('actions_pending', action.id); // pas critique, skip proprement
          continue;
        }

        const r = await fetch(`${BASE}/patients/${realPatientId}`, {
          method: 'PATCH', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Patient update: ${r.status}`);
        console.log(`✅ Patient mis à jour: ${realPatientId}`);
      }

      // ── CREATE_CONSULTATION ──────────────────────────────────────
      else if (action.type === 'CREATE_CONSULTATION') {
        const patientId = idMap[action.payload.patient_local_id]
                       ?? action.payload.patient_id;

        if (!patientId || String(patientId).startsWith('local-')) {
          throw new Error(`patient_id non résolu: ${patientId}`);
        }

        const r = await fetch(`${BASE}/consultations`, {
          method: 'POST', headers,
          body: JSON.stringify({ patient_id: patientId }),
        });
        if (!r.ok) throw new Error(`Consultation: ${r.status}`);
        const c = await r.json();
        idMap[action.payload.local_id] = c.id;
        console.log(`✅ Consultation créée: ${action.payload.local_id} → ${c.id}`);
      }

      // ── SAVE_DIAGNOSTIC (résultat IA offline) ────────────────────
      else if (action.type === 'SAVE_DIAGNOSTIC') {
        const consId = idMap[action.payload.consultation_local_id]
                    ?? action.payload.consultation_id;

        if (!consId || String(consId).startsWith('local-')) {
          throw new Error(`consultation_id non résolu pour diagnostic: ${consId}`);
        }

        const r = await fetch(`${BASE}/diagnostic/predict-and-save`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...action.payload.data,
            consultation_id: consId,   // ← remplacer le local_id par le vrai
          }),
        });
        if (!r.ok) throw new Error(`Diagnostic: ${r.status}`);
        const diagResult = await r.json();

        // Mémoriser le vrai diagnostic_id pour SAVE_FEEDBACK qui suit
        if (action.payload.local_diagnostic_id && diagResult.diagnostic_id) {
          idMap[action.payload.local_diagnostic_id] = diagResult.diagnostic_id;
        }
        console.log(`✅ Diagnostic synchronisé → consultation ${consId} (${diagResult.diagnostic_id})`);
      }

      // ── SAVE_FEEDBACK (concordance médecin) ──────────────────────
      else if (action.type === 'SAVE_FEEDBACK') {
        // Résoudre le vrai diagnostic_id si c'était un ID offline
        const diagId = idMap[action.payload.local_diagnostic_id]
                    ?? action.payload.diagnostic_id;

        if (!diagId || String(diagId).startsWith('offline-')) {
          // Le diagnostic n'a pas encore été synchronisé → bloquer
          throw new Error(`diagnostic_id non résolu pour feedback: ${diagId}`);
        }

        const r = await fetch(`${BASE}/diagnostic/${diagId}/feedback`, {
          method: 'POST',
          headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Feedback: ${r.status}`);
        console.log(`✅ Feedback synchronisé → diagnostic ${diagId}`);
      }

      // ── SAVE_ANTECEDENTS ─────────────────────────────────────────
      else if (action.type === 'SAVE_ANTECEDENTS') {
        const consId = idMap[action.payload.consultation_local_id]
                    ?? action.payload.consultation_id;

        if (!consId || String(consId).startsWith('local-')) {
          throw new Error(`consultation_id non résolu: ${consId}`);
        }

        const r = await fetch(`${BASE}/consultations/${consId}/antecedents`, {
          method: 'PATCH', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Antécédents: ${r.status}`);
        console.log(`✅ Antécédents synchronisés → consultation ${consId}`);
      }

      // ── SAVE_SYMPTOMES ───────────────────────────────────────────
      else if (action.type === 'SAVE_SYMPTOMES') {
        const consId = idMap[action.payload.consultation_local_id]
                    ?? action.payload.consultation_id;

        if (!consId || String(consId).startsWith('local-')) {
          throw new Error(`consultation_id non résolu: ${consId}`);
        }

        const r = await fetch(`${BASE}/consultations/${consId}/symptomes`, {
          method: 'PATCH', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Symptômes: ${r.status}`);
        console.log(`✅ Symptômes synchronisés → consultation ${consId}`);
      }

      // ── SAVE_OPINION ─────────────────────────────────────────────
      else if (action.type === 'SAVE_OPINION') {
        const consId = idMap[action.payload.consultation_local_id]
                    ?? action.payload.consultation_id;

        if (!consId || String(consId).startsWith('local-')) {
          throw new Error(`consultation_id non résolu: ${consId}`);
        }

        const r = await fetch(`${BASE}/consultations/${consId}/opinion`, {
          method: 'POST', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Opinion: ${r.status}`);
        console.log(`✅ Opinion synchronisée → consultation ${consId}`);
      }

      // Succès → supprimer de la file
      await dbDelete('actions_pending', action.id);

    } catch (err) {
      console.error(`❌ Échec sync [${action.type}]:`, err.message);

      // Bloquer les actions dépendantes si c'est une action critique
      if (action.payload.local_id) {
        blockedLocalIds.add(action.payload.local_id);
        console.warn(`🔒 ID bloqué: ${action.payload.local_id}`);
      }
    }
  }

  console.log('✅ Synchronisation terminée', { idMap, blocked: [...blockedLocalIds] });
  return idMap;
}