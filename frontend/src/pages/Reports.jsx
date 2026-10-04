import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import StatCard from "../components/StatCard.jsx";

const BAR_COLORS = ["#4f46e5", "#059669", "#d97706", "#e11d48", "#0891b2", "#7c3aed"];

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [top, setTop] = useState([]);
  const [gst, setGst] = useState(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(activeMonth) {
    setLoading(true);
    setError("");
    try {
      const [sumRes, monthlyRes, topRes, gstRes] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/reports/monthly-sales"),
        api.get("/reports/top-products", { params: { limit: 5 } }),
        api.get("/reports/gst-summary", { params: { month: activeMonth } }),
      ]);
      setSummary(sumRes.data);
      setMonthly(
        monthlyRes.data.map((row) => ({
          ...row,
          label: new Date(row.month + "-01").toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
        }))
      );
      setTop(topRes.data);
      setGst(gstRes.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeMonth(value) {
    setMonth(value);
    load(value);
  }

  if (loading) {
    return <Loader label="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-800">Reports</h1>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          GST month
          <input
            type="month"
            value={month}
            onChange={(event) => changeMonth(event.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5"
          />
        </label>
      </div>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={`₹ ${formatMoney(summary.todaySales)}`}
            subtitle={`${summary.todayInvoiceCount} invoices today`}
            accent="indigo"
          />
          <StatCard
            title="This Month"
            value={`₹ ${formatMoney(summary.monthSales)}`}
            subtitle={`${summary.monthInvoiceCount} invoices this month`}
            accent="emerald"
          />
          <StatCard
            title="Low Stock"
            value={summary.lowStockCount}
            subtitle={`${summary.totalProducts} products total`}
            accent="amber"
          />
          <StatCard
            title="Expiring Soon"
            value={summary.expiringSoonCount}
            subtitle={`${summary.totalInvoices} invoices in total`}
            accent="rose"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly sales line */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Monthly Sales (last 12 months)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `₹ ${formatMoney(value)}`} />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top products bar */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Top Products (last 30 days)</h2>
          {top.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">No sales in the last 30 days.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(value) => `₹ ${formatMoney(value)}`} />
                <Bar dataKey="salesAmount" radius={[0, 4, 4, 0]}>
                  {top.map((_, index) => (
                    <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* GST summary */}
      {gst && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-700">GST Summary - {gst.month}</h2>
            <span className="text-xs text-slate-400">{gst.invoiceCount} invoices</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Taxable Value</p>
              <p className="mt-1 text-lg font-semibold text-slate-700">
                ₹ {formatMoney(gst.totalTaxable)}
              </p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs text-slate-400">CGST</p>
              <p className="mt-1 text-lg font-semibold text-slate-700">₹ {formatMoney(gst.totalCgst)}</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="text-xs text-slate-400">SGST</p>
              <p className="mt-1 text-lg font-semibold text-slate-700">₹ {formatMoney(gst.totalSgst)}</p>
            </div>
            <div className="rounded bg-indigo-50 p-3">
              <p className="text-xs text-indigo-400">Total GST</p>
              <p className="mt-1 text-lg font-semibold text-indigo-700">₹ {formatMoney(gst.totalGst)}</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">GST Rate</th>
                  <th className="py-2 pr-4">Taxable Amount</th>
                  <th className="py-2 pr-4">GST Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gst.byRate.map((row) => (
                  <tr key={row.rate}>
                    <td className="py-2 pr-4 font-medium text-slate-700">{row.rate}%</td>
                    <td className="py-2 pr-4 text-slate-600">₹ {formatMoney(row.taxableAmount)}</td>
                    <td className="py-2 pr-4 text-slate-600">₹ {formatMoney(row.gstAmount)}</td>
                  </tr>
                ))}
                {gst.byRate.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400">
                      No GST data for {gst.month}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
