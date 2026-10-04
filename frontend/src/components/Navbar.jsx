import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded p-1 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
        <span className="hidden text-sm text-slate-400 md:inline">
          Inventory and GST billing for small shops
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{user.name}</p>
            <p className="text-xs text-slate-400">{user.role}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
