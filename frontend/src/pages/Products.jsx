import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import Pagination from "../components/Pagination.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  name: "",
  barcode: "",
  unit: "pcs",
  hsnCode: "",
  gstRate: 0,
  sellingPrice: "",
  reorderLevel: 0,
  categoryId: "",
};

export default function Products() {
  const { isOwner } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/products", {
        params: { search, page, size: 10 },
      });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    api
      .get("/categories")
      .then((response) => setCategories(response.data))
      .catch(() => setCategories([]));
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    setPage(0);
    loadProducts();
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      barcode: product.barcode || "",
      unit: product.unit,
      hsnCode: product.hsnCode || "",
      gstRate: product.gstRate,
      sellingPrice: product.sellingPrice,
      reorderLevel: product.reorderLevel,
      categoryId: product.categoryId || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      name: form.name,
      barcode: form.barcode || null,
      unit: form.unit,
      hsnCode: form.hsnCode || null,
      gstRate: Number(form.gstRate),
      sellingPrice: Number(form.sellingPrice),
      reorderLevel: Number(form.reorderLevel),
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    };
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
        setNotice("Product updated.");
      } else {
        await api.post("/products", payload);
        setNotice("Product created.");
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      await api.delete(`/products/${product.id}`);
      setNotice("Product deleted.");
      await loadProducts();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or barcode..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-ghost">
            Search
          </button>
        </form>
        {isOwner && (
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus size={16} strokeWidth={2.6} /> New Product
          </button>
        )}
      </div>

      {notice && <div className="alert-success">{notice}</div>}
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p className="text-sm font-bold text-ink-700">No products found.</p>
          <p className="text-xs font-medium text-ink-500">
            {isOwner ? "Click 'New Product' to add one." : "Try a different search."}
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Name</th>
                <th className="table-cell">Barcode</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">Unit</th>
                <th className="table-cell">HSN</th>
                <th className="table-cell">GST %</th>
                <th className="table-cell text-right">Price</th>
                <th className="table-cell">Reorder</th>
                {isOwner && <th className="table-cell text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="table-row">
                  <td className="table-cell font-bold text-ink-900">{product.name}</td>
                  <td className="table-cell font-mono text-xs text-ink-500">
                    {product.barcode || "—"}
                  </td>
                  <td className="table-cell">
                    <span className="badge-neutral">{product.categoryName || "Uncategorized"}</span>
                  </td>
                  <td className="table-cell text-ink-500">{product.unit}</td>
                  <td className="table-cell text-ink-500">{product.hsnCode || "—"}</td>
                  <td className="table-cell text-ink-500">{product.gstRate}</td>
                  <td className="table-cell money text-right font-bold text-ink-900">
                    ₹ {formatMoney(product.sellingPrice)}
                  </td>
                  <td className="table-cell text-ink-500">{product.reorderLevel}</td>
                  {isOwner && (
                    <td className="table-cell">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-2 text-ink-500 transition hover:bg-brand-50 hover:text-brand-700"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        open={modalOpen}
        title={editing ? "Edit Product" : "New Product"}
        onClose={() => setModalOpen(false)}
      >
        {formError && <div className="alert-error mb-4">{formError}</div>}
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="Barcode">
            <input
              value={form.barcode}
              onChange={(event) => setForm({ ...form, barcode: event.target.value })}
              className="input"
              placeholder="EAN / manual code"
            />
          </Field>
          <Field label="Unit">
            <input
              required
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="HSN Code">
            <input
              value={form.hsnCode}
              onChange={(event) => setForm({ ...form, hsnCode: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="GST Rate (%)">
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.gstRate}
              onChange={(event) => setForm({ ...form, gstRate: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="Selling Price">
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.sellingPrice}
              onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="Reorder Level">
            <input
              required
              type="number"
              min="0"
              value={form.reorderLevel}
              onChange={(event) => setForm({ ...form, reorderLevel: event.target.value })}
              className="input"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.categoryId}
              onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
              className="input"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
