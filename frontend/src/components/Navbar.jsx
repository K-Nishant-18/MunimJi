import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Search, WifiOff } from "lucide-react";
import { DEMO_MODE_EVENT, isDemoMode } from "../api/mock.js";

const titles = {
  "/dashboard": "Dashboard",
  "/billing": "Billing Counter",
  "/stock": "Stock & Alerts",
  "/products": "Products",
  "/categories": "Categories",
  "/invoices": "Invoices",
  "/suppliers": "Suppliers",
  "/purchases/new": "New Purchase",
  "/reports": "Reports",
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const title = titles[location.pathname] || "MunimJi";
  const [offlineDemo, setOfflineDemo] = useState(isDemoMode());

  useEffect(() => {
    const sync = () => setOfflineDemo(isDemoMode());
    window.addEventListener(DEMO_MODE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_MODE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-ink-900/[0.06] bg-white/80 px-4 backdrop-blur-md md:px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-ink-900/10 p-2 text-ink-600 hover:bg-ink-900/[0.04] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="page-title leading-tight">{title}</h1>
          <p className="hidden text-xs font-medium text-ink-500 sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-ink-900/10 bg-ink-900/[0.03] px-3 py-2 text-xs font-medium text-ink-500 lg:flex">
          <Search size={14} />
          <span>Invoice, product, batch...</span>
          <kbd className="ml-4 rounded border border-ink-900/10 bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink-500">
            /
          </kbd>
        </div>
        {offlineDemo && (
          <span className="badge-warn inline-flex items-center gap-1.5">
            <WifiOff size={12} strokeWidth={2.6} />
            Offline demo · mock data
          </span>
        )}
        <span className="badge-warn hidden sm:inline-flex">GST Ready</span>
      </div>
    </header>
  );
}
