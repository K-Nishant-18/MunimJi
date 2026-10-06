import { useState } from "react";
import { ShieldAlert, UserPlus } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const roles = [
  {
    value: "STAFF",
    title: "Staff",
    sub: "Billing, stock and products. No reports, purchases or user management.",
  },
  {
    value: "OWNER",
    title: "Owner",
    sub: "Full access: reports, suppliers, purchases and adding more users.",
  },
];

export default function Users() {
  const { isOwner } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setNotice(`${response.data.name} was created as ${response.data.role}.`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl">
        <div className="alert-error flex items-center gap-2">
          <ShieldAlert size={16} strokeWidth={2.4} className="shrink-0" />
          Only the owner can create new users.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {notice && <div className="alert-success">{notice}</div>}
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="card p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <UserPlus size={18} strokeWidth={2.4} />
          </span>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-ink-900">Add a user</h1>
            <p className="text-xs font-medium text-ink-500">
              They can sign in with their email and password right away.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="user-name">
              Full name
            </label>
            <input
              id="user-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input"
              placeholder="Ramesh Kumar"
            />
          </div>
          <div>
            <label className="label" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="staff@munimji.local"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="user-password">
            Password
          </label>
          <input
            id="user-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="At least 6 characters"
          />
        </div>

        <div className="mt-5">
          <p className="label">Role</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {roles.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRole(item.value)}
                className={`rounded-xl border p-3.5 text-left transition ${
                  role === item.value
                    ? "border-brand-500 bg-brand-50 shadow-glow"
                    : "border-ink-900/10 bg-white hover:border-brand-500/50"
                }`}
              >
                <span className="block text-sm font-extrabold text-ink-900">{item.title}</span>
                <span className="mt-0.5 block text-[11px] font-medium leading-snug text-ink-500">
                  {item.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !email.trim() || password.length < 6}
          className="btn-primary mt-6 w-full py-3"
        >
          <UserPlus size={16} strokeWidth={2.6} />
          {saving ? "Creating..." : "Create user"}
        </button>
      </form>

      <div className="rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          How access works
        </p>
        <ul className="mt-2 space-y-1.5 text-xs font-medium leading-relaxed text-ink-500">
          <li>Only the owner can add users — the backend enforces this, not just this screen.</li>
          <li>
            On a brand-new database (no users yet), the very first registration is open to
            anyone and becomes the bootstrap owner.
          </li>
          <li>Passwords need at least 6 characters; emails must be unique.</li>
        </ul>
      </div>
    </div>
  );
}
