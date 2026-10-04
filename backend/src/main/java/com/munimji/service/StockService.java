package com.munimji.service;

import com.munimji.dto.stock.ExpiryAlertResponse;
import com.munimji.dto.stock.LowStockResponse;
import com.munimji.dto.stock.StockViewResponse;
import com.munimji.entity.Product;
import com.munimji.entity.StockBatch;
import com.munimji.exception.BadRequestException;
import com.munimji.repository.ProductRepository;
import com.munimji.repository.StockBatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockService {

    private final ProductRepository productRepository;
    private final StockBatchRepository stockBatchRepository;

    public StockService(ProductRepository productRepository, StockBatchRepository stockBatchRepository) {
        this.productRepository = productRepository;
        this.stockBatchRepository = stockBatchRepository;
    }

    /**
     * All products with their batches, loaded in ONE query (no N+1).
     * totalQuantity = sum of batch quantities, stock is never stored on product.
     */
    @Transactional(readOnly = true)
    public List<StockViewResponse> viewStock() {
        List<StockViewResponse> result = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Product product : productRepository.findAllWithBatches()) {
            int total = 0;
            List<StockViewResponse.BatchResponse> batches = new ArrayList<>();

            for (StockBatch batch : product.getBatches()) {
                total += batch.getQuantity();
                long daysToExpiry = ChronoUnit.DAYS.between(today, batch.getExpiryDate());
                batches.add(new StockViewResponse.BatchResponse(batch.getId(), batch.getBatchNo(),
                        batch.getExpiryDate(), batch.getQuantity(), batch.getCostPrice(), daysToExpiry));
            }

            String status = total <= product.getReorderLevel() ? "LOW" : "OK";
            result.add(new StockViewResponse(product.getId(), product.getName(), product.getUnit(),
                    product.getCategory() != null ? product.getCategory().getName() : null,
                    product.getReorderLevel(), total, status, batches));
        }
        return result;
    }

    /** Products whose total stock is at or below the reorder level. */
    @Transactional(readOnly = true)
    public List<LowStockResponse> lowStock() {
        List<LowStockResponse> result = new ArrayList<>();
        for (StockViewResponse stock : viewStock()) {
            if (stock.getTotalQuantity() <= stock.getReorderLevel()) {
                result.add(new LowStockResponse(stock.getProductId(), stock.getProductName(),
                        stock.getUnit(), stock.getReorderLevel(), stock.getTotalQuantity()));
            }
        }
        return result;
    }

    /** Batches expiring within the given number of days (30 / 60 / 90). */
    @Transactional(readOnly = true)
    public List<ExpiryAlertResponse> expiring(int days) {
        if (days < 1 || days > 365) {
            throw new BadRequestException("days must be between 1 and 365");
        }
        LocalDate today = LocalDate.now();
        LocalDate until = today.plusDays(days);

        List<ExpiryAlertResponse> result = new ArrayList<>();
        for (StockBatch batch : stockBatchRepository.findExpiring(today, until)) {
            long daysLeft = ChronoUnit.DAYS.between(today, batch.getExpiryDate());
            result.add(toExpiryResponse(batch, daysLeft));
        }
        return result;
    }

    /** Batches that are already past their expiry date. */
    @Transactional(readOnly = true)
    public List<ExpiryAlertResponse> expired() {
        LocalDate today = LocalDate.now();
        List<ExpiryAlertResponse> result = new ArrayList<>();
        for (StockBatch batch : stockBatchRepository.findExpired(today)) {
            long daysLeft = ChronoUnit.DAYS.between(today, batch.getExpiryDate());
            result.add(toExpiryResponse(batch, daysLeft));
        }
        return result;
    }

    private ExpiryAlertResponse toExpiryResponse(StockBatch batch, long daysLeft) {
        return new ExpiryAlertResponse(batch.getProduct().getId(), batch.getProduct().getName(),
                batch.getBatchNo(), batch.getExpiryDate(), batch.getQuantity(), daysLeft);
    }
}
