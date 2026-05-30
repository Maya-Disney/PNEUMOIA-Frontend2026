// src/features/medecin/components/PatientModal.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown, Activity, FileText, Brain, Clock, FileCheck, Lock, Download, Share2, Edit, Trash2 } from 'lucide-react';
import { getStatusStyle, getIaStyle, getIaRingOffset } from '../utils/styleHelpers';
import { useFormatters } from '../hooks/useFormatters';
import { 
  PatientModalHeader, 
  PatientModalTabs, 
  PatientModalContent,
  PatientModalFooter 
} from './PatientModalSections';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.96, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function PatientModal({
  isOpen,
  patient,
  editMode,
  editedPatient,
  activeTab,
  statusDropdownOpen,
  onClose,
  onSetActiveTab,
  onSetEditMode,
  onCancelEdit,
  onSaveEdit,
  onUpdateEditedPatient,
  onToggleStatusDropdown,
  onChangeStatus,
  onShare,
  onExportPDF,
  onDelete,
}) {
  const { formatDate, getInitials } = useFormatters();

  if (!patient) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 h-full z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <PatientModalHeader
              patient={patient}
              getInitials={getInitials}
              getStatusStyle={getStatusStyle}
              onClose={onClose}
            />

            {/* Action Bar */}
            <PatientModalActionBar
              patient={patient}
              statusDropdownOpen={statusDropdownOpen}
              getStatusStyle={getStatusStyle}
              onSetEditMode={onSetEditMode}
              onShare={onShare}
              onExportPDF={onExportPDF}
              onDelete={onDelete}
              onToggleStatusDropdown={onToggleStatusDropdown}
              onChangeStatus={onChangeStatus}
            />

            {/* Tabs */}
            <PatientModalTabs
              activeTab={activeTab}
              onSetActiveTab={onSetActiveTab}
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <PatientModalContent
                tab={activeTab}
                patient={patient}
                editMode={editMode}
                editedPatient={editedPatient}
                formatDate={formatDate}
                getIaStyle={getIaStyle}
                getIaRingOffset={getIaRingOffset}
                onUpdateEditedPatient={onUpdateEditedPatient}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
              />
            </div>

            {/* Footer */}
            <PatientModalFooter
              onNewConsultation={() => alert('Nouvelle consultation')}
              onHistory={() => onSetActiveTab('historique')}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Action Bar Component
function PatientModalActionBar({
  patient,
  statusDropdownOpen,
  getStatusStyle,
  onSetEditMode,
  onShare,
  onExportPDF,
  onDelete,
  onToggleStatusDropdown,
  onChangeStatus,
}) {
  const statusStyle = getStatusStyle(patient.status);

  const STATUS_MAP = {
    'Actif': 'actif',
    'Urgent': 'urgent',
    'En attente': 'attente',
    'Clôturé': 'cloture',
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors">
        <Activity className="w-3.5 h-3.5" /> Nouvelle
      </button>

      <button
        onClick={onShare}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" /> Partager
      </button>

      <button
        onClick={onSetEditMode}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Edit className="w-3.5 h-3.5" /> Modifier
      </button>

      <button
        onClick={onExportPDF}
        className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> PDF
      </button>

      <button
        onClick={onDelete}
        className="inline-flex items-center justify-center p-1.5 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Status Dropdown */}
      <div className="relative ml-auto">
        <button
          onClick={onToggleStatusDropdown}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {patient.status}
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {statusDropdownOpen && (
          <StatusDropdown
            onSelect={onChangeStatus}
            getStatusStyle={getStatusStyle}
          />
        )}
      </div>
    </div>
  );
}

function StatusDropdown({ onSelect, getStatusStyle }) {
  const statuses = [
    { value: 'Actif', label: 'Actif' },
    { value: 'Urgent', label: 'Urgent' },
    { value: 'En attente', label: 'En attente' },
    { value: 'Clôturé', label: 'Clôturé' },
  ];

  return (
    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
      {statuses.map((status) => {
        const style = getStatusStyle(status.value);
        const Icon = style.icon;
        return (
          <button
            key={status.value}
            onClick={() => onSelect(status.value)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Icon className="w-3 h-3" style={{ color: 'currentColor' }} />
            <span>{status.label}</span>
          </button>
        );
      })}
    </div>
  );
}