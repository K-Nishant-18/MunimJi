package com.munimji.dto.stock;

public class LowStockResponse {

    private Long productId;
    private String productName;
    private String unit;
    private Integer reorderLevel;
    private Integer totalQuantity;

    public LowStockResponse(Long productId, String productName, String unit,
                            Integer reorderLevel, Integer totalQuantity) {
        this.productId = productId;
        this.productName = productName;
        this.unit = unit;
        this.reorderLevel = reorderLevel;
        this.totalQuantity = totalQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }
}
