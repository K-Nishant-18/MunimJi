import { useEffect, useState } from "react";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";

const tabs = [
  { key: "all", label: "All Stock" },
  { key: "low", label: "Low Stock" },
  { key: "expiring", label: "Expiring (60 days)" },
  { key: "expired", label: "Expired" },
];

export default function Stock() {
  const [tab, setTab] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(60);

  async function load(activeTab, activeDays) {
    setLoading(true);
    setError("");
    try {
      let response;
      if (activeTab === "low") {
        response = await api.get("/stock/low");
      } else if (activeTab === "expiring") {
        response = await api.get("/stock/expiring", { params: { days: activeDays } });
      } else if (activeTab === "expired") {
        response = await api.get("/stock/expired");
      } else {
        response = await api.get("/stock");
      }
      setData(response.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(tab, days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  function changeDays(value) {
    setDays(value);
    if (tab === "expiring") {
      load("expiring", value);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">Stock</h1>
        {tab === "expiring" && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Days window
            <select
              value={days}
              onChange={(event) => changeDays(Number(event.target.value))}
              className="rounded border border-slate-300 px-2 py-1.5"
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === item.key
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <Loader label="Loading stock..." />
      ) : data.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-400">
          {tab === "low"
            ? "No products are below their reorder level."
            : tab === "expiring"
            ? `Nothing expires in the next ${days} days.`
            : tab === "expired"
            ? "No expired batches."
            : "No stock records yet. Add a purchase first."}
        </div>
      ) : tab === "all" ? (
        <AllStockTable rows={data} />
      ) : (
        <AlertTable tab={tab} rows={data} />
      )}
    </div>
  );
}

function AllStockTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Total Qty</th>
            <th className="px-4 py-3">Reorder Level</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Batches (qty, expiry)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.productId} className="align-top hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">{row.productName}</td>
              <td className="px-4 py-3 text-slate-500">{row.categoryName || "-"}</td>
              <td className="px-4 py-3 text-slate-500">{row.unit}</td>
              <td className="px-4 py-3 text-slate-700">{row.totalQuantity}</td>
              <td className="px-4 py-3 text-slate-500">{row.reorderLevel}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    row.status === "LOW" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {row.batches.length === 0 ? (
                  <span className="text-amber-600">No batches (out of stock)</span>
                ) : (
                  <ul className="space-y-1">
                    {row.batches.map((batch) => (
                      <li key={batch.batchId}>
                        {batch.batchNo}: {batch.quantity} pcs, exp {batch.expiryDate}
                        {batch.daysToExpiry < 0 && " (expired)"}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AlertTable({ tab, rows }) {
  if (tab === "low") {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Total Qty</th>
              <th className="px-4 py-3">Reorder Level</th>
              <th className="px-4 py-3">Shortfall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.productId}>
                <td className="px-4 py-3 font-medium text-slate-700">{row.productName}</td>
                <td className="px-4 py-3 text-slate-700">{row.totalQuantity}</td>
                <td className="px-4 py-3 text-slate-500">{row.reorderLevel}</td>
                <td className="px-4 py-3 text-rose-600">
                  {Math.max(0, row.reorderLevel - row.totalQuantity)} {row.unit} to order
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Batch</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Expiry Date</th>
            <th className="px-4 py-3">{tab === "expired" ? "Days Overdue" : "Days Left"}</th>
            <th className="px-4 py-3">Batch Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.productId + row.batchNo}>
              <td className="px-4 py-3 font-medium text-slate-700">{row.productName}</td>
              <td className="px-4 py-3 text-slate-500">{row.batchNo}</td>
              <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
              <td className="px-4 py-3 text-slate-500">{row.expiryDate}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    tab === "expired"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {Math.abs(row.daysLeft)} days {tab === "expired" ? "overdue" : "left"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {row.costPrice !== undefined ? `₹ ${formatMoney(row.costPrice)}` : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
