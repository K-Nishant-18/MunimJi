package com.munimji.repository;

import com.munimji.entity.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface StockBatchRepository extends JpaRepository<StockBatch, Long> {

    // FEFO query: sellable batches of a product, earliest expiry first
    @Query("SELECT b FROM StockBatch b "
            + "WHERE b.product.id = :productId AND b.quantity > 0 AND b.expiryDate >= :today "
            + "ORDER BY b.expiryDate ASC, b.id ASC")
    List<StockBatch> findSellableByProduct(@Param("productId") Long productId,
                                            @Param("today") LocalDate today);

    // Batches that expire between today and the given days window
    @Query("SELECT b FROM StockBatch b JOIN FETCH b.product "
            + "WHERE b.quantity > 0 AND b.expiryDate >= :from AND b.expiryDate <= :to "
            + "ORDER BY b.expiryDate ASC")
    List<StockBatch> findExpiring(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Batches whose expiry date is already in the past
    @Query("SELECT b FROM StockBatch b JOIN FETCH b.product "
            + "WHERE b.quantity > 0 AND b.expiryDate < :today "
            + "ORDER BY b.expiryDate ASC")
    List<StockBatch> findExpired(@Param("today") LocalDate today);
}
