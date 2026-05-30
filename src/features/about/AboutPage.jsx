// src/features/about/AboutPage.jsx
import HeroAbout from './components/HeroAbout';
import StatsCards from './components/StatsCards';
import DetectionSpectrum from './components/DetectionSpectrum';
import StorySection from './components/StorySection';
import TeamCarousel from './components/TeamCarousel';
import FAQSection from './components/FAQSection';
import CtaAbout from './components/CtaAbout';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)]">
      <HeroAbout />

      <StatsCards />
      <DetectionSpectrum />
      <StorySection />
      <TeamCarousel />
      <FAQSection />
      <CtaAbout />
      <Footer />
    </div>
   
  );
  
}