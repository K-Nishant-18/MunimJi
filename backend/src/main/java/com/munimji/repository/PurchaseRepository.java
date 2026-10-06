package com.munimji.repository;

import com.munimji.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    // Supplier and items are fetched in the same query to avoid N+1
    @Query("SELECT DISTINCT p FROM Purchase p JOIN FETCH p.supplier JOIN FETCH p.items "
            + "WHERE p.ownerId = :ownerId ORDER BY p.id DESC")
    List<Purchase> findAllWithDetails(@Param("ownerId") Long ownerId);

    boolean existsByOwnerIdAndSupplierId(Long ownerId, Long supplierId);
}
