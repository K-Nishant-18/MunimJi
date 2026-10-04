package com.munimji.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PurchaseItemResponse {

    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal costPrice;
    private String batchNo;
    private LocalDate expiryDate;

    public PurchaseItemResponse(Long productId, String productName, Integer quantity,
                                BigDecimal costPrice, String batchNo, LocalDate expiryDate) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.costPrice = costPrice;
        this.batchNo = batchNo;
        this.expiryDate = expiryDate;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }
}
