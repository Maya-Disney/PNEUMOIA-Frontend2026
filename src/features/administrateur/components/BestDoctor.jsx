import React from "react";

export default function Top5Doctors({
  doctors,
  darkMode,
}) {
  return (
    <div className={`rounded-2xl border p-6 ${
      darkMode ?"bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}>
      <h3 className={`font-semibold text-lg mb-5 ${darkMode ?"text-white" : "text-gray-900"}`}>
        Top 5 â€” Concordance
      </h3>

      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div key={doctor.rank} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xs font-bold w-5 ${darkMode ?"text-gray-500" : "text-gray-400"}`}>
                #{doctor.rank}
              </span>
              <span className={`font-medium ${darkMode ?"text-gray-200" : "text-gray-800"}`}>
                {doctor.name}
              </span>
            </div>
            <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/50 px-3 py-1 rounded-full text-sm">
              {doctor.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}