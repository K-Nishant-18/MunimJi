import { BrandTile } from "./Brand.jsx";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 py-14">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-brand-400/20" />
        <div className="relative animate-float">
          <BrandTile size={44} />
        </div>
      </div>
      <p className="text-sm font-semibold text-ink-500">{label}</p>
    </div>
  );
}
