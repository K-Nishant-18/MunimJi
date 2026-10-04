package com.munimji.dto.stock;

import java.time.LocalDate;

public class ExpiryAlertResponse {

    private Long productId;
    private String productName;
    private String batchNo;
    private LocalDate expiryDate;
    private Integer quantity;
    private Long daysLeft;

    public ExpiryAlertResponse(Long productId, String productName, String batchNo,
                               LocalDate expiryDate, Integer quantity, Long daysLeft) {
        this.productId = productId;
        this.productName = productName;
        this.batchNo = batchNo;
        this.expiryDate = expiryDate;
        this.quantity = quantity;
        this.daysLeft = daysLeft;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Long getDaysLeft() {
        return daysLeft;
    }
}
