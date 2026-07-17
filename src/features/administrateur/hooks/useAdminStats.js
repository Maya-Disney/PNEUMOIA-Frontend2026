import { useState, useEffect } from "react";

const MOCK_STATS = {
  medecinsActifs:        { value: 38,   delta: "+3 ce mois",   hausse: true },
  inscriptionsEnAttente: { value: 4 },
  consultationsTotales:  { value: 4821, delta: "+247 ce mois", hausse: true },
};

export default function useAdminStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: remplacer par le vrai appel API quand le back est prêt
    // fetch("/api/admin/stats")
    //   .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    //   .then(data => { setStats(data); setLoading(false); })
    //   .catch(() => { setStats(MOCK_STATS); setLoading(false); });

    setStats(MOCK_STATS);
    setLoading(false);
  }, []);

  return { stats, loading };
}
