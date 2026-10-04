package com.munimji.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceSummaryResponse {

    private Long id;
    private String invoiceNumber;
    private LocalDateTime invoiceDate;
    private String customerName;
    private Integer itemCount;
    private BigDecimal grandTotal;

    public InvoiceSummaryResponse(Long id, String invoiceNumber, LocalDateTime invoiceDate,
                                  String customerName, Integer itemCount, BigDecimal grandTotal) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.invoiceDate = invoiceDate;
        this.customerName = customerName;
        this.itemCount = itemCount;
        this.grandTotal = grandTotal;
    }

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }
}
