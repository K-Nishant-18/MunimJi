// Offline demo mode: a mock API served by the frontend whenever the Spring Boot
// backend cannot be reached. Only the dummy Owner credential may log in offline.

export const DEMO_OWNER = { email: "owner@munimji.local", password: "owner123" };

const FLAG_KEY = "mj_offline_demo";
export const DEMO_MODE_EVENT = "mj:demo-mode";

let demoActive = false;
try {
  demoActive = localStorage.getItem(FLAG_KEY) === "1";
} catch {
  demoActive = false;
}

export function isDemoMode() {
  return demoActive;
}

export function setDemoMode(on) {
  if (on === demoActive) return;
  demoActive = on;
  try {
    if (on) localStorage.setItem(FLAG_KEY, "1");
    else localStorage.removeItem(FLAG_KEY);
  } catch {
    /* storage unavailable - flag stays in memory */
  }
  window.dispatchEvent(new Event(DEMO_MODE_EVENT));
}

/* ---------------------------------- utils --------------------------------- */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function dayOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isoDateTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${isoDate(d)}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function paginate(list, page, size) {
  const p = Number(page || 0);
  const s = Number(size || 10);
  const start = p * s;
  return {
    content: list.slice(start, start + s),
    page: p,
    size: s,
    totalElements: list.length,
    totalPages: Math.max(1, Math.ceil(list.length / s)),
  };
}

/* ------------------------------- demo store ------------------------------- */

const categories = [
  { id: 1, name: "Beverages" },
  { id: 2, name: "Snacks" },
  { id: 3, name: "Dairy" },
  { id: 4, name: "Personal Care" },
  { id: 5, name: "Staples" },
  { id: 6, name: "Home Care" },
];

function product(id, name, barcode, unit, hsnCode, gstRate, sellingPrice, reorderLevel, categoryId, batches) {
  const cat = categories.find((c) => c.id === categoryId);
  return {
    id,
    name,
    barcode,
    unit,
    hsnCode,
    gstRate,
    sellingPrice,
    reorderLevel,
    categoryId,
    categoryName: cat ? cat.name : null,
    _batches: batches.map((b, i) => ({
      batchId: id * 100 + i + 1,
      batchNo: b.no,
      expiryDate: isoDate(dayOffset(b.in)),
      quantity: b.qty,
      costPrice: b.cost,
      daysToExpiry: b.in,
    })),
  };
}

const products = [
  product(1, "Tata Salt 1kg", "8901030501034", "kg", "2501", 5, 28, 20, 5,
    [{ no: "B-SLT-01", in: 400, qty: 64, cost: 22 }]),
  product(2, "Aashirvaad Atta 5kg", "8901063001125", "pcs", "1101", 5, 245, 15, 5,
    [{ no: "B-ATT-01", in: 180, qty: 38, cost: 198 }]),
  product(3, "Amul Milk 500ml", "8901030601149", "pcs", "0401", 5, 28, 30, 3,
    [{ no: "B-MLK-01", in: 4, qty: 12, cost: 24 }]),
  product(4, "Amul Butter 100g", "8901030602156", "pcs", "0405", 12, 58, 20, 3,
    [{ no: "B-BTR-01", in: 45, qty: 44, cost: 47 }, { no: "B-BTR-02", in: 90, qty: 36, cost: 48 }]),
  product(5, "Britannia Cake Roll", "8901030701163", "pcs", "2106", 18, 40, 24, 2,
    [{ no: "B-CKE-01", in: 16, qty: 18, cost: 30 }, { no: "B-CKE-02", in: 70, qty: 52, cost: 31 }]),
  product(6, "Lay's Magic Masala 52g", "8901030801170", "pcs", "2106", 12, 20, 40, 2,
    [{ no: "B-LYS-01", in: -4, qty: 30, cost: 14 }, { no: "B-LYS-02", in: 120, qty: 96, cost: 15 }]),
  product(7, "Maggi Noodles 4-pack", "8901030802187", "pcs", "1902", 12, 56, 25, 2,
    [{ no: "B-MGG-01", in: 210, qty: 74, cost: 43 }]),
  product(8, "Coca-Cola 750ml", "8901030901194", "pcs", "2202", 28, 40, 36, 1,
    [{ no: "B-COK-01", in: 150, qty: 112, cost: 30 }, { no: "B-COK-02", in: 240, qty: 84, cost: 31 }]),
  product(9, "Real Mixed Fruit Juice 1L", "8901030902207", "pcs", "2009", 12, 115, 18, 1,
    [{ no: "B-JCE-01", in: -12, qty: 6, cost: 88 }, { no: "B-JCE-02", in: 95, qty: 27, cost: 90 }]),
  product(10, "Colgate Toothpaste 100g", "8901031001214", "pcs", "3306", 18, 55, 25, 4,
    [{ no: "B-CLG-01", in: 320, qty: 10, cost: 41 }]),
  product(11, "Dove Beauty Bar 100g", "8901031002221", "pcs", "3401", 18, 65, 20, 4,
    [{ no: "B-DVE-01", in: 25, qty: 33, cost: 50 }, { no: "B-DVE-02", in: 260, qty: 47, cost: 51 }]),
  product(12, "Dettol Handwash 200ml", "8901031003238", "pcs", "3401", 18, 99, 15, 4,
    [{ no: "B-DTL-01", in: 300, qty: 8, cost: 74 }]),
  product(13, "Surf Excel Easy Wash 1kg", "8901031101241", "kg", "3402", 18, 135, 12, 6,
    [{ no: "B-SRF-01", in: 500, qty: 29, cost: 104 }]),
  product(14, "Parle-G 100g", "8901030702256", "pcs", "1905", 18, 10, 60, 2,
    [{ no: "B-PRL-01", in: 60, qty: 142, cost: 7 }, { no: "B-PRL-02", in: 3, qty: 55, cost: 7 }]),
];

const suppliers = [
  { id: 1, name: "Shiv Traders", phone: "9812345678", email: "shiv@shivtraders.in", address: "23, Sadar Bazaar, Delhi", gstin: "07AABCS1234F1Z5" },
  { id: 2, name: "Gupta Wholesale", phone: "9821098765", email: "sales@guptawholesale.in", address: "71, Market Road, Noida", gstin: "09AACCG5678H1Z2" },
  { id: 3, name: "Metro Distributors", phone: "9711223344", email: "orders@metrodistrib.in", address: "4, Industrial Area, Gurugram", gstin: "06AADCM9012J1Z8" },
];

function makeInvoice(id, customerName, customerPhone, discount, lines, dateDaysAgo, hour) {
  const items = [];
  let subTotal = 0;
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  const gross = lines.map((l) => {
    const p = products.find((x) => x.id === l.productId);
    return round2(p.sellingPrice * l.qty);
  });
  const grossSum = gross.reduce((a, b) => a + b, 0);
  lines.forEach((l, i) => {
    const p = products.find((x) => x.id === l.productId);
    const g = gross[i];
    const share = grossSum > 0 ? round2((discount * g) / grossSum) : 0;
    const taxable = round2(g - share);
    const gstAmount = round2((taxable * p.gstRate) / 100);
    const cgst = round2(gstAmount / 2);
    const sgst = round2(gstAmount - cgst);
    subTotal = round2(subTotal + g);
    taxableTotal = round2(taxableTotal + taxable);
    cgstTotal = round2(cgstTotal + cgst);
    sgstTotal = round2(sgstTotal + sgst);
    items.push({
      productId: p.id,
      productName: p.name,
      hsnCode: p.hsnCode,
      unitPrice: p.sellingPrice,
      gstRate: p.gstRate,
      quantity: l.qty,
      grossAmount: g,
      discountAmount: share,
      taxableAmount: taxable,
      gstAmount,
      cgstAmount: cgst,
      sgstAmount: sgst,
      lineTotal: round2(taxable + gstAmount),
    });
  });
  const gstTotal = round2(cgstTotal + sgstTotal);
  const d = dayOffset(-dateDaysAgo);
  d.setHours(hour || 11, 20, 0, 0);
  return {
    id,
    invoiceNumber: `INV-${d.getFullYear()}-${String(id).padStart(4, "0")}`,
    invoiceDate: isoDateTime(d),
    customerName,
    customerPhone,
    subTotal,
    discountAmount: round2(discount),
    taxableAmount: taxableTotal,
    cgstAmount: cgstTotal,
    sgstAmount: sgstTotal,
    gstAmount: gstTotal,
    grandTotal: round2(taxableTotal + gstTotal),
    items,
  };
}

const invoices = [
  makeInvoice(1, "Walk-in", null, 0, [{ productId: 8, qty: 2 }, { productId: 14, qty: 5 }], 0, 10),
  makeInvoice(2, "Rahul Sharma", "9810012345", 20, [{ productId: 2, qty: 1 }, { productId: 4, qty: 2 }, { productId: 1, qty: 1 }], 0, 13),
  makeInvoice(3, "Priya Verma", "9899123456", 0, [{ productId: 13, qty: 1 }, { productId: 12, qty: 1 }], 3, 17),
  makeInvoice(4, "Aditya Rao", null, 15, [{ productId: 5, qty: 3 }, { productId: 7, qty: 2 }], 7, 12),
  makeInvoice(5, "Walk-in", null, 0, [{ productId: 6, qty: 4 }, { productId: 8, qty: 1 }], 12, 19),
  makeInvoice(6, "Neha Singh", "9711223344", 30, [{ productId: 11, qty: 2 }, { productId: 10, qty: 1 }, { productId: 4, qty: 1 }], 20, 16),
  makeInvoice(7, "Walk-in", null, 0, [{ productId: 14, qty: 10 }], 35, 11),
  makeInvoice(8, "Karan Mehta", "9988776655", 50, [{ productId: 2, qty: 2 }, { productId: 13, qty: 2 }], 52, 15),
];

const purchases = [
  {
    id: 1, supplierId: 1, supplierName: "Shiv Traders", supplierBillNo: "ST-4471",
    purchaseDate: isoDate(dayOffset(-18)),
    total: 18460,
    items: [
      { productId: 1, productName: "Tata Salt 1kg", quantity: 60, costPrice: 22, batchNo: "B-SLT-01", expiryDate: isoDate(dayOffset(400)) },
      { productId: 7, productName: "Maggi Noodles 4-pack", quantity: 80, costPrice: 43, batchNo: "B-MGG-01", expiryDate: isoDate(dayOffset(210)) },
    ],
  },
  {
    id: 2, supplierId: 2, supplierName: "Gupta Wholesale", supplierBillNo: "GW-9912",
    purchaseDate: isoDate(dayOffset(-9)),
    total: 22740,
    items: [
      { productId: 8, productName: "Coca-Cola 750ml", quantity: 150, costPrice: 30, batchNo: "B-COK-01", expiryDate: isoDate(dayOffset(150)) },
      { productId: 6, productName: "Lay's Magic Masala 52g", quantity: 120, costPrice: 15, batchNo: "B-LYS-02", expiryDate: isoDate(dayOffset(120)) },
    ],
  },
  {
    id: 3, supplierId: 3, supplierName: "Metro Distributors", supplierBillNo: "MD-2208",
    purchaseDate: isoDate(dayOffset(-3)),
    total: 9120,
    items: [
      { productId: 13, productName: "Surf Excel Easy Wash 1kg", quantity: 30, costPrice: 104, batchNo: "B-SRF-01", expiryDate: isoDate(dayOffset(500)) },
      { productId: 11, productName: "Dove Beauty Bar 100g", quantity: 48, costPrice: 51, batchNo: "B-DVE-02", expiryDate: isoDate(dayOffset(260)) },
    ],
  },
];

let nextProductId = 100;
let nextCategoryId = 100;
let nextSupplierId = 100;
let nextInvoiceId = 100;
let nextPurchaseId = 100;

/* ------------------------------ derived views ----------------------------- */

function stockView() {
  return products.map((p) => {
    const batches = p._batches.map((b) => ({ ...b }));
    const total = batches.reduce((a, b) => a + b.quantity, 0);
    return {
      productId: p.id,
      productName: p.name,
      unit: p.unit,
      categoryName: p.categoryName,
      reorderLevel: p.reorderLevel,
      totalQuantity: total,
      status: total <= p.reorderLevel ? "LOW" : "OK",
      batches,
    };
  });
}

function lowStock() {
  return stockView()
    .filter((s) => s.status === "LOW")
    .map((s) => ({
      productId: s.productId,
      productName: s.productName,
      unit: s.unit,
      reorderLevel: s.reorderLevel,
      totalQuantity: s.totalQuantity,
    }));
}

function expiryAlerts(days, includeExpired) {
  const limit = Number(days || 30);
  const rows = [];
  stockView().forEach((s) => {
    s.batches.forEach((b) => {
      const expired = b.daysToExpiry < 0;
      const inWindow = b.daysToExpiry >= 0 && b.daysToExpiry <= limit;
      if ((includeExpired && expired) || (!includeExpired && inWindow)) {
        rows.push({
          productId: s.productId,
          productName: s.productName,
          batchNo: b.batchNo,
          expiryDate: b.expiryDate,
          quantity: b.quantity,
          daysLeft: b.daysToExpiry,
        });
      }
    });
  });
  return rows;
}

function reportSummary() {
  const today = isoDate(new Date());
  const month = today.slice(0, 7);
  const todayInvoices = invoices.filter((i) => i.invoiceDate.startsWith(today));
  const monthInvoices = invoices.filter((i) => i.invoiceDate.startsWith(month));
  const sum = (list) => round2(list.reduce((a, i) => a + i.grandTotal, 0));
  const stock = stockView();
  return {
    todaySales: sum(todayInvoices),
    todayInvoiceCount: todayInvoices.length,
    monthSales: sum(monthInvoices),
    monthInvoiceCount: monthInvoices.length,
    totalProducts: products.length,
    lowStockCount: stock.filter((s) => s.status === "LOW").length,
    expiringSoonCount: expiryAlerts(30).length,
    totalInvoices: invoices.length,
  };
}

function monthlySales() {
  const out = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = dayOffset(-i * 30);
    const key = isoDate(d).slice(0, 7);
    const inMonth = invoices.filter((x) => x.invoiceDate.startsWith(key));
    const seeded = round2(42000 + (5 - i) * 8500 + (i % 2) * 3200);
    out.push({ month: key, total: inMonth.length ? round2(inMonth.reduce((a, x) => a + x.grandTotal, 0) + seeded * 4) : seeded });
  }
  return out;
}

function topProducts(limit) {
  const tally = {};
  invoices.forEach((inv) =>
    inv.items.forEach((it) => {
      if (!tally[it.productName]) tally[it.productName] = { name: it.productName, qty: 0, amount: 0 };
      tally[it.productName].qty += it.quantity;
      tally[it.productName].amount = round2(tally[it.productName].amount + it.lineTotal);
    })
  );
  return Object.values(tally)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, Number(limit || 5))
    .map((t) => ({ productName: t.name, quantitySold: t.qty, salesAmount: t.amount }));
}

function gstSummary(month) {
  const key = month || isoDate(new Date()).slice(0, 7);
  const inMonth = invoices.filter((i) => i.invoiceDate.startsWith(key));
  const byRateMap = {};
  inMonth.forEach((inv) =>
    inv.items.forEach((it) => {
      const rate = String(it.gstRate);
      if (!byRateMap[rate]) byRateMap[rate] = { rate: it.gstRate, taxableAmount: 0, gstAmount: 0 };
      byRateMap[rate].taxableAmount = round2(byRateMap[rate].taxableAmount + it.taxableAmount);
      byRateMap[rate].gstAmount = round2(byRateMap[rate].gstAmount + it.gstAmount);
    })
  );
  const fallback = [
    { rate: 5, taxableAmount: 12480, gstAmount: 624 },
    { rate: 12, taxableAmount: 9860, gstAmount: 1183.2 },
    { rate: 18, taxableAmount: 7420, gstAmount: 1335.6 },
    { rate: 28, taxableAmount: 4310, gstAmount: 1206.8 },
  ];
  const byRate = Object.values(byRateMap);
  return {
    month: key,
    invoiceCount: inMonth.length || 37,
    totalTaxable: round2(byRate.reduce((a, r) => a + r.taxableAmount, 0)) || 34070,
    totalCgst: round2(byRate.reduce((a, r) => a + r.gstAmount, 0) / 2) || 2174.8,
    totalSgst: round2(byRate.reduce((a, r) => a + r.gstAmount, 0) / 2) || 2174.8,
    totalGst: round2(byRate.reduce((a, r) => a + r.gstAmount, 0)) || 4349.6,
    byRate: byRate.length ? byRate : fallback,
  };
}

/* ---------------------------------- PDF ----------------------------------- */

function makePdf(lines) {
  const esc = (s) =>
    String(s)
      .replace(/[^\x20-\x7E]/g, "-")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  let stream = "BT /F1 16 Tf 50 790 Td 22 TL\n";
  stream += `(${esc(lines[0])}) Tj T*\n`;
  stream += "/F1 11 Tf\n";
  for (let i = 1; i < lines.length; i += 1) stream += `(${esc(lines[i])}) Tj T*\n`;
  stream += "ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets[i] = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

/* ------------------------------- route table ------------------------------ */

function publicProduct(p) {
  const { _batches, ...rest } = p;
  return rest;
}

export function handleMock(method, url, params, body) {
  const m = method.toUpperCase();
  const [path, query = ""] = url.split("?");
  const all = { ...Object.fromEntries(new URLSearchParams(query)), ...(params || {}) };
  let data = null;

  if (m === "GET" && path === "/products") {
    const search = String(all.search || "").trim().toLowerCase();
    const filtered = products.filter(
      (p) => !search || p.name.toLowerCase().includes(search) || (p.barcode || "").includes(search)
    );
    data = paginate(filtered.map(publicProduct), all.page || 0, all.size || 10);
  } else if (m === "GET" && /^\/products\/\d+$/.test(path)) {
    const p = products.find((x) => x.id === Number(path.split("/")[2]));
    if (!p) return null;
    data = publicProduct(p);
  } else if (m === "POST" && path === "/products") {
    const b = body || {};
    const created = {
      id: nextProductId,
      name: b.name,
      barcode: b.barcode || null,
      unit: b.unit || "pcs",
      hsnCode: b.hsnCode || null,
      gstRate: Number(b.gstRate || 0),
      sellingPrice: Number(b.sellingPrice || 0),
      reorderLevel: Number(b.reorderLevel || 0),
      categoryId: b.categoryId || null,
      categoryName: (categories.find((c) => c.id === Number(b.categoryId)) || {}).name || null,
      _batches: [],
    };
    nextProductId += 1;
    products.push(created);
    data = publicProduct(created);
  } else if (m === "PUT" && /^\/products\/\d+$/.test(path)) {
    const p = products.find((x) => x.id === Number(path.split("/")[2]));
    if (!p) return null;
    const b = body || {};
    Object.assign(p, b, {
      gstRate: Number(b.gstRate != null ? b.gstRate : p.gstRate),
      sellingPrice: Number(b.sellingPrice != null ? b.sellingPrice : p.sellingPrice),
      reorderLevel: Number(b.reorderLevel != null ? b.reorderLevel : p.reorderLevel),
      categoryName: (categories.find((c) => c.id === Number(b.categoryId)) || {}).name || p.categoryName,
    });
    data = publicProduct(p);
  } else if (m === "DELETE" && /^\/products\/\d+$/.test(path)) {
    const i = products.findIndex((x) => x.id === Number(path.split("/")[2]));
    if (i < 0) return null;
    products.splice(i, 1);
    data = {};
  } else if (m === "GET" && path === "/categories") {
    data = categories.map((c) => ({ ...c }));
  } else if (m === "POST" && path === "/categories") {
    const created = { id: nextCategoryId, name: (body || {}).name };
    nextCategoryId += 1;
    categories.push(created);
    data = created;
  } else if (m === "PUT" && /^\/categories\/\d+$/.test(path)) {
    const c = categories.find((x) => x.id === Number(path.split("/")[2]));
    if (!c) return null;
    c.name = (body || {}).name;
    data = { ...c };
  } else if (m === "DELETE" && /^\/categories\/\d+$/.test(path)) {
    const i = categories.findIndex((x) => x.id === Number(path.split("/")[2]));
    if (i < 0) return null;
    categories.splice(i, 1);
    data = {};
  } else if (m === "GET" && path === "/suppliers") {
    data = suppliers.map((s) => ({ ...s }));
  } else if (m === "POST" && path === "/suppliers") {
    const created = { id: nextSupplierId, ...(body || {}) };
    nextSupplierId += 1;
    suppliers.push(created);
    data = created;
  } else if (m === "PUT" && /^\/suppliers\/\d+$/.test(path)) {
    const s = suppliers.find((x) => x.id === Number(path.split("/")[2]));
    if (!s) return null;
    Object.assign(s, body || {});
    data = { ...s };
  } else if (m === "DELETE" && /^\/suppliers\/\d+$/.test(path)) {
    const i = suppliers.findIndex((x) => x.id === Number(path.split("/")[2]));
    if (i < 0) return null;
    suppliers.splice(i, 1);
    data = {};
  } else if (m === "GET" && path === "/invoices") {
    const sorted = [...invoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
    const page = paginate(sorted, all.page || 0, all.size || 10);
    data = {
      ...page,
      content: page.content.map((i) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        invoiceDate: i.invoiceDate,
        customerName: i.customerName,
        itemCount: i.items.length,
        grandTotal: i.grandTotal,
      })),
    };
  } else if (m === "GET" && /^\/invoices\/\d+\/pdf$/.test(path)) {
    const inv = invoices.find((x) => x.id === Number(path.split("/")[2]));
    if (!inv) return null;
    data = makePdf([
      "MunimJi - Tax Invoice (Offline Demo)",
      `Invoice: ${inv.invoiceNumber}`,
      `Date: ${inv.invoiceDate}`,
      `Customer: ${inv.customerName || "Walk-in"}`,
      "",
      ...inv.items.map((it) => `${it.productName} x${it.quantity}  Rs. ${it.lineTotal}`),
      "",
      `Taxable: Rs. ${inv.taxableAmount}   GST: Rs. ${inv.gstAmount}`,
      `Grand Total: Rs. ${inv.grandTotal}`,
    ]);
  } else if (m === "GET" && /^\/invoices\/\d+$/.test(path)) {
    const inv = invoices.find((x) => x.id === Number(path.split("/")[2]));
    if (!inv) return null;
    data = JSON.parse(JSON.stringify(inv));
  } else if (m === "POST" && path === "/invoices") {
    const b = body || {};
    const lines = (b.items || []).map((it) => ({ productId: Number(it.productId), qty: Number(it.quantity) }));
    if (!lines.length) return null;
    const inv = makeInvoice(
      nextInvoiceId,
      b.customerName || "Walk-in",
      b.customerPhone || null,
      Number(b.discount || 0),
      lines,
      0,
      new Date().getHours()
    );
    nextInvoiceId += 1;
    invoices.push(inv);
    lines.forEach((l) => {
      const p = products.find((x) => x.id === l.productId);
      if (!p) return;
      const batch = [...p._batches].sort((a, z) => z.daysToExpiry - a.daysToExpiry)[0];
      if (batch) batch.quantity = Math.max(0, batch.quantity - l.qty);
    });
    data = JSON.parse(JSON.stringify(inv));
  } else if (m === "GET" && path === "/purchases") {
    data = [...purchases].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).map((p) => ({ ...p }));
  } else if (m === "POST" && path === "/purchases") {
    const b = body || {};
    const items = (b.items || []).map((it) => {
      const p = products.find((x) => x.id === Number(it.productId));
      return {
        productId: Number(it.productId),
        productName: p ? p.name : "Product",
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice),
        batchNo: it.batchNo || null,
        expiryDate: it.expiryDate || null,
      };
    });
    const total = round2(items.reduce((a, i) => a + i.quantity * i.costPrice, 0));
    const created = {
      id: nextPurchaseId,
      supplierId: Number(b.supplierId),
      supplierName: (suppliers.find((s) => s.id === Number(b.supplierId)) || {}).name || "Supplier",
      supplierBillNo: b.supplierBillNo || null,
      purchaseDate: b.purchaseDate || isoDate(new Date()),
      total,
      items,
    };
    nextPurchaseId += 1;
    purchases.push(created);
    items.forEach((it) => {
      const p = products.find((x) => x.id === it.productId);
      if (!p || !it.expiryDate) return;
      const days = Math.round((new Date(it.expiryDate) - new Date()) / 86400000);
      p._batches.push({
        batchId: p.id * 100 + p._batches.length + 1,
        batchNo: it.batchNo || `B-${p.id}-N`,
        expiryDate: it.expiryDate,
        quantity: it.quantity,
        costPrice: it.costPrice,
        daysToExpiry: days,
      });
    });
    data = created;
  } else if (m === "POST" && path === "/auth/register") {
    const b = body || {};
    const roleName = String(b.role || "OWNER").toUpperCase();
    data = {
      token: "offline-demo-new-user",
      name: b.name || "New User",
      email: String(b.email || "").toLowerCase(),
      role: roleName === "STAFF" ? "STAFF" : "OWNER",
    };
  } else if (m === "GET" && path === "/reports/summary") {
    data = reportSummary();
  } else if (m === "GET" && path === "/reports/monthly-sales") {
    data = monthlySales();
  } else if (m === "GET" && path === "/reports/top-products") {
    data = topProducts(all.limit || 5);
  } else if (m === "GET" && path === "/reports/gst-summary") {
    data = gstSummary(all.month);
  } else if (m === "GET" && path === "/stock") {
    data = stockView();
  } else if (m === "GET" && path === "/stock/low") {
    data = lowStock();
  } else if (m === "GET" && path === "/stock/expiring") {
    data = expiryAlerts(all.days || 30, false);
  } else if (m === "GET" && path === "/stock/expired") {
    data = expiryAlerts(0, true);
  }

  if (data === null) return null;
  return { status: 200, data };
}
