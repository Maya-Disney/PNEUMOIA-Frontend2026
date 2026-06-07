// src/features/medecin/components/PatientTable.jsx
import { useState } from 'react';
import { Eye, Trash2, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TablePagination } from '../../../components/ui/TablePagination';

export default function PatientTable({ patients, onViewPatient, onDeletePatient }) {
  const navigate = useNavigate();
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const total     = patients.length;
  const from      = (page - 1) * pageSize;
  const paginated = patients.slice(from, from + pageSize);

  return (
    <div className="bg-(--sf) rounded-xl border border-(--ln) overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-(--sf2) border-b border-(--ln)">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Patient</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Pathologie</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Concordance IA</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Dernière consultation</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Prochain suivi</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-(--t3) uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--ln)">
            {paginated.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-(--sf2) cursor-pointer transition-colors group"
                onClick={() => onViewPatient(patient)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
                      {patient.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-(--t1) group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </div>
                      <div className="text-xs text-(--t4)">{patient.age} ans · {patient.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    patient.pathologie.includes('Pneumonie') ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                    patient.pathologie.includes('BPCO') ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' :
                    patient.pathologie.includes('Tuberculose') ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' :
                    'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {patient.pathologie}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-(--sf3) rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full"
                        style={{ width: `${patient.iaConfidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-(--t2)">{patient.iaConfidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-(--t2)">
                  {new Date(patient.lastConsultation).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  {patient.nextAppointment ? (
                    <span className="text-sm text-(--t2)">
                      {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}
                    </span>
                  ) : (
                    <span className="text-sm text-red-500">Non planifié</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/medecin/consultation/${patient.id}`); }}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                      title="Consulter"
                    >
                      <Stethoscope className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onViewPatient(patient); }}
                      className="p-2 rounded-lg hover:bg-(--sf3) transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4 text-(--t3)" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeletePatient(patient); }}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
      />
    </div>
  );
}
