import { motion } from 'framer-motion';

export default function HeroAbout() {
  return (
    <section className="pt-32 pb-16 px-4 bg-linear-to-br from-(--sf) via-(--bg) to-(--sf2)">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* "À propos" avec des lignes/barres autour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-px bg-blue-400 dark:bg-blue-300"></div>
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-xl uppercase tracking-wider">
              À propos
            </span>
            <div className="w-8 h-px bg-blue-400 dark:bg-blue-300"></div>
          </motion.div>

          {/* Grand titre noir et bleu */}
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-4xl lg:text-5xl font-semibold text-(--t1) mb-6"
              >
                Nous sommes là pour{" "}
                <span className="block text-blue-600 dark:text-blue-400">vous guider vers la</span>
                <span className="text-(--t2)">solution</span>
            </motion.h1>
          {/* Description centrée */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-sm text-(--t2) leading-relaxed text-center"
          >
            Nous sommes une équipe engagée dans l'innovation médicale et le développement de solutions numériques 
            intelligentes dédiées au domaine de la pneumologie. Notre objectif est de mettre la technologie et 
            l'intelligence artificielle au service de la santé afin de faciliter l'analyse, l'orientation et 
            l'aide au diagnostic des pathologies respiratoires. À travers notre plateforme, nous concevons des 
            outils fiables, accessibles et performants destinés à accompagner les professionnels de santé et 
            les utilisateurs dans la recherche de solutions adaptées à leurs besoins médicaux, tout en contribuant 
            à améliorer la rapidité, la précision et l'efficacité de la prise de décision clinique.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
