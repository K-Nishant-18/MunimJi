package com.munimji.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    private LocalDateTime invoiceDate;
    private String customerName;
    private String customerPhone;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal gstAmount;
    private BigDecimal grandTotal;
    private List<InvoiceItemResponse> items;

    public InvoiceResponse(Long id, String invoiceNumber, LocalDateTime invoiceDate,
                           String customerName, String customerPhone, BigDecimal subTotal,
                           BigDecimal discountAmount, BigDecimal taxableAmount,
                           BigDecimal cgstAmount, BigDecimal sgstAmount, BigDecimal gstAmount,
                           BigDecimal grandTotal, List<InvoiceItemResponse> items) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.invoiceDate = invoiceDate;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.subTotal = subTotal;
        this.discountAmount = discountAmount;
        this.taxableAmount = taxableAmount;
        this.cgstAmount = cgstAmount;
        this.sgstAmount = sgstAmount;
        this.gstAmount = gstAmount;
        this.grandTotal = grandTotal;
        this.items = items;
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

    public String getCustomerPhone() {
        return customerPhone;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public BigDecimal getGstAmount() {
        return gstAmount;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public List<InvoiceItemResponse> getItems() {
        return items;
    }
}
