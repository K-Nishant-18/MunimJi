package com.munimji.dto.report;

import java.math.BigDecimal;
import java.util.List;

public class GstSummaryResponse {

    private String month;
    private Long invoiceCount;
    private BigDecimal totalTaxable;
    private BigDecimal totalCgst;
    private BigDecimal totalSgst;
    private BigDecimal totalGst;
    private List<GstRateBreakdown> byRate;

    public GstSummaryResponse(String month, Long invoiceCount, BigDecimal totalTaxable,
                              BigDecimal totalCgst, BigDecimal totalSgst, BigDecimal totalGst,
                              List<GstRateBreakdown> byRate) {
        this.month = month;
        this.invoiceCount = invoiceCount;
        this.totalTaxable = totalTaxable;
        this.totalCgst = totalCgst;
        this.totalSgst = totalSgst;
        this.totalGst = totalGst;
        this.byRate = byRate;
    }

    public String getMonth() {
        return month;
    }

    public Long getInvoiceCount() {
        return invoiceCount;
    }

    public BigDecimal getTotalTaxable() {
        return totalTaxable;
    }

    public BigDecimal getTotalCgst() {
        return totalCgst;
    }

    public BigDecimal getTotalSgst() {
        return totalSgst;
    }

    public BigDecimal getTotalGst() {
        return totalGst;
    }

    public List<GstRateBreakdown> getByRate() {
        return byRate;
    }

    public static class GstRateBreakdown {

        private BigDecimal rate;
        private BigDecimal taxableAmount;
        private BigDecimal gstAmount;

        public GstRateBreakdown(BigDecimal rate, BigDecimal taxableAmount, BigDecimal gstAmount) {
            this.rate = rate;
            this.taxableAmount = taxableAmount;
            this.gstAmount = gstAmount;
        }

        public BigDecimal getRate() {
            return rate;
        }

        public BigDecimal getTaxableAmount() {
            return taxableAmount;
        }

        public BigDecimal getGstAmount() {
            return gstAmount;
        }
    }
}
