package com.munimji.dto.invoice;

import java.math.BigDecimal;

public class InvoiceItemResponse {

    private Long productId;
    private String productName;
    private String hsnCode;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private Integer quantity;
    private BigDecimal grossAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal gstAmount;
    private BigDecimal cgstAmount;
    private BigDecimal sgstAmount;
    private BigDecimal lineTotal;

    public InvoiceItemResponse(Long productId, String productName, String hsnCode,
                               BigDecimal unitPrice, BigDecimal gstRate, Integer quantity,
                               BigDecimal grossAmount, BigDecimal discountAmount,
                               BigDecimal taxableAmount, BigDecimal gstAmount,
                               BigDecimal cgstAmount, BigDecimal sgstAmount, BigDecimal lineTotal) {
        this.productId = productId;
        this.productName = productName;
        this.hsnCode = hsnCode;
        this.unitPrice = unitPrice;
        this.gstRate = gstRate;
        this.quantity = quantity;
        this.grossAmount = grossAmount;
        this.discountAmount = discountAmount;
        this.taxableAmount = taxableAmount;
        this.gstAmount = gstAmount;
        this.cgstAmount = cgstAmount;
        this.sgstAmount = sgstAmount;
        this.lineTotal = lineTotal;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getGstRate() {
        return gstRate;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getGrossAmount() {
        return grossAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public BigDecimal getGstAmount() {
        return gstAmount;
    }

    public BigDecimal getCgstAmount() {
        return cgstAmount;
    }

    public BigDecimal getSgstAmount() {
        return sgstAmount;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }
}
