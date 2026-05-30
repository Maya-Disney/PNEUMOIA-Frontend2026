// src/features/medecin/utils/styleHelpers.js
import {
  CheckCircle, AlertCircle, Clock, Circle,
  Stethoscope, Brain, Heart, HeartPulse,
  Camera, Microscope, BarChart3, ScanLine, FileText
} from 'lucide-react';

/**
 * Retourne les styles pour un statut patient
 */
export function getStatusStyle(status) {
  const styles = {
    Actif: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      icon: CheckCircle,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    Urgent: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      dot: 'bg-red-500',
      icon: AlertCircle,
      badgeColor: 'bg-red-100 text-red-700',
    },
    'En attente': {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      icon: Clock,
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    'Clôturé': {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
      dot: 'bg-gray-400',
      icon: Circle,
      badgeColor: 'bg-gray-100 text-gray-600',
    },
  };

  return styles[status] || styles['Clôturé'];
}

/**
 * Retourne les styles pour une pathologie
 */
export function getPathologyStyle(pathology) {
  const styles = {
    Pneumonie:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    BPCO: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    Asthme:
      'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    Tuberculose:
      'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    styles[pathology] ||
    'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
  );
}

/**
 * Retourne les styles pour le niveau de confiance IA
 */
export function getIaStyle(confidence) {
  if (confidence >= 85) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: 'Très haute confiance',
    };
  }
  if (confidence >= 75) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-400',
      label: 'Haute confiance',
    };
  }
  if (confidence >= 60) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      label: 'Confiance moyenne',
    };
  }
  return {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    label: 'Confiance faible',
  };
}

/**
 * Calcule l'offset du SVG circle pour le pourcentage IA
 */
export function getIaRingOffset(percentage) {
  const circumference = 188.5;
  return circumference - (circumference * percentage) / 100;
}

/**
 * Retourne le composant icône Lucide pour un type de document
 */
export function getDocumentIcon(type) {
  const icons = {
    radio: Camera,
    lab:   Microscope,
    efr:   BarChart3,
    scan:  ScanLine,
  };
  return icons[type] || FileText;
}

/**
 * Critères de risque vitaux
 */
export function getVitalRiskLevel(vital, value) {
  const risks = {
    spo2: value < 93,
    fr: value > 25,
    temp: value > 38,
    fc: value > 100,
  };
  return risks[vital] || false;
}

// src/features/medecin/utils/constants.js
export const STATUS_OPTIONS = [
  { value: 'actif', label: 'Actif' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'attente', label: 'En attente' },
  { value: 'cloture', label: 'Clôturé' },
];

export const PATHOLOGIES = [
  { value: 'Pneumonie', label: 'Pneumonie' },
  { value: 'BPCO', label: 'BPCO' },
  { value: 'Asthme', label: 'Asthme' },
  { value: 'Tuberculose', label: 'Tuberculose' },
];

export const MODAL_TABS = [
  { id: 'dossier', label: 'Dossier', icon: 'FileText' },
  { id: 'ia', label: 'IA', icon: 'Brain' },
  { id: 'historique', label: 'Historique', icon: 'Clock' },
  { id: 'documents', label: 'Documents', icon: 'FileCheck' },
  { id: 'acces', label: 'Accès', icon: 'Lock' },
];

export const ITEMS_PER_PAGE = 6;