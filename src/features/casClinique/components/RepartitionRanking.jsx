import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Couleurs fixes pour le podium (Tailwind doit les voir littéralement)
const RANK_COLORS = [
  'from-yellow-500 to-yellow-600',
  'from-gray-400 to-gray-500',
  'from-amber-600 to-amber-700',
  'from-blue-400 to-blue-500',
];

// Couleurs fixes pour les pastilles de répartition
const REP_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
  'bg-pink-500',  'bg-orange-500', 'bg-red-500',
  'bg-teal-500',  'bg-cyan-500',   'bg-amber-500', 'bg-emerald-500',
];

export default function RankingRepartition() {
  const [rankings,    setRankings]    = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/medecins/public/top4`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE}/medecins/public/repartition`).then(r => r.ok ? r.json() : []),
    ])
      .then(([top4, rep]) => {
        setRankings(top4);
        setRepartition(rep);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = repartition.reduce((s, d) => s + d.count, 0);

  if (loading) return (
    <section className="py-20 px-4 bg-(--sf2) flex justify-center items-center min-h-75">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </section>
  );

  return (
    <section id="ranking-records" className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── CLASSEMENT ──────────────────────────────────── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">CLASSEMENT</h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
                Les meilleurs contributeurs
              </h3>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
              </div>
              <p className="text-(--t3) text-sm">
                Classement basé sur le nombre de cas partagés et la concordance avec l'analyse IA.
              </p>
            </div>

            <div className="space-y-3">
              {rankings.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-(--sf) rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-(--ln)"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${RANK_COLORS[idx] || RANK_COLORS[3]} flex items-center justify-center shadow-md`}>
                      {idx === 0 ? (
                        <Trophy className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-(--t1)">
                        Dr. {item.prenom} {item.nom}
                      </h4>
                      <p className="text-xs text-(--t3)">{item.hopital}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{item.concordance}%</span>
                </motion.div>
              ))}

              {rankings.length === 0 && (
                <p className="text-center text-(--t3) py-8">Aucun classement disponible.</p>
              )}
            </div>
          </div>

          {/* ── RÉPARTITION ─────────────────────────────────── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">RÉPARTITION</h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
                {total > 0 ? `${total} cas par pathologie` : 'Cas par pathologie'}
              </h3>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
              </div>
            </div>

            <div className="space-y-3">
              {repartition.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-(--sf) rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-all border border-(--ln)"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${REP_COLORS[idx % REP_COLORS.length]}`} />
                    <span className="text-(--t2) font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">{item.count} cas</span>
                    <span className="text-xs text-(--t4)">({item.percentage}%)</span>
                  </div>
                </motion.div>
              ))}

              {repartition.length === 0 && (
                <p className="text-center text-(--t3) py-8">Aucune donnée disponible.</p>
              )}

              {total > 0 && (
                <div className="text-center pt-4 border-t border-(--ln)">
                  <p className="text-(--t3) text-sm">
                    Total : <span className="font-bold text-blue-600">{total} cas</span> partagés
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
