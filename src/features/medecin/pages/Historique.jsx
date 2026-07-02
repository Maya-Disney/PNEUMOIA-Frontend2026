// src/features/medecin/pages/Historique.jsx
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { TablePagination } from '../../../components/ui/TablePagination';
import {
  Search, Calendar, Clock, User, Stethoscope,
  FileText, ChevronRight, Download, Eye,
  CheckCircle, XCircle, AlertCircle, AlertTriangle,
  LayoutGrid, List, X, Brain, Pill, Activity,
  Thermometer, Wind, Heart, Droplet, Microscope,
  ClipboardList, Info, Zap, Target, MessageSquare,
  Lock, Loader2, RefreshCw, MapPin, Briefcase, Globe,
  HeartPulse, TrendingUp, Syringe, FolderOpen, ChevronDown
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

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' }) : '—';
const formatDateTime = (d) => d ? `${formatDate(d)} à ${formatTime(d)}` : '—';

const STATUT_CFG = {
  terminee:   { label: 'Terminée',   icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  en_attente: { label: 'En attente', icon: AlertCircle, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  annulee:    { label: 'Annulée',    icon: XCircle,     cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
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

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-(--ln) last:border-0">
    <span className="text-xs text-(--t4)">{label}</span>
    <span className="text-xs font-semibold text-(--t1)">{value || '—'}</span>
  </div>
);

const TAG_CLS = {
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  red:    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  orange: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
  amber:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
  slate:  'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  teal:   'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
};

const Tag = ({ children, color = 'blue' }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${TAG_CLS[color] || TAG_CLS.blue}`}>
    {children}
  </span>
);

// ── Modal détails d'une consultation ─────────────────────────────
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
  const allergies      = patient.allergies || [];
  const allergieMed    = c.antecedents_consultation?.allergie_medicaments;
  const traitementCours = c.antecedents_consultation?.traitement_en_cours;

  const spo2 = parseFloat(sym.saturation_o2);
  const temp = parseFloat(sym.temperature);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-(--sf) rounded-2xl shadow-2xl z-60 overflow-hidden max-h-[92vh] flex flex-col">
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

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {restriction && (
            <div className={`rounded-xl p-3 border ${restriction.cls} flex items-start gap-2`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">{restriction.label}</p>
                {restriction.restrictions.map((r, i) => <p key={i} className="text-[10px] mt-0.5">• {r}</p>)}
              </div>
            </div>
          )}
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
              <InfoRow label="Groupe sanguin" value={patient.groupe_sanguin} />
              <InfoRow label="Téléphone"       value={patient.telephone} />
              {traitementCours && <InfoRow label="Traitements en cours" value={traitementCours} />}
            </Section>
            <Section title="Médecin" icon={Stethoscope} color="indigo">
              <InfoRow label="Nom"        value={`Dr. ${medecin.prenom || ''} ${medecin.nom || ''}`} />
              <InfoRow label="Spécialité" value={medecin.specialite} />
              <div className="mt-3 pt-3 border-t border-(--ln)">
                <InfoRow label="Date"        value={formatDate(c.created_at)} />
                <InfoRow label="Heure"       value={formatTime(c.created_at)} />
                <InfoRow label="Statut avis" value={c.statut === 'terminee' ? '✅ Avis donné' : '⏳ En attente'} />
              </div>
            </Section>
          </div>

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
            </Section>
          )}

          {sym.motif && (
            <Section title="Motif & Symptômes" icon={ClipboardList} color="teal">
              <p className="text-sm text-(--t2) mb-3 italic">"{sym.motif}"</p>
              <div className="flex flex-wrap gap-1.5">
                {sym.fievre            && <Tag color="red">Fièvre</Tag>}
                {sym.toux              && <Tag color="orange">Toux {sym.toux_type}</Tag>}
                {sym.toux_sang         && <Tag color="red">Crachats sanglants</Tag>}
                {sym.dyspnee           && <Tag color="amber">Dyspnée stade {sym.dyspnee_stade}</Tag>}
                {sym.douleur_thoracique && <Tag color="red">Douleur thoracique</Tag>}
                {sym.wheezing          && <Tag color="purple">Wheezing</Tag>}
                {sym.hemoptysie        && <Tag color="red">Hémoptysie</Tag>}
                {sym.fatigue           && <Tag color="slate">Fatigue</Tag>}
                {sym.perte_poids       && <Tag color="slate">Perte de poids</Tag>}
                {sym.sueurs_nocturnes  && <Tag color="blue">Sueurs nocturnes</Tag>}
              </div>
            </Section>
          )}

          {diag && (
            <Section title="Diagnostic IA" icon={Brain} color="blue">
              {principale && (
                <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/40 rounded-xl text-center">
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{principale.nom}</p>
                  <div className="flex justify-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-800/60 text-blue-700 dark:text-blue-200 rounded-full font-medium">
                      Confiance : {principale.pct}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 bg-blue-100 dark:bg-blue-800/40 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: `${principale.pct}%` }} />
                  </div>
                </div>
              )}
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
              {/* Critères retenus par l'IA */}
              {(principale?.criteres_valides || []).length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-2">Critères retenus</p>
                  <div className="flex flex-wrap gap-1.5">
                    {principale.criteres_valides.map((cr, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-600/30">
                        ✓ {cr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Recommandations IA */}
              {(principale?.recommandations || diag?.recommandations || []).length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-2">Recommandations IA</p>
                  <ul className="space-y-1">
                    {(principale?.recommandations || diag?.recommandations || []).map((r, i) => (
                      <li key={i} className="text-xs text-(--t2) flex items-start gap-1.5">
                        <span className="text-blue-500 shrink-0 mt-0.5">→</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Examens recommandés */}
              {(diag?.examens_recommandes || []).length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-2">Examens recommandés</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diag.examens_recommandes.map((ex, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-600/30">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {fb && (
            <Section title="Avis du médecin" icon={MessageSquare} color="emerald">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit mb-2 ${
                fb.concordance
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              }`}>
                {fb.concordance
                  ? <><CheckCircle className="w-3.5 h-3.5" /> Concordant avec l'IA</>
                  : <><XCircle className="w-3.5 h-3.5" /> Divergent de l'IA</>
                }
              </div>
              {fb.diagnostic_final && <p className="text-xs font-bold text-(--t1) mb-1">→ {fb.diagnostic_final}</p>}
              {fb.commentaire && (
                <p className="text-xs text-(--t2) italic bg-(--sf2) rounded-lg p-3">"{fb.commentaire}"</p>
              )}
            </Section>
          )}

          {(presc.medicaments || presc.conseils_maison) && (
            <Section title="Prescription" icon={Pill} color="violet">
              {presc.medicaments && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1.5">Médicaments</p>
                  <p className="text-sm text-(--t2) bg-(--sf2) rounded-lg p-3 whitespace-pre-line">{presc.medicaments}</p>
                </div>
              )}
              {presc.conseils_maison && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1.5">Conseils à domicile</p>
                  <p className="text-sm text-(--t2) bg-(--sf2) rounded-lg p-3 whitespace-pre-line">{presc.conseils_maison}</p>
                </div>
              )}
            </Section>
          )}

          {c.avis_medecin && (
            <Section title="Observations du médecin" icon={FileText} color="slate">
              <p className="text-sm text-(--t2) italic">"{c.avis_medecin}"</p>
            </Section>
          )}
        </div>

        <div className="px-6 py-4 border-t border-(--ln) bg-(--sf2) flex justify-end gap-3 sticky bottom-0">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-(--t2) hover:bg-(--sf) rounded-lg transition-colors">
            Fermer
          </button>
          {c.statut === 'terminee' && (
            <button onClick={() => onDownload(c.id)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <FileText className="w-4 h-4" /> PDF cette consultation
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Modal dossier patient (liste de toutes ses consultations) ─────
function DossierPatientModal({ groupe, onClose, onDownloadDossier, onViewConsultation }) {
  if (!groupe) return null;
  const { patient, consultations } = groupe;
  const initials = `${patient.prenom?.[0] || ''}${patient.nom?.[0] || ''}`;
  const nbEnAttente = consultations.filter(c => c.statut === 'en_attente').length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-(--sf) rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--ln) bg-(--sf2) flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-(--t1)">{patient.civilite} {patient.prenom} {patient.nom}</h2>
              <p className="text-xs text-(--t4)">{patient.age ? `${patient.age} ans` : '—'} · {consultations.length} consultation{consultations.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => !nbEnAttente && onDownloadDossier(patient)}
              disabled={nbEnAttente > 0}
              title={nbEnAttente > 0 ? `${nbEnAttente} consultation${nbEnAttente > 1 ? 's sont' : ' est'} en attente de votre avis` : 'Télécharger le dossier complet PDF'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${nbEnAttente > 0 ? 'bg-(--sf3) text-(--t4) cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              <Download className="w-3.5 h-3.5" />
              {nbEnAttente > 0 ? `${nbEnAttente} en attente` : 'Dossier complet PDF'}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-(--sf3) transition-colors">
              <X className="w-4 h-4 text-(--t3)" />
            </button>
          </div>
        </div>

        {/* Liste des consultations */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {consultations.map((c, idx) => {
            const statut   = STATUT_CFG[c.statut] || STATUT_CFG.en_attente;
            const StatIcon = statut.icon;
            const clinique = CLINIQUE_CFG[c.statut_clinique];
            const diag     = c.diagnostic;
            const principale = diag?.maladies?.[0];

            return (
              <div key={c.id}
                className="bg-(--sf2) rounded-xl border border-(--ln) p-4 flex items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                    {consultations.length - idx}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-(--t1) truncate">
                        {principale?.nom || 'Pas de diagnostic'}
                      </p>
                      {principale?.pct && (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{principale.pct}%</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-(--t4) flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(c.created_at)}
                      </span>
                      <span className="text-xs text-(--t4) flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatTime(c.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {clinique && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${clinique.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${clinique.dot}`} />{clinique.label}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statut.cls}`}>
                    <StatIcon className="w-3 h-3" />{statut.label}
                  </span>
                  <button
                    onClick={() => onViewConsultation(c)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-(--sf) border border-(--ln) rounded-lg text-xs font-medium text-(--t2) hover:bg-(--sf3) transition-colors">
                    <Eye className="w-3 h-3" /> Voir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Page principale ───────────────────────────────────────────────
export default function ConsultationHistory() {
  const toast = useToast();
  const [consultations,  setConsultations]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [itemsPerPage,   setItemsPerPage]   = useState(12);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const loadConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try { data = await apiFetch('/consultations/historique'); }
      catch { data = await apiFetch('/consultations'); }

      if (!Array.isArray(data)) { setConsultations([]); return; }

      const seen = new Set();
      const unique = data.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
      setConsultations(unique);
    } catch (err) {
      setError('Impossible de charger l\'historique des consultations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConsultations(); }, [loadConsultations]);

  // ── Grouper par patient ───────────────────────────────────────
  const groupes = (() => {
    const map = {};
    consultations.forEach(c => {
      const pid = c.patient?.id || 'inconnu';
      if (!map[pid]) map[pid] = { patient: c.patient || {}, consultations: [] };
      map[pid].consultations.push(c);
    });
    return Object.values(map);
  })();

  // ── Filtrer les groupes ───────────────────────────────────────
  const filteredGroupes = groupes.filter(g => {
    const name = `${g.patient.prenom || ''} ${g.patient.nom || ''}`.toLowerCase();
    const anyDiag = g.consultations.some(c =>
      (c.diagnostic?.maladies?.[0]?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchSearch = name.includes(searchTerm.toLowerCase()) || anyDiag;
    const matchFilter = selectedFilter === 'all'
      || g.consultations.some(c => c.statut === selectedFilter);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredGroupes.length / itemsPerPage);
  const paginated  = filteredGroupes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Télécharger le dossier complet ───────────────────────────
  const handleDownloadDossier = async (patient) => {
    try {
      const token = localStorage.getItem('pneumoia_token') || localStorage.getItem('access_token') || localStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/patients/${patient.id}/dossier-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        toast.warning(data.detail || 'Téléchargement bloqué : une consultation est en attente de votre avis.');
        return;
      }
      if (!res.ok) { toast.error('PDF non disponible'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `dossier_${patient.nom}_${patient.prenom}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error('Erreur lors du téléchargement du dossier.');
    }
  };

  // ── Télécharger une seule consultation ────────────────────────
  const handleDownloadConsultation = async (consultationId) => {
    try {
      const token = localStorage.getItem('pneumoia_token') || localStorage.getItem('access_token') || localStorage.getItem('token');
      const res   = await fetch(`${BASE_URL}/consultations/${consultationId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        toast.warning(data.detail || 'Téléchargement bloqué : cette consultation est en attente de votre avis.');
        return;
      }
      if (!res.ok) { toast.error('PDF non disponible'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `consultation_${consultationId}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error('Erreur lors du téléchargement du bilan.');
    }
  };

  const getInitials = (p) => `${p.prenom?.[0] || ''}${p.nom?.[0] || ''}`;

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--t1)">Historique des dossiers</h1>
          <p className="text-sm text-(--t4) mt-0.5">
            {loading ? 'Chargement...' : `${filteredGroupes.length} patient${filteredGroupes.length > 1 ? 's' : ''} · ${consultations.length} consultation${consultations.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={loadConsultations}
          className="flex items-center gap-2 px-3 py-2 bg-(--sf) border border-(--ln) rounded-xl text-sm font-medium text-(--t2) hover:bg-(--sf2) transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
          <input type="text" placeholder="Rechercher par patient ou pathologie..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={selectedFilter} onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-sm border border-(--ln) rounded-xl bg-(--sf) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">Tous les statuts</option>
          <option value="terminee">Avec consultation terminée</option>
          <option value="en_attente">Avec consultation en attente</option>
        </select>
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
      {!loading && !error && filteredGroupes.length === 0 && (
        <div className="text-center py-16 bg-(--sf) rounded-xl border border-(--ln)">
          <FileText className="w-10 h-10 text-(--t4) mx-auto mb-3" />
          <p className="font-medium text-(--t2)">Aucun dossier trouvé</p>
          <p className="text-sm text-(--t4) mt-1">Modifiez vos critères de recherche</p>
        </div>
      )}

      {/* Grille patients */}
      {!loading && !error && paginated.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((g) => {
            const p   = g.patient;
            const nb  = g.consultations.length;
            const terminees  = g.consultations.filter(c => c.statut === 'terminee').length;
            const enAttente  = g.consultations.filter(c => c.statut === 'en_attente').length;
            const latest     = g.consultations[0];
            const latestDiag = latest?.diagnostic?.maladies?.[0];
            const hasCritique = g.consultations.some(c =>
              c.statut_clinique === 'critique' || c.statut_clinique === 'urgent'
            );

            return (
              <div key={p.id || Math.random()}
                onClick={() => setSelectedGroupe(g)}
                className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer group">
                {/* Header patient */}
                <div className="p-4 border-b border-(--ln) bg-(--sf2) flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                    {getInitials(p)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-(--t1) truncate">{p.civilite} {p.prenom} {p.nom}</h3>
                    <p className="text-xs text-(--t4)">{p.age ? `${p.age} ans` : '—'}</p>
                  </div>
                  {hasCritique && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-bold shrink-0">Critique</span>
                  )}
                </div>

                {/* Corps */}
                <div className="p-4 space-y-3">
                  {/* Dernière consultation */}
                  {latest && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-(--t4) mb-1">Dernière consultation</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-(--t1)">{latestDiag?.nom || 'Pas de diagnostic'}</p>
                        {latestDiag?.pct && <span className="text-xs font-bold text-blue-600">{latestDiag.pct}%</span>}
                      </div>
                      <p className="text-xs text-(--t4) mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(latest.created_at)}
                      </p>
                    </div>
                  )}

                  {/* Compteurs */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-(--sf2) border border-(--ln) text-(--t3) font-medium">
                      <FolderOpen className="w-3 h-3" />{nb} consultation{nb > 1 ? 's' : ''}
                    </span>
                    {terminees > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-medium">
                        {terminees} terminée{terminees > 1 ? 's' : ''}
                      </span>
                    )}
                    {enAttente > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-medium">
                        {enAttente} en attente
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 bg-(--sf2) border-t border-(--ln) flex justify-between items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (enAttente > 0) {
                        toast.warning(`${enAttente} consultation${enAttente > 1 ? 's sont' : ' est'} en attente de votre avis — donnez votre avis avant de télécharger.`);
                        return;
                      }
                      handleDownloadDossier(p);
                    }}
                    title={enAttente > 0 ? 'Donnez votre avis sur les consultations en attente avant de télécharger' : 'Télécharger le dossier complet PDF'}
                    className={`flex items-center gap-1 text-[10px] transition-colors ${enAttente > 0 ? 'text-(--t4) opacity-40 cursor-not-allowed' : 'text-(--t4) hover:text-blue-600 cursor-pointer'}`}>
                    <Download className="w-3 h-3" /> Dossier PDF
                  </button>
                  <span className="text-blue-600 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ouvrir le dossier <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredGroupes.length > 0 && (
        <TablePagination
          total={filteredGroupes.length}
          page={currentPage}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={s => { setItemsPerPage(s); setCurrentPage(1); }}
        />
      )}

      {/* Modal dossier patient */}
      {selectedGroupe && !selectedConsultation && (
        <DossierPatientModal
          groupe={selectedGroupe}
          onClose={() => setSelectedGroupe(null)}
          onDownloadDossier={handleDownloadDossier}
          onViewConsultation={(c) => setSelectedConsultation(c)}
        />
      )}

      {/* Modal détails consultation */}
      {selectedConsultation && (
        <ConsultationModal
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
          onDownload={handleDownloadConsultation}
        />
      )}
    </div>
  );
}
