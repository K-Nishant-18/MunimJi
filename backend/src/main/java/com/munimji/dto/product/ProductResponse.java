package com.munimji.dto.product;

import java.math.BigDecimal;

public class ProductResponse {

    private Long id;
    private String name;
    private String barcode;
    private String unit;
    private String hsnCode;
    private BigDecimal gstRate;
    private BigDecimal sellingPrice;
    private Integer reorderLevel;
    private Long categoryId;
    private String categoryName;

    public ProductResponse(Long id, String name, String barcode, String unit, String hsnCode,
                           BigDecimal gstRate, BigDecimal sellingPrice, Integer reorderLevel,
                           Long categoryId, String categoryName) {
        this.id = id;
        this.name = name;
        this.barcode = barcode;
        this.unit = unit;
        this.hsnCode = hsnCode;
        this.gstRate = gstRate;
        this.sellingPrice = sellingPrice;
        this.reorderLevel = reorderLevel;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getUnit() {
        return unit;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public BigDecimal getGstRate() {
        return gstRate;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }
}
