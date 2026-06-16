import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const SOCIAL_LINKS = [
  ['facebook', 'twitter', 'linkedin'],
  ['facebook', 'twitter'],
  ['facebook', 'twitter', 'linkedin'],
  ['facebook', 'twitter'],
];

function DoctorAvatar({ src, initials }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src}
        alt={initials}
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-blue-100">
      <span className="text-2xl font-bold text-blue-700">{initials}</span>
    </div>
  );
}

export default function TeamSection() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/medecins/public/top4`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setDoctors(d))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-(--t1) mb-3">Notre équipe</h2>
          <h3 className="text-3xl md:text-4xl font-semibold text-blue-600 mb-6">
            Les meilleurs contributeurs
          </h3>
          <p className="text-(--t2) max-w-3xl mx-auto text-lg leading-relaxed">
            Derrière chaque diagnostic, il y a des médecins passionnés, engagés et expérimentés.
            Notre équipe regroupe des spécialistes en pneumologie qui allient savoir médical et
            intelligence artificielle pour vous offrir un accompagnement fiable, humain et personnalisé.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc, idx) => {
              const initials = `${(doc.prenom || '').charAt(0)}${(doc.nom || '').charAt(0)}`.toUpperCase();
              const socials  = SOCIAL_LINKS[idx] || SOCIAL_LINKS[1];
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="bg-(--sf) rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all"
                >
                  <div className="w-32 h-32 rounded-full border-[3px] border-blue-700 mx-auto mb-5 overflow-hidden">
                    <DoctorAvatar src={doc.photo_url} initials={initials} />
                  </div>

                  <h3 className="text-xl font-bold text-(--t1) mb-1">
                    {doc.prenom} {doc.nom?.toUpperCase()}
                  </h3>
                  <p className="text-blue-600 font-medium mb-1">{doc.specialite}</p>
                  {doc.hopital && (
                    <p className="text-xs text-(--t4) mb-4">{doc.hopital}</p>
                  )}

                  {doc.concordance > 0 && (
                    <div className="mb-4 text-xs text-(--t3)">
                      Concordance IA : <span className="font-bold text-blue-600">{doc.concordance}%</span>
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    {socials.includes('facebook') && (
                      <a href="#" className="text-(--t4) hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                      </a>
                    )}
                    {socials.includes('twitter') && (
                      <a href="#" className="text-(--t4) hover:text-sky-500 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                        </svg>
                      </a>
                    )}
                    {socials.includes('linkedin') && (
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
