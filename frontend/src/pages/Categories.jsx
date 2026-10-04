import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Tag, X } from "lucide-react";
import api, { errorMessage } from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Categories() {
  const { isOwner } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
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

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await api.post("/categories", { name });
      setName("");
      setNotice("Category created.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id) {
    setError("");
    setNotice("");
    try {
      await api.put(`/categories/${id}`, { name: editName });
      setEditingId(null);
      setNotice("Category updated.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api.delete(`/categories/${category.id}`);
      setNotice("Category deleted.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      {notice && <div className="alert-success">{notice}</div>}
      {error && <div className="alert-error">{error}</div>}

      {isOwner && (
        <form onSubmit={handleCreate} className="card flex gap-2 p-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New category name..."
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary"
          >
            <Plus size={16} strokeWidth={2.6} />
            {saving ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader label="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <Tag size={26} className="text-ink-500" />
          <p className="text-sm font-bold text-ink-700">No categories yet.</p>
          <p className="text-xs font-medium text-ink-500">
            Group products into aisles like Kirana or Medicines.
          </p>
        </div>
      ) : (
        <ul className="card divide-y divide-ink-900/[0.05] overflow-hidden">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-brand-50/40"
            >
              {editingId === category.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="input py-2"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(category.id)}
                    className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700"
                    title="Save"
                  >
                    <Check size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-ink-900/10 p-2 text-ink-500 hover:bg-ink-900/[0.04]"
                    title="Cancel"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex items-center gap-3 text-sm font-bold text-ink-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Tag size={14} strokeWidth={2.4} />
                    </span>
                    {category.name}
                  </span>
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditName(category.name);
                        }}
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
