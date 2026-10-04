import { useEffect, useState } from "react";
import { PackagePlus, Plus, Save, Trash2 } from "lucide-react";
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
      {notice && <div className="alert-success">{notice}</div>}

      <form onSubmit={handleSubmit} className="card p-6">
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <PackagePlus size={17} strokeWidth={2.3} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink-900">Purchase details</p>
            <p className="text-xs font-medium text-ink-500">
              Each line becomes a stock batch with its own expiry date
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="block">
            <span className="label">Supplier</span>
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
            <span className="label">Supplier Bill No</span>
            <input
              value={supplierBillNo}
              onChange={(event) => setSupplierBillNo(event.target.value)}
              className="input"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="label">Purchase Date</span>
            <input
              required
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Product</th>
                <th className="table-cell">Qty</th>
                <th className="table-cell">Cost Price</th>
                <th className="table-cell">Batch No</th>
                <th className="table-cell">Expiry</th>
                <th className="table-cell text-right">Line Total</th>
                <th className="table-cell" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">
                    <select
                      required
                      value={row.productId}
                      onChange={(event) => updateRow(index, "productId", event.target.value)}
                      className="input min-w-[180px] py-2"
                    >
                      <option value="">Select product...</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="table-cell">
                    <input
                      required
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(event) => updateRow(index, "quantity", event.target.value)}
                      className="input w-20 py-2"
                    />
                  </td>
                  <td className="table-cell">
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={row.costPrice}
                      onChange={(event) => updateRow(index, "costPrice", event.target.value)}
                      className="input w-28 py-2"
                    />
                  </td>
                  <td className="table-cell">
                    <input
                      required
                      value={row.batchNo}
                      onChange={(event) => updateRow(index, "batchNo", event.target.value)}
                      className="input w-32 py-2"
                      placeholder="BATCH-01"
                    />
                  </td>
                  <td className="table-cell">
                    <input
                      required
                      type="date"
                      value={row.expiryDate}
                      onChange={(event) => updateRow(index, "expiryDate", event.target.value)}
                      className="input w-40 py-2"
                    />
                  </td>
                  <td className="table-cell money text-right font-bold text-ink-900">
                    ₹ {formatMoney((Number(row.quantity) || 0) * (Number(row.costPrice) || 0))}
                  </td>
                  <td className="table-cell text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                      title="Remove row"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={addRow} className="btn-ghost">
            <Plus size={15} strokeWidth={2.6} /> Add row
          </button>
          <div className="flex items-center gap-5">
            <span className="text-sm font-semibold text-ink-500">
              Estimated total:{" "}
              <strong className="money text-lg font-extrabold text-ink-900">
                ₹ {formatMoney(estimatedTotal)}
              </strong>
            </span>
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={16} strokeWidth={2.4} />
              {saving ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>

        {formError && <div className="alert-error mt-4">{formError}</div>}
      </form>

      <div className="space-y-3">
        <h2 className="section-title">Recent purchases</h2>
        {purchases.length === 0 ? (
          <div className="empty-state">
            <p className="text-sm font-bold text-ink-700">No purchases recorded yet.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Date</th>
                  <th className="table-cell">Supplier</th>
                  <th className="table-cell">Bill No</th>
                  <th className="table-cell">Items</th>
                  <th className="table-cell text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 8).map((purchase) => (
                  <tr key={purchase.id} className="table-row">
                    <td className="table-cell text-ink-500">{purchase.purchaseDate}</td>
                    <td className="table-cell font-bold text-ink-900">{purchase.supplierName}</td>
                    <td className="table-cell font-mono text-xs text-ink-500">
                      {purchase.supplierBillNo || "—"}
                    </td>
                    <td className="table-cell text-ink-500">{purchase.items.length}</td>
                    <td className="table-cell money text-right font-bold text-ink-900">
                      ₹ {formatMoney(purchase.total)}
                    </td>
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
