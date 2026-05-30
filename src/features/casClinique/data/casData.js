// src/features/casClinique/data/casData.js
export const casData = [
  {
    id: 1,
    title: "Pneumonie bilatérale atypique chez un patient diabétique de 58 ans",
    description: "Fièvre 39.2°C. Toux productive. SaO2 91%. CRP 142mg/l. Séroconversion pneumocoque",
    pathology: "Pneumonie",
    tags: ["Homepage", "Diabetes T2", "Douala"],
    confidence: 85,
    presentation: "Fièvre à 39.2°C, toux productive purulente, SaO₂ 91%. Diabétique type 2. Crépitants base droite. CRP 142 mg/L. Séroconversion pneumocoque positive.",
    criteria: [
      "Syndrome infectieux (fièvre + CRP élevée)",
      "Opacité alvéolaire segmentaire à la radio",
      "Désaturation oxymétrique (SaO₂ < 94%)",
      "Séroconversion pneumocoque positive"
    ],
    differentials: ["Bronchite aigue", "Tuberculose", "Pneumonie virale"],
    treatments: ["Antibiothérapie", "Oxygénothérapie", "Surveillance glycémique"],
    similarCases: [2, 3, 4],
    doctor: "Dr. Dupont",
    hospital: "Hop. Laquintinie, Douala",
    date: "2026-04-01"
  },
  // ... autres cas
];