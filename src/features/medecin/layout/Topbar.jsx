// src/features/medecin/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import {useProfil} from '../hooks/useAuth';
import { Menu, Search, Bell, Trash2, User, Settings, LogOut, UserCircle, ChevronDown, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Topbar({ sidebarOpen, setSidebarOpen, pageTitle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profil } = useProfil();

  const nomComplet  = profil ? `${profil.civilite || 'Dr.'} ${profil.prenom} ${profil.nom}` : 'Chargement...';
  const specialite  = profil?.specialite || '';
  const initiales   = profil ? `${profil.prenom?.[0] || ''}${profil.nom?.[0] || ''}`.toUpperCase() : 'JD';
  const email       = profil?.email || '';
  const photoUrl    = profil?.photo_url || null;

  // Fermer le menu utilisateur quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medecin/recherche?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const userMenuItems = [
    { icon: UserCircle, label: 'Mon profil', path: '/medecin/profil' },
    { icon: Settings, label: 'Paramètres', path: '/medecin/parametres' },
    { divider: true },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre',
      onClick: () => {
        toggleTheme();
        setUserMenuOpen(false);
      },
      className: 'text-[var(--t2)] hover:bg-[var(--sf2)]',
    },
    { divider: true },
    { icon: LogOut, label: 'Déconnexion', path: '/', className: 'text-red-600 hover:bg-red-50' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-[var(--sf)] border-b border-[var(--ln)] shadow-sm w-full transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-4">
          
          {/* Partie gauche : Menu mobile + Titre de la page */}
          <div className="flex items-center gap-4">
            {/* Bouton menu mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--sf2)] transition-all duration-200"
            >
              <Menu className="w-5 h-5 text-[var(--t2)]" />
            </button>
            
            {/* Titre de la page */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[var(--t4)]">
                {pageTitle}
              </h2>
              <h1 className="text-sm font-bold text-[var(--t2)] mt-1">
                {pageTitle === "Tableau de bord" ? `Bienvenue, ${nomComplet}` : pageTitle}
              </h1>
            </div>
          </div>

          {/* Partie droite : Recherche + Notifications + Messages + Avatar */}
          <div className="flex items-center gap-3">
            
            {/* Barre de recherche - desktop */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--sf2)] rounded-2xl border border-[var(--ln)] min-w-[280px] transition-all focus-within:border-blue-300 focus-within:shadow-sm">
              <Search className="w-4 h-4 text-[var(--t4)] flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Rechercher un patient, un cas..."
                className="w-full bg-transparent text-sm text-[var(--t2)] placeholder:text-[var(--t4)] focus:outline-none"
              />
              <kbd className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">⌘K</kbd>
            </div>

            {/* Bouton recherche - mobile */}
            <button
              onClick={() => document.getElementById('mobile-search')?.focus()}
              className="md:hidden p-2 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all"
            >
              <Search className="w-5 h-5 text-[var(--t3)]" />
            </button>

            {/* Bouton Notifications */}
            <Link 
              to="/medecin/notifications" 
              className="relative p-2 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all group"
            >
              <Bell className="w-5 h-5 text-[var(--t3)] group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </Link>

            {/* Bouton Corbeille */}
            <Link
              to="/medecin/corbeille"
              className="relative p-2 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all group"
              title="Corbeille"
            >
              <Trash2 className="w-5 h-5 text-(--t3) group-hover:text-red-500 transition-colors" />
            </Link>

            {/* Menu utilisateur */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                  {photoUrl
                    ? <img src={photoUrl} alt="Profil" className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                    : null}
                  <span style={{ display: photoUrl ? 'none' : 'flex' }}>{initiales}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[var(--t1)]">{nomComplet}</p>
                  <p className="text-[10px] font-medium text-[var(--t3)]">{specialite}</p>
                </div>
                <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Menu déroulant utilisateur */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[var(--sf)] rounded-2xl border border-[var(--ln)] shadow-xl overflow-hidden z-50">
                  {/* En-tête du menu */}
                  <div className="p-4 bg-[var(--sf2)] border-b border-[var(--ln)]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                        {photoUrl
                          ? <img src={photoUrl} alt="Profil" className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
                          : null}
                        <span style={{ display: photoUrl ? 'none' : 'flex' }}>{initiales}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--t1)]">{nomComplet}</p>
                        <p className="text-xs text-[var(--t3)]">{email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          En ligne
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items du menu */}
                  <div className="p-2">
                    {userMenuItems.map((item, idx) => (
                      item.divider ? (
                          <div key={idx} className="h-px bg-[var(--ln)] my-2"></div>
                      ) : item.onClick ? (
                        <button
                          key={idx}
                          onClick={item.onClick}
                          className={
                            `w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${item.className || 'text-[var(--t2)] hover:bg-[var(--sf2)]'}`
                          }
                        >
                          <item.icon className="w-4 h-4 text-blue-500" />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={idx}
                          to={item.path}
                          onClick={() => setUserMenuOpen(false)}
                          className={
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${item.className || 'text-[var(--t2)] hover:bg-[var(--sf2)]'}`
                          }
                        >
                          <item.icon className={item.className ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-blue-500'} />
                          <span className="flex-1 text-left">{item.label}</span>
                        </Link>
                      )
                    ))}
                  </div>

                  {/* Stats rapides */}
                  <div className="p-3 bg-[var(--sf2)] border-t border-[var(--ln)]">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center py-1">
                        <p className="text-[8px] font-black text-[var(--t4)] uppercase">Patients</p>
                        <p className="text-xs font-bold text-[var(--t1)]">234</p>
                      </div>
                      <div className="text-center py-1">
                        <p className="text-[8px] font-black text-[var(--t4)] uppercase">Consultations</p>
                        <p className="text-xs font-bold text-[var(--t1)]">1,289</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="md:hidden px-6 pb-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--sf2)] rounded-2xl border border-[var(--ln)]">
            <Search className="w-4 h-4 text-[var(--t4)] flex-shrink-0" />
            <input
              id="mobile-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Rechercher..."
              className="w-full bg-transparent text-sm text-[var(--t2)] placeholder:text-[var(--t4)] focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* Styles d'animation - version corrigée sans jsx */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
