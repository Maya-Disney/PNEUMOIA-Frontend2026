import React from "react";
import { createPortal } from "react-dom";

export default function DocumentViewerModal({ documentLabel, darkMode, onClose, onMarquerVerifie }) {
  const dm = darkMode;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl ${dm ?"bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between px-6 pt-5 pb-4 border-b ${dm ?"border-gray-700" : "border-gray-100"}`}>
          <h2 className={`font-bold text-base ${dm ?"text-white" : "text-gray-900"}`}>{documentLabel}</h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dm ?"hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <div className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-12 px-6 text-center ${dm ?"border-gray-700 bg-gray-800/40" : "border-teal-200 bg-teal-50/40"}`}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={dm ?"text-gray-500" : "text-gray-300"}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>

            <div>
              <p className={`font-semibold text-sm ${dm ?"text-white" : "text-gray-800"}`}>{documentLabel}</p>
              <p className={`text-xs mt-1 leading-relaxed max-w-xs ${dm ?"text-gray-500" : "text-gray-400"}`}>
                Apercu du document. Dans la version finale, le fichier sera affiche ici (PDF/image).
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button className="flex items-center gap-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-lg transition-colors">Telecharger</button>
              <button
                onClick={() => onMarquerVerifie && onMarquerVerifie(documentLabel)}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border ${dm ?"text-teal-400 border-teal-700 hover:bg-teal-900/30" : "text-teal-600 border-teal-300 hover:bg-teal-50"}`}
              >
                Marquer verifie
              </button>
            </div>
          </div>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end ${dm ?"border-gray-700" : "border-gray-100"}`}>
          <button
            onClick={onClose}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${dm ?"text-gray-400 hover:bg-gray-800 hover:text-gray-200" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
