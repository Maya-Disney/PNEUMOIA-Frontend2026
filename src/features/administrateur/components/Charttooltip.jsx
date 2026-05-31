export default function ChartTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs shadow-lg ${dark ? "bg-[#161b22] border-[#21262d] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#0f766e" }}>{p.name} : {p.value}</p>
      ))}
    </div>
  );
}