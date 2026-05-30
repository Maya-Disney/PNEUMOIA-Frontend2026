import { motion } from 'framer-motion';
import doctor1 from '../../../assets/images/doctor1.jpeg';
import doctor2 from '../../../assets/images/doctor2.jpeg';
import doctor3 from '../../../assets/images/doctor3.jpeg';
import doctor4 from '../../../assets/images/doctor4.jpeg';

export default function TeamSection() {
  const team = [
    {
      name: "SONIA Alam",
      role: "Pneumologue",
      image: doctor1,
      social: ["facebook", "twitter", "linkedin"]
    },
    {
      name: "SONIA Alam",
      role: "Pneumologue",
      image: doctor2,
      social: ["facebook", "twitter"]
    },
    {
      name: "SONIA Alam",
      role: "Pneumologue",
      image: doctor3,
      social: ["facebook", "twitter", "linkedin"]
    },
    {
      name: "SONIA Alam",
      role: "Pneumologue",
      image: doctor4,
      social: ["facebook", "twitter"]
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header - exactement comme la capture */}
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

        {/* Grille des médecins - 4 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-(--sf) rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all"
            >
              {/* Photo du médecin */}
              <div className="w-32 h-32 rounded-full border-3 border-blue-700 mx-auto mb-5 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Nom et rôle */}
              <h3 className="text-xl font-bold text-(--t1) mb-1">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-5">{member.role}</p>
              
              {/* Icônes sociales */}
              <div className="flex justify-center gap-3">
                {member.social.includes("facebook") && (
                  <a href="#" className="text-(--t4) hover:text-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                  </a>
                )}
                {member.social.includes("twitter") && (
                  <a href="#" className="text-(--t4) hover:text-sky-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                    </svg>
                  </a>
                )}
                {member.social.includes("linkedin") && (
                  <a href="#" className="text-(--t4) hover:text-blue-800 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}