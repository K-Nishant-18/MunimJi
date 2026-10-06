import { useState } from "react";
import { ShieldAlert, UserPlus, UsersRound } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Users() {
  const { isOwner } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        role: "STAFF",
      });
      setNotice(`${response.data.name} was created as ${response.data.role}.`);
      setName("");
      setEmail("");
      setPassword("");
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
            <h1 className="text-lg font-extrabold tracking-tight text-ink-900">
              Add a staff member
            </h1>
            <p className="text-xs font-medium text-ink-500">
              They sign in with their email and password and work inside your shop only.
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

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <UsersRound size={16} strokeWidth={2.4} />
          </span>
          <p className="text-xs font-medium leading-relaxed text-ink-500">
            <span className="font-extrabold text-ink-900">Staff can</span> bill, manage stock,
            products and categories. Reports, purchases, suppliers and user management stay with
            you — every staff account belongs to this shop.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !email.trim() || password.length < 6}
          className="btn-primary mt-6 w-full py-3"
        >
          <UserPlus size={16} strokeWidth={2.6} />
          {saving ? "Creating..." : "Create staff member"}
        </button>
      </form>

      <div className="rounded-xl border border-dashed border-ink-900/15 bg-ink-900/[0.02] p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
          How access works
        </p>
        <ul className="mt-2 space-y-1.5 text-xs font-medium leading-relaxed text-ink-500">
          <li>
            Staff only see this shop's categories, products, stock and sales — the backend
            enforces it, not just this screen.
          </li>
          <li>
            New shop owners register themselves from the sign-in page; from here you can only
            add staff to your own shop.
          </li>
          <li>Passwords need at least 6 characters; emails must be unique.</li>
        </ul>
      </div>
    </div>
  );
}
