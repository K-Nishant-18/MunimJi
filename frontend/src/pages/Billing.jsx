import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import api, { errorMessage, formatMoney } from "../api/axios.js";

// POS style billing: search with the keyboard, Enter adds the highlighted item.
export default function Billing() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(0);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedInvoice, setSavedInvoice] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (savedInvoice && searchRef.current) {
      searchRef.current.focus();
    }
  }, [savedInvoice]);

  // Search the product list while typing (short delay to avoid flooding)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await api.get("/products", {
          params: { search: query.trim(), page: 0, size: 8 },
        });
        if (!cancelled) {
          setResults(response.data.content);
          setHighlight(0);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function addToCart(product) {
    setError("");
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          price: Number(product.sellingPrice),
          gstRate: Number(product.gstRate),
          quantity: 1,
        },
      ];
    });
    setQuery("");
    setResults([]);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }

  function handleKeyDown(event) {
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      addToCart(results[highlight]);
    }
  }

  function changeQuantity(productId, delta) {
    setCart((current) =>
      current
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.max(0, line.quantity + delta) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  const subTotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const discountNumber = Math.max(0, Number(discount) || 0);
  const totalGst = cart.reduce((sum, line) => {
    const gross = line.price * line.quantity;
    const share = subTotal > 0 ? (gross / subTotal) * discountNumber : 0;
    const taxable = gross - share;
    return sum + (taxable * line.gstRate) / 100;
  }, 0);
  const grandTotal = subTotal - discountNumber + totalGst;

  async function handleSave() {
    setError("");
    if (cart.length === 0) {
      setError("Add at least one product to the bill.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        discount: discountNumber,
        items: cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      };
      const response = await api.post("/invoices", payload);
      setSavedInvoice(response.data);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount("0");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function startNewBill() {
    setSavedInvoice(null);
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }

  if (savedInvoice) {
    return (
      <div className="mx-auto max-w-lg animate-fadeUp">
        <div className="card overflow-hidden text-center">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-10">
            <CheckCircle2 size={54} className="mx-auto text-white" strokeWidth={1.6} />
            <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-100">
              Invoice saved
            </p>
            <p className="money mt-2 text-3xl font-extrabold text-white">
              {savedInvoice.invoiceNumber}
            </p>
            <p className="money mt-3 text-lg font-bold text-gold-300">
              ₹ {formatMoney(savedInvoice.grandTotal)}
            </p>
          </div>
          <div className="flex justify-center gap-3 p-6">
            <button
              type="button"
              onClick={() => downloadPdf(savedInvoice.id, savedInvoice.invoiceNumber)}
              className="btn-primary"
            >
              <Download size={16} strokeWidth={2.4} /> Download PDF
            </button>
            <button type="button" onClick={startNewBill} className="btn-ghost">
              <Plus size={16} strokeWidth={2.4} /> New Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {/* Search + cart */}
      <div className="space-y-5 xl:col-span-2">
        <div className="card relative p-5">
          <label className="label flex items-center gap-2">
            <Search size={14} /> Scan or search product
            <span className="ml-auto rounded border border-ink-900/10 bg-ink-900/[0.03] px-1.5 py-0.5 text-[10px] font-bold text-ink-500">
              ↑ ↓ + Enter
            </span>
          </label>
          <input
            ref={searchRef}
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a name or barcode, press Enter to add..."
            className="input text-base"
          />
          {searching && (
            <p className="mt-2 text-xs font-semibold text-brand-600">Searching...</p>
          )}
          {results.length > 0 && (
            <ul className="mt-3 divide-y divide-ink-900/[0.05] overflow-hidden rounded-xl border border-ink-900/10 shadow-lift">
              {results.map((product, index) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                      index === highlight ? "bg-brand-50" : "bg-white hover:bg-ink-900/[0.03]"
                    }`}
                  >
                    <span className="font-bold text-ink-900">{product.name}</span>
                    <span className="money text-xs font-semibold text-ink-500">
                      ₹ {formatMoney(product.sellingPrice)} / {product.unit} · GST{" "}
                      {product.gstRate}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && !searching && results.length === 0 && (
            <p className="mt-2 text-xs font-medium text-ink-500">No products match "{query}".</p>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-900/[0.06] bg-ink-900/[0.02] px-5 py-3.5">
            <h2 className="section-title flex items-center gap-2">
              <ShoppingCart size={14} /> Cart
            </h2>
            <span className="badge-neutral">{cart.length} items</span>
          </div>
          {cart.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm font-medium text-ink-500">
              Cart is empty — search above and press <strong>Enter</strong> to add items.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">Item</th>
                  <th className="table-cell">Price</th>
                  <th className="table-cell">Qty</th>
                  <th className="table-cell">GST %</th>
                  <th className="table-cell text-right">Amount</th>
                  <th className="table-cell" />
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => (
                  <tr key={line.productId} className="table-row">
                    <td className="table-cell font-bold text-ink-900">{line.name}</td>
                    <td className="table-cell money text-ink-500">
                      ₹ {formatMoney(line.price)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => changeQuantity(line.productId, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:border-ink-900/25 hover:bg-ink-900/[0.04]"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="money w-7 text-center font-extrabold text-ink-900">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQuantity(line.productId, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-900/10 text-ink-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="table-cell text-ink-500">{line.gstRate}</td>
                    <td className="table-cell money text-right font-bold text-ink-900">
                      ₹ {formatMoney(line.price * line.quantity)}
                    </td>
                    <td className="table-cell text-right">
                      <button
                        type="button"
                        onClick={() => changeQuantity(line.productId, -line.quantity)}
                        className="rounded-lg p-2 text-ink-500 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Totals and customer */}
      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="section-title mb-3">Customer</h2>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Name (optional)"
            className="input mb-2.5"
          />
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Phone (optional)"
            className="input"
          />
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-ink-900/[0.06] bg-ink-900/[0.02] px-5 py-3.5">
            <h2 className="section-title">Bill Summary</h2>
          </div>
          <div className="p-5">
            <label className="mb-4 block">
              <span className="label">Discount (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                className="input"
              />
            </label>

            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-ink-500">Subtotal</dt>
                <dd className="money font-bold text-ink-900">₹ {formatMoney(subTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-ink-500">Discount</dt>
                <dd className="money font-bold text-rose-600">
                  − ₹ {formatMoney(discountNumber)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-ink-500">GST (CGST + SGST)</dt>
                <dd className="money font-bold text-ink-900">₹ {formatMoney(totalGst)}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl bg-ink-900 px-4 py-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Grand Total
                </span>
                <span className="money text-2xl font-extrabold text-gold-300">
                  ₹ {formatMoney(grandTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || cart.length === 0}
              className="btn-gold mt-4 w-full py-3"
            >
              <FileText size={16} strokeWidth={2.4} />
              {saving ? "Saving..." : "Save Bill"}
            </button>

            <p className="mt-3 text-center text-[11px] font-medium text-ink-500">
              Stock is deducted FEFO — first expiry, first out.
            </p>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}
      </div>
    </div>
  );
}

// Downloads the PDF through axios so the JWT is attached to the request
async function downloadPdf(id, invoiceNumber) {
  try {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    window.alert("Could not download the PDF. Please try again.");
  }
}
