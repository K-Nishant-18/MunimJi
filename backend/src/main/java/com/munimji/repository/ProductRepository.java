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
            + "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR p.barcode LIKE CONCAT('%', :search, '%')",
            countQuery = "SELECT COUNT(p) FROM Product p "
                    + "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) "
                    + "OR p.barcode LIKE CONCAT('%', :search, '%')")
    Page<Product> search(@Param("search") String search, Pageable pageable);

    // Loads every product together with its batches in one query (stock page)
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.batches")
    java.util.List<Product> findAllWithBatches();

    boolean existsByCategoryId(Long categoryId);

    boolean existsByBarcode(String barcode);
}
