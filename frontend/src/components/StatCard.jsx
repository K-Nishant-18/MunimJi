const accents = {
  brand: "bg-brand-100 text-brand-700",
  gold: "bg-gold-100 text-gold-600",
  ink: "bg-ink-900/[0.06] text-ink-600",
  rose: "bg-rose-100 text-rose-600",
};

export default function StatCard({ title, value, subtitle, accent = "brand", icon: Icon }) {
  return (
    <div className="card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-wider text-ink-500">{title}</p>
          <p className="money mt-2 text-[26px] font-extrabold leading-none tracking-tight text-ink-900">
            {value}
          </p>
          {subtitle && <p className="mt-2 text-xs font-medium text-ink-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110 ${
              accents[accent] || accents.brand
            }`}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
      </div>
      {/* corner accent */}
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.07] ${
          accent === "rose"
            ? "bg-rose-500"
            : accent === "gold"
            ? "bg-gold-500"
            : accent === "ink"
            ? "bg-ink-900"
            : "bg-brand-600"
        }`}
      />
    </div>
  );
}
