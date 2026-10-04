import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, PackageSearch, Skull } from "lucide-react";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";

const tabs = [
  { key: "all", label: "All Stock", icon: PackageSearch },
  { key: "low", label: "Low Stock", icon: AlertTriangle },
  { key: "expiring", label: "Expiring (60 days)", icon: CalendarClock },
  { key: "expired", label: "Expired", icon: Skull },
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
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-ink-900 text-white shadow-lift"
                    : "border border-ink-900/10 bg-white text-ink-600 hover:border-ink-900/25"
                }`}
              >
                <Icon size={15} strokeWidth={2.3} />
                {item.label}
              </button>
            );
          })}
        </div>
        {tab === "expiring" && (
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-500">
            Days window
            <select
              value={days}
              onChange={(event) => changeDays(Number(event.target.value))}
              className="input w-24 py-2"
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </label>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading stock..." />
      ) : data.length === 0 ? (
        <div className="empty-state">
          <PackageSearch size={26} className="text-ink-500" />
          <p className="text-sm font-bold text-ink-700">
            {tab === "low"
              ? "No products are below their reorder level."
              : tab === "expiring"
              ? `Nothing expires in the next ${days} days.`
              : tab === "expired"
              ? "No expired batches."
              : "No stock records yet. Add a purchase first."}
          </p>
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
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="table-head">
          <tr>
            <th className="table-cell">Product</th>
            <th className="table-cell">Category</th>
            <th className="table-cell">Unit</th>
            <th className="table-cell">Total Qty</th>
            <th className="table-cell">Reorder</th>
            <th className="table-cell">Status</th>
            <th className="table-cell">Batches (qty, expiry)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId} className="table-row align-top">
              <td className="table-cell font-bold text-ink-900">{row.productName}</td>
              <td className="table-cell">
                <span className="badge-neutral">{row.categoryName || "Uncategorized"}</span>
              </td>
              <td className="table-cell text-ink-500">{row.unit}</td>
              <td className="table-cell money font-extrabold text-ink-900">
                {row.totalQuantity}
              </td>
              <td className="table-cell text-ink-500">{row.reorderLevel}</td>
              <td className="table-cell">
                <span className={row.status === "LOW" ? "badge-warn" : "badge-ok"}>
                  {row.status}
                </span>
              </td>
              <td className="table-cell text-ink-500">
                {row.batches.length === 0 ? (
                  <span className="badge-danger">out of stock</span>
                ) : (
                  <ul className="space-y-1">
                    {row.batches.map((batch) => (
                      <li key={batch.batchId}>
                        <span className="font-mono text-xs font-bold text-ink-700">
                          {batch.batchNo}
                        </span>{" "}
                        · {batch.quantity} pcs · exp {batch.expiryDate}
                        {batch.daysToExpiry < 0 && (
                          <span className="ml-1 text-rose-600">(expired)</span>
                        )}
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
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="table-cell">Product</th>
              <th className="table-cell">Total Qty</th>
              <th className="table-cell">Reorder Level</th>
              <th className="table-cell text-right">Shortfall</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.productId} className="table-row">
                <td className="table-cell font-bold text-ink-900">{row.productName}</td>
                <td className="table-cell money font-extrabold text-ink-900">
                  {row.totalQuantity}
                </td>
                <td className="table-cell text-ink-500">{row.reorderLevel}</td>
                <td className="table-cell text-right">
                  <span className="badge-warn">
                    {Math.max(0, row.reorderLevel - row.totalQuantity)} {row.unit} to order
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="table-head">
          <tr>
            <th className="table-cell">Product</th>
            <th className="table-cell">Batch</th>
            <th className="table-cell">Quantity</th>
            <th className="table-cell">Expiry Date</th>
            <th className="table-cell">{tab === "expired" ? "Days Overdue" : "Days Left"}</th>
            <th className="table-cell text-right">Batch Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.productId + row.batchNo} className="table-row">
              <td className="table-cell font-bold text-ink-900">{row.productName}</td>
              <td className="table-cell font-mono text-xs font-bold text-ink-700">
                {row.batchNo}
              </td>
              <td className="table-cell money font-extrabold text-ink-900">{row.quantity}</td>
              <td className="table-cell text-ink-500">{row.expiryDate}</td>
              <td className="table-cell">
                <span className={tab === "expired" ? "badge-danger" : "badge-warn"}>
                  {Math.abs(row.daysLeft)} days {tab === "expired" ? "overdue" : "left"}
                </span>
              </td>
              <td className="table-cell money text-right text-ink-500">
                {row.costPrice !== undefined ? `₹ ${formatMoney(row.costPrice)}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
