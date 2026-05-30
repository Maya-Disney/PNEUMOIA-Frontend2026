
import { motion } from 'framer-motion';
import { Trophy, Award, Star } from 'lucide-react';

export default function RankingRepartition() {
  const rankings = [
    { rank: 1, name: "Dr Jean Dupont", hospital: "Hop. Laquintinie, Douala", age: "42 ans", score: 91, icon: Trophy, color: "from-yellow-500 to-yellow-600" },
    { rank: 2, name: "Dr Marie Camara", hospital: "Hop. Central, Yaoundé", age: "38 ans", score: 81, icon: Award, color: "from-gray-400 to-gray-500" },
    { rank: 3, name: "Dr Paul Ngassa", hospital: "Hop. Général, Douala", age: "45 ans", score: 70, icon: Award, color: "from-amber-600 to-amber-700" },
    { rank: 4, name: "Dr Claire Ngo", hospital: "Hop. Régional, Bafoussam", age: "35 ans", score: 60, icon: Star, color: "from-blue-400 to-blue-500" }
  ];

  const repartition = [
    { name: "Pneumonie", count: 68, percentage: 27.5, color: "bg-blue-500" },
    { name: "BPCO", count: 52, percentage: 21, color: "bg-indigo-500" },
    { name: "Asthme sévère", count: 44, percentage: 17.8, color: "bg-purple-500" },
    { name: "Tuberculose", count: 38, percentage: 15.4, color: "bg-pink-500" },
    { name: "Bronchite", count: 31, percentage: 12.5, color: "bg-orange-500" },
    { name: "Cancer bronchique", count: 28, percentage: 11.3, color: "bg-red-500" }
  ];

  const total = repartition.reduce((acc, item) => acc + item.count, 0);

  return (
    <section id="ranking-records" className="py-20 px-4 bg-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Côté gauche - CLASSEMENT */}
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
                  key={item.rank}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-(--sf) rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-(--ln)"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${item.color} flex items-center justify-center shadow-md`}>
                      {item.rank === 1 ? (
                        <Trophy className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold text-md">{item.rank}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-(--t1)">{item.name}</h4>
                      <p className="text-xs text-(--t3)">{item.hospital}</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{item.score}%</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Côté droit - RÉPARTITION */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-(--t1) mb-2">RÉPARTITION</h2>
              <h3 className="text-xl md:text-2xl font-semibold text-blue-600 mb-3">
                247 cas par pathologie
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
                  className="bg-(--sf) rounded-xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-all border border-(--ln)"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-(--t2) font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">{item.count} cas</span>
                    <span className="text-xs text-(--t4)">({item.percentage}%)</span>
                  </div>
                </motion.div>
              ))}
              <div className="text-center pt-4 border-t border-(--ln)">
                <p className="text-(--t3) text-sm">
                  Total : <span className="font-bold text-blue-600">{total} cas</span> partagés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}