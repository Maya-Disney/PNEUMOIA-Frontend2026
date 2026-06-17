import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export default function TeamSection() {
  const [team, setTeam]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/medecins/public/top4`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setTeam(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="py-20 px-4 bg-gray-50 flex justify-center items-center min-h-75">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </section>
  );

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-(--t1) mb-3">Team</h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">
            Notre team
          </h3>
          <p className="text-(--t2) max-w-3xl mx-auto text-lg leading-relaxed">
            Derrière chaque diagnostic, il y a des médecins passionnés, engagés et expérimentés.
            Notre équipe regroupe des spécialistes en pneumologie qui allient savoir médical et
            intelligence artificielle pour vous offrir un accompagnement fiable, humain et personnalisé.
          </p>
        </div>

        {/* Grille des médecins */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => {
            const initials = `${(member.prenom || '')[0] || ''}${(member.nom || '')[0] || ''}`.toUpperCase();
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-(--sf) rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all"
              >
                {/* Photo / initiales */}
                <div className="w-32 h-32 rounded-full border-4 border-blue-200 mx-auto mb-5 overflow-hidden">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={`${member.prenom} ${member.nom}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                      {initials || '?'}
                    </div>
                  )}
                </div>

                {/* Nom et spécialité */}
                <h3 className="text-xl font-bold text-(--t1) mb-1">
                  Dr. {member.prenom} {member.nom}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {member.specialite || 'Pneumologue'}
                </p>

                {/* Concordance IA */}
                {member.concordance > 0 && (
                  <p className="text-xs text-(--t4)">
                    Concordance IA :{' '}
                    <span className="font-semibold text-blue-600">{member.concordance}%</span>
                  </p>
                )}

                {/* Établissement */}
                {member.hopital && (
                  <p className="text-xs text-(--t4) mt-1 truncate">{member.hopital}</p>
                )}
              </motion.div>
            );
          })}

          {/* Fallback si aucun médecin */}
          {!loading && team.length === 0 && (
            <div className="lg:col-span-4 text-center py-12 text-(--t3)">
              Aucun médecin disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
