package com.munimji.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank(message = "is required")
    @Size(max = 200, message = "must be under 200 characters")
    private String name;

    @Size(max = 100, message = "must be under 100 characters")
    private String barcode;

    @NotBlank(message = "is required")
    private String unit;

    @Size(max = 20, message = "must be under 20 characters")
    private String hsnCode;

    @NotNull(message = "is required")
    @DecimalMin(value = "0", message = "must be 0 or more")
    private BigDecimal gstRate;

    @NotNull(message = "is required")
    @DecimalMin(value = "0.01", message = "must be more than 0")
    private BigDecimal sellingPrice;

    @NotNull(message = "is required")
    @Min(value = 0, message = "must be 0 or more")
    private Integer reorderLevel;

    // Category id, may be null
    private Long categoryId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getHsnCode() {
        return hsnCode;
    }

    public void setHsnCode(String hsnCode) {
        this.hsnCode = hsnCode;
    }

    public BigDecimal getGstRate() {
        return gstRate;
    }

    public void setGstRate(BigDecimal gstRate) {
        this.gstRate = gstRate;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
}
