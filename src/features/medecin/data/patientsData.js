export const PATIENTS_DATA = {
  1: {
    id: 1,
    name: "TAMO Bernard",
    firstName: "Bernard",
    lastName: "Tamo",
    age: 47,
    gender: "Masculin",
    pathology: "Pneumonie bactérienne",
    pathologyShort: "Pneumonie",
    lastVisit: "2026-04-07",
    nextFollowUp: "2026-04-14",
    status: "Actif",
    phone: "+237 699 123 456",
    email: "bernard.tamo@email.com",
    address: "Douala, Cameroun",
    city: "Douala",
    profession: "Enseignant",
    consultations: 8,
    createdAt: "2025-01-12",
    iaConcordance: 85,
    iaConfidence: "Haute confiance",
    antecedents: ["Tabagisme sevré 2020", "Hypertension artérielle", "Chirurgie appendice 2015"],
    allergies: ["Aucune allergie connue"],
    treatments: [
      { name: "Amoxicilline", dose: "1g x 3/j — 7 jours", type: "antibiotique" },
      { name: "Paracétamol", dose: "1g si fièvre > 38.5°C", type: "antipyrétique" },
      { name: "Amlodipine", dose: "5mg/j — HTA", type: "antihypertenseur" }
    ],
    vitals: { spo2: 94, fr: 22, temp: 38.7, pa: "125/82", fc: 98, poids: "78 kg" },
    documents: [
      { name: "Radio thorax — 09/03/2026", type: "radio", date: "2026-03-09", size: "2.4 MB" },
      { name: "NFS + CRP — 09/03/2026", type: "lab", date: "2026-03-09", size: "856 KB" }
    ],
    notes: "Patient coopératif. Toux productive depuis 48h. Réévaluation J+2.",
    iaHistory: [
      { date: "2026-03-09", diagnosis: "Pneumonie bactérienne", confidence: 85, concordant: true, details: "Opacités alvéolaires" },
      { date: "2025-10-15", diagnosis: "Bronchite aiguë", confidence: 78, concordant: true, details: "Toux sèche" }
    ],
    iaDifferentials: [
      { name: "Tuberculose", probability: 28 },
      { name: "Pneumopathie virale", probability: 15 },
      { name: "Épanchement pleural", probability: 8 }
    ],
    iaCriteria: [
      { label: "Fièvre > 38.5°C", present: true },
      { label: "Opacité alvéolaire radio", present: true },
      { label: "Crépitants", present: true },
      { label: "SpO2 < 95%", present: true },
      { label: "Hémoptysie", present: false }
    ],
    timeline: [
      { date: "2026-03-09", doctor: "Dr. Dupont", title: "Pneumonie bactérienne", note: "Amoxicilline 1g x 3/j.", ia: 85, concordant: true },
      { date: "2025-10-15", doctor: "Dr. Dupont", title: "Bronchite aiguë", note: "Guérison J+10.", ia: 78, concordant: true }
    ],
    shareAccess: [{ name: "Dr. Martin", role: "Pneumologue", accessDate: "2026-03-07" }]
  },
  2: {
    id: 2,
    name: "FOUDA Marie",
    firstName: "Marie",
    lastName: "Fouda",
    age: 52,
    gender: "Féminin",
    pathology: "BPCO stade II",
    pathologyShort: "BPCO",
    lastVisit: "2026-04-05",
    nextFollowUp: "2026-05-05",
    status: "Actif",
    phone: "+237 677 234 567",
    email: "marie.fouda@email.com",
    address: "Yaoundé, Cameroun",
    city: "Yaoundé",
    profession: "Commerçante",
    consultations: 12,
    createdAt: "2024-06-03",
    iaConcordance: 83,
    iaConfidence: "Haute confiance",
    antecedents: ["Tabagisme actif 25 PA", "Asthme enfance", "Rhinite chronique"],
    allergies: ["Aspirine (urticaire)", "AINS"],
    treatments: [
      { name: "Salbutamol inh.", dose: "2 bouffées si dyspnée", type: "bronchodilatateur" },
      { name: "Tiotropium inh.", dose: "18µg/j — fond", type: "anticholinergique" }
    ],
    vitals: { spo2: 92, fr: 24, temp: 37.1, pa: "138/86", fc: 88, poids: "63 kg" },
    documents: [
      { name: "EFR — 15/02/2026", type: "efr", date: "2026-02-15", size: "1.8 MB" },
      { name: "Scanner thorax 01/2026", type: "scan", date: "2026-01-20", size: "5.2 MB" }
    ],
    notes: "BPCO stable. SpO2 légèrement basse. Sevrage tabagique recommandé.",
    iaHistory: [
      { date: "2026-03-10", diagnosis: "BPCO stade II", confidence: 83, concordant: true },
      { date: "2025-12-15", diagnosis: "BPCO exacerbation", confidence: 79, concordant: true }
    ],
    iaDifferentials: [
      { name: "Asthme sévère", probability: 22 },
      { name: "Insuffisance cardiaque", probability: 12 }
    ],
    iaCriteria: [
      { label: "VEMS/CVF < 0.70", present: true },
      { label: "Tabagisme > 20 PA", present: true },
      { label: "Dyspnée chronique", present: true }
    ],
    timeline: [
      { date: "2026-03-10", doctor: "Dr. Dupont", title: "BPCO bilan trim.", note: "Stable. SpO2 92%.", ia: 83, concordant: true },
      { date: "2025-12-15", doctor: "Dr. Dupont", title: "BPCO exacerbation", note: "Cortico 5j.", ia: 79, concordant: true }
    ],
    shareAccess: []
  },
  3: {
    id: 3,
    name: "KAMGA Jean",
    firstName: "Jean",
    lastName: "Kamga",
    age: 71,
    gender: "Masculin",
    pathology: "Tuberculose pulmonaire",
    pathologyShort: "Tuberculose",
    lastVisit: "2026-02-28",
    nextFollowUp: "2026-03-07",
    status: "Urgent",
    phone: "+237 655 345 678",
    email: "jean.kamga@email.com",
    address: "Yaoundé, Cameroun",
    city: "Yaoundé",
    profession: "Retraité",
    consultations: 5,
    createdAt: "2025-11-15",
    iaConcordance: 82,
    iaConfidence: "Haute confiance",
    antecedents: ["Diabète type 2", "Immunodépression cortico", "Contact TB confirmé"],
    allergies: ["Streptomycine (ototoxicité)"],
    treatments: [
      { name: "Rifampicine", dose: "600mg/j RHZE", type: "antibiotique" },
      { name: "Isoniazide", dose: "300mg/j", type: "antibiotique" },
      { name: "Pyrazinamide", dose: "2000mg/j", type: "antibiotique" }
    ],
    vitals: { spo2: 89, fr: 26, temp: 37.8, pa: "142/91", fc: 104, poids: "61 kg" },
    documents: [
      { name: "BK crachat positif", type: "lab", date: "2025-11-15", size: "234 KB" },
      { name: "Radio thorax initiale", type: "radio", date: "2025-11-15", size: "1.9 MB" }
    ],
    notes: "SUIVI DEPASSE depuis 28/02/2026. Traitement TB phase intensive.",
    iaHistory: [
      { date: "2025-11-15", diagnosis: "Tuberculose pulmonaire", confidence: 82, concordant: true }
    ],
    iaDifferentials: [
      { name: "Pneumonie bactérienne", probability: 18 },
      { name: "Cancer bronchique", probability: 14 }
    ],
    iaCriteria: [
      { label: "BK crachat positif", present: true },
      { label: "Opacités bilatérales", present: true },
      { label: "Contact TB connu", present: true }
    ],
    timeline: [
      { date: "2026-02-28", doctor: "Dr. Dupont", title: "TB suivi J+105", note: "BK négatif.", ia: 79, concordant: true },
      { date: "2025-11-15", doctor: "Dr. Dupont", title: "TB diagnostic", note: "BK+ confirmé.", ia: 82, concordant: true }
    ],
    shareAccess: []
  },
  4: {
    id: 4,
    name: "NGUEMA Paul",
    firstName: "Paul",
    lastName: "Nguema",
    age: 63,
    gender: "Masculin",
    pathology: "Asthme sévère persistant",
    pathologyShort: "Asthme",
    lastVisit: "2026-04-02",
    nextFollowUp: "2026-06-02",
    status: "Actif",
    phone: "+237 699 456 789",
    email: "paul.nguema@email.com",
    address: "Douala, Cameroun",
    city: "Douala",
    profession: "Ingénieur",
    consultations: 15,
    createdAt: "2023-09-08",
    iaConcordance: 91,
    iaConfidence: "Très haute confiance",
    antecedents: ["Asthme depuis enfance", "Rhinosinusite chronique", "Dermatite atopique"],
    allergies: ["Acariens (allergique)", "Aspirine CI"],
    treatments: [
      { name: "Fluticasone/Salmétérol", dose: "500/50µg x 2/j", type: "corticoïde" },
      { name: "Montélukast", dose: "10mg/j", type: "antileucotriène" }
    ],
    vitals: { spo2: 96, fr: 16, temp: 36.8, pa: "118/74", fc: 74, poids: "82 kg" },
    documents: [
      { name: "EFR 05/03/2026", type: "efr", date: "2026-03-05", size: "2.1 MB" }
    ],
    notes: "Asthme bien contrôlé. VEMS 78%. Pas de crise.",
    iaHistory: [
      { date: "2026-03-05", diagnosis: "Asthme sévère contrôlé", confidence: 91, concordant: true }
    ],
    iaDifferentials: [
      { name: "BPCO", probability: 12 },
      { name: "Trachéobronchite", probability: 6 }
    ],
    iaCriteria: [
      { label: "Obstruction réversible", present: true },
      { label: "Variabilité VEMS > 12%", present: true },
      { label: "Terrain atopique", present: true }
    ],
    timeline: [
      { date: "2026-03-05", doctor: "Dr. Dupont", title: "Asthme contrôlé", note: "VEMS 78%.", ia: 91, concordant: true }
    ],
    shareAccess: [{ name: "Dr. Kamga", role: "Allergologue", accessDate: "2025-12-10" }]
  },
  5: {
    id: 5,
    name: "MBOMA Éric",
    firstName: "Éric",
    lastName: "Mboma",
    age: 55,
    gender: "Masculin",
    pathology: "BPCO stade III",
    pathologyShort: "BPCO",
    lastVisit: "2026-02-22",
    nextFollowUp: "2026-03-22",
    status: "En attente",
    phone: "+237 677 567 890",
    email: "eric.mboma@email.com",
    address: "Bafoussam, Cameroun",
    city: "Bafoussam",
    profession: "Mineur",
    consultations: 3,
    createdAt: "2025-04-20",
    iaConcordance: 81,
    iaConfidence: "Haute confiance",
    antecedents: ["Tabagisme 35 PA", "Silicose professionnelle", "HTA traitée"],
    allergies: ["Codéine (nausées)"],
    treatments: [
      { name: "Indacatérol/Glycopyrronium", dose: "110/50µg/j", type: "bronchodilatateur" },
      { name: "Amlodipine", dose: "10mg/j", type: "antihypertenseur" }
    ],
    vitals: { spo2: 88, fr: 28, temp: 37.2, pa: "148/95", fc: 102, poids: "70 kg" },
    documents: [
      { name: "EFR VEMS 38%", type: "efr", date: "2025-04-20", size: "1.5 MB" }
    ],
    notes: "BPCO très sévère. SpO2 88%. OLT en discussion.",
    iaHistory: [
      { date: "2026-02-22", diagnosis: "BPCO stade III sévère", confidence: 81, concordant: true }
    ],
    iaDifferentials: [
      { name: "Silicose évoluée", probability: 31 },
      { name: "Emphysème bulleux", probability: 22 }
    ],
    iaCriteria: [
      { label: "VEMS < 50%", present: true },
      { label: "Tabagisme > 30 PA", present: true },
      { label: "SpO2 < 90%", present: true }
    ],
    timeline: [
      { date: "2026-02-22", doctor: "Dr. Dupont", title: "BPCO aggravation", note: "VEMS 38%.", ia: 81, concordant: true }
    ],
    shareAccess: []
  },
  6: {
    id: 6,
    name: "ABENA Catherine",
    firstName: "Catherine",
    lastName: "Abena",
    age: 38,
    gender: "Féminin",
    pathology: "Pneumonie bactérienne",
    pathologyShort: "Pneumonie",
    lastVisit: "2026-04-01",
    nextFollowUp: "2026-04-08",
    status: "Actif",
    phone: "+237 677 890 123",
    email: "catherine.abena@email.com",
    address: "Yaoundé, Cameroun",
    city: "Yaoundé",
    profession: "Infirmière",
    consultations: 6,
    createdAt: "2024-07-12",
    iaConcordance: 88,
    iaConfidence: "Haute confiance",
    antecedents: ["Asthme léger", "Allergie saisonnière"],
    allergies: ["Pénicilline (rash)"],
    treatments: [
      { name: "Azithromycine", dose: "500mg/j — 5 jours", type: "antibiotique" }
    ],
    vitals: { spo2: 95, fr: 20, temp: 38.2, pa: "120/78", fc: 92, poids: "65 kg" },
    documents: [
      { name: "Radio thorax — 01/04/2026", type: "radio", date: "2026-04-01", size: "1.8 MB" }
    ],
    notes: "Toux sèche, fièvre modérée. Bonne réponse au traitement.",
    iaHistory: [
      { date: "2026-04-01", diagnosis: "Pneumonie bactérienne", confidence: 88, concordant: true }
    ],
    iaDifferentials: [
      { name: "Bronchite aiguë", probability: 25 }
    ],
    iaCriteria: [
      { label: "Fièvre > 38°C", present: true },
      { label: "Opacité radiologique", present: true },
      { label: "CRP élevée", present: true }
    ],
    timeline: [
      { date: "2026-04-01", doctor: "Dr. Dupont", title: "Pneumonie aiguë", note: "Azithromycine 5j.", ia: 88, concordant: true }
    ],
    shareAccess: []
  },
  7: {
    id: 7,
    name: "DJIBRIL Ali",
    firstName: "Ali",
    lastName: "Djibril",
    age: 45,
    gender: "Masculin",
    pathology: "BPCO stade II",
    pathologyShort: "BPCO",
    lastVisit: "2026-03-30",
    nextFollowUp: "2026-04-13",
    status: "Urgent",
    phone: "+237 655 123 456",
    email: "ali.djibril@email.com",
    address: "Garoua, Cameroun",
    city: "Garoua",
    profession: "Boulanger",
    consultations: 9,
    createdAt: "2024-02-18",
    iaConcordance: 76,
    iaConfidence: "Confiance moyenne",
    antecedents: ["Tabagisme 30 PA", "Exposition à la biomasse"],
    allergies: ["Aucune allergie connue"],
    treatments: [
      { name: "Formotérol/Budésonide", dose: "12/400µg x 2/j", type: "corticoïde" }
    ],
    vitals: { spo2: 91, fr: 26, temp: 37.5, pa: "145/90", fc: 98, poids: "75 kg" },
    documents: [
      { name: "EFR — 30/03/2026", type: "efr", date: "2026-03-30", size: "1.6 MB" }
    ],
    notes: "Exacerbation récente. Sevrage tabagique impératif.",
    iaHistory: [
      { date: "2026-03-30", diagnosis: "BPCO exacerbation", confidence: 76, concordant: true }
    ],
    iaDifferentials: [
      { name: "Asthme non contrôlé", probability: 18 }
    ],
    iaCriteria: [
      { label: "VEMS/CVF < 0.70", present: true },
      { label: "Dyspnée d'effort", present: true },
      { label: "Exposition tabagique", present: true }
    ],
    timeline: [
      { date: "2026-03-30", doctor: "Dr. Dupont", title: "BPCO exacerbation", note: "Corticothérapie majorée.", ia: 76, concordant: true }
    ],
    shareAccess: []
  },
  8: {
    id: 8,
    name: "MVONDO Claire",
    firstName: "Claire",
    lastName: "Mvondo",
    age: 42,
    gender: "Féminin",
    pathology: "Asthme intermittent",
    pathologyShort: "Asthme",
    lastVisit: "2026-03-20",
    nextFollowUp: "2026-04-20",
    status: "En attente",
    phone: "+237 677 456 789",
    email: "claire.mvondo@email.com",
    address: "Douala, Cameroun",
    city: "Douala",
    profession: "Enseignante",
    consultations: 4,
    createdAt: "2024-09-03",
    iaConcordance: 79,
    iaConfidence: "Confiance moyenne",
    antecedents: ["Rhinite allergique", "Eczéma"],
    allergies: ["Acariens", "Pollens"],
    treatments: [
      { name: "Béclométasone", dose: "100µg x 2/j", type: "corticoïde" }
    ],
    vitals: { spo2: 97, fr: 18, temp: 36.9, pa: "115/72", fc: 82, poids: "58 kg" },
    documents: [],
    notes: "Asthme bien contrôlé. Crises rares.",
    iaHistory: [
      { date: "2026-03-20", diagnosis: "Asthme intermittent", confidence: 79, concordant: true }
    ],
    iaDifferentials: [
      { name: "Rhinite allergique sévère", probability: 15 }
    ],
    iaCriteria: [
      { label: "Symptômes < 2x/semaine", present: true },
      { label: "Fonction respiratoire normale", present: true },
      { label: "Terrain atopique", present: true }
    ],
    timeline: [
      { date: "2026-03-20", doctor: "Dr. Dupont", title: "Asthme intermittent", note: "Contrôle satisfaisant.", ia: 79, concordant: true }
    ],
    shareAccess: []
  }
};
