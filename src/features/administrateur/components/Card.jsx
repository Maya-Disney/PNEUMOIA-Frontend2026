export default function Card({ children, className = "", dark }) {
  return (
    <div className={`rounded-2xl border transition-all ${dark ? "bg-[#161b22] border-[#21262d]" : "bg-white border-gray-100 shadow-sm"} ${className}`}>
      {children}
    </div>
  );
}