import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Receipt,
  ShoppingCart,
  Tag,
  Truck,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Brand from "./Brand.jsx";

const groups = [
  {
    label: "Counter",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/billing", label: "Billing", icon: ShoppingCart },
      { to: "/invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    label: "Inventory",
    links: [
      { to: "/stock", label: "Stock & Alerts", icon: Warehouse },
      { to: "/products", label: "Products", icon: Boxes },
      { to: "/categories", label: "Categories", icon: Tag },
      { to: "/suppliers", label: "Suppliers", icon: Truck, ownerOnly: true },
      { to: "/purchases/new", label: "New Purchase", icon: PackagePlus, ownerOnly: true },
    ],
  },
  {
    label: "Insights",
    links: [{ to: "/reports", label: "Reports", icon: BarChart3, ownerOnly: true }],
  },
];

export default function Sidebar({ open, onClose }) {
  const { isOwner, user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink-900 transition-transform duration-300 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 px-5">
          <Brand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group) => {
            const links = group.links.filter((link) => !link.ownerOnly || isOwner);
            if (links.length === 0) {
              return null;
            }
            return (
              <div key={group.label} className="mb-5">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            isActive
                              ? "bg-brand-600 text-white shadow-[0_6px_16px_rgba(15,136,109,0.35)]"
                              : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                          }`
                        }
                      >
                        <Icon size={17} strokeWidth={2.2} />
                        {link.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User chip + logout */}
        {user && (
          <div className="shrink-0 border-t border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-extrabold text-ink-900">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-rose-300"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
