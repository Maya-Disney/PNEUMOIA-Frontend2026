// src/features/casClinique/CasCliniquePage.jsx
import { useState } from 'react';
import HeroCasClinique from './components/HeroCasClinique';
import StatsCards from './components/StatsCards';
import LibrarySection from './components/LibrarySection';
import CasesGrid from './components/CasesGrid';
import CaseDetailModal from './components/CaseDetailModal';
import CTAAccess from './components/CTAAccess';
// import Ranking from './components/RankingSection';
// import Repartition from './components/RepartitionSection';
import Repartition from './components/RepartitionRanking';
import Footer from '../../components/layout/Footer';

export default function CasCliniquePage() {
  const [selectedFilter, setSelectedFilter] = useState("Toute");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      <HeroCasClinique />
      <StatsCards />
      <LibrarySection 
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <CasesGrid 
        filter={selectedFilter}
         searchTerm={searchTerm}
        onCaseClick={setSelectedCase}
      />
      <CaseDetailModal 
        caseItem={selectedCase} 
        onClose={() => setSelectedCase(null)} 
      />
      <CTAAccess />
      {/* <Ranking /> */}
      <Repartition />
      <Footer />
    </div>
  );
}