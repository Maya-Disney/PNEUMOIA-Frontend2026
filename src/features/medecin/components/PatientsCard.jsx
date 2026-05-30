// src/features/medecin/components/PatientCard.jsx
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { getStatusStyle, getPathologyStyle, getIaStyle } from '../utils/styleHelpers';
 
export function PatientCard({
  patient,
  formatDate,
  getInitials,
  onSelect,
  onEdit,
  onDelete,
}) {
  const statusStyle = getStatusStyle(patient.status);
  const pathoStyle = getPathologyStyle(patient.pathologyShort);
  const iaStyle = getIaStyle(patient.iaConcordance);
  const StatusIcon = statusStyle.icon;
 
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.02)' }}
      className="cursor-pointer group"
      onClick={() => onSelect(patient)}
    >
      {/* Avatar + Info */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {getInitials(patient.name)}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusStyle.dot} ring-2 ring-white dark:ring-gray-900`}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {patient.name}
            </p>
            <p className="text-xs text-gray-400">
              {patient.gender} · {patient.city}
            </p>
          </div>
        </div>
      </td>
 
      {/* Age */}
      <td className="px-4 py-4 text-gray-600 dark:text-gray-400 font-medium">
        {patient.age} ans
      </td>
 
      {/* Pathologie */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${pathoStyle}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {patient.pathologyShort}
        </span>
      </td>
 
      {/* Concordance IA */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
              style={{ width: `${patient.iaConcordance}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${iaStyle.text}`}>
            {patient.iaConcordance}%
          </span>
        </div>
      </td>
 
      {/* Dates */}
      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        {formatDate(patient.lastVisit)}
      </td>
 
      <td className="px-4 py-4">
        <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(patient.nextFollowUp)}
        </span>
      </td>
 
      {/* Statut */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          <StatusIcon className="w-3 h-3" />
          {patient.status}
        </span>
      </td>
 
      {/* Actions */}
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(patient);
            }}
            aria-label="Voir patient"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(patient);
            }}
            aria-label="Modifier patient"
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Supprimer patient"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
 