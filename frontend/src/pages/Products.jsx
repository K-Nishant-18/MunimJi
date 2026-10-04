import { useEffect, useState } from "react";
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
        <h1 className="text-xl font-semibold text-slate-800">Products</h1>
        {isOwner && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            New Product
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or barcode..."
          className="w-full max-w-sm rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
        >
          Search
        </button>
      </form>

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

      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-400">
          No products found. {isOwner && "Click 'New Product' to add one."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">HSN</th>
                <th className="px-4 py-3">GST %</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Reorder</th>
                {isOwner && <th className="px-4 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{product.name}</td>
                  <td className="px-4 py-3 text-slate-500">{product.barcode || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{product.categoryName || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{product.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{product.hsnCode || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{product.gstRate}</td>
                  <td className="px-4 py-3 text-slate-700">₹ {formatMoney(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-slate-500">{product.reorderLevel}</td>
                  {isOwner && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="text-rose-600 hover:underline"
                        >
                          Delete
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
        {formError && (
          <div className="mb-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {formError}
          </div>
        )}
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
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
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
