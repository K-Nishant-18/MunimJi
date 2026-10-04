package com.munimji.dto.stock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Product wise stock view. totalQuantity is the sum of all its batch quantities.
 */
public class StockViewResponse {

    private Long productId;
    private String productName;
    private String unit;
    private String categoryName;
    private Integer reorderLevel;
    private Integer totalQuantity;
    private String status;
    private List<BatchResponse> batches;

    public StockViewResponse(Long productId, String productName, String unit, String categoryName,
                             Integer reorderLevel, Integer totalQuantity, String status,
                             List<BatchResponse> batches) {
        this.productId = productId;
        this.productName = productName;
        this.unit = unit;
        this.categoryName = categoryName;
        this.reorderLevel = reorderLevel;
        this.totalQuantity = totalQuantity;
        this.status = status;
        this.batches = batches;
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

    public String getCategoryName() {
        return categoryName;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public String getStatus() {
        return status;
    }

    public List<BatchResponse> getBatches() {
        return batches;
    }

    public static class BatchResponse {

        private Long batchId;
        private String batchNo;
        private LocalDate expiryDate;
        private Integer quantity;
        private BigDecimal costPrice;
        private Long daysToExpiry;

        public BatchResponse(Long batchId, String batchNo, LocalDate expiryDate,
                             Integer quantity, BigDecimal costPrice, Long daysToExpiry) {
            this.batchId = batchId;
            this.batchNo = batchNo;
            this.expiryDate = expiryDate;
            this.quantity = quantity;
            this.costPrice = costPrice;
            this.daysToExpiry = daysToExpiry;
        }

        public Long getBatchId() {
            return batchId;
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

        public BigDecimal getCostPrice() {
            return costPrice;
        }

        public Long getDaysToExpiry() {
            return daysToExpiry;
        }
    }
}
