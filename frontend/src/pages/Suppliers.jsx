import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = { name: "", phone: "", email: "", address: "", gstin: "" };

export default function Suppliers() {
  const { isOwner } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(supplier) {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      gstin: supplier.gstin || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, form);
        setNotice("Supplier updated.");
      } else {
        await api.post("/suppliers", form);
        setNotice("Supplier created.");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(supplier) {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api.delete(`/suppliers/${supplier.id}`);
      setNotice("Supplier deleted.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isOwner && (
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} strokeWidth={2.6} /> New Supplier
          </button>
        )}
      </div>

      {notice && <div className="alert-success">{notice}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading suppliers..." />
      ) : suppliers.length === 0 ? (
        <div className="empty-state">
          <Truck size={26} className="text-ink-500" />
          <p className="text-sm font-bold text-ink-700">No suppliers yet.</p>
          <p className="text-xs font-medium text-ink-500">
            Add the wholesalers you buy from to link purchases to them.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Name</th>
                <th className="table-cell">Phone</th>
                <th className="table-cell">Email</th>
                <th className="table-cell">GSTIN</th>
                <th className="table-cell">Address</th>
                {isOwner && <th className="table-cell text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="table-row">
                  <td className="table-cell">
                    <span className="flex items-center gap-3 font-bold text-ink-900">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                        <Truck size={14} strokeWidth={2.4} />
                      </span>
                      {supplier.name}
                    </span>
                  </td>
                  <td className="table-cell text-ink-500">{supplier.phone || "—"}</td>
                  <td className="table-cell text-ink-500">{supplier.email || "—"}</td>
                  <td className="table-cell font-mono text-xs text-ink-500">
                    {supplier.gstin || "—"}
                  </td>
                  <td className="table-cell max-w-[240px] truncate text-ink-500">
                    {supplier.address || "—"}
                  </td>
                  {isOwner && (
                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(supplier)}
                          className="rounded-lg p-2 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(supplier)}
                          className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Supplier" : "New Supplier"}
        onClose={() => setModalOpen(false)}
      >
        {formError && <div className="alert-error mb-4">{formError}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block">
            <span className="label">Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">Phone</span>
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">GSTIN</span>
            <input
              value={form.gstin}
              onChange={(event) => setForm({ ...form, gstin: event.target.value })}
              className="input font-mono uppercase"
            />
          </label>
          <label className="block">
            <span className="label">Address</span>
            <input
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              className="input"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
