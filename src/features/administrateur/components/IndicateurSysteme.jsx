import React from "react";

export default function SystemIndicators({ stats = {}, darkMode }) {
  const textMain = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`rounded-2xl border p-6 ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      
      <h3 className={`font-semibold text-lg mb-5 ${textMain}`}>
        Indicateurs système
      </h3>

      <div className="space-y-4 text-sm">

        <div className="flex justify-between">
          <span className={textMuted}>Version modèle</span>
          <span className={`font-medium ${textMain}`}>
            {stats.modelVersion}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={textMuted}>Dernière MAJ</span>
          <span className={`font-medium ${textMain}`}>
            {stats.lastUpdate}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={textMuted}>Cas d'entraînement</span>
          <span className={`font-medium ${textMain}`}>
            {stats.trainingCases?.toLocaleString("fr-FR")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={textMuted}>Médecins contributeurs</span>
          <span className={`font-medium ${textMain}`}>
            {stats.contributors}
          </span>
        </div>

        <div className="flex justify-between">
          <span className={textMuted}>Concordance globale</span>
          <span className="font-bold text-emerald-600">
            {stats.globalConcordance}%
          </span>
        </div>

        <div className="flex justify-between pt-2">
          <span className={textMuted}>Statut API</span>
          <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-medium">
            {stats.apiStatus}
          </span>
        </div>

      </div>
    </div>
  );
}