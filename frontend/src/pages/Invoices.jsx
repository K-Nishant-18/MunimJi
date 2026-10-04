import { useEffect, useState } from "react";
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
        const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
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
      <h1 className="text-xl font-semibold text-slate-800">Invoices</h1>

      {error && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <Loader label="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-400">
          No invoices yet. Create one from the Billing page.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(invoice.invoiceDate).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{invoice.customerName || "Walk-in"}</td>
                  <td className="px-4 py-3 text-slate-500">{invoice.itemCount}</td>
                  <td className="px-4 py-3 text-slate-700">₹ {formatMoney(invoice.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => openDetail(invoice)}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadPdf(invoice)}
                        className="text-emerald-600 hover:underline"
                      >
                        PDF
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
          <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {detailError}
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Invoice No</p>
                <p className="font-semibold text-slate-700">{detail.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-slate-400">Date</p>
                <p className="text-slate-700">{new Date(detail.invoiceDate).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-slate-400">Customer</p>
                <p className="text-slate-700">{detail.customerName || "Walk-in"}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="text-slate-700">{detail.customerPhone || "-"}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">HSN</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">GST %</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-slate-700">{item.productName}</td>
                      <td className="px-3 py-2 text-slate-500">{item.hsnCode || "-"}</td>
                      <td className="px-3 py-2 text-slate-500">{item.quantity}</td>
                      <td className="px-3 py-2 text-slate-500">₹ {formatMoney(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-slate-500">{item.gstRate}</td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        ₹ {formatMoney(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>₹ {formatMoney(detail.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span>- ₹ {formatMoney(detail.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CGST</span>
                <span>₹ {formatMoney(detail.cgstAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SGST</span>
                <span>₹ {formatMoney(detail.sgstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
                <span>Grand Total</span>
                <span>₹ {formatMoney(detail.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => downloadPdf(detail)}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
