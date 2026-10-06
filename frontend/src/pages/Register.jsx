import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Lock, Mail, Store, User } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { BrandTile } from "../components/Brand.jsx";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "OWNER",
      });
      login(response.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.request && !err.response) {
        setError(
          "Backend not reachable. A new shop can only be created while the server is running."
        );
      } else {
        setError(errorMessage(err, "Could not create the shop"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa] p-5">
      <div className="w-full max-w-[400px] animate-fadeUp">
        <div className="mb-7 flex justify-center">
          <BrandTile size={46} />
        </div>

        <div className="card p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Store size={18} strokeWidth={2.4} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-ink-900">Open your shop</h1>
              <p className="mt-0.5 text-sm font-medium text-ink-500">
                Register as the owner — add staff after you're in.
              </p>
            </div>
          </div>

          {error && <div className="alert-error mt-5">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="register-name">
                Your name
              </label>
              <div className="relative">
                <User
                  size={15}
                  strokeWidth={2.4}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id="register-name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input pl-9"
                  placeholder="Ramesh Sharma"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="register-email">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  strokeWidth={2.4}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="input pl-9"
                  placeholder="you@yourshop.com"
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="register-password">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  strokeWidth={2.4}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="input pl-9"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              <KeyRound size={16} strokeWidth={2.4} />
              {loading ? "Creating your shop..." : "Create shop & start billing"}
            </button>
          </form>

          <div className="mt-5 rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-4">
            <p className="text-[11px] font-medium leading-relaxed text-ink-500">
              Your shop is private: products, sales, reports and staff stay under your account.
              Other shops never see your data.
            </p>
          </div>

          <p className="mt-5 text-center text-sm font-medium text-ink-500">
            Already registered?{" "}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
