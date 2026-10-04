package com.munimji.repository;

import com.munimji.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // Last invoice, used to generate the next invoice number
    Optional<Invoice> findTopByOrderByIdDesc();

    // Items are fetched together so invoice detail has no N+1
    @Query("SELECT i FROM Invoice i JOIN FETCH i.items WHERE i.id = :id")
    Optional<Invoice> findByIdWithItems(Long id);

    // List page: returns DTOs directly and counts items with a subquery,
    // so paging never loads the item collection (no N+1)
    @Query("SELECT new com.munimji.dto.invoice.InvoiceSummaryResponse("
            + "i.id, i.invoiceNumber, i.invoiceDate, i.customerName, SIZE(i.items), i.grandTotal) "
            + "FROM Invoice i")
    org.springframework.data.domain.Page<com.munimji.dto.invoice.InvoiceSummaryResponse>
            findAllSummaries(org.springframework.data.domain.Pageable pageable);

    List<Invoice> findByInvoiceDateBetweenOrderByInvoiceDateAsc(LocalDateTime start, LocalDateTime end);
}
