package com.munimji.service;

import com.munimji.dto.purchase.PurchaseItemRequest;
import com.munimji.dto.purchase.PurchaseItemResponse;
import com.munimji.dto.purchase.PurchaseRequest;
import com.munimji.dto.purchase.PurchaseResponse;
import com.munimji.entity.Product;
import com.munimji.entity.Purchase;
import com.munimji.entity.PurchaseItem;
import com.munimji.entity.StockBatch;
import com.munimji.entity.Supplier;
import com.munimji.exception.ResourceNotFoundException;
import com.munimji.repository.ProductRepository;
import com.munimji.repository.PurchaseRepository;
import com.munimji.repository.StockBatchRepository;
import com.munimji.repository.SupplierRepository;
import com.munimji.util.MoneyUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final StockBatchRepository stockBatchRepository;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           StockBatchRepository stockBatchRepository) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.stockBatchRepository = stockBatchRepository;
    }

    /**
     * Saves the purchase and creates one StockBatch per line item.
     * Everything runs in one transaction, so either all batches are created
     * or none of them are.
     */
    @Transactional
    public PurchaseResponse create(PurchaseRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Supplier not found with id " + request.getSupplierId()));

        Purchase purchase = new Purchase();
        purchase.setSupplier(supplier);
        purchase.setSupplierBillNo(blankToNull(request.getSupplierBillNo()));
        purchase.setPurchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now());

        BigDecimal total = MoneyUtil.zero();
        List<PurchaseItemResponse> itemResponses = new ArrayList<>();

        for (PurchaseItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id " + itemRequest.getProductId()));

            PurchaseItem item = new PurchaseItem();
            item.setPurchase(purchase);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setCostPrice(MoneyUtil.round(itemRequest.getCostPrice()));
            item.setBatchNo(itemRequest.getBatchNo().trim());
            item.setExpiryDate(itemRequest.getExpiryDate());
            purchase.getItems().add(item);

            // Receiving stock = one new batch of that product
            StockBatch batch = new StockBatch(product, item.getBatchNo(), item.getExpiryDate(),
                    item.getQuantity(), item.getCostPrice());
            stockBatchRepository.save(batch);

            total = total.add(item.getCostPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            itemResponses.add(new PurchaseItemResponse(product.getId(), product.getName(),
                    item.getQuantity(), item.getCostPrice(), item.getBatchNo(), item.getExpiryDate()));
        }

        purchase.setTotal(MoneyUtil.round(total));
        purchase = purchaseRepository.save(purchase);

        return new PurchaseResponse(purchase.getId(), supplier.getId(), supplier.getName(),
                purchase.getSupplierBillNo(), purchase.getPurchaseDate(), purchase.getTotal(), itemResponses);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> findAll() {
        List<PurchaseResponse> result = new ArrayList<>();
        for (Purchase purchase : purchaseRepository.findAllWithDetails()) {
            result.add(toResponse(purchase));
        }
        return result;
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        List<PurchaseItemResponse> items = new ArrayList<>();
        for (PurchaseItem item : purchase.getItems()) {
            items.add(new PurchaseItemResponse(item.getProduct().getId(), item.getProduct().getName(),
                    item.getQuantity(), item.getCostPrice(), item.getBatchNo(), item.getExpiryDate()));
        }
        return new PurchaseResponse(purchase.getId(), purchase.getSupplier().getId(),
                purchase.getSupplier().getName(), purchase.getSupplierBillNo(),
                purchase.getPurchaseDate(), purchase.getTotal(), items);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
