// src/features/medecin/components/PatientModalSections.jsx
import { X, FileText, Brain, Clock, FileCheck, Lock, Activity, Download, Calendar, User, HeartPulse, Thermometer, Heart, Scale, Image, Microscope } from 'lucide-react';
import { getStatusStyle, getVitalRiskLevel } from '../utils/styleHelpers';

export function PatientModalHeader({ patient, getInitials, getStatusStyle, onClose }) {
  const statusStyle = getStatusStyle(patient.status);

  return (
    <div className="relative bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 px-4 py-4">
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {getInitials(patient.name)}
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusStyle.dot} ring-2 ring-white`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{patient.name}</h2>
          <p className="text-blue-100 text-xs">
            {patient.gender} · {patient.age} ans · {patient.city}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

export function PatientModalTabs({ activeTab, onSetActiveTab }) {
  const tabs = [
    { id: 'dossier', label: 'Dossier', icon: FileText },
    { id: 'ia', label: 'IA', icon: Brain },
    { id: 'historique', label: 'Histoire', icon: Clock },
    { id: 'documents', label: 'Docs', icon: FileCheck },
    { id: 'acces', label: 'Accès', icon: Lock },
  ];

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 px-3 overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSetActiveTab(id)}
          className={`flex items-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-all border-b-2 whitespace-nowrap ${
            activeTab === id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}

export function PatientModalContent({
  tab,
  patient,
  editMode,
  editedPatient,
  formatDate,
  getIaStyle,
  getIaRingOffset,
  onUpdateEditedPatient,
  onSaveEdit,
  onCancelEdit,
}) {
  switch (tab) {
    case 'dossier':
      return (
        <DossierTab
          patient={patient}
          editMode={editMode}
          editedPatient={editedPatient}
          formatDate={formatDate}
          getIaStyle={getIaStyle}
          onUpdateEditedPatient={onUpdateEditedPatient}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      );
    case 'ia':
      return <IaTab patient={patient} formatDate={formatDate} getIaStyle={getIaStyle} getIaRingOffset={getIaRingOffset} />;
    case 'historique':
      return <HistoriqueTab patient={patient} formatDate={formatDate} getIaStyle={getIaStyle} />;
    case 'documents':
      return <DocumentsTab patient={patient} formatDate={formatDate} />;
    case 'acces':
      return <AccesTab patient={patient} />;
    default:
      return null;
  }
}

function DossierTab({
  patient,
  editMode,
  editedPatient,
  formatDate,
  getIaStyle,
  onUpdateEditedPatient,
  onSaveEdit,
  onCancelEdit,
}) {
  if (editMode) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Modifier le dossier</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1">Prénom</label>
            <input
              type="text"
              value={editedPatient?.firstName || ''}
              onChange={(e) =>
                onUpdateEditedPatient({
                  firstName: e.target.value,
                  name: `${editedPatient?.lastName} ${e.target.value}`,
                })
              }
              className="w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Nom</label>
            <input
              type="text"
              value={editedPatient?.lastName || ''}
              onChange={(e) =>
                onUpdateEditedPatient({
                  lastName: e.target.value,
                  name: `${e.target.value} ${editedPatient?.firstName}`,
                })
              }
              className="w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              value={editedPatient?.phone || ''}
              onChange={(e) => onUpdateEditedPatient({ phone: e.target.value })}
              className="w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Ville</label>
            <input
              type="text"
              value={editedPatient?.city || ''}
              onChange={(e) => onUpdateEditedPatient({ city: e.target.value })}
              className="w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Notes</label>
          <textarea
            rows={3}
            value={editedPatient?.notes || ''}
            onChange={(e) => onUpdateEditedPatient({ notes: e.target.value })}
            className="w-full px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={onSaveEdit}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors"
          >
            Enregistrer
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Identité */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> Identité
        </h3>
        <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">ID</span>
            <p className="font-medium text-xs">PNEU-{patient.id.toString().padStart(6, '0')}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Téléphone</span>
            <p className="font-medium text-xs">{patient.phone}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Ville</span>
            <p className="font-medium text-xs">{patient.city}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Profession</span>
            <p className="font-medium text-xs">{patient.profession}</p>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Médecin</span>
            <p className="font-medium text-xs text-blue-600">Dr. Jean Dupont</p>
          </div>
        </div>
      </div>

      {/* Pathologie */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Pathologie
        </h3>
        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{patient.pathology}</p>
              <p className="text-xs text-gray-500">{formatDate(patient.createdAt)}</p>
            </div>
            <div
              className={`px-2 py-0.5 rounded-full ${getIaStyle(patient.iaConcordance).bg} ${getIaStyle(patient.iaConcordance).text} text-xs font-medium`}
            >
              {patient.iaConcordance}%
            </div>
          </div>
        </div>
      </div>

      {/* Antécédents */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Antécédents</h3>
        <div className="flex flex-wrap gap-1.5">
          {patient.antecedents.map((ant, i) => (
            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
              {ant}
            </span>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Allergies</h3>
        <div className="flex flex-wrap gap-1.5">
          {patient.allergies.map((all, i) => (
            <span
              key={i}
              className={`px-2 py-1 rounded-md text-xs ${
                all === 'Aucune allergie connue'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
              }`}
            >
              {all}
            </span>
          ))}
        </div>
      </div>

      {/* Traitements */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Traitements</h3>
        <div className="space-y-1.5">
          {patient.treatments.map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-xs">{t.name}</p>
                <p className="text-xs text-gray-500">{t.dose}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vitals */}
      <VitalsGrid patient={patient} />

      {/* Notes */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Notes</h3>
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-md text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
          {patient.notes}
        </div>
      </div>
    </div>
  );
}

function VitalsGrid({ patient }) {
  const vitals = [
    { label: 'SpO₂', value: patient.vitals.spo2, unit: '%', icon: HeartPulse, isRisk: getVitalRiskLevel('spo2', patient.vitals.spo2) },
    { label: 'FR', value: patient.vitals.fr, unit: '/m', icon: Activity, isRisk: getVitalRiskLevel('fr', patient.vitals.fr) },
    { label: 'Temp', value: patient.vitals.temp, unit: '°C', icon: Thermometer, isRisk: getVitalRiskLevel('temp', patient.vitals.temp) },
    { label: 'PA', value: patient.vitals.pa, unit: '', icon: Heart, isRisk: false },
    { label: 'FC', value: patient.vitals.fc, unit: '', icon: HeartPulse, isRisk: getVitalRiskLevel('fc', patient.vitals.fc) },
    { label: 'Poids', value: patient.vitals.poids, unit: '', icon: Scale, isRisk: false },
  ];

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Vitaux</h3>
      <div className="grid grid-cols-2 gap-2">
        {vitals.map((vital, i) => {
          const Icon = vital.icon;
          const bgColor = vital.isRisk ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50';
          const textColor = vital.isRisk ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white';

          return (
            <div key={i} className={`p-2 rounded-md border ${bgColor}`}>
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${vital.isRisk ? 'text-rose-500' : 'text-gray-400'}`} />
                <p className="text-xs text-gray-500">{vital.label}</p>
              </div>
              <p className={`text-base font-bold ${textColor}`}>
                {vital.value}
                <span className="text-xs font-normal text-gray-400">{vital.unit}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IaTab({ patient, formatDate, getIaStyle, getIaRingOffset }) {
  return (
    <div className="space-y-3">
      {/* Concordance circulaire */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 72 72" className="w-16 h-16 -rotate-90">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="188.5"
              strokeDashoffset={getIaRingOffset(patient.iaConcordance)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold">{patient.iaConcordance}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">Concordance IA</p>
          <p className="text-sm font-bold">{patient.pathology}</p>
          <p className="text-xs text-gray-500">{patient.iaHistory.length} analyses</p>
          <span
            className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full ${getIaStyle(patient.iaConcordance).bg} ${getIaStyle(patient.iaConcordance).text}`}
          >
            {getIaStyle(patient.iaConcordance).label}
          </span>
        </div>
      </div>

      {/* Diagnostics */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Diagnostics</h3>
        <div className="space-y-2">
          {patient.iaHistory.map((item, i) => (
            <div key={i} className="p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <p className="font-medium text-xs">{item.diagnosis}</p>
                <span className={`text-xs font-medium ${getIaStyle(item.confidence).text}`}>
                  {item.confidence}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                  Concordant
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Différentiels */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Différentiels</h3>
        <div className="space-y-1.5">
          {patient.iaDifferentials?.map((diff, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="font-medium text-xs">{diff.name}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${diff.probability}%` }} />
                </div>
                <span className="text-sm font-semibold">{diff.probability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critères */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Critères</h3>
        <div className="space-y-1.5">
          {patient.iaCriteria?.map((crit, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-xs">{crit.label}</span>
              {crit.present ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                  ✓ Présent
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                  Absent
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoriqueTab({ patient, formatDate, getIaStyle }) {
  return (
    <div className="space-y-3">
      {patient.timeline.map((event, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {i < patient.timeline.length - 1 && <div className="w-px h-full bg-gray-200 dark:bg-gray-700 my-1" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <p className="text-xs text-gray-500">
                {formatDate(event.date)} · {event.doctor}
              </p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getIaStyle(event.ia).bg} ${getIaStyle(event.ia).text}`}>
                {event.ia}%
              </span>
            </div>
            <p className="font-medium text-xs mt-1">{event.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{event.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ patient, formatDate }) {
  if (patient.documents.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-xs">Aucun document</div>
    );
  }

  return (
    <div className="space-y-2">
      {patient.documents.map((doc, i) => (
        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <div className="p-1.5 bg-white dark:bg-gray-900 rounded-md">
            {doc.type === 'radio' ? (
              <Image className="w-5 h-5 text-blue-500" />
            ) : doc.type === 'lab' ? (
              <Microscope className="w-5 h-5 text-purple-500" />
            ) : (
              <FileText className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-xs">{doc.name}</p>
            <p className="text-xs text-gray-500">
              {formatDate(doc.date)} · {doc.size}
            </p>
          </div>
          <button className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Download className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AccesTab({ patient }) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Accès</h3>
        <div className="space-y-1.5">
          {/* Propriétaire */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs">
              JD
            </div>
            <div className="flex-1">
              <p className="font-semibold text-xs">Dr. Jean Dupont</p>
              <p className="text-xs text-gray-500">Propriétaire</p>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400">
              Proprio
            </span>
          </div>

          {/* Accès partagés */}
          {patient.shareAccess?.map((access, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                {access.name.charAt(0)}
                {access.name.split(' ')[1]?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-xs">{access.name}</p>
                <p className="text-xs text-gray-500">{access.role}</p>
              </div>
              <button className="text-xs px-1.5 py-0.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Révoquer
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Demander partage
        </button>
      </div>
    </div>
  );
}

export function PatientModalFooter({ onNewConsultation, onHistory }) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex gap-2 bg-gray-50 dark:bg-gray-800/50">
      <button
        onClick={onNewConsultation}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
      >
        <Activity className="w-3.5 h-3.5" /> Nouvelle consult.
      </button>
      <button
        onClick={onHistory}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Clock className="w-3.5 h-3.5" /> Historique
      </button>
    </div>
  );
}