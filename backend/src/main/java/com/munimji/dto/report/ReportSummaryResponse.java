package com.munimji.dto.report;

import java.math.BigDecimal;

public class ReportSummaryResponse {

    private BigDecimal todaySales;
    private Long todayInvoiceCount;
    private BigDecimal monthSales;
    private Long monthInvoiceCount;
    private Long totalProducts;
    private Long lowStockCount;
    private Long expiringSoonCount;
    private Long totalInvoices;

    public ReportSummaryResponse(BigDecimal todaySales, Long todayInvoiceCount,
                                 BigDecimal monthSales, Long monthInvoiceCount,
                                 Long totalProducts, Long lowStockCount,
                                 Long expiringSoonCount, Long totalInvoices) {
        this.todaySales = todaySales;
        this.todayInvoiceCount = todayInvoiceCount;
        this.monthSales = monthSales;
        this.monthInvoiceCount = monthInvoiceCount;
        this.totalProducts = totalProducts;
        this.lowStockCount = lowStockCount;
        this.expiringSoonCount = expiringSoonCount;
        this.totalInvoices = totalInvoices;
    }

    public BigDecimal getTodaySales() {
        return todaySales;
    }

    public Long getTodayInvoiceCount() {
        return todayInvoiceCount;
    }

    public BigDecimal getMonthSales() {
        return monthSales;
    }

    public Long getMonthInvoiceCount() {
        return monthInvoiceCount;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public Long getLowStockCount() {
        return lowStockCount;
    }

    public Long getExpiringSoonCount() {
        return expiringSoonCount;
    }

    public Long getTotalInvoices() {
        return totalInvoices;
    }
}
