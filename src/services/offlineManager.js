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
  return err.name === 'TypeError'
      || err.name === 'AbortError'
      || err.message === 'Failed to fetch'
      || (err.message && err.message.includes('ERR_INTERNET'));
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

  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  const BASE  = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  console.log(`🔄 Synchronisation de ${actions.length} action(s) offline...`);

  // Map IDs locaux → IDs serveur
  const idMap = {};

  for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      let serverRes;

      if (action.type === 'CREATE_PATIENT') {
        const r = await fetch(`${BASE}/patients`, {
          method: 'POST', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Patient: ${r.status}`);
        const p = await r.json();
        idMap[action.payload.local_id] = p.id;
        console.log(`✅ Patient: ${action.payload.local_id} → ${p.id}`);
      }

      else if (action.type === 'CREATE_CONSULTATION') {
        const patientId = idMap[action.payload.patient_local_id] || action.payload.patient_id;
        const r = await fetch(`${BASE}/consultations`, {
          method: 'POST', headers,
          body: JSON.stringify({ patient_id: patientId }),
        });
        if (!r.ok) throw new Error(`Consultation: ${r.status}`);
        const c = await r.json();
        idMap[action.payload.local_id] = c.id;
        console.log(`✅ Consultation: ${action.payload.local_id} → ${c.id}`);
      }

      else if (action.type === 'SAVE_ANTECEDENTS') {
        const consId = idMap[action.payload.consultation_local_id] || action.payload.consultation_id;
        const r = await fetch(`${BASE}/consultations/${consId}/antecedents`, {
          method: 'PATCH', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Antécédents: ${r.status}`);
        console.log(`✅ Antécédents synchronisés`);
      }

      else if (action.type === 'SAVE_SYMPTOMES') {
        const consId = idMap[action.payload.consultation_local_id] || action.payload.consultation_id;
        const r = await fetch(`${BASE}/consultations/${consId}/symptomes`, {
          method: 'PATCH', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Symptômes: ${r.status}`);
        console.log(`✅ Symptômes synchronisés`);
      }

      else if (action.type === 'SAVE_OPINION') {
        const consId = idMap[action.payload.consultation_local_id] || action.payload.consultation_id;
        const r = await fetch(`${BASE}/consultations/${consId}/opinion`, {
          method: 'POST', headers,
          body: JSON.stringify(action.payload.data),
        });
        if (!r.ok) throw new Error(`Opinion: ${r.status}`);
        console.log(`✅ Opinion synchronisée`);
      }

      await dbDelete('actions_pending', action.id);

    } catch (err) {
      console.error(`❌ Échec sync [${action.type}]:`, err.message);
    }
  }

  console.log('✅ Synchronisation terminée');
  return idMap;
}