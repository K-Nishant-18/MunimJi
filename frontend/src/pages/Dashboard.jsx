import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  IndianRupee,
  Receipt,
} from "lucide-react";
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
    return <div className="alert-error">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`₹ ${formatMoney(summary.todaySales)}`}
          subtitle={`${summary.todayInvoiceCount} invoices today`}
          accent="brand"
          icon={IndianRupee}
        />
        <StatCard
          title="This Month"
          value={`₹ ${formatMoney(summary.monthSales)}`}
          subtitle={`${summary.monthInvoiceCount} invoices this month`}
          accent="ink"
          icon={Receipt}
        />
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockCount}
          subtitle="At or below reorder level"
          accent="gold"
          icon={AlertTriangle}
        />
        <StatCard
          title="Expiring in 30 Days"
          value={summary.expiringSoonCount}
          subtitle="Batches to sell first"
          accent="rose"
          icon={CalendarClock}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Top 5 Products</h2>
            <span className="badge-neutral">Last 30 days</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-ink-500">
              No sales in the last 30 days yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="productName" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "rgba(15,136,109,0.06)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="quantitySold" name="Qty sold" fill="#0f886d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card card-pad">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Monthly Sales</h2>
            <span className="badge-neutral">12 months</span>
          </div>
          {monthlySales.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-ink-500">No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Sales"
                  stroke="#f6b93c"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#f6b93c" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Alert lists */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AlertList
          tone="gold"
          title="Low Stock"
          items={lowStock.map((item) => ({
            key: item.productId,
            main: item.productName,
            detail: `${item.totalQuantity} left · reorder at ${item.reorderLevel} ${item.unit}`,
          }))}
          emptyText="All products are above their reorder level."
        />
        <AlertList
          tone="brand"
          title="Expiring in 30 Days"
          items={expiring.map((item) => ({
            key: item.productId + item.batchNo,
            main: item.productName,
            detail: `${item.batchNo} · ${item.quantity} left · ${item.daysLeft} days left`,
          }))}
          emptyText="Nothing is expiring in the next 30 days."
        />
        <AlertList
          tone="rose"
          title="Expired Batches"
          items={expired.map((item) => ({
            key: item.productId + item.batchNo,
            main: item.productName,
            detail: `${item.batchNo} · ${item.quantity} left · expired ${Math.abs(
              item.daysLeft
            )} days ago`,
          }))}
          emptyText="No expired stock."
        />
      </div>
    </div>
  );
}

const tones = {
  gold: { dot: "bg-gold-400", chip: "bg-gold-100 text-gold-600" },
  brand: { dot: "bg-brand-500", chip: "bg-brand-100 text-brand-700" },
  rose: { dot: "bg-rose-500", chip: "bg-rose-100 text-rose-600" },
};

function AlertList({ title, items, emptyText, tone = "brand" }) {
  const palette = tones[tone];
  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${palette.dot}`} />
          {title}
        </h2>
        <span className={`badge ${palette.chip}`}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm font-medium text-ink-500">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 6).map((item) => (
            <li
              key={item.key}
              className="rounded-xl px-2 py-2.5 transition hover:bg-ink-900/[0.03]"
            >
              <p className="truncate text-sm font-bold text-ink-900">{item.main}</p>
              <p className="mt-0.5 text-xs font-medium text-ink-500">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
