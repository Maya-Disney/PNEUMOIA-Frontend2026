// src/features/medecin/components/PatientsTable.jsx
import { PatientCard } from './PatientsCard';
import { useFormatters } from '../hooks/useFormatters';

export function PatientsTable({
  patients,
  onSelectPatient,
  onEditPatient,
  onDeletePatient,
}) {
  const { formatDate, getInitials } = useFormatters();

  if (patients.length === 0) {
    return (
      <div className="bg-(--sf) rounded-xl border border-(--ln) p-12 text-center">
        <p className="text-(--t3)">Aucun patient trouvé</p>
      </div>
    );
  }

  return (
    <div className="bg-(--sf) rounded-xl border border-(--ln) shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-(--sf2) border-b border-(--ln)">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Patient</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Âge</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Pathologie</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Concordance IA</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Dernière visite</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Prochain suivi</th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-(--t3) uppercase">Statut</th>
              <th className="px-4 py-4 text-right text-xs font-semibold text-(--t3) uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--ln)">
            {patients.map((patient, idx) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                formatDate={formatDate}
                getInitials={getInitials}
                onSelect={onSelectPatient}
                onEdit={onEditPatient}
                onDelete={onDeletePatient}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}