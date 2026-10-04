import { useEffect, useState } from "react";
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
      <h1 className="text-xl font-semibold text-slate-800">Categories</h1>

      {notice && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isOwner && (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New category name"
            className="w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </form>
      )}

      {loading ? (
        <Loader label="Loading categories..." />
      ) : categories.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-400">
          No categories yet.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between px-4 py-3">
              {editingId === category.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(category.id)}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">{category.name}</span>
                  {isOwner && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(category.id);
                          setEditName(category.name);
                        }}
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="text-sm text-rose-600 hover:underline"
                      >
                        Delete
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
