import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/billing", label: "Billing" },
  { to: "/stock", label: "Stock" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/invoices", label: "Invoices" },
  { to: "/suppliers", label: "Suppliers", ownerOnly: true },
  { to: "/purchases/new", label: "New Purchase", ownerOnly: true },
  { to: "/reports", label: "Reports", ownerOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { isOwner } = useAuth();

  const visibleLinks = links.filter((link) => !link.ownerOnly || isOwner);

  return (
    <>
      {/* Dark overlay on small screens */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 transform border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <span className="text-lg font-bold text-indigo-700">MunimJi</span>
          <span className="ml-2 text-xs text-slate-400">Billing</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
