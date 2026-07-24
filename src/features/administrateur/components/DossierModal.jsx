import React, { useState } from "react";
import { createPortal } from "react-dom";
import DocumentViewerModal from "./DocumentViewerModal";

const avatarColors = ["bg-teal-600", "bg-blue-600", "bg-purple-600", "bg-orange-600"];

const docStatusColor = { 
  verified: "text-teal-500", 
  pending: "text-orange-400", 
  missing: "text-red-400" 
};

const docStatusLabel = {
  verified: "Reçu et vérifiable",
  pending: "En attente de vérification",
  missing: "Document manquant"
};

const docStatusIcon = { 
  verified: "OK", 
  pending: "WAIT", 
  missing: "MISS" 
};

export default function DossierModal({ 
  doc, 
  darkMode, 
  onClose, 
  onValidate, 
  onRefuse 
}) {
  
  // ✅ Correction principale
  const [activeDoc, setActiveDoc] = useState(doc.documents?.[0]?.label || null);
  
  const [viewerDoc, setViewerDoc] = useState(null);

  const dm = darkMode;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl 
            ${dm ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 pt-6 pb-4 border-b ${dm ? "border-gray-700" : "border-gray-100"}`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-base">Dossier d'inscription - {doc.name}</h2>
                <p className={`text-xs mt-0.5 ${dm ? "text-gray-400" : "text-gray-500"}`}>
                  {doc.specialite} - {doc.hopital}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                  ${dm ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Info Card */}
            <div className={`rounded-xl p-4 flex items-center gap-4 ${dm ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 
                ${avatarColors[doc.avatarIndex ?? 0]}`}>
                {doc.initials}
              </div>
              <div>
                <p className="font-bold text-sm">{doc.name}</p>
                <p className={`text-xs ${dm ? "text-gray-400" : "text-gray-500"}`}>
                  {doc.specialite} - {doc.hopital}
                </p>
                <p className="text-xs text-teal-500 mt-1">
                  Dossier {doc.docsStatus === "OK" ? "complet" : doc.docsStatus === "WAIT" ? "incomplet" : "manquant"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Informations personnelles */}
              <div>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  Informations personnelles
                </p>
                <div className={`rounded-xl overflow-hidden border ${dm ? "border-gray-700" : "border-gray-100"}`}>
                  {[
                    { label: "N° CNOM", value: doc.cnom, highlight: true },
                    { label: "E-mail", value: doc.email },
                    { label: "Téléphone", value: doc.telephone },
                    { label: "Établissement", value: doc.hopital },
                    { label: "Ville", value: doc.ville },
                    { label: "Soumis le", value: doc.soumisLe }
                  ].map((row, i) => (
                    <div 
                      key={i} 
                      className={`flex justify-between items-center px-3 py-2 text-xs 
                        ${i % 2 === 0 
                          ? (dm ? "bg-gray-800/60" : "bg-gray-50/60") 
                          : (dm ? "bg-gray-800/20" : "bg-white")
                        }`}
                    >
                      <span className={dm ? "text-gray-400" : "text-gray-500"}>{row.label}</span>
                      <span className={`font-medium ${row.highlight ? "text-teal-500" : dm ? "text-white" : "text-gray-800"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                  Vérification des documents
                </p>
                <div className="space-y-2">
                  {doc.documents.map((d, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveDoc(d.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer 
                        ${activeDoc === d.label 
                          ? (dm ? "border-teal-500/50 bg-teal-900/20" : "border-teal-300 bg-teal-50") 
                          : (dm ? "border-gray-700 bg-gray-800/40 hover:bg-gray-800" : "border-gray-100 bg-gray-50 hover:bg-gray-100")
                        }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${dm ? "text-white" : "text-gray-800"}`}>{d.label}</p>
                        <p className={`text-[10px] ${docStatusColor[d.status]}`}>
                          {docStatusIcon[d.status]} {docStatusLabel[d.status]}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerDoc(d.label);
                        }}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 transition-colors 
                          ${dm ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      >
                        Visualiser
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prévisualisation */}
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                Justificatifs soumis - prévisualisation
              </p>
              <div className={`rounded-xl border ${dm ? "border-gray-700" : "border-gray-100"}`}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${dm ? "border-gray-700 bg-gray-800/40" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span className={`text-xs font-medium ${dm ? "text-white" : "text-gray-800"}`}>{activeDoc || "Aucun document sélectionné"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-500 font-medium">Document vérifié</span>
                    <button
                      onClick={() => setViewerDoc(activeDoc)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors 
                        ${dm ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                    >
                      Ouvrir
                    </button>
                  </div>
                </div>
                <div className={`h-32 flex flex-col items-center justify-center gap-2 ${dm ? "bg-gray-800/20" : "bg-gray-50/50"}`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={dm ? "text-gray-600" : "text-gray-300"}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className={`text-xs text-center px-4 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                    Aperçu du document PDF - cliquez sur "Ouvrir" pour visualiser et télécharger.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${dm ? "border-gray-700" : "border-gray-100"}`}>
            <button 
              onClick={onClose} 
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-colors ${dm ? "text-gray-300 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"}`}
            >
              Fermer
            </button>
            <button 
              onClick={() => { onRefuse(doc); onClose(); }} 
              className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Refuser ce dossier
            </button>
            <button 
              onClick={() => { onValidate(doc.id); onClose(); }} 
              className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Valider l'inscription
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerDoc && (
        <DocumentViewerModal
          documentLabel={viewerDoc}
          darkMode={darkMode}
          onClose={() => setViewerDoc(null)}
          onMarquerVerifie={(label) => {
            console.log("Marqué vérifié :", label);
            setViewerDoc(null);
          }}
        />
      )}
    </>,
    document.body
  );
}