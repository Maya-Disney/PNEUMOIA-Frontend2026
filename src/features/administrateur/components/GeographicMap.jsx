import React from "react";

const villes = [
  {
    nom: "Douala",
    pays: "Cameroun",
    count: 18,
    hopitaux: "H.G. Douala, Laquintinie, Deido",
    color: "text-teal-500",
    bgColor: "bg-teal-500",
    width: "100%",
  },
  {
    nom: "Yaounde",
    pays: "Cameroun",
    count: 14,
    hopitaux: "CHU Yaounde, Hop. Central",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    width: "78%",
  },
  {
    nom: "Autres",
    pays: "Bafoussam, Garoua, Maroua",
    count: 6,
    hopitaux: "Hopitaux regionaux",
    color: "text-orange-400",
    bgColor: "bg-orange-400",
    width: "33%",
  },
];

export default function GeographicMap({ darkMode, compact = false }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${
      darkMode ?"bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <div
        className={`px-5 py-4 border-b flex items-center justify-between ${
          darkMode ?"border-gray-700" : "border-gray-100"
        }`}
      >
        <div>
          <h2 className={`font-semibold text-sm ${darkMode ?"text-white" : "text-gray-900"}`}>
            Repartition geographique - CEMAC
          </h2>
          <p className={`text-xs mt-0.5 ${darkMode ?"text-gray-500" : "text-gray-400"}`}>
            Medecins actifs par ville
          </p>
        </div>
        <button
          className={`text-xs flex items-center gap-1.5 font-medium border px-3 py-1.5 rounded-lg transition-colors ${
            darkMode
              ?"text-gray-300 border-gray-600 hover:bg-gray-700"
              : "text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Rapport PDF
        </button>
      </div>

      <div className={compact ?"p-4" : "p-5"}>
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${compact ?"" : "mb-6"}`}>
          {villes.map((v) => (
            <div
              key={v.nom}
              className={`rounded-xl p-4 border text-center ${
                darkMode ?"bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-100"
              }`}
            >
              <p className={`text-3xl font-bold ${v.color}`}>{v.count}</p>
              <p className={`text-sm font-semibold mt-1 ${darkMode ?"text-white" : "text-gray-800"}`}>
                {v.nom}
              </p>
              <p className={`text-[10px] mt-0.5 ${darkMode ?"text-gray-500" : "text-gray-400"}`}>
                {v.hopitaux}
              </p>
            </div>
          ))}
        </div>

        {!compact && (
          <>
            <div className="space-y-3">
              {villes.map((v) => (
                <div key={v.nom}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${v.bgColor}`} />
                      <span className={`text-xs font-medium ${darkMode ?"text-gray-300" : "text-gray-700"}`}>
                        {v.nom}
                      </span>
                      <span className={`text-[10px] ${darkMode ?"text-gray-500" : "text-gray-400"}`}>
                        . {v.pays}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold ${darkMode ?"text-white" : "text-gray-900"}`}>
                      {v.count} medecins
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${darkMode ?"bg-gray-700" : "bg-gray-100"}`}>
                    <div
                      className={`h-full rounded-full ${v.bgColor} transition-all duration-700`}
                      style={{ width: v.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-4 pt-4 border-t flex items-center justify-between ${
                darkMode ?"border-gray-700" : "border-gray-100"
              }`}
            >
              <span className={`text-xs ${darkMode ?"text-gray-400" : "text-gray-500"}`}>Total CEMAC</span>
              <span className={`text-sm font-bold ${darkMode ?"text-white" : "text-gray-900"}`}>
                38 medecins actifs
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
