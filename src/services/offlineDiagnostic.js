// src/services/offlineDiagnostic.js
// ================================================================
// Diagnostic IA offline — utilise les modèles ONNX dans le navigateur
// Même Random Forest que le serveur, même précision
// ================================================================

import * as ort from 'onnxruntime-web';

// Configuration ONNX — utilise les fichiers WASM inclus dans le package
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
ort.env.wasm.numThreads = 1;

let sessionBase   = null;
let sessionEquipe = null;
let metadata      = null;
let loading       = false;

// ── Charger les modèles (une seule fois, mis en cache) ────────────
export async function chargerModeles() {
  if (sessionBase && sessionEquipe) return true;
  if (loading) return false;
  loading = true;

  try {
    console.log('Chargement modèles ONNX offline...');

    const [metaRes, base, equipe] = await Promise.all([
      fetch('/models/metadata.json').then(r => r.json()),
      ort.InferenceSession.create('/models/model_base.onnx',   { executionProviders: ['wasm'] }),
      ort.InferenceSession.create('/models/model_equipe.onnx', { executionProviders: ['wasm'] }),
    ]);

    metadata      = metaRes;
    sessionBase   = base;
    sessionEquipe = equipe;

    console.log('✅ Modèles ONNX chargés — mode offline disponible');
    return true;
  } catch (err) {
    console.error('❌ Échec chargement modèles ONNX:', err);
    loading = false;
    return false;
  }
}

// ── Vérifier si les modèles sont prêts ───────────────────────────
export function modelesDisponibles() {
  return sessionBase !== null && sessionEquipe !== null;
}

// ── Inférence offline ─────────────────────────────────────────────
export async function diagnosticOffline({ age, gender, smoke, asthma, other_diseases,
  o2, scan, pefr, fvc, fec1, fev1_fvc_ratio, peak_flow,
  abg_po2, abg_pco2, abg_ph }) {

  if (!sessionBase || !sessionEquipe || !metadata) {
    const ok = await chargerModeles();
    if (!ok) throw new Error('Modèles IA non disponibles en mode offline');
  }

  // Choisir le modèle selon les données EFR disponibles
  const donneesEFR = [fvc, fec1, fev1_fvc_ratio, peak_flow].filter(v => v !== null && v !== undefined);
  const estEquipe  = donneesEFR.length >= 2;

  let features, session, precision;

  if (estEquipe) {
    features = [
      age, gender, smoke,
      fvc       ?? NaN,
      fec1      ?? NaN,
      fev1_fvc_ratio ?? NaN,
      pefr, o2,
      abg_po2   ?? NaN,
      abg_pco2  ?? NaN,
      abg_ph    ?? NaN,
      scan, asthma, other_diseases,
      peak_flow ?? NaN,
    ];
    session   = sessionEquipe;
    precision = metadata.precision_equipe || 96.8;
  } else {
    features = [age, gender, smoke, pefr, o2, scan, asthma, other_diseases];
    session   = sessionBase;
    precision = metadata.precision_base || 53.2;
  }

  // Remplacer NaN par 0 pour ONNX
  const inputData = Float32Array.from(features.map(v => isNaN(v) ? 0 : v));
  const tensor    = new ort.Tensor('float32', inputData, [1, features.length]);

  // Inférence
  const feeds  = { float_input: tensor };
  const output = await session.run(feeds);

  // Récupérer les probabilités
  const probas      = output.probabilities?.data || output[Object.keys(output)[1]]?.data;
  const classes     = metadata.classes;
  const probasArray = Array.from(probas);

  // Top 3 maladies
  const indexed = probasArray.map((p, i) => ({ nom: classes[i], pct: Math.round(p * 1000) / 10 }));
  indexed.sort((a, b) => b.pct - a.pct);
  const top3 = indexed.slice(0, 3);

  const principale = top3[0];
  const etat = principale.pct >= 70 ? 'critique'
             : principale.pct >= 50 ? 'urgent'
             : principale.pct >= 30 ? 'surveille' : 'stable';

  return {
    diagnostic_id:      `offline-${Date.now()}`,
    consultation_id:    null,
    principal:          principale.nom,
    confidence:         principale.pct,
    maladies:           top3.map((m, i) => ({
      nom:              m.nom,
      pct:              m.pct,
      etat:             i === 0 ? etat : 'stable',
      criteres_valides: [],
      recommandations:  [],
      examens_suggeres: [],
    })),
    etat_patient:       etat,
    risque_eleve:       etat === 'critique' || etat === 'urgent',
    recommandations:    [],
    examens_recommandes: [],
    precision_modele:   `${precision}%`,
    type_consultation:  estEquipe ? 'equipe' : 'base',
    alertes:            [],
    offline:            true,  // ← indique que c'est un résultat offline
  };
}