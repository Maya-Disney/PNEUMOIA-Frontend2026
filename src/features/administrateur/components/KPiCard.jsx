export default function KpiCard({ icon: Icon, label, val, gradient, tintLight, tintDark, dark }) {
  const tint = dark ? tintDark : tintLight;
  const cardBg     = dark ? "#111827" : "#ffffff";
  const borderCol  = dark ? "#1f2937" : "#f1f5f9";
  const numColor   = dark ? "#ffffff" : "#111827";
  const labelColor = dark ? "#d1d5db" : "#4b5563";
  const subColor   = dark ? "#6b7280" : "#9ca3af";

  return (
    <div
      className="overflow-hidden rounded-2xl border transition-all hover:shadow-lg group cursor-default"
      style={{ background: cardBg, borderColor: borderCol }}
    >
      {/* Zone haute — fond teinté, chiffre + titre */}
      <div className="px-5 pt-5 pb-5" style={{ backgroundColor: tint }}>
        <p className="text-4xl font-black tracking-tight leading-none tabular-nums" style={{ color: numColor }}>
          {val}
        </p>
        <p className="text-sm font-semibold mt-2" style={{ color: labelColor }}>{label}</p>
      </div>

      {/* Séparateur */}
      <div className="h-px" style={{ backgroundColor: borderCol }} />

      {/* Zone basse — icône + label */}
      <div className="px-5 py-3.5 flex items-center gap-3" style={{ backgroundColor: cardBg }}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200`}>
          <Icon size={16} className="text-white" />
        </div>
        <p className="text-xs truncate" style={{ color: subColor }}>{label}</p>
      </div>
    </div>
  );
}
