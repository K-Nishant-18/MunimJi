// Brand mark: emerald gradient tile with a gold "M" monogram.
export function BrandTile({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mjTile" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22b392" />
          <stop offset="55%" stopColor="#0f886d" />
          <stop offset="100%" stopColor="#0b6050" />
        </linearGradient>
        <linearGradient id="mjMark" x1="14" y1="14" x2="34" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3d9" />
          <stop offset="100%" stopColor="#f6b93c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#mjTile)" />
      <path
        d="M14 34.5V15.5L24 27.5L34 15.5V34.5"
        stroke="url(#mjMark)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Brand({ compact = false, dark = true }) {
  return (
    <div className="flex items-center gap-3">
      <BrandTile size={compact ? 30 : 36} />
      {!compact && (
        <div className="leading-tight">
          <p
            className={`text-[17px] font-extrabold tracking-tight ${
              dark ? "text-white" : "text-ink-900"
            }`}
          >
            MunimJi
          </p>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
              dark ? "text-brand-300" : "text-brand-600"
            }`}
          >
            GST Billing
          </p>
        </div>
      )}
    </div>
  );
}
