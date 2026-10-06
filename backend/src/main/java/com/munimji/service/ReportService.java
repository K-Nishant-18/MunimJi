package com.munimji.service;

import com.munimji.dto.report.GstSummaryResponse;
import com.munimji.dto.report.MonthlySalesResponse;
import com.munimji.dto.report.ReportSummaryResponse;
import com.munimji.dto.report.TopProductResponse;
import com.munimji.dto.stock.LowStockResponse;
import com.munimji.exception.BadRequestException;
import com.munimji.entity.Invoice;
import com.munimji.entity.InvoiceItem;
import com.munimji.repository.InvoiceItemRepository;
import com.munimji.repository.InvoiceRepository;
import com.munimji.repository.ProductRepository;
import com.munimji.security.CurrentTenant;
import com.munimji.util.MoneyUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Dashboard numbers and reports. Aggregations are done with simple Java loops
 * over a small query result, which keeps the code database independent and
 * easy to explain.
 */
@Service
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;

    public ReportService(InvoiceRepository invoiceRepository,
                         InvoiceItemRepository invoiceItemRepository,
                         ProductRepository productRepository,
                         StockService stockService) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.productRepository = productRepository;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public ReportSummaryResponse summary() {
        LocalDate today = LocalDate.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        BigDecimal todaySales = MoneyUtil.zero();
        long todayCount = 0;
        BigDecimal monthSales = MoneyUtil.zero();
        long monthCount = 0;
        Long ownerId = CurrentTenant.id();

        // Invoices of the current month, day totals come from the same list
        for (Invoice invoice : invoiceRepository
                .findByOwnerIdAndInvoiceDateBetweenOrderByInvoiceDateAsc(ownerId, monthStart, now)) {
            monthSales = monthSales.add(invoice.getGrandTotal());
            monthCount++;
            if (!invoice.getInvoiceDate().isBefore(dayStart)) {
                todaySales = todaySales.add(invoice.getGrandTotal());
                todayCount++;
            }
        }

        long lowStockCount = 0;
        for (LowStockResponse low : stockService.lowStock()) {
            lowStockCount++;
        }
        long expiringSoonCount = stockService.expiring(30).size();

        return new ReportSummaryResponse(todaySales, todayCount, monthSales, monthCount,
                productRepository.countByOwnerId(ownerId), lowStockCount, expiringSoonCount,
                invoiceRepository.countByOwnerId(ownerId));
    }

    /** Sales total for each of the last 12 months, oldest first (line chart). */
    @Transactional(readOnly = true)
    public List<MonthlySalesResponse> monthlySales() {
        LocalDate today = LocalDate.now();
        LocalDate firstMonth = today.withDayOfMonth(1).minusMonths(11);
        LocalDateTime start = firstMonth.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        // key = yyyy-MM, starts with 0 for every month so the chart is continuous
        Map<String, BigDecimal> totals = new TreeMap<>();
        LocalDate cursor = firstMonth;
        for (int i = 0; i < 12; i++) {
            totals.put(cursor.format(DateTimeFormatter.ofPattern("yyyy-MM")), MoneyUtil.zero());
            cursor = cursor.plusMonths(1);
        }

        for (Invoice invoice : invoiceRepository
                .findByOwnerIdAndInvoiceDateBetweenOrderByInvoiceDateAsc(CurrentTenant.id(), start, end)) {
            String key = invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            totals.put(key, totals.getOrDefault(key, MoneyUtil.zero()).add(invoice.getGrandTotal()));
        }

        List<MonthlySalesResponse> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : totals.entrySet()) {
            result.add(new MonthlySalesResponse(entry.getKey(), MoneyUtil.round(entry.getValue())));
        }
        return result;
    }

    /** Best selling products of the last 30 days (bar chart, default 5). */
    @Transactional(readOnly = true)
    public List<TopProductResponse> topProducts(int limit) {
        if (limit < 1 || limit > 20) {
            throw new BadRequestException("limit must be between 1 and 20");
        }
        LocalDateTime start = LocalDateTime.now().minusDays(30);

        Map<String, Integer> quantityByName = new HashMap<>();
        Map<String, BigDecimal> amountByName = new HashMap<>();

        for (InvoiceItem item : invoiceItemRepository.findByInvoiceDateRange(CurrentTenant.id(),
                start, LocalDateTime.now())) {
            String name = item.getProductName();
            quantityByName.put(name, quantityByName.getOrDefault(name, 0) + item.getQuantity());
            amountByName.put(name, amountByName.getOrDefault(name, MoneyUtil.zero())
                    .add(item.getLineTotal()));
        }

        List<TopProductResponse> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : quantityByName.entrySet()) {
            result.add(new TopProductResponse(entry.getKey(), entry.getValue(),
                    MoneyUtil.round(amountByName.get(entry.getKey()))));
        }

        // Highest quantity first, then by name for a stable order
        Collections.sort(result, new Comparator<TopProductResponse>() {
            @Override
            public int compare(TopProductResponse a, TopProductResponse b) {
                int byQuantity = Integer.compare(b.getQuantitySold(), a.getQuantitySold());
                if (byQuantity != 0) {
                    return byQuantity;
                }
                return a.getProductName().compareTo(b.getProductName());
            }
        });

        if (result.size() > limit) {
            return new ArrayList<>(result.subList(0, limit));
        }
        return result;
    }

    /**
     * GST collected in a month (default: current month), overall and
     * split per GST rate. Month format: yyyy-MM.
     */
    @Transactional(readOnly = true)
    public GstSummaryResponse gstSummary(String month) {
        LocalDate firstOfMonth;
        if (month == null || month.isBlank()) {
            firstOfMonth = LocalDate.now().withDayOfMonth(1);
        } else {
            try {
                firstOfMonth = LocalDate.parse(month + "-01");
            } catch (Exception ex) {
                throw new BadRequestException("month must be in format yyyy-MM");
            }
        }
        LocalDateTime start = firstOfMonth.atStartOfDay();
        LocalDateTime end = firstOfMonth.plusMonths(1).atStartOfDay();

        BigDecimal totalTaxable = MoneyUtil.zero();
        BigDecimal totalCgst = MoneyUtil.zero();
        BigDecimal totalSgst = MoneyUtil.zero();
        BigDecimal totalGst = MoneyUtil.zero();
        Set<Long> invoiceIds = new HashSet<>();
        Map<BigDecimal, BigDecimal[]> byRate = new TreeMap<>();

        for (InvoiceItem item : invoiceItemRepository.findByInvoiceDateRange(CurrentTenant.id(),
                start, end)) {
            BigDecimal cgst = MoneyUtil.round(item.getGstAmount().divide(MoneyUtil.TWO, 8,
                    java.math.RoundingMode.HALF_UP));
            BigDecimal sgst = MoneyUtil.round(item.getGstAmount().subtract(cgst));

            totalTaxable = totalTaxable.add(item.getTaxableAmount());
            totalCgst = totalCgst.add(cgst);
            totalSgst = totalSgst.add(sgst);
            totalGst = totalGst.add(item.getGstAmount());
            invoiceIds.add(item.getInvoice().getId());

            BigDecimal[] sums = byRate.getOrDefault(item.getGstRate(), new BigDecimal[]{
                    MoneyUtil.zero(), MoneyUtil.zero()});
            sums[0] = sums[0].add(item.getTaxableAmount());
            sums[1] = sums[1].add(item.getGstAmount());
            byRate.put(item.getGstRate(), sums);
        }

        List<GstSummaryResponse.GstRateBreakdown> breakdown = new ArrayList<>();
        for (Map.Entry<BigDecimal, BigDecimal[]> entry : byRate.entrySet()) {
            breakdown.add(new GstSummaryResponse.GstRateBreakdown(entry.getKey(),
                    MoneyUtil.round(entry.getValue()[0]), MoneyUtil.round(entry.getValue()[1])));
        }

        return new GstSummaryResponse(firstOfMonth.format(DateTimeFormatter.ofPattern("yyyy-MM")),
                (long) invoiceIds.size(), MoneyUtil.round(totalTaxable),
                MoneyUtil.round(totalCgst), MoneyUtil.round(totalSgst),
                MoneyUtil.round(totalGst), breakdown);
    }
}
