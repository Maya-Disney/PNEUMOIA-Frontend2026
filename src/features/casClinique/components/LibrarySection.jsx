import { Search } from 'lucide-react';

export default function LibrarySection({ 
  selectedFilter = "Toute", 
  onFilterChange = () => {}, 
  searchTerm = "", 
  onSearchChange = () => {} 
}) {
  const filters = ["Toute", "Tuberculose", "Asthme", "BPCO", "Pneumonie", "Cancer"];

  const handleFilterChange = (filter) => {
    console.log("Filtre cliqué:", filter); // Vérifie dans la console
    onFilterChange(filter);
  };

  const handleSearchChange = (e) => {
    console.log("Recherche tapée:", e.target.value); // Vérifie dans la console
    onSearchChange(e.target.value);
  };

  return (
    <section className="py-8 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-blue-600 font-medium text-sm uppercase tracking-wider mb-2">Bibliothèque</p>
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">Explorer les cas cliniques</h2>
          <div className="w-16 h-0.5 bg-linear-to-r from-blue-500 to-indigo-600 mx-auto mb-4 rounded-full"></div>
          <p className="text-(--t3) max-w-2xl mx-auto text-base">
            Cliquez sur un cas pour voir la démarche IA complète. 
            <span className="text-blue-600 dark:text-blue-400"> Connectez-vous</span> pour accéder à tous les détails.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 items-center justify-center max-w-4xl mx-auto">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--t4)" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Rechercher un cas..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-(--ln) bg-(--sf) focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-(--t1) placeholder:text-(--t4)"
            />
          </div>

          <span className="text-(--t4) hidden lg:block">|</span>
          <span className="text-xs text-(--t3) hidden lg:block">Filtrer :</span>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                  selectedFilter === filter
                    ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "bg-(--sf) text-(--t2) hover:bg-(--sf2) border border-(--ln)"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
