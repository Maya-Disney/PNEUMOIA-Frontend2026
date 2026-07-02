// src/features/medecin/components/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useProfil } from '../hooks/useAuth';
import {
  Menu, Search, Bell, Trash2,
  Settings, LogOut, UserCircle, ChevronDown, Sun, Moon, RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function playNotifSound() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const t    = ctx.currentTime;
    [[587.33, 0], [739.99, 0.13], [880, 0.26]].forEach(([freq, delay]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.22, t + delay + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);
      osc.start(t + delay);
      osc.stop(t + delay + 0.55);
    });
  } catch { /* audio non supporté ou bloqué */ }
}

export default function Topbar({ sidebarOpen, setSidebarOpen, pageTitle }) {
  const [searchQuery,  setSearchQuery]  = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifCount,   setNotifCount]   = useState(0);
  const [refreshing,   setRefreshing]   = useState(false);
  const prevNotifCount = useRef(null);
  const userMenuRef = useRef(null);
  const navigate    = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { profil }  = useProfil();

  useEffect(() => {
    const fetchNotifCount = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/notifications/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const newCount = data.count || 0;
          if (prevNotifCount.current !== null && newCount > prevNotifCount.current) {
            playNotifSound();
          }
          prevNotifCount.current = newCount;
          setNotifCount(newCount);
        }
      } catch {}
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  const nomComplet = profil
    ? `${profil.civilite || 'Dr.'} ${profil.prenom} ${profil.nom}`
    : 'Chargement…';
  const specialite = profil?.specialite || '';
  const initiales  = profil
    ? `${profil.prenom?.[0] || ''}${profil.nom?.[0] || ''}`.toUpperCase()
    : 'JD';
  const email    = profil?.email || '';
  const photoUrl = profil?.photo_url || null;

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { window.location.reload(); }, 150);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medecin/recherche?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const userMenuItems = [
    { icon: UserCircle, label: 'Mon profil',   path: '/medecin/profil'     },
    { icon: Settings,   label: 'Paramètres',   path: '/medecin/parametres' },
    { divider: true },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? 'Mode clair' : 'Mode sombre',
      onClick: () => { toggleTheme(); setUserMenuOpen(false); },
      className: 'text-[var(--t2)] hover:bg-[var(--sf2)]',
    },
    { divider: true },
    {
      icon: LogOut,
      label: 'Déconnexion',
      path: '/',
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-[var(--sf)] border-b border-[var(--ln)] shadow-sm w-full transition-colors duration-300">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-16">

          {/* ── Gauche : menu mobile + titre ── */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--sf2)] transition-all shrink-0"
            >
              <Menu className="w-5 h-5 text-[var(--t2)]" />
            </button>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--t4)] hidden sm:block">
                {pageTitle}
              </p>
              {/* Mobile : juste le titre court — Desktop : salutation complète */}
              <h1 className="text-[15px] font-bold text-(--t1) leading-tight truncate max-w-35 sm:max-w-55 md:max-w-none">
                {pageTitle === 'Tableau de bord'
                  ? <>
                      <span className="sm:hidden">Tableau de bord</span>
                      <span className="hidden sm:inline">Bienvenue, {nomComplet}</span>
                    </>
                  : pageTitle}
              </h1>
            </div>
          </div>

          {/* ── Droite : recherche + actions + avatar ── */}
          <div className="flex items-center gap-2.5">

            {/* Barre de recherche — desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-[var(--sf2)] rounded-xl border border-[var(--ln)] min-w-[260px] transition-all focus-within:border-blue-300 focus-within:shadow-sm">
              <button type="submit" className="shrink-0 hover:text-blue-600 transition-colors">
                <Search className="w-4 h-4 text-[var(--t4)]" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un patient, un cas…"
                className="w-full bg-transparent text-sm text-[var(--t2)] placeholder:text-[var(--t4)] focus:outline-none"
              />
            </form>

            {/* Bouton recherche — mobile */}
            <button
              onClick={() => document.getElementById('mobile-search')?.focus()}
              className="md:hidden p-2 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all"
            >
              <Search className="w-5 h-5 text-[var(--t3)]" />
            </button>

            {/* Actualiser */}
            <button
              onClick={handleRefresh}
              title="Actualiser la page"
              className="p-2.5 rounded-xl bg-(--sf2) border border-(--ln) hover:bg-(--sf3) transition-all group"
            >
              <RefreshCw className={`w-5 h-5 text-(--t3) group-hover:text-blue-600 transition-colors ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Cloche — notifications */}
            <Link
              to="/medecin/notifications"
              className="relative p-2.5 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all group"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-[var(--t3)] group-hover:text-blue-600 transition-colors" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[var(--sf)]">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </Link>

            {/* Corbeille */}
            <Link
              to="/medecin/corbeille"
              className="relative p-2.5 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all group"
              title="Corbeille"
            >
              <Trash2 className="w-5 h-5 text-[var(--t3)] group-hover:text-red-500 transition-colors" />
            </Link>

            {/* ── Avatar / menu utilisateur ── */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--sf2)] border border-[var(--ln)] hover:bg-[var(--sf3)] transition-all"
              >
                <div className="relative w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow overflow-hidden shrink-0">
                  {initiales}
                  {photoUrl && <img src={photoUrl} alt="Profil" className="absolute inset-0 w-full h-full object-cover" onError={e => e.currentTarget.remove()} />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-semibold text-[var(--t1)] leading-tight">{nomComplet}</p>
                  <p className="text-[11px] text-[var(--t3)]">{specialite}</p>
                </div>
                <ChevronDown
                  className={`hidden md:block w-4 h-4 text-slate-400 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2.5 w-72 bg-[var(--sf)] rounded-2xl border border-[var(--ln)] shadow-xl overflow-hidden z-50 animate-in">

                  {/* En-tête profil */}
                  <div className="p-4 bg-[var(--sf2)] border-b border-[var(--ln)]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow overflow-hidden shrink-0">
                        {initiales}
                        {photoUrl && <img src={photoUrl} alt="Profil" className="absolute inset-0 w-full h-full object-cover" onError={e => e.currentTarget.remove()} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--t1)]">{nomComplet}</p>
                        <p className="text-xs text-[var(--t3)] mt-0.5">{email}</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          En ligne
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-2">
                    {userMenuItems.map((item, idx) =>
                      item.divider ? (
                        <div key={idx} className="h-px bg-[var(--ln)] my-1.5" />
                      ) : item.onClick ? (
                        <button
                          key={idx}
                          onClick={item.onClick}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.className || 'text-[var(--t2)] hover:bg-[var(--sf2)]'}`}
                        >
                          <item.icon className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={idx}
                          to={item.path}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${item.className || 'text-[var(--t2)] hover:bg-[var(--sf2)]'}`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${item.className?.includes('red') ? 'text-red-500' : 'text-blue-500'}`} />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      )
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="md:hidden px-4 sm:px-6 pb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2 bg-[var(--sf2)] rounded-xl border border-[var(--ln)]">
            <button type="submit" className="shrink-0">
              <Search className="w-4 h-4 text-[var(--t4)]" />
            </button>
            <input
              id="mobile-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full bg-transparent text-sm text-[var(--t2)] placeholder:text-[var(--t4)] focus:outline-none"
            />
          </form>
        </div>
      </header>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fade-in 0.18s ease-out; }
      `}</style>
    </>
  );
}
