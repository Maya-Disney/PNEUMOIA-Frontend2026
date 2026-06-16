import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const RANK_CFG = [
  { color: 'from-yellow-500 to-yellow-600', icon: Trophy },
  { color: 'from-gray-400 to-gray-500',    icon: Award  },
  { color: 'from-amber-600 to-amber-700',  icon: Award  },
  { color: 'from-blue-400 to-blue-500',    icon: Star   },
];

export default function RankingRepartition() {
  const [rankings,    setRankings]    = useState([]);
  const [repartition, setRepartition] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/medecins/public/top4`).then(r => r.ok ? r.json() : []),
      fetch(`${API_URL}/medecins/public/repartition`).then(r => r.ok ? r.json() : []),
    ])
      .then(([top4, rept]) => {
        setRankings(top4);
        setRepartition(rept);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total = repartition.reduce((acc, item) => acc + item.count, 0);

  return (
    <section id="ranking-records" className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ── Classement ── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">CLASSEMENT</h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">Les meilleurs contributeurs</h3>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-1 bg-blue-600 rounded-full" />
              </div>
              <p className="text-(--t3) text-sm">Classement basé sur les cas partagés et la concordance avec l'analyse IA.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : rankings.length === 0 ? (
              <p className="text-center text-(--t4) py-8 text-sm">Aucun contributeur pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {rankings.map((item, idx) => {
                  const cfg  = RANK_CFG[idx] || RANK_CFG[3];
                  const Icon = cfg.icon;
                  return (
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
                        <div className={`w-10 h-10 rounded-full bg-linear-to-br ${cfg.color} flex items-center justify-center shadow-md`}>
                          {idx === 0
                            ? <Trophy className="w-5 h-5 text-white" />
                            : <span className="text-white font-bold text-sm">{idx + 1}</span>
                          }
                        </div>
                        <div>
                          <h4 className="font-bold text-(--t1)">Dr {item.prenom} {item.nom}</h4>
                          <p className="text-xs text-(--t3)">{item.hopital || item.specialite}</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-blue-600">
                        {item.concordance > 0 ? `${item.concordance}%` : '—'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Répartition ── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">RÉPARTITION</h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
                {total > 0 ? `${total} cas` : 'Cas'} par pathologie
              </h3>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-1 bg-blue-600 rounded-full" />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : repartition.length === 0 ? (
              <p className="text-center text-(--t4) py-8 text-sm">Aucun cas diagnostiqué pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {repartition.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-(--sf) rounded-xl p-4 border border-(--ln) hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-(--t2) font-medium text-sm">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 text-sm">{item.count} cas</span>
                        <span className="text-xs text-(--t4)">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-(--sf2) rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </motion.div>
                ))}
                <div className="text-center pt-4 border-t border-(--ln)">
                  <p className="text-(--t3) text-sm">
                    Total : <span className="font-bold text-blue-600">{total} cas</span> diagnostiqués
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
