package com.munimji.repository;

import com.munimji.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // Last invoice of one shop, used to generate that shop's next invoice number
    Optional<Invoice> findTopByOwnerIdOrderByIdDesc(Long ownerId);

    // Items are fetched together so invoice detail has no N+1
    @Query("SELECT i FROM Invoice i JOIN FETCH i.items WHERE i.id = :id AND i.ownerId = :ownerId")
    Optional<Invoice> findByIdWithItems(@Param("id") Long id, @Param("ownerId") Long ownerId);

    // List page: returns DTOs directly and counts items with a subquery,
    // so paging never loads the item collection (no N+1)
    @Query(value = "SELECT new com.munimji.dto.invoice.InvoiceSummaryResponse("
            + "i.id, i.invoiceNumber, i.invoiceDate, i.customerName, SIZE(i.items), i.grandTotal) "
            + "FROM Invoice i WHERE i.ownerId = :ownerId",
            countQuery = "SELECT COUNT(i) FROM Invoice i WHERE i.ownerId = :ownerId")
    Page<com.munimji.dto.invoice.InvoiceSummaryResponse> findAllSummaries(
            @Param("ownerId") Long ownerId, Pageable pageable);

    List<Invoice> findByOwnerIdAndInvoiceDateBetweenOrderByInvoiceDateAsc(
            @Param("ownerId") Long ownerId, LocalDateTime start, LocalDateTime end);

    long countByOwnerId(Long ownerId);
}
