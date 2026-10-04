package com.munimji.repository;

import com.munimji.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {

    // Invoice is fetched with every item so report queries never go N+1
    @Query("SELECT ii FROM InvoiceItem ii JOIN FETCH ii.invoice "
            + "WHERE ii.invoice.invoiceDate >= :start AND ii.invoice.invoiceDate < :end")
    List<InvoiceItem> findByInvoiceDateRange(@Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);

    boolean existsByProductId(Long productId);
}
