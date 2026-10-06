package com.munimji.repository;

import com.munimji.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // JOIN FETCH loads the category in the same query so the list page does
    // not fire one extra query per product (N+1 problem).
    @Query(value = "SELECT DISTINCT p FROM Product p JOIN FETCH p.category "
            + "WHERE p.ownerId = :ownerId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR p.barcode LIKE CONCAT('%', :search, '%'))",
            countQuery = "SELECT COUNT(p) FROM Product p "
                    + "WHERE p.ownerId = :ownerId AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) "
                    + "OR p.barcode LIKE CONCAT('%', :search, '%'))")
    Page<Product> search(@Param("ownerId") Long ownerId, @Param("search") String search,
                         Pageable pageable);

    // Loads every product with its batches and category in one query (stock page)
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.batches LEFT JOIN FETCH p.category "
            + "WHERE p.ownerId = :ownerId")
    java.util.List<Product> findAllWithBatches(@Param("ownerId") Long ownerId);

    boolean existsByOwnerIdAndCategoryId(Long ownerId, Long categoryId);

    boolean existsByOwnerIdAndBarcode(Long ownerId, String barcode);

    boolean existsByOwnerIdAndBarcodeAndIdNot(Long ownerId, String barcode, Long id);

    long countByOwnerId(Long ownerId);
}
