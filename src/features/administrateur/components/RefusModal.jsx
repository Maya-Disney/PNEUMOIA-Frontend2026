import React, { useState } from "react";

const MOTIFS = [
  "Documents incomplets ou illisibles",
  "Diplôme non reconnu ou non vérifié",
  "Numéro CNOM invalide ou expiré",
  "Spécialité non couverte par la plateforme",
  "Informations personnelles incohérentes",
  "Dossier en double",
  "Autre motif"
];

export default function RefusModal({ doctorName, darkMode, onClose, onConfirm }) {
  const [motif, setMotif] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = motif !== "";
  const dm = darkMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${dm ?"bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className={`flex items-center justify-between px-6 pt-5 pb-4 border-b ${dm ?"border-gray-700" : "border-gray-100"}`}>
          <h2 className={`font-bold text-base ${dm ?"text-white" : "text-gray-900"}`}>Motif du refus</h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dm ?"hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${dm ?"bg-orange-900/20 border-orange-700/40" : "bg-orange-50 border-orange-200"}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className={`text-xs leading-relaxed ${dm ?"text-orange-300" : "text-orange-700"}`}>
              Le motif sera envoyé au médecin par e-mail automatiquement.
            </p>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${dm ?"text-gray-400" : "text-gray-600"}`}>Médecin concerné</label>
            <input
              type="text"
              value={doctorName}
              readOnly
              className={`w-full px-3 py-2.5 text-sm rounded-xl border cursor-not-allowed ${dm ?"bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}
            />
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${dm ?"text-gray-400" : "text-gray-600"}`}>
              Motif du refus <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className={`w-full appearance-none px-3 py-2.5 text-sm rounded-xl border transition-colors pr-10 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 ${dm ?"bg-gray-800 border-gray-700 text-gray-300" : motif ?"bg-white border-gray-300 text-gray-800" : "bg-white border-gray-200 text-gray-400"}`}
              >
                <option value="">- Choisir un motif -</option>
                {MOTIFS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1.5 ${dm ?"text-gray-400" : "text-gray-600"}`}>
              Message additionnel <span className={dm ?"text-gray-600" : "text-gray-400"}>(optionnel)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Informations supplémentaires pour le médecin"
              className={`w-full px-3 py-2.5 text-sm rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 transition-colors ${dm ?"bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-600" : "bg-white border-gray-200 text-gray-800 placeholder-gray-300"}`}
            />
          </div>
        </div>

        <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${dm ?"border-gray-700" : "border-gray-100"}`}>
          <button onClick={onClose} className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${dm ?"text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}>Annuler</button>
          <button
            onClick={() => canSubmit && onConfirm({ motif, message })}
            disabled={!canSubmit}
            className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${canSubmit ?"text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" : dm ?"text-red-900 border border-red-900/30 cursor-not-allowed" : "text-red-300 border border-red-100 cursor-not-allowed"}`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Confirmer le refus
          </button>
        </div>
      </div>
    </div>
  );
}
