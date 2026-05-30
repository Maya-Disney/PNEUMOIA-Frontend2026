import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, MapPin, Activity, Award, Stethoscope } from 'lucide-react';

// 36 cas générés
const generateCases = () => {
  const pathologies = ["Pneumonie", "Tuberculose", "Asthme", "BPCO", "Cancer", "Bronchite"];
  const titles = [
    "Pneumonie bilatérale atypique chez un patient diabétique",
    "Tuberculose pulmonaire chez un patient immunodéprimé",
    "Crise d'asthme aiguë sévère chez une patiente",
    "Exacerbation de BPCO chez un patient tabagique",
    "Nodule pulmonaire suspect chez un patient",
    "Pneumonie communautaire chez un patient jeune"
  ];
  const doctors = ["Dr. Jean Dupont", "Dr. Marie Camara", "Dr. Paul Ngassa", "Dr. Claire Ngo", "Dr. David Fouda", "Dr. Sophie Laurent"];
  const locations = ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Maroua", "Ngaoundéré"];
  const conditions = ["Diabète T2", "Immunodéprimé", "Asthme connu", "Tabagique sévère", "Hypertension", "Sain"];
  const genders = ["Homme", "Femme"];
  
  const cases = [];
  for (let i = 1; i <= 36; i++) {
    const pathology = pathologies[i % pathologies.length];
    cases.push({
      id: i,
      badge: pathology,
      title: `${titles[i % titles.length]} de ${35 + (i % 30)} ans`,
      symptoms: `Fièvre ${38 + (i % 2)}°C • Toux ${i % 2 === 0 ? "productive" : "sèche"} • SaO2 ${85 + (i % 10)}% • CRP ${100 + (i % 100)}mg/l`,
      patient: {
        gender: genders[i % 2],
        age: `${35 + (i % 30)} ans`,
        condition: conditions[i % conditions.length],
        location: locations[i % locations.length]
      },
      doctor: doctors[i % doctors.length],
      confidence: 70 + (i % 28),
      pathology: pathology
    });
  }
  return cases;
};

const allCases = generateCases();

export default function CasesGrid({ filter = "Toute", searchTerm = "", onCaseClick }) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Filtrer
  const filteredCases = allCases.filter(c => {
    const matchFilter = filter === "Toute" || c.pathology === filter;
    const matchSearch = searchTerm === "" || c.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const currentCases = filteredCases.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

  if (filteredCases.length === 0) {
    return <div className="py-20 text-center text-(--t3)">Aucun cas trouvé</div>;
  }

  return (
    <section className="py-16 px-4 bg-linear-to-b from-(--sf2) to-(--sf)">
      <div className="max-w-7xl mx-auto">
        {/* CARROUSEL */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentCases.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => onCaseClick?.(c)}
                  className="group bg-(--sf2) rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-(--ln)"
                >
                  <div className="h-1 bg-linear-to-r from-blue-500 to-indigo-600"></div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        {c.badge}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Stethoscope className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-lg text-(--t1) mb-2 leading-tight line-clamp-2">
                      {c.title}
                    </h3>
                    
                    <p className="text-(--t2) text-xs leading-relaxed mb-4 line-clamp-2">
                      {c.symptoms}
                    </p>
                    
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-(--t2)">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{c.patient.gender} • {c.patient.age}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-(--t2)">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <Activity className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{c.patient.condition}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-(--t2)">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>{c.patient.location}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-(--ln) my-4"></div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-(--t2)">Médecin</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Award className="w-3 h-3 text-blue-500" />
                          <p className="font-medium text-sm text-(--t1)">{c.doctor}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-(--t4) mb-1">Confiance IA</p>
                        <div className="relative w-12 h-12 mx-auto">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                            <circle cx="24" cy="24" r="20" stroke="url(#gradient)" strokeWidth="3" fill="none" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - c.confidence / 100)} />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{c.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* FLÈCHES */}
          {totalPages > 1 && (
            <>
              <button onClick={prevPage} disabled={currentPage === 0} className="absolute -top-13 right-25 p-2 bg-(--sf) rounded-full shadow-lg border border-(--ln) disabled:opacity-50 hover:bg-(--sf2)">
                <ChevronLeft className="w-5 h-5 text-(--t2)" />
              </button>
              <button onClick={nextPage} disabled={currentPage === totalPages - 1} className="absolute -top-13 right-12 p-2 bg-(--sf) rounded-full shadow-lg border border-(--ln) disabled:opacity-50 hover:bg-(--sf2)">
                <ChevronRight className="w-5 h-5 text-(--t2)" />
              </button>
            </>
          )}
        </div>

        {/* PAGINATION 1 ... 6 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(0)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === 0 ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) hover:bg-(--sf2) text-(--t2)'}`}>1</button>
            {currentPage > 2 && <span className="text-(--t4)">...</span>}
            {currentPage > 1 && currentPage < totalPages - 1 && (
              <button onClick={() => setCurrentPage(currentPage)} className="w-8 h-8 rounded-lg text-sm font-medium bg-blue-600 text-white">{currentPage + 1}</button>
            )}
            {currentPage < totalPages - 3 && <span className="text-(--t4)">...</span>}
            <button onClick={() => setCurrentPage(totalPages - 1)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === totalPages - 1 ? 'bg-blue-600 text-white' : 'bg-(--sf) border border-(--ln) hover:bg-(--sf2) text-(--t2)'}`}>{totalPages}</button>
          </div>
        )}

        <div className="text-center mt-4 text-xs text-(--t4)">
          {filteredCases.length} cas • Page {currentPage + 1} / {totalPages}
        </div>
      </div>
    </section>
  );
}