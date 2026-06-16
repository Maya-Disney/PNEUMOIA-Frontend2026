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
    ville:       m.ville || m.adresse || "—",
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
