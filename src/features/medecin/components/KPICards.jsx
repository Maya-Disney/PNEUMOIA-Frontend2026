// src/features/medecin/components/KPICards.jsx
import { Users, Calendar, AlertTriangle, Share2 } from 'lucide-react';

export default function KPICards({ stats }) {
  const cards = [
    { 
      label: 'Total patients', 
      value: stats.total, 
      icon: Users, 
      color: 'blue',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      label: 'Consultés ce mois', 
      value: stats.consulted, 
      icon: Calendar, 
      color: 'emerald',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    { 
      label: 'Suivis urgents', 
      value: stats.urgents, 
      icon: AlertTriangle, 
      color: 'rose',
      bg: 'bg-rose-50',
      iconColor: 'text-rose-600'
    },
    { 
      label: 'Dossiers partagés', 
      value: stats.shared, 
      icon: Share2, 
      color: 'violet',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="bg-(--sf) rounded-xl p-4 border border-(--ln) shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-(--t1)">{card.value}</p>
            <p className="text-sm text-(--t3) mt-1">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}