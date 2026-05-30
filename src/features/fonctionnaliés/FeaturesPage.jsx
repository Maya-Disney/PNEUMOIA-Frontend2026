import HeroFeatures from './components/HeroFeatures';
import DiagnosticIA from './components/DiagnosticIA';
import BibliothequeCas from './components/BibliothequeCas';
import Communaute from './components/Communaute';
import EspaceMedecin from './components/EspaceMedecin';
import Statistiques from './components/Statistiques';
import Ressources from './components/Ressources';
import ExportRapports from './components/ExportRapports';
import Footer from '../../components/layout/Footer';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--t1)">
      <HeroFeatures />
      <DiagnosticIA />
      <BibliothequeCas />
      <Communaute />
      <EspaceMedecin />
      <Statistiques />
      <Ressources />
      <ExportRapports />
      <Footer />
    </div>
  );
}