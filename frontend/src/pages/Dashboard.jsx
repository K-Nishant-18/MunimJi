import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      setError("");
      try {
        const [sumRes, topRes, monthRes, lowRes, expRes, oldRes] = await Promise.all([
          api.get("/reports/summary"),
          api.get("/reports/top-products?limit=5"),
          api.get("/reports/monthly-sales"),
          api.get("/stock/low"),
          api.get("/stock/expiring?days=30"),
          api.get("/stock/expired"),
        ]);
        if (cancelled) return;
        setSummary(sumRes.data);
        setTopProducts(topRes.data);
        setMonthlySales(monthRes.data);
        setLowStock(lowRes.data);
        setExpiring(expRes.data);
        setExpired(oldRes.data);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`₹ ${formatMoney(summary.todaySales)}`}
          subtitle={`${summary.todayInvoiceCount} invoices today`}
          accent="emerald"
        />
        <StatCard
          title="This Month"
          value={`₹ ${formatMoney(summary.monthSales)}`}
          subtitle={`${summary.monthInvoiceCount} invoices this month`}
          accent="indigo"
        />
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockCount}
          subtitle="At or below reorder level"
          accent="amber"
        />
        <StatCard
          title="Expiring in 30 Days"
          value={summary.expiringSoonCount}
          subtitle="Batches to sell first"
          accent="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Top 5 Products (last 30 days)
          </h2>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No sales in the last 30 days yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="productName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantitySold" name="Qty sold" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Monthly Sales (12 months)</h2>
          {monthlySales.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" name="Sales" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alert lists */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AlertList
          title="Low Stock"
          items={lowStock.map((item) => ({
            key: item.productId,
            main: item.productName,
            detail: `${item.totalQuantity} left / reorder at ${item.reorderLevel} ${item.unit}`,
          }))}
          emptyText="All products are above their reorder level."
        />
        <AlertList
          title="Expiring in 30 Days"
          items={expiring.map((item) => ({
            key: item.productId + item.batchNo,
            main: item.productName,
            detail: `Batch ${item.batchNo}: ${item.quantity} left, expires in ${item.daysLeft} days`,
          }))}
          emptyText="Nothing is expiring in the next 30 days."
        />
        <AlertList
          title="Expired Batches"
          items={expired.map((item) => ({
            key: item.productId + item.batchNo,
            main: item.productName,
            detail: `Batch ${item.batchNo}: ${item.quantity} left, expired ${Math.abs(item.daysLeft)} days ago`,
          }))}
          emptyText="No expired stock."
        />
      </div>
    </div>
  );
}

function AlertList({ title, items, emptyText }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.slice(0, 6).map((item) => (
            <li key={item.key} className="py-2">
              <p className="text-sm font-medium text-slate-700">{item.main}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
