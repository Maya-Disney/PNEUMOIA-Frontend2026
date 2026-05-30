import { motion } from 'framer-motion';
import { Library, Search, Filter, Users, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BibliothequeCas() {
  return (
    <section id="bibliotheque-cas" className="py-12 px-4 bg-(--sf2) border-b border-(--ln)">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Library className="w-4 h-4" />
            <span>02 — Bibliothèque clinique</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-4">
            Une base de connaissances vivante
          </h2>
          <div className="w-12 h-0.5 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Colonne gauche - Texte */}
          <div className="space-y-6">
            <p className="text-(--t2) leading-relaxed">
              Une bibliothèque collaborative de <span className="font-semibold text-(--t1)">247 cas cliniques réels</span>, 
              anonymisés et enrichis par des pneumologues de la région CEMAC.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Recherche sémantique</p>
                  <p className="text-sm text-(--t3)">Par pathologie, symptômes, ou mots-clés libres</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Filter className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Filtres combinables</p>
                  <p className="text-sm text-(--t3)">Âge, sexe, comorbidités, sévérité</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-800">Modération par les pairs</p>
                  <p className="text-sm text-(--t3)">Chaque contribution est validée par le comité scientifique</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-5 mt-6">
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-semibold">Usage clinique :</span> Comparez votre diagnostic avec l'analyse IA, 
                consultez l'avis de confrères, et enrichissez votre pratique.
              </p>
            </div>
            
            <Link 
              to="/cas-cliniques"
              className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:gap-3 transition-all"
            >
              Explorer la bibliothèque <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Colonne droite - Stats */}
          <div className="bg-(--sf) rounded-2xl p-8 shadow-sm border border-(--ln)">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">247</p>
                <p className="text-sm text-(--t3)">cas cliniques</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">10</p>
                <p className="text-sm text-(--t3)">pathologies couvertes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">80%</p>
                <p className="text-sm text-(--t3)">concordance médecins/IA</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">+25</p>
                <p className="text-sm text-(--t3)">contributeurs actifs</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-(--ln)">
              <p className="text-xs text-gray-400 text-center">
                Données mises à jour en temps réel
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}