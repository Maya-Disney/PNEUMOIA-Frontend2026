const NOW = new Date();
const sub = (ms) => new Date(NOW.getTime() - ms);

export const pad = (n) => String(n).padStart(2, "0");

export function elapsedStr(d) {
  const dm = Math.floor((Date.now() - d.getTime()) / 60000);
  const dh = Math.floor(dm / 60);
  const dd = Math.floor(dh / 24);
  if (dm < 60) return `Il y a ${dm} min`;
  if (dh < 24) return `Il y a ${dh}h${pad(dm % 60)}`;
  return `Il y a ${dd}j ${dh % 24}h`;
}

export function avatarColor(str) {
  const colors = ["#1D9E75","#185FA5","#7C3AED","#DC2626","#D97706","#0891B2"];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export function mapMedecin(m) {
  return {
    id:          m.id,
    initials:    `${(m.prenom?.[0]||"").toUpperCase()}${(m.nom?.[0]||"").toUpperCase()}`,
    name:        `${m.civilite||"Dr."} ${m.prenom} ${m.nom}`,
    specialite:  m.specialite || "Pneumologue",
    hopital:     m.etablissement || "—",
    ville:       "—",
    email:       m.email,
    telephone:   m.telephone || "—",
    cnom:        m.numero_rpps || "—",
    photo_url:   m.photo_url || null,
    submittedAt: new Date(m.created_at),
    status:      m.statut || "en_attente",
    avatarBg:    avatarColor(`${m.prenom}${m.nom}`),
    documents:   (m.documents || []).map(d => ({
      label:  d.label,
      url:    d.url,
      mime:   d.mime || d.mime_type || d.content_type || null,
      status: "pending",
    })),
  };
}

export const MOCK = [
  {
    id: 1, initials: "DK", avatarBg: "#1D9E75",
    name: "Dr. Kamga Denis", specialite: "Pneumologue",
    hopital: "H. Central, Yaoundé", ville: "Yaoundé",
    email: "kamga.denis@pneumo.cm", telephone: "+237 698 001 234",
    cnom: "CM-2025-4401", submittedAt: sub(2 * 3600 * 1000), status: "en_attente",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "pending" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "missing" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
  {
    id: 2, initials: "AN", avatarBg: "#7C3AED",
    name: "Dr. Abena Nkolo", specialite: "Pneumologue",
    hopital: "H. Laquintinie, Douala", ville: "Douala",
    email: "abena.nkolo@pnm.cm", telephone: "+237 677 555 021",
    cnom: "CM-2025-4398", submittedAt: sub(5 * 3600 * 1000), status: "en_attente",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "verified" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "verified" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
  {
    id: 3, initials: "MB", avatarBg: "#D97706",
    name: "Dr. Mbala Berthe", specialite: "Pneumologue",
    hopital: "CHU, Bafoussam", ville: "Bafoussam",
    email: "mbala.berthe@chu-baf.cm", telephone: "+237 655 300 887",
    cnom: "CM-2025-4410", submittedAt: sub(24 * 3600 * 1000), status: "en_attente",
    documents: [
      { label: "Diplôme de spécialisation en pneumologie", status: "verified" },
      { label: "Diplôme de docteur en médecine",           status: "pending" },
      { label: "Inscription à l'ordre des médecins",       status: "verified" },
      { label: "Autorisation d'exercice",                  status: "pending" },
      { label: "Carte professionnelle de médecin",         status: "verified" },
      { label: "Carte nationale d'identité (CNI)",         status: "verified" },
    ],
  },
];
