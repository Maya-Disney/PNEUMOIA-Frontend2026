import React from 'react';
import Hero from './components/Hero';
import FeaturesGrid from './components/FeaturesGrid';
import StatsSection from './components/StatsSection';
import AboutSection from './components/AboutSection';
import TeamSection from './components/TeamSection';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import CtaSection from './components/CtaSection';
import Footer from '../../components/layout/Footer';

/**
 * Page d'accueil complète avec toutes les sections
 * Structure claire et responsive
 */
const HomePage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      <Hero />
       <div className="relative z-20 md:-mt-20 lg:-mt-35 pointer-events-none">
          {/* Les cartes redeviennent cliquables */}
          <div className="pointer-events-auto">
            <FeaturesGrid />
          </div>
        </div>
      <StatsSection />
      <AboutSection />
      <TeamSection />
      <WhyChooseUs />
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default HomePage;