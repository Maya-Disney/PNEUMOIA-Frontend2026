
// src/features/medecin/components/FilterBar.jsx
import { Search, Filter } from 'lucide-react';
import { PATHOLOGIES } from '../utils/constants';
 
export function FilterBar({
  searchTerm,
  statusFilter,
  pathologyFilter,
  totalPatients,
  urgentCount,
  onSearchChange,
  onStatusFilterChange,
  onPathologyFilterChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Recherche */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un patient..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-(--ln) bg-(--sf) focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-label="Rechercher patients"
        />
      </div>
 
      {/* Filtres */}
      <div className="flex items-center gap-3">
        {/* Filtre Statut */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
          <Filter className="w-4 h-4 text-(--t4)" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none cursor-pointer"
            aria-label="Filtrer par statut"
          >
            <option value="Tous">Tous ({totalPatients})</option>
            <option value="Actif">Actif</option>
            <option value="Urgent">Urgent ({urgentCount})</option>
            <option value="En attente">En attente</option>
            <option value="Clôturé">Clôturé</option>
          </select>
        </div>
 
        {/* Filtre Pathologie */}
        <select
          value={pathologyFilter}
          onChange={(e) => onPathologyFilterChange(e.target.value)}
          className="px-4 py-2 rounded-xl border border-(--ln) bg-(--sf) text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
          aria-label="Filtrer par pathologie"
        >
          <option value="Toutes">Toutes pathologies</option>
          {PATHOLOGIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}