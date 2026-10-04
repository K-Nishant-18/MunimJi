import { useEffect, useState } from "react";
import { CalendarDays, FileText, Landmark } from "lucide-react";
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

const BAR_COLORS = ["#0f886d", "#f6b93c", "#2a4069", "#e11d48", "#1ea785"];

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
      {error && <div className="alert-error">{error}</div>}

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={`₹ ${formatMoney(summary.todaySales)}`}
            subtitle={`${summary.todayInvoiceCount} invoices today`}
            accent="brand"
            icon={FileText}
          />
          <StatCard
            title="This Month"
            value={`₹ ${formatMoney(summary.monthSales)}`}
            subtitle={`${summary.monthInvoiceCount} invoices this month`}
            accent="ink"
            icon={Landmark}
          />
          <StatCard
            title="Low Stock"
            value={summary.lowStockCount}
            subtitle={`${summary.totalProducts} products total`}
            accent="gold"
            icon={FileText}
          />
          <StatCard
            title="Expiring Soon"
            value={summary.expiringSoonCount}
            subtitle={`${summary.totalInvoices} invoices in total`}
            accent="rose"
            icon={CalendarDays}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly sales line */}
        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Monthly Sales</h2>
            <span className="badge-neutral">12 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => `₹ ${formatMoney(value)}`}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0f886d"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#0f886d" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top products bar */}
        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Top Products</h2>
            <span className="badge-neutral">Last 30 days</span>
          </div>
          {top.length === 0 ? (
            <p className="py-16 text-center text-sm font-medium text-ink-500">
              No sales in the last 30 days.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={top} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={110} />
                <Tooltip
                  formatter={(value) => `₹ ${formatMoney(value)}`}
                  cursor={{ fill: "rgba(15,136,109,0.06)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="salesAmount" radius={[0, 6, 6, 0]}>
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
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900/[0.06] bg-ink-900/[0.02] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
                <Landmark size={17} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink-900">GST Summary</p>
                <p className="text-xs font-medium text-ink-500">
                  {gst.invoiceCount} invoices in {gst.month}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-500">
              Month
              <input
                type="month"
                value={month}
                onChange={(event) => changeMonth(event.target.value)}
                className="input w-40 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-4">
            <div className="rounded-xl bg-ink-900/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                Taxable Value
              </p>
              <p className="money mt-1.5 text-lg font-extrabold text-ink-900">
                ₹ {formatMoney(gst.totalTaxable)}
              </p>
            </div>
            <div className="rounded-xl bg-ink-900/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">CGST</p>
              <p className="money mt-1.5 text-lg font-extrabold text-ink-900">
                ₹ {formatMoney(gst.totalCgst)}
              </p>
            </div>
            <div className="rounded-xl bg-ink-900/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">SGST</p>
              <p className="money mt-1.5 text-lg font-extrabold text-ink-900">
                ₹ {formatMoney(gst.totalSgst)}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-100">
                Total GST
              </p>
              <p className="money mt-1.5 text-lg font-extrabold text-white">
                ₹ {formatMoney(gst.totalGst)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-6">
            <table className="w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="table-cell">GST Rate</th>
                  <th className="table-cell text-right">Taxable Amount</th>
                  <th className="table-cell text-right">GST Amount</th>
                </tr>
              </thead>
              <tbody>
                {gst.byRate.map((row) => (
                  <tr key={row.rate} className="table-row">
                    <td className="table-cell">
                      <span className="badge-warn">{row.rate}%</span>
                    </td>
                    <td className="table-cell money text-right font-bold text-ink-900">
                      ₹ {formatMoney(row.taxableAmount)}
                    </td>
                    <td className="table-cell money text-right font-bold text-ink-900">
                      ₹ {formatMoney(row.gstAmount)}
                    </td>
                  </tr>
                ))}
                {gst.byRate.length === 0 && (
                  <tr>
                    <td colSpan={3} className="table-cell py-6 text-center text-ink-500">
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
