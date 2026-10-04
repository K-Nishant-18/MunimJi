import { useEffect, useState } from "react";
import { Download, Eye, Receipt } from "lucide-react";
import api, { errorMessage, formatMoney } from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import Pagination from "../components/Pagination.jsx";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/invoices", { params: { page, size: 10 } });
      setInvoices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function openDetail(invoice) {
    setDetail(invoice);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await api.get(`/invoices/${invoice.id}`);
      setDetail(response.data);
    } catch (err) {
      setDetailError(errorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  }

  function downloadPdf(invoice) {
    api
      .get(`/invoices/${invoice.id}/pdf`, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => window.alert("Could not download the PDF. Please try again."));
  }

  return (
    <div className="space-y-4">
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <Receipt size={26} className="text-ink-500" />
          <p className="text-sm font-bold text-ink-700">No invoices yet.</p>
          <p className="text-xs font-medium text-ink-500">
            Create one from the Billing counter.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="table-cell">Invoice No</th>
                <th className="table-cell">Date</th>
                <th className="table-cell">Customer</th>
                <th className="table-cell">Items</th>
                <th className="table-cell text-right">Grand Total</th>
                <th className="table-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="table-row">
                  <td className="table-cell">
                    <span className="badge-neutral font-mono">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="table-cell text-ink-500">
                    {new Date(invoice.invoiceDate).toLocaleString("en-IN")}
                  </td>
                  <td className="table-cell font-bold text-ink-900">
                    {invoice.customerName || "Walk-in"}
                  </td>
                  <td className="table-cell text-ink-500">{invoice.itemCount}</td>
                  <td className="table-cell money text-right font-extrabold text-ink-900">
                    ₹ {formatMoney(invoice.grandTotal)}
                  </td>
                  <td className="table-cell">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openDetail(invoice)}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(invoice)}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={!!detail} title="Invoice Detail" onClose={() => setDetail(null)} wide>
        {detailLoading ? (
          <Loader label="Loading invoice..." />
        ) : detailError ? (
          <div className="alert-error">{detailError}</div>
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-ink-900/[0.03] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Invoice No
                </p>
                <p className="mt-0.5 font-mono text-base font-extrabold text-ink-900">
                  {detail.invoiceNumber}
                </p>
              </div>
              <div className="rounded-xl bg-ink-900/[0.03] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Date
                </p>
                <p className="mt-0.5 font-semibold text-ink-900">
                  {new Date(detail.invoiceDate).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-xl bg-ink-900/[0.03] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Customer
                </p>
                <p className="mt-0.5 font-semibold text-ink-900">
                  {detail.customerName || "Walk-in"}
                </p>
              </div>
              <div className="rounded-xl bg-ink-900/[0.03] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Phone
                </p>
                <p className="mt-0.5 font-semibold text-ink-900">{detail.customerPhone || "—"}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ink-900/[0.07]">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-cell">Item</th>
                    <th className="table-cell">HSN</th>
                    <th className="table-cell">Qty</th>
                    <th className="table-cell">Rate</th>
                    <th className="table-cell">GST %</th>
                    <th className="table-cell text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item, index) => (
                    <tr key={index} className="table-row">
                      <td className="table-cell font-bold text-ink-900">{item.productName}</td>
                      <td className="table-cell font-mono text-xs text-ink-500">
                        {item.hsnCode || "—"}
                      </td>
                      <td className="table-cell text-ink-500">{item.quantity}</td>
                      <td className="table-cell money text-ink-500">
                        ₹ {formatMoney(item.unitPrice)}
                      </td>
                      <td className="table-cell text-ink-500">{item.gstRate}</td>
                      <td className="table-cell money text-right font-bold text-ink-900">
                        ₹ {formatMoney(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-ink-500">Subtotal</span>
                <span className="money font-bold text-ink-900">
                  ₹ {formatMoney(detail.subTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-ink-500">Discount</span>
                <span className="money font-bold text-rose-600">
                  − ₹ {formatMoney(detail.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-ink-500">CGST</span>
                <span className="money font-bold text-ink-900">
                  ₹ {formatMoney(detail.cgstAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-ink-500">SGST</span>
                <span className="money font-bold text-ink-900">
                  ₹ {formatMoney(detail.sgstAmount)}
                </span>
              </div>
              <div className="flex justify-between rounded-xl bg-ink-900 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Grand Total
                </span>
                <span className="money font-extrabold text-gold-300">
                  ₹ {formatMoney(detail.grandTotal)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => downloadPdf(detail)}
                className="btn-primary"
              >
                <Download size={16} strokeWidth={2.4} /> Download PDF
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
