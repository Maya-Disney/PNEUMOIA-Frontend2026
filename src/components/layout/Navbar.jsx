import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from '../../components/modals/LoginModal';
import RegisterModal from '../../components/modals/RegisterModal';
import logo from '../../assets/images/logo.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: 'accueil', label: 'Accueil', path: '' },
    { id: 'apropos', label: 'À propos', path: '/apropos' },
    { id: 'fonctionnalites', label: 'Fonctionnalités', path: '/fonctionnalites' },
    { id: 'cas-cliniques', label: 'Cas cliniques', path: '/cas-cliniques' },
  ];

  // Déterminer l'élément actif basé sur l'URL
  const getActiveNav = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => item.path === currentPath);
    return activeItem ? activeItem.id : 'accueil';
  };

  const activeNav = getActiveNav();

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-[var(--sf)] z-50 border-b border-[var(--ln)] transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - lien vers accueil */}
            <Link to="/" className="shrink-0">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative z-10 overflow-hidden"
              >
                <img 
                  src={logo} 
                  alt="PneumoDiag" 
                  className="w-18 h-18 object-contain"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative px-2 py-2 text-sm font-medium transition-colors ${
                      activeNav === item.id
                        ? 'text-blue-600'
                        : 'text-[var(--t2)] hover:text-blue-600'
                    }`}
                >
                  {item.label}
                  {activeNav === item.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginOpen(true)}
                className="px-5 py-2 text-[var(--t2)] hover:text-blue-600 transition-colors font-medium"
              >
                Connexion
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRegisterOpen(true)}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Inscription
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--sf3)]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Menu latéral droit */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-full w-80 bg-[var(--sf)] shadow-2xl md:hidden z-50 border-l border-[var(--ln)]"
            >
              <div className="flex flex-col h-full">
                {/* Header du menu mobile */}
                <div className="flex justify-between items-center p-4 border-b border-(--ln)">
                  <h2 className="text-lg font-semibold text-(--t1)">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-(--sf2)"
                  >
                    <X className="w-6 h-6 text-(--t2)" />
                  </button>
                </div>

                {/* Contenu du menu - Liens de navigation */}
                <div className="flex-1 px-4 py-6 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block w-full text-left py-3 px-4 rounded-lg transition-colors ${
                        activeNav === item.id
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-(--t2) hover:bg-(--sf2) hover:text-blue-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Boutons d'authentification */}
                <div className="p-4 border-t border-(--ln) space-y-3">
                  <button
                    onClick={() => {
                      setIsLoginOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 text-(--t2) hover:text-blue-600 font-medium border border-(--ln) rounded-lg hover:border-blue-300 transition-colors"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Inscription
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
}