import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Boxes, CalendarClock, KeyRound, PackageCheck, Receipt, ShieldCheck, Truck } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import { DEMO_OWNER, setDemoMode } from "../api/mock.js";
import { useAuth } from "../context/AuthContext.jsx";
import { BrandTile } from "../components/Brand.jsx";

const features = [
  { icon: Receipt, title: "GST Billing", sub: "CGST/SGST, discounts & invoice PDF" },
  { icon: PackageCheck, title: "FEFO Stock", sub: "Expiry-first batch deduction" },
  { icon: CalendarClock, title: "Live Alerts", sub: "Low, expiring & expired batches" },
  { icon: Boxes, title: "Catalog", sub: "Products, barcodes & categories" },
  { icon: Truck, title: "Purchases", sub: "Supplier bills that add batches" },
  { icon: BarChart3, title: "Reports", sub: "Sales, top products & GST" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Backend not connected: only the dummy Owner credential may enter,
      // and the app runs on the offline mock dataset from there on.
      if (err.request && !err.response) {
        const isDemoOwner =
          email.trim().toLowerCase() === DEMO_OWNER.email && password === DEMO_OWNER.password;
        if (isDemoOwner) {
          setDemoMode(true);
          login({
            token: "offline-demo-token",
            name: "Owner (Offline Demo)",
            email: DEMO_OWNER.email,
            role: "OWNER",
          });
          navigate("/dashboard", { replace: true });
          return;
        }
        setError(
          `Backend not reachable. Offline demo access (Owner only): ${DEMO_OWNER.email} / ${DEMO_OWNER.password}`
        );
      } else {
        setError(errorMessage(err, "Login failed"));
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(accountEmail, accountPassword) {
    setEmail(accountEmail);
    setPassword(accountPassword);
    setError("");
  }

  return (
    <div className="flex min-h-screen">
      {/* ---------------------------- Brand panel ---------------------------- */}
      <div className="relative hidden w-[46%] flex-col overflow-hidden bg-ink-900 p-8 lg:flex">
        {/* backdrop: corner spotlights + geometric outlines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(110% 75% at 0% 0%, rgba(30,167,133,0.20), transparent 55%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(85% 60% at 100% 100%, rgba(246,185,60,0.10), transparent 60%)" }}
        />
        <div className="pointer-events-none absolute -right-20 top-[20%] h-72 w-72 rotate-12 rounded-[2.5rem] border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-6 top-[28%] h-52 w-52 rotate-12 rounded-[2rem] bg-white/[0.03]" />

        <div className="relative">
          <BrandTile size={40} />
        </div>

        <div className="relative flex flex-1 flex-col justify-center py-4">
          <h2 className="text-[36px] font-extrabold leading-[1.08] tracking-tight text-white">
            Run your shop like a{" "}
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
              pro.
            </span>
          </h2>
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-white/50">
            Billing, stock and reports — everything your GST counter needs, in one place.
          </p>

          {/* feature tiles */}
          <div className="mt-6 grid max-w-xl grid-cols-2 gap-2.5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const gold = index % 2 === 1;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      gold ? "bg-gold-400/15 text-gold-300" : "bg-brand-500/15 text-brand-300"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.4} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white/90">{feature.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-white/45">{feature.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-wider text-white/35">
            <span>Owner &amp; Staff roles</span>
            <span className="text-white/20">·</span>
            <span>Invoice PDFs</span>
            <span className="text-white/20">·</span>
            <span>Offline demo ready</span>
          </p>
        </div>
      </div>

      {/* ------------------------------ Login form ---------------------------- */}
      <div className="flex flex-1 items-center justify-center bg-[#f4f6fa] p-5">
        <div className="w-full max-w-[400px] animate-fadeUp">
          <div className="mb-7 lg:hidden">
            <BrandTile size={42} />
          </div>

          <div className="card p-7">
            <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Welcome back</h1>
            <p className="mt-1 text-sm font-medium text-ink-500">
              Sign in to your counter. No setup needed.
            </p>

            {error && <div className="alert-error mt-5">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input"
                  placeholder="owner@munimji.local"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                <KeyRound size={16} strokeWidth={2.4} />
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* demo accounts, one click to prefill */}
            <div className="mt-6 rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                <ShieldCheck size={13} /> Demo accounts — tap to fill
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("owner@munimji.local", "owner123")}
                  className="rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-left transition hover:border-brand-500 hover:shadow-glow"
                >
                  <span className="block text-xs font-extrabold text-ink-900">Owner</span>
                  <span className="block text-[10px] font-medium text-ink-500">owner123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("staff@munimji.local", "staff123")}
                  className="rounded-lg border border-ink-900/10 bg-white px-3 py-2 text-left transition hover:border-brand-500 hover:shadow-glow"
                >
                  <span className="block text-xs font-extrabold text-ink-900">Staff</span>
                  <span className="block text-[10px] font-medium text-ink-500">staff123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
