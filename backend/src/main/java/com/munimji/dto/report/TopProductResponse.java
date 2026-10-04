package com.munimji.dto.report;

import java.math.BigDecimal;

public class TopProductResponse {

    private String productName;
    private Integer quantitySold;
    private BigDecimal salesAmount;

    public TopProductResponse(String productName, Integer quantitySold, BigDecimal salesAmount) {
        this.productName = productName;
        this.quantitySold = quantitySold;
        this.salesAmount = salesAmount;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getQuantitySold() {
        return quantitySold;
    }

    public BigDecimal getSalesAmount() {
        return salesAmount;
    }
}
