package com.munimji.service;

import com.munimji.dto.invoice.InvoiceItemRequest;
import com.munimji.dto.invoice.InvoiceRequest;
import com.munimji.dto.invoice.InvoiceResponse;
import com.munimji.entity.Product;
import com.munimji.entity.StockBatch;
import com.munimji.exception.InsufficientStockException;
import com.munimji.repository.InvoiceRepository;
import com.munimji.repository.ProductRepository;
import com.munimji.repository.StockBatchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Billing core: FEFO stock deduction, GST split, invoice numbering and the
 * rollback that happens when the cart asks for more stock than the shop has.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InvoiceBillingTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private StockBatchRepository stockBatchRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    void fefo_deductsEarliestExpiryFirst() {
        // Rice seed has one batch (20 pcs). Add a second batch that expires later
        Product rice = productRepository.findById(1L).orElseThrow();
        StockBatch later = stockBatchRepository.save(new StockBatch(
                rice, "B-RICE-02", LocalDate.now().plusDays(900), 10, new BigDecimal("410.00")));

        // Selling 25 must empty the earlier batch (B-RICE-01) and cut into the later one
        invoiceService.create(invoiceWith(1L, 25));

        StockBatch early = stockBatchRepository.findById(1L).orElseThrow();
        assertEquals(0, early.getQuantity());
        assertEquals(5, stockBatchRepository.findById(later.getId()).orElseThrow().getQuantity());
    }

    @Test
    void gst_isSplitIntoCgstAndSgst_andNumberContinues() {
        InvoiceResponse response = invoiceService.create(invoiceWith(5L, 3));

        // Sugar: 3 x 45.00 = 135.00, GST 5% = 6.75 -> CGST 3.38 + SGST 3.37
        assertEquals(0, new BigDecimal("141.75").compareTo(response.getGrandTotal()));
        assertEquals(0, new BigDecimal("6.75").compareTo(response.getGstAmount()));
        assertEquals(0, response.getCgstAmount().add(response.getSgstAmount())
                .compareTo(response.getGstAmount()));
        assertEquals(0, new BigDecimal("3.38").compareTo(response.getCgstAmount()));

        // Seed already contains INV-<year>-0001 and -0002
        assertEquals("INV-" + LocalDate.now().getYear() + "-0003", response.getInvoiceNumber());
    }

    @Test
    void insufficientStock_throwsAndSavesNothing() {
        long invoicesBefore = invoiceRepository.count();
        int sugarBefore = stockBatchRepository.findById(3L).orElseThrow().getQuantity();

        assertThrows(InsufficientStockException.class, () -> invoiceService.create(invoiceWith(5L, 99999)));

        assertEquals(invoicesBefore, invoiceRepository.count());
        assertEquals(sugarBefore, stockBatchRepository.findById(3L).orElseThrow().getQuantity());
    }

    @Test
    void expiredBatch_isNeverSold() {
        // Paracetamol has 100 expired pcs + 60 fresh pcs: only the 60 may be sold
        InsufficientStockException error = assertThrows(InsufficientStockException.class,
                () -> invoiceService.create(invoiceWith(17L, 61)));

        assertTrue(error.getMessage().contains("Available: 60"));
    }

    private InvoiceRequest invoiceWith(Long productId, int quantity) {
        InvoiceRequest request = new InvoiceRequest();
        request.setItems(List.of(new InvoiceItemRequest(productId, quantity)));
        return request;
    }
}
