// src/features/medecin/components/PatientFilters.jsx
import { Search } from 'lucide-react';

export default function PatientFilters({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  stats
}) {
  const filters = [
    { key: 'all',    label: 'Tous',     count: stats.total },
    { key: 'urgent', label: 'Urgents',  count: stats.urgents },
    { key: 'shared', label: 'Partagés', count: stats.shared }
  ];

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-(--ln) bg-(--sf) text-(--t1) placeholder:text-(--t4) focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Boutons de filtre */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-(--sf3) text-(--t2) hover:bg-(--sf2)'
            }`}
          >
            {f.label}
            {f.count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                filter === f.key ? 'bg-white/20' : 'bg-(--ln) text-(--t3)'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
