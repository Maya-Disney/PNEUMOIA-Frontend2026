import { useState, useEffect } from 'react';
import { UserPlus, Clock, ChevronRight, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff === 0) return "Auj.";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `${diff}j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function initials(prenom, nom) {
  return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase() || '?';
}

function PatientChip({ item, type, onClick }) {
  const init = initials(item.prenom, item.nom);
  const isAttente = type === 'attente';
  const dateLabel = isAttente ? fmtDate(item.date) : fmtDate(item.created_at);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 bg-(--sf2) border border-(--ln) rounded-xl
                 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20
                 transition-all duration-150 shrink-0 text-left group"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0
        ${isAttente
          ? 'bg-linear-to-br from-amber-500 to-orange-500'
          : 'bg-linear-to-br from-violet-500 to-violet-600'
        }`}>
        {init}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-(--t1) truncate max-w-[100px]">
          {item.prenom} {item.nom}
        </p>
        <p className="text-[10px] text-(--t4)">{item.age ? `${item.age} ans` : '—'} · {dateLabel}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-(--t4) shrink-0 group-hover:text-blue-500 transition-colors" />
    </button>
  );
}

export default function PatientsAlerteCarousel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attente');
  const [data, setData] = useState({ par_aide: [], en_attente: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/patients/alertes-dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : { par_aide: [], en_attente: [] })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const items = activeTab === 'attente' ? data.en_attente : data.par_aide;
  const totalAide    = data.par_aide.length;
  const totalAttente = data.en_attente.length;
  const totalAlerts  = totalAide + totalAttente;

  const handleClick = (item) => {
    if (activeTab === 'attente') {
      // Consultation en attente d'avis → ouvrir la page Patients avec modal avis auto-ouvert
      navigate(`/medecin/patients?patient_id=${item.patient_id}&open_avis=${item.consultation_id}`);
    } else {
      // Patient créé par aide → démarrer une consultation avec ce patient pré-chargé
      navigate(`/medecin/consultation?patient_id=${item.id}`);
    }
  };

  if (!loading && totalAlerts === 0) return null;

  return (
    <div className="bg-(--sf) rounded-2xl border border-(--ln) shadow-sm overflow-hidden">
      {/* Header compact */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-(--ln)">

        {/* Icône + titre */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          {totalAlerts > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
              {totalAlerts}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-(--t1) leading-none">Patients à prendre en charge</h3>
          <p className="text-[10px] text-(--t4) mt-0.5">Cliquez pour ouvrir le dossier patient</p>
        </div>

        {/* Tabs compacts */}
        <div className="flex items-center gap-1 bg-(--sf2) rounded-lg p-0.5 border border-(--ln) shrink-0">
          <button
            onClick={() => setActiveTab('attente')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'attente'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-(--t3) hover:text-(--t1)'
            }`}
          >
            <Clock className="w-3 h-3" />
            En attente
            {totalAttente > 0 && (
              <span className={`min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center leading-none ${
                activeTab === 'attente' ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'
              }`}>
                {totalAttente}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('aide')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              activeTab === 'aide'
                ? 'bg-violet-500 text-white shadow-sm'
                : 'text-(--t3) hover:text-(--t1)'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            Via aide
            {totalAide > 0 && (
              <span className={`min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center leading-none ${
                activeTab === 'aide' ? 'bg-white/30 text-white' : 'bg-violet-500 text-white'
              }`}>
                {totalAide}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Chips scrollables */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-12 w-36 bg-(--sf3) rounded-xl animate-pulse shrink-0" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-(--t4) py-1">
            {activeTab === 'attente'
              ? 'Aucune consultation en attente.'
              : 'Aucun patient créé par les aides-soignants.'}
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {items.map((item) => (
              <PatientChip
                key={activeTab === 'attente' ? item.consultation_id : item.id}
                item={item}
                type={activeTab}
                onClick={() => handleClick(item)}
              />
            ))}
            {/* Lien voir tout */}
            <button
              onClick={() => navigate(activeTab === 'attente' ? '/medecin/historique' : '/medecin/patients')}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-dashed border-(--ln) text-[11px] font-medium text-(--t4) hover:text-(--t2) hover:border-(--t3) transition-all shrink-0"
            >
              Voir tout
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
