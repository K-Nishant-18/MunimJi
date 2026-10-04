import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, FileText, KeyRound, PackageCheck, ShieldCheck, Zap } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { BrandTile } from "../components/Brand.jsx";

const features = [
  { icon: PackageCheck, text: "FEFO stock batches with expiry alerts" },
  { icon: FileText, text: "GST invoices with CGST/SGST and PDF" },
  { icon: BarChart3, text: "Sales, top products and GST reports" },
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
      setError(errorMessage(err, "Login failed"));
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
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-ink-900 p-10 lg:flex">
        {/* glow + grid decoration */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <BrandTile size={40} />
          <div className="leading-tight">
            <p className="text-lg font-extrabold text-white">MunimJi</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-300">
              Inventory &amp; GST Billing
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[38px] font-extrabold leading-[1.1] tracking-tight text-white">
            Run your shop like a{" "}
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
              pro.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Purchase batches, counter billing with live GST, expiry-first stock
            deduction and reports the accountant will actually accept.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.text} className="flex items-center gap-3 text-sm font-semibold text-white/80">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-brand-300">
                    <Icon size={17} strokeWidth={2.2} />
                  </span>
                  {feature.text}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs font-medium text-white/30">
          Fresher portfolio project · Spring Boot + React · H2 / MySQL ready
        </p>
      </div>

      {/* ------------------------------ Login form ---------------------------- */}
      <div className="flex flex-1 items-center justify-center bg-[#f4f6fa] p-5">
        <div className="w-full max-w-[400px] animate-fadeUp">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <BrandTile size={38} />
            <div className="leading-tight">
              <p className="text-lg font-extrabold text-ink-900">MunimJi</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">
                GST Billing
              </p>
            </div>
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

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-500">
            <Zap size={13} className="text-gold-500" />
            Backend on :8080 · Vite on :5173
          </p>
        </div>
      </div>
    </div>
  );
}
