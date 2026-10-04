import { useEffect, useRef, useState } from "react";
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
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">Invoice Saved</h1>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm text-emerald-700">Invoice number</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{savedInvoice.invoiceNumber}</p>
          <p className="mt-3 text-sm text-emerald-700">
            Grand total: <strong>₹ {formatMoney(savedInvoice.grandTotal)}</strong>
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={() => downloadPdf(savedInvoice.id, savedInvoice.invoiceNumber)}
          >
            Download PDF
          </button>
          <button
            type="button"
            onClick={startNewBill}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
          >
            New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Billing (POS)</h1>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Search + cart */}
        <div className="space-y-4 xl:col-span-2">
          <div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Search product (type and press Enter to add)
            </label>
            <input
              ref={searchRef}
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Rice, Cola, 8901234000011"
              className="input text-base"
            />
            {searching && <p className="mt-2 text-xs text-slate-400">Searching...</p>}
            {results.length > 0 && (
              <ul className="mt-2 divide-y divide-slate-100 rounded border border-slate-200">
                {results.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                        index === highlight ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-medium text-slate-700">{product.name}</span>
                      <span className="text-slate-500">
                        ₹ {formatMoney(product.sellingPrice)} / {product.unit} (GST {product.gstRate}%)
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && !searching && results.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">No products match "{query}".</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-700">Cart</h2>
            </div>
            {cart.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Cart is empty. Search above and press Enter to add items.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">GST %</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((line) => (
                    <tr key={line.productId}>
                      <td className="px-4 py-2 font-medium text-slate-700">{line.name}</td>
                      <td className="px-4 py-2 text-slate-500">₹ {formatMoney(line.price)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => changeQuantity(line.productId, -1)}
                            className="h-6 w-6 rounded border border-slate-300 text-slate-600"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQuantity(line.productId, 1)}
                            className="h-6 w-6 rounded border border-slate-300 text-slate-600"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-slate-500">{line.gstRate}</td>
                      <td className="px-4 py-2 text-right text-slate-700">
                        ₹ {formatMoney(line.price * line.quantity)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => changeQuantity(line.productId, -line.quantity)}
                          className="text-rose-600 hover:underline"
                        >
                          Remove
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
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Customer</h2>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer name (optional)"
              className="input mb-2"
            />
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Phone (optional)"
              className="input"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Bill Summary</h2>
            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-600">Discount (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                className="input"
              />
            </label>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="text-slate-700">₹ {formatMoney(subTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Discount</dt>
                <dd className="text-slate-700">- ₹ {formatMoney(discountNumber)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">GST (CGST + SGST)</dt>
                <dd className="text-slate-700">₹ {formatMoney(totalGst)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <dt>Grand Total</dt>
                <dd>₹ {formatMoney(grandTotal)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || cart.length === 0}
              className="mt-4 w-full rounded bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Bill"}
            </button>
            <p className="mt-2 text-xs text-slate-400">
              Stock is reduced using FEFO (first expiry, first out).
            </p>
          </div>
        </div>
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
