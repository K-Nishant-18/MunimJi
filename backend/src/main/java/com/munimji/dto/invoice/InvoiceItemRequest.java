package com.munimji.dto.invoice;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class InvoiceItemRequest {

    @NotNull(message = "is required")
    private Long productId;

    @NotNull(message = "is required")
    @Min(value = 1, message = "must be 1 or more")
    private Integer quantity;

    public InvoiceItemRequest() {
    }

    public InvoiceItemRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
