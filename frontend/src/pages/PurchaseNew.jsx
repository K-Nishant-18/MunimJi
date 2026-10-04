import { useEffect, useState } from "react";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";

const emptyRow = { productId: "", quantity: 1, costPrice: "", batchNo: "", expiryDate: "" };

export default function PurchaseNew() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [supplierId, setSupplierId] = useState("");
  const [supplierBillNo, setSupplierBillNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([{ ...emptyRow }]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [supRes, prodRes, purRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/products?size=100&page=0"),
        api.get("/purchases"),
      ]);
      setSuppliers(supRes.data);
      setProducts(prodRes.data.content);
      setPurchases(purRes.data);
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

  function updateRow(index, field, value) {
    const next = [...rows];
    next[index] = { ...next[index], [field]: value };
    setRows(next);
  }

  function addRow() {
    setRows([...rows, { ...emptyRow }]);
  }

  function removeRow(index) {
    if (rows.length === 1) {
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  }

  const estimatedTotal = rows.reduce((sum, row) => {
    const qty = Number(row.quantity) || 0;
    const cost = Number(row.costPrice) || 0;
    return sum + qty * cost;
  }, 0);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    for (const row of rows) {
      if (!row.productId || !row.batchNo || !row.expiryDate || Number(row.quantity) < 1) {
        setFormError("Every row needs product, quantity, batch number and expiry date.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        supplierBillNo: supplierBillNo || null,
        purchaseDate,
        items: rows.map((row) => ({
          productId: Number(row.productId),
          quantity: Number(row.quantity),
          costPrice: Number(row.costPrice),
          batchNo: row.batchNo,
          expiryDate: row.expiryDate,
        })),
      };
      const response = await api.post("/purchases", payload);
      setNotice(`Purchase saved (total ₹ ${formatMoney(response.data.total)}). Stock updated.`);
      setSupplierBillNo("");
      setRows([{ ...emptyRow }]);
      const purRes = await api.get("/purchases");
      setPurchases(purRes.data);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loader label="Loading purchase form..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">New Purchase</h1>

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

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Supplier</span>
            <select
              required
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="input"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Supplier Bill No</span>
            <input
              value={supplierBillNo}
              onChange={(event) => setSupplierBillNo(event.target.value)}
              className="input"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Purchase Date</span>
            <input
              required
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Cost Price</th>
                <th className="py-2 pr-3">Batch No</th>
                <th className="py-2 pr-3">Expiry</th>
                <th className="py-2 pr-3">Line Total</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="py-2 pr-3">
                    <select
                      required
                      value={row.productId}
                      onChange={(event) => updateRow(index, "productId", event.target.value)}
                      className="input min-w-[180px]"
                    >
                      <option value="">Select product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      required
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(event) => updateRow(index, "quantity", event.target.value)}
                      className="input w-20"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={row.costPrice}
                      onChange={(event) => updateRow(index, "costPrice", event.target.value)}
                      className="input w-28"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      required
                      value={row.batchNo}
                      onChange={(event) => updateRow(index, "batchNo", event.target.value)}
                      className="input w-32"
                      placeholder="BATCH-01"
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      required
                      type="date"
                      value={row.expiryDate}
                      onChange={(event) => updateRow(index, "expiryDate", event.target.value)}
                      className="input w-40"
                    />
                  </td>
                  <td className="py-2 pr-3 text-slate-600">
                    ₹ {formatMoney((Number(row.quantity) || 0) * (Number(row.costPrice) || 0))}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={addRow}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            + Add row
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              Estimated total: <strong>₹ {formatMoney(estimatedTotal)}</strong>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>

        {formError && (
          <div className="mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {formError}
          </div>
        )}
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Recent purchases</h2>
        {purchases.length === 0 ? (
          <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-400">
            No purchases recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Bill No</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.slice(0, 8).map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-3 text-slate-600">{purchase.purchaseDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{purchase.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{purchase.supplierBillNo || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{purchase.items.length}</td>
                    <td className="px-4 py-3 text-slate-700">₹ {formatMoney(purchase.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
