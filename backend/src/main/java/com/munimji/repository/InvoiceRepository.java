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

    List<Invoice> findByInvoiceDateBetweenOrderByInvoiceDateAsc(LocalDateTime start, LocalDateTime end);
}
