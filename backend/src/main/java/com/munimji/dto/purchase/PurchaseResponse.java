package com.munimji.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PurchaseResponse {

    private Long id;
    private Long supplierId;
    private String supplierName;
    private String supplierBillNo;
    private LocalDate purchaseDate;
    private BigDecimal total;
    private List<PurchaseItemResponse> items;

    public PurchaseResponse(Long id, Long supplierId, String supplierName, String supplierBillNo,
                            LocalDate purchaseDate, BigDecimal total, List<PurchaseItemResponse> items) {
        this.id = id;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.supplierBillNo = supplierBillNo;
        this.purchaseDate = purchaseDate;
        this.total = total;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public String getSupplierBillNo() {
        return supplierBillNo;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public List<PurchaseItemResponse> getItems() {
        return items;
    }
}
