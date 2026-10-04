export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 py-8 text-slate-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
