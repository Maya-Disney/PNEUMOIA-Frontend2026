// src/features/medecin/pages/ConsultationHistory.jsx
import { useState, useEffect, useCallback } from 'react';
import { TablePagination } from '../../../components/ui/TablePagination';
import {
  Search, Calendar, Clock, User, Stethoscope,
  FileText, ChevronRight, Download, Eye,
  CheckCircle, XCircle, AlertCircle, AlertTriangle,
  LayoutGrid, List, X, Brain, Pill, Activity,
  Thermometer, Wind, Heart, Droplet, Microscope,
  ClipboardList, Info, Zap, Target, MessageSquare,
  Lock, Loader2, RefreshCw, MapPin, Briefcase, Globe,
  HeartPulse, TrendingUp, Syringe
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiFetch = async (endpoint) => {
  const token = localStorage.getItem('pneumoia_token')
             || localStorage.getItem('access_token')
             || localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '—';
const formatDateTime = (d) => d ? `${formatDate(d)} à ${formatTime(d)}` : '—';

const STATUT_CFG = {
  terminee:   { label: 'Terminée',    icon: CheckCircle,   cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  en_attente: { label: 'En attente',  icon: AlertCircle,   cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  annulee:    { label: 'Annulée',     icon: XCircle,       cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const CLINIQUE_CFG = {
  stable:    { label: 'Stable',    dot: 'bg-emerald-500', cls: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' },
  surveille: { label: 'Surveillé', dot: 'bg-blue-500',    cls: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' },
  urgent:    { label: 'Urgent',    dot: 'bg-amber-500',   cls: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30' },
  critique:  { label: 'Critique',  dot: 'bg-red-500',     cls: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' },
};

const RELIGION_RESTRICTIONS = {
  temoin_jehovah: {
    label: '⚠️ Témoin de Jéhovah',
    restrictions: ['Transfusion sanguine refusée', 'Produits dérivés du sang refusés'],
    cls: 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-200',
  },
};

// ── Couleurs Section (statiques pour Tailwind JIT) ────────────────
const SECTION_ICON_CLS = {
  blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  indigo:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  rose:    'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  teal:    'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  violet:  'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  slate:   'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
  purple:  'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

// ── Section info réutilisable ─────────────────────────────────────
const Section = ({ title, icon: Icon, children, color = 'blue' }) => {
  const iconCls = SECTION_ICON_CLS[color] || SECTION_ICON_CLS.blue;
  return (
    <div className="rounded-xl border border-(--ln) overflow-hidden">
      <div className="px-4 py-2.5 bg-(--sf2) border-b border-(--ln) flex items-center gap-2">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconCls}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-(--t3)">{title}</span>
      </div>
      <div className="p-4 bg-(--sf)">{children}</div>
    </div>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-(--ln) last:border-0">
    <span className="text-xs text-(--t4)">{label}</span>
    <span className={`text-xs font-semibold text-(--t1) ${highlight || ''}`}>{value || '—'}</span>
  </div>
);

const Tag = ({ children, color = 'blue' }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-${color}-50 text-${color}-700 dark:bg-${color}-500/10 dark:text-${color}-300`}>
    {children}
  </span>
);

// ── Modal détails ─────────────────────────────────────────────────
function ConsultationModal({ consultation: c, onClose, onDownload }) {
  if (!c) return null;

  const statut    = STATUT_CFG[c.statut]    || STATUT_CFG.en_attente;
  const StatIcon  = statut.icon;
  const clinique  = CLINIQUE_CFG[c.statut_clinique] || CLINIQUE_CFG.stable;

  const sym       = c.symptomes      || {};
  const diag      = c.diagnostic     || null;
  const fb        = c.feedback        || null;
  const presc     = c.prescriptions  || {};
  const maladies  = diag?.maladies   || [];
  const principale = maladies[0];
  const differentiels = maladies.slice(1);

  const patient   = c.patient        || {};
  const medecin   = c.medecin        || {};
  const religion  = patient.religion;
  const restriction = RELIGION_RESTRICTIONS[religion];

  // Allergies
  const allergies      = patient.allergies || [];
  const allergieMed    = c.antecedents_consultation?.allergie_medicaments;
  const traitementCours = c.antecedents_consultation?.traitement_en_cours;

  // Vitaux anormaux
  const spo2     = parseFloat(sym.saturation_o2);
  const temp     = parseFloat(sym.temperature);
  const fc       = parseFloat(sym.frequence_cardiaque);
  const fr       = parseFloat(sym.frequence_respiratoire);

  const isOtherMedecin = c.is_shared; // consultation d'un autre médecin partagée

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-(--ln) bg-(--sf2) sticky top-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-(--t1)">Détails de la consultation</h2>
              <p className="text-xs text-(--t4)">{formatDateTime(c.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statut.cls}`}>
              <StatIcon className="w-3 h-3" />{statut.label}
            </span>
            {c.statut_clinique && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${clinique.cls}`}>
                <span className={`w-2 h-2 rounded-full ${clinique.dot}`} />{clinique.label}
              </span>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-(--sf3) transition-colors ml-2">
              <X className="w-4 h-4 text-(--t3)" />
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Bannière consultation partagée */}
          {isOtherMedecin && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl text-xs text-purple-800 dark:text-purple-200">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Consultation partagée par <strong>Dr. {medecin.prenom} {medecin.nom}</strong> — lecture seule</span>
            </div>
          )}

          {/* Restriction religieuse */}
          {restriction && (
            <div className={`rounded-xl p-3 border ${restriction.cls} flex items-start gap-2`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">{restriction.label}</p>
                {restriction.restrictions.map((r, i) => (
                  <p key={i} className="text-[10px] mt-0.5">• {r}</p>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {(allergies.length > 0 || allergieMed) && (
            <div className="rounded-xl p-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800 dark:text-red-200">Allergies / Contre-indications</p>
                {allergieMed && <p className="text-[10px] text-red-700 dark:text-red-300 mt-0.5">Médicaments : {allergieMed}</p>}
                {allergies.map((a, i) => <p key={i} className="text-[10px] text-red-700 dark:text-red-300">• {a}</p>)}
              </div>
            </div>
          )}

          {/* Patient + Médecin */}
          <div className="grid md:grid-cols-2 gap-4">
            <Section title="Patient" icon={User}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {patient.prenom?.[0]}{patient.nom?.[0]}
                </div>
                <div>
                  <p className="font-bold text-sm text-(--t1)">{patient.civilite} {patient.prenom} {patient.nom}</p>
                  <p className="text-xs text-(--t4)">{patient.age ? `${patient.age} ans` : '—'} · {patient.adresse || '—'}</p>
                </div>
              </div>
              <InfoRow label="Groupe sanguin"  value={patient.groupe_sanguin} />
              <InfoRow label="Téléphone"        value={patient.telephone} />
              <InfoRow label="Religion"         value={patient.religion} />
              <InfoRow label="Contact urgence"  value={patient.personne_a_contacter} />
              {traitementCours && <InfoRow label="Traitements en cours" value={traitementCours} />}
            </Section>

            <Section title="Médecin" icon={Stethoscope} color="indigo">
              <InfoRow label="Nom"        value={`Dr. ${medecin.prenom || ''} ${medecin.nom || ''}`} />
              <InfoRow label="Spécialité" value={medecin.specialite} />
              <InfoRow label="Ville"      value={medecin.ville} />
              <div className="mt-3 pt-3 border-t border-(--ln)">
                <InfoRow label="Date"   value={formatDate(c.created_at)} />
                <InfoRow label="Heure"  value={formatTime(c.created_at)} />
                <InfoRow label="Statut avis" value={c.statut === 'terminee' ? '✅ Avis donné' : '⏳ En attente d\'avis'} />
              </div>
            </Section>
          </div>

          {/* Signes vitaux */}
          {(sym.temperature || sym.saturation_o2 || sym.frequence_cardiaque || sym.frequence_respiratoire) && (
            <Section title="Signes vitaux" icon={HeartPulse} color="rose">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {sym.temperature && (
                  <div className={`rounded-lg p-3 border text-center ${temp >= 38.5 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 'bg-(--sf2) border-(--ln)'}`}>
                    <Thermometer className={`w-4 h-4 mx-auto mb-1 ${temp >= 38.5 ? 'text-red-500' : 'text-(--t4)'}`} />
                    <p className="text-xs text-(--t4)">Temp.</p>
                    <p className={`text-sm font-bold ${temp >= 38.5 ? 'text-red-600 dark:text-red-400' : 'text-(--t1)'}`}>{sym.temperature}°C</p>
                  </div>
                )}
                {sym.saturation_o2 && (
                  <div className={`rounded-lg p-3 border text-center ${spo2 < 94 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 'bg-(--sf2) border-(--ln)'}`}>
                    <Droplet className={`w-4 h-4 mx-auto mb-1 ${spo2 < 94 ? 'text-red-500' : 'text-(--t4)'}`} />
                    <p className="text-xs text-(--t4)">SpO₂</p>
                    <p className={`text-sm font-bold ${spo2 < 94 ? 'text-red-600 dark:text-red-400' : 'text-(--t1)'}`}>{sym.saturation_o2}%</p>
                  </div>
                )}
                {sym.frequence_cardiaque && (
                  <div className="rounded-lg p-3 border bg-(--sf2) border-(--ln) text-center">
                    <Heart className="w-4 h-4 mx-auto mb-1 text-(--t4)" />
                    <p className="text-xs text-(--t4)">FC</p>
                    <p className="text-sm font-bold text-(--t1)">{sym.frequence_cardiaque} bpm</p>
                  </div>
                )}
                {sym.frequence_respiratoire && (
                  <div className="rounded-lg p-3 border bg-(--sf2) border-(--ln) text-center">
                    <Wind className="w-4 h-4 mx-auto mb-1 text-(--t4)" />
                    <p className="text-xs text-(--t4)">FR</p>
                    <p className="text-sm font-bold text-(--t1)">{sym.frequence_respiratoire}/min</p>
                  </div>
                )}
              </div>
              {/* EFR */}
              {(sym.fvc || sym.fec1) && (
                <div className="mt-3 pt-3 border-t border-(--ln) grid grid-cols-3 gap-2">
                  {sym.fvc  && <div className="text-center p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg"><p className="text-[10px] text-purple-600 dark:text-purple-400">FVC</p><p className="text-sm font-bold text-purple-700 dark:text-purple-300">{sym.fvc} L</p></div>}
                  {sym.fec1 && <div className="text-center p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg"><p className="text-[10px] text-purple-600 dark:text-purple-400">FEV1</p><p className="text-sm font-bold text-purple-700 dark:text-purple-300">{sym.fec1} L</p></div>}
                  {sym.fvc && sym.fec1 && (
                    <div className={`text-center p-2 rounded-lg ${(sym.fec1/sym.fvc) < 0.7 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                      <p className="text-[10px] text-(--t4)">VEMS/CVF</p>
                      <p className={`text-sm font-bold ${(sym.fec1/sym.fvc) < 0.7 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {(sym.fec1/sym.fvc).toFixed(2)}
                        {(sym.fec1/sym.fvc) < 0.7 && <span className="ml-1 text-[10px]">⚠️</span>}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Motif + symptômes */}
          {sym.motif && (
            <Section title="Motif & Symptômes" icon={ClipboardList} color="teal">
              <p className="text-sm text-(--t2) mb-3 italic">"{sym.motif}"</p>
              <div className="flex flex-wrap gap-1.5">
                {sym.fievre          && <Tag color="red">Fièvre {sym.fievre_temperature && `${sym.fievre_temperature}°C`}</Tag>}
                {sym.toux            && <Tag color="orange">Toux {sym.toux_type}</Tag>}
                {sym.toux_sang       && <Tag color="red">Crachats sanglants</Tag>}
                {sym.dyspnee         && <Tag color="amber">Dyspnée stade {sym.dyspnee_stade}</Tag>}
                {sym.douleur_thoracique && <Tag color="red">Douleur thoracique</Tag>}
                {sym.wheezing        && <Tag color="purple">Wheezing</Tag>}
                {sym.hemoptysie      && <Tag color="red">Hémoptysie</Tag>}
                {sym.fatigue         && <Tag color="slate">Fatigue</Tag>}
                {sym.perte_poids     && <Tag color="slate">Perte de poids</Tag>}
                {sym.sueurs_nocturnes && <Tag color="blue">Sueurs nocturnes</Tag>}
                {sym.crepitants      && <Tag color="indigo">Crépitants</Tag>}
                {sym.sibilants       && <Tag color="indigo">Sibilants</Tag>}
              </div>
            </Section>
          )}

          {/* Diagnostic IA */}
          {diag && (
            <Section title="Diagnostic IA" icon={Brain} color="blue">
              {/* Modèle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    diag.type_consultation === 'equipe'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-600/40 text-slate-600 dark:text-slate-300'
                  }`}>
                    {diag.type_consultation === 'equipe' ? `⚡ Modèle équipé · ${diag.version_modele}` : `○ Modèle de base · ${diag.version_modele}`}
                  </span>
                </div>
              </div>

              {/* Principale */}
              {principale && (
                <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/40 rounded-xl text-center">
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{principale.nom}</p>
                  <div className="flex justify-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-200 rounded-full font-medium">
                      Confiance : {principale.pct}%
                    </span>
                    {principale.etat && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${CLINIQUE_CFG[principale.etat]?.cls || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}>
                        {CLINIQUE_CFG[principale.etat]?.label || principale.etat}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-800/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all" style={{ width: `${principale.pct}%` }} />
                  </div>
                </div>
              )}

              {/* Différentiels */}
              {differentiels.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4)">Diagnostics différentiels</p>
                  {differentiels.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-(--t2) w-32 truncate">{d.nom}</span>
                      <div className="flex-1 h-1.5 bg-(--sf2) rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 dark:bg-blue-500 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 w-10 text-right">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Examens recommandés */}
              {diag.examens_recommandes?.length > 0 && (
                <div className="pt-3 border-t border-(--ln)">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-2">Examens recommandés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diag.examens_recommandes.map((e, i) => <Tag key={i} color="purple">{e}</Tag>)}
                  </div>
                </div>
              )}

              {/* Recommandations IA */}
              {diag.recommandations?.length > 0 && (
                <div className="pt-3 border-t border-(--ln) mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-2">Recommandations IA</p>
                  <div className="space-y-1">
                    {diag.recommandations.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-(--t2)">
                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Avis médecin */}
          {fb && (
            <Section title="Avis du médecin" icon={MessageSquare} color="emerald">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  fb.concordance
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                }`}>
                  {fb.concordance
                    ? <><CheckCircle className="w-3.5 h-3.5" /> Concordant avec l'IA</>
                    : <><XCircle className="w-3.5 h-3.5" /> Divergent de l'IA</>
                  }
                </div>
                {fb.diagnostic_final && (
                  <span className="text-xs font-bold text-(--t1)">→ {fb.diagnostic_final}</span>
                )}
              </div>
              {fb.commentaire && (
                <p className="text-xs text-(--t2) italic bg-(--sf2) rounded-lg p-3">"{fb.commentaire}"</p>
              )}
            </Section>
          )}

          {/* Prescription */}
          {(presc.medicaments || presc.conseils_maison || presc.recommandations) && (
            <Section title="Prescription" icon={Pill} color="violet">
              {presc.medicaments && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1.5">Médicaments</p>
                  <p className="text-sm text-(--t2) bg-(--sf2) rounded-lg p-3 whitespace-pre-line">{presc.medicaments}</p>
                </div>
              )}
              {presc.conseils_maison && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1.5">Conseils à domicile</p>
                  <p className="text-sm text-(--t2) bg-(--sf2) rounded-lg p-3 whitespace-pre-line">{presc.conseils_maison}</p>
                </div>
              )}
              {presc.recommandations && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1.5">Recommandations</p>
                  <p className="text-sm text-(--t2) bg-(--sf2) rounded-lg p-3 whitespace-pre-line">{presc.recommandations}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-(--ln)">
                {presc.arret_travail && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-center">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Arrêt de travail</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{presc.duree_arret} jours</p>
                  </div>
                )}
                {presc.hospitalisation && (
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-center">
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">Hospitalisation</p>
                    <p className="text-xs text-red-700 dark:text-red-300">{presc.motif_hospitalisation || 'Recommandée'}</p>
                  </div>
                )}
                {presc.suivi && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg text-center">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Suivi</p>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{presc.suivi}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Observations médecin */}
          {c.avis_medecin && (
            <Section title="Observations du médecin" icon={FileText} color="slate">
              <p className="text-sm text-(--t2) italic">"{c.avis_medecin}"</p>
            </Section>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--ln) bg-(--sf2) flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-(--t2) hover:bg-(--sf) rounded-lg transition-colors">
            Fermer
          </button>
          <button onClick={() => onDownload(c.id)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" /> Télécharger le rapport
          </button>
        </div>
      </div>
    </>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function ConsultationHistory() {
  const [consultations,  setConsultations]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode,       setViewMode]       = useState('cards');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage,   setItemsPerPage]   = useState(12);
  const [selected,       setSelected]       = useState(null);

  // ── Charger les consultations depuis l'API ────────────────────
  const loadConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await apiFetch('/consultations/historique');
      } catch {
        // Fallback si /historique n'existe pas encore
        data = await apiFetch('/consultations');
      }

      if (!Array.isArray(data)) { setConsultations([]); return; }

      // Dédupliquer par ID (protection contre double appel StrictMode)
      const seen = new Set();
      const unique = data.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });

      setConsultations(unique);
    } catch (err) {
      setError('Impossible de charger l\'historique des consultations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConsultations(); }, [loadConsultations]);

  // ── Télécharger PDF ───────────────────────────────────────────
  const handleDownload = async (consultationId) => {
    try {
      const token = localStorage.getItem('pneumoia_token') || localStorage.getItem('access_token') || localStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/consultations/${consultationId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('PDF non disponible');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `bilan_${consultationId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    }
  };

  // ── Filtrage ─────────────────────────────────────────────────
  const filtered = consultations.filter(c => {
    const patientName = c.patient ? `${c.patient.prenom} ${c.patient.nom}` : '';
    const diag        = c.diagnostic?.maladies?.[0]?.nom || '';
    const matchSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase())
                     || diag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = selectedFilter === 'all' || c.statut === selectedFilter;
    return matchSearch && matchFilter;
  });

  const totalPages  = Math.ceil(filtered.length / itemsPerPage);
  const paginated   = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatut = (c) => STATUT_CFG[c.statut] || STATUT_CFG.en_attente;
  const getDiag   = (c) => c.diagnostic?.maladies?.[0]?.nom || 'Pas de diagnostic';
  const getPct    = (c) => c.diagnostic?.maladies?.[0]?.pct || 0;
  const getPatientName = (c) => c.patient ? `${c.patient.prenom} ${c.patient.nom}` : '—';
  const getInitials    = (c) => c.patient ? `${c.patient.prenom?.[0] || ''}${c.patient.nom?.[0] || ''}` : '??';
  const getMedecin     = (c) => c.medecin ? `Dr. ${c.medecin.prenom} ${c.medecin.nom}` : '—';

  // ── Vue Cartes ────────────────────────────────────────────────
  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginated.map((c) => {
        const statut  = getStatut(c);
        const Icon    = statut.icon;
        const clinique = CLINIQUE_CFG[c.statut_clinique];
        return (
          <div key={c.id} onClick={() => setSelected(c)}
            className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden hover:shadow-md transition-all cursor-pointer group">
            <div className="p-4 border-b border-(--ln) bg-(--sf2) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(c)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-(--t1)">{getPatientName(c)}</h3>
                  <p className="text-xs text-(--t4)">{c.patient?.age ? `${c.patient.age} ans` : '—'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statut.cls}`}>
                  <Icon className="w-3 h-3" />{statut.label}
                </span>
                {clinique && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${clinique.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${clinique.dot}`} />{clinique.label}
                  </span>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-(--t4)">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(c.created_at)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(c.created_at)}</span>
              </div>
              <div>
                <p className="text-xs text-(--t4) mb-0.5">Diagnostic IA</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-(--t1)">{getDiag(c)}</p>
                  <span className="text-xs font-bold text-blue-600">{getPct(c)}%</span>
                </div>
                <div className="mt-1 h-1 bg-(--sf2) rounded-full">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${getPct(c)}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-(--t4) bg-(--sf2) px-2 py-1 rounded-lg">
                <User className="w-3 h-3" />{getMedecin(c)}
              </div>
            </div>
            <div className="px-4 py-3 bg-(--sf2) border-t border-(--ln) flex justify-between items-center">
              <span className="text-[10px] text-(--t4)">Présentiel</span>
              <span className="text-blue-600 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Vue Tableau ───────────────────────────────────────────────
  const TableView = () => (
    <div className="overflow-x-auto rounded-xl border border-(--ln)">
      <table className="w-full">
        <thead className="bg-(--sf2) border-b border-(--ln)">
          <tr>
            {['Patient', 'Date & Heure', 'Diagnostic IA', 'Médecin', 'Statut', ''].map(h => (
              <th key={h} className="text-left py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-(--t4)">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--ln)">
          {paginated.map((c) => {
            const statut   = getStatut(c);
            const Icon     = statut.icon;
            const clinique = CLINIQUE_CFG[c.statut_clinique];
            return (
              <tr key={c.id} onClick={() => setSelected(c)}
                className="hover:bg-(--sf2) transition-colors cursor-pointer">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(c)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-(--t1)">{getPatientName(c)}</p>
                      <p className="text-xs text-(--t4)">{c.patient?.age ? `${c.patient.age} ans` : '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-(--t2)">
                  <p>{formatDate(c.created_at)}</p>
                  <p className="text-(--t4)">{formatTime(c.created_at)}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-(--t1) font-medium">{getDiag(c)}</p>
                  <p className="text-xs text-blue-600 font-bold">{getPct(c)}%</p>
                </td>
                <td className="py-3 px-4 text-xs text-(--t2)">{getMedecin(c)}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${statut.cls}`}>
                      <Icon className="w-3 h-3" />{statut.label}
                    </span>
                    {clinique && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border w-fit ${clinique.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${clinique.dot}`} />{clinique.label}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1.5 rounded-lg hover:bg-(--sf3) transition-colors">
                    <Eye className="w-4 h-4 text-(--t4)" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Historique des consultations</h1>
          <p className="text-sm text-(--t4) mt-0.5">
            {loading ? 'Chargement...' : `${filtered.length} consultation${filtered.length > 1 ? 's' : ''} trouvée${filtered.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadConsultations}
            className="flex items-center gap-2 px-3 py-2 bg-(--sf) border border-(--ln) rounded-xl text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-(--sf) border border-(--ln) rounded-xl text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-all">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input type="text" placeholder="Rechercher par patient ou pathologie..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          <select value={selectedFilter} onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Tous les statuts</option>
            <option value="terminee">Terminées</option>
            <option value="en_attente">En attente</option>
            <option value="annulee">Annulées</option>
          </select>
          <div className="flex border border-(--ln) rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('cards')}
              className={`p-2 px-3 transition-all ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-(--sf) text-(--t3) hover:bg-(--sf2)'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')}
              className={`p-2 px-3 transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-(--sf) text-(--t3) hover:bg-(--sf2)'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* États */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />{error}
          <button onClick={loadConsultations} className="ml-auto text-xs underline">Réessayer</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-(--sf) rounded-xl border border-(--ln)">
          <FileText className="w-10 h-10 text-(--t4) mx-auto mb-3" />
          <p className="font-medium text-(--t2)">Aucune consultation trouvée</p>
          <p className="text-sm text-(--t4) mt-1">Modifiez vos critères de recherche</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        viewMode === 'cards' ? <CardsView /> : <TableView />
      )}

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <TablePagination
          total={filtered.length}
          page={currentPage}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={s => { setItemsPerPage(s); setCurrentPage(1); }}
        />
      )}

      {/* Modal */}
      <ConsultationModal
        consultation={selected}
        onClose={() => setSelected(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}