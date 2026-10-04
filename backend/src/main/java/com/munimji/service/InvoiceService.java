package com.munimji.service;

import com.munimji.dto.PagedResponse;
import com.munimji.dto.invoice.InvoiceItemRequest;
import com.munimji.dto.invoice.InvoiceItemResponse;
import com.munimji.dto.invoice.InvoiceRequest;
import com.munimji.dto.invoice.InvoiceResponse;
import com.munimji.dto.invoice.InvoiceSummaryResponse;
import com.munimji.entity.Invoice;
import com.munimji.entity.InvoiceItem;
import com.munimji.entity.Product;
import com.munimji.entity.StockBatch;
import com.munimji.exception.BadRequestException;
import com.munimji.exception.InsufficientStockException;
import com.munimji.exception.ResourceNotFoundException;
import com.munimji.repository.InvoiceRepository;
import com.munimji.repository.ProductRepository;
import com.munimji.repository.StockBatchRepository;
import com.munimji.util.MoneyUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final StockBatchRepository stockBatchRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          ProductRepository productRepository,
                          StockBatchRepository stockBatchRepository) {
        this.invoiceRepository = invoiceRepository;
        this.productRepository = productRepository;
        this.stockBatchRepository = stockBatchRepository;
    }

    /**
     * Creates the invoice, applies GST and deducts stock using FEFO, all in ONE
     * transaction. If any product does not have enough stock the whole thing
     * rolls back, so no invoice and no partial stock deduction is saved.
     */
    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        LocalDate today = LocalDate.now();
        BigDecimal discount = request.getDiscount() == null ? MoneyUtil.zero()
                : MoneyUtil.round(request.getDiscount());
        if (discount.signum() < 0) {
            throw new BadRequestException("Discount cannot be negative");
        }

        // Load products and calculate the gross (price * qty) of every line
        List<Product> products = new ArrayList<>();
        List<Integer> quantities = new ArrayList<>();
        List<BigDecimal> grossAmounts = new ArrayList<>();
        BigDecimal subTotal = MoneyUtil.zero();

        for (InvoiceItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id " + itemRequest.getProductId()));
            BigDecimal gross = MoneyUtil.round(
                    product.getSellingPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            products.add(product);
            quantities.add(itemRequest.getQuantity());
            grossAmounts.add(gross);
            subTotal = subTotal.add(gross);
        }

        if (discount.compareTo(subTotal) > 0) {
            throw new BadRequestException("Discount cannot be more than the subtotal");
        }

        // Split the invoice discount over the lines in proportion to gross.
        // The last line gets the remainder so the parts always add up exactly.
        List<BigDecimal> lineDiscounts = new ArrayList<>();
        BigDecimal assigned = MoneyUtil.zero();
        for (int i = 0; i < grossAmounts.size(); i++) {
            BigDecimal share;
            if (i < grossAmounts.size() - 1) {
                share = MoneyUtil.round(discount.multiply(grossAmounts.get(i)).divide(subTotal, 8,
                        java.math.RoundingMode.HALF_UP));
                assigned = assigned.add(share);
            } else {
                share = MoneyUtil.round(discount.subtract(assigned));
            }
            lineDiscounts.add(share);
        }

        // GST per line: taxable = gross - discount share, gst = taxable * rate / 100
        // CGST and SGST are each half of the GST (intra-state supply)
        List<BigDecimal> taxableAmounts = new ArrayList<>();
        List<BigDecimal> gstAmounts = new ArrayList<>();
        List<BigDecimal> cgstAmounts = new ArrayList<>();
        List<BigDecimal> sgstAmounts = new ArrayList<>();

        BigDecimal totalGst = MoneyUtil.zero();
        BigDecimal totalCgst = MoneyUtil.zero();
        BigDecimal totalSgst = MoneyUtil.zero();

        for (int i = 0; i < products.size(); i++) {
            BigDecimal taxable = MoneyUtil.round(grossAmounts.get(i).subtract(lineDiscounts.get(i)));
            BigDecimal gst = MoneyUtil.round(taxable.multiply(products.get(i).getGstRate())
                    .divide(MoneyUtil.HUNDRED, 8, java.math.RoundingMode.HALF_UP));
            BigDecimal cgst = MoneyUtil.round(gst.divide(MoneyUtil.TWO, 8, java.math.RoundingMode.HALF_UP));
            BigDecimal sgst = MoneyUtil.round(gst.subtract(cgst));

            taxableAmounts.add(taxable);
            gstAmounts.add(gst);
            cgstAmounts.add(cgst);
            sgstAmounts.add(sgst);

            totalGst = totalGst.add(gst);
            totalCgst = totalCgst.add(cgst);
            totalSgst = totalSgst.add(sgst);
        }

        // FEFO: check availability first, then deduct from earliest expiry batch
        List<List<StockBatch>> deductionPlan = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            int needed = quantities.get(i);
            List<StockBatch> sellable = stockBatchRepository.findSellableByProduct(product.getId(), today);

            int available = 0;
            for (StockBatch batch : sellable) {
                available += batch.getQuantity();
            }
            if (available < needed) {
                throw new InsufficientStockException(
                        "Not enough stock for '" + product.getName() + "'. Available: " + available
                                + " " + product.getUnit() + ", requested: " + needed);
            }

            int remaining = needed;
            List<StockBatch> usedBatches = new ArrayList<>();
            for (StockBatch batch : sellable) {
                if (remaining == 0) {
                    break;
                }
                int take = Math.min(batch.getQuantity(), remaining);
                batch.setQuantity(batch.getQuantity() - take);
                remaining -= take;
                usedBatches.add(batch);
            }
            deductionPlan.add(usedBatches);
        }

        // Everything is valid, now build and save the invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(nextInvoiceNumber());
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setCustomerName(blankToNull(request.getCustomerName()));
        invoice.setCustomerPhone(blankToNull(request.getCustomerPhone()));
        invoice.setSubTotal(subTotal);
        invoice.setDiscountAmount(discount);
        invoice.setCgstAmount(totalCgst);
        invoice.setSgstAmount(totalSgst);
        invoice.setGstAmount(totalGst);
        invoice.setGrandTotal(MoneyUtil.round(subTotal.subtract(discount).add(totalGst)));

        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            BigDecimal taxable = taxableAmounts.get(i);
            BigDecimal gst = gstAmounts.get(i);

            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProduct(product);
            item.setStockBatch(deductionPlan.get(i).get(0));
            // Snapshot so old invoices stay correct if the product changes later
            item.setProductName(product.getName());
            item.setHsnCode(product.getHsnCode());
            item.setUnitPrice(product.getSellingPrice());
            item.setGstRate(product.getGstRate());
            item.setQuantity(quantities.get(i));
            item.setDiscountAmount(lineDiscounts.get(i));
            item.setTaxableAmount(taxable);
            item.setGstAmount(gst);
            item.setLineTotal(MoneyUtil.round(taxable.add(gst)));
            invoice.getItems().add(item);
        }

        invoice = invoiceRepository.save(invoice);
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public PagedResponse<InvoiceSummaryResponse> findAll(int page, int size) {
        Page<InvoiceSummaryResponse> result = invoiceRepository.findAllSummaries(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")));

        return new PagedResponse<>(result.getContent(), result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse findById(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id " + id));
        return toResponse(invoice);
    }

    /**
     * INV-YYYY-NNNN, sequence restarts every year and continues from the last
     * invoice of the current year.
     */
    private String nextInvoiceNumber() {
        int year = LocalDate.now().getYear();
        int next = 1;
        Optional<Invoice> last = invoiceRepository.findTopByOrderByIdDesc();
        if (last.isPresent()) {
            String[] parts = last.get().getInvoiceNumber().split("-");
            if (parts.length == 3 && parts[1].equals(String.valueOf(year))) {
                try {
                    next = Integer.parseInt(parts[2]) + 1;
                } catch (NumberFormatException ex) {
                    next = 1;
                }
            }
        }
        return String.format("INV-%d-%04d", year, next);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        List<InvoiceItemResponse> items = new ArrayList<>();
        for (InvoiceItem item : invoice.getItems()) {
            BigDecimal cgst = item.getGstAmount() == null ? MoneyUtil.zero()
                    : MoneyUtil.round(item.getGstAmount().divide(MoneyUtil.TWO, 8,
                    java.math.RoundingMode.HALF_UP));
            BigDecimal sgst = MoneyUtil.zero();
            if (item.getGstAmount() != null) {
                sgst = MoneyUtil.round(item.getGstAmount().subtract(cgst));
            }
            items.add(new InvoiceItemResponse(
                    item.getProduct() != null ? item.getProduct().getId() : null,
                    item.getProductName(), item.getHsnCode(), item.getUnitPrice(), item.getGstRate(),
                    item.getQuantity(),
                    MoneyUtil.round(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))),
                    item.getDiscountAmount(), item.getTaxableAmount(), item.getGstAmount(),
                    cgst, sgst, item.getLineTotal()));
        }

        return new InvoiceResponse(invoice.getId(), invoice.getInvoiceNumber(), invoice.getInvoiceDate(),
                invoice.getCustomerName(), invoice.getCustomerPhone(), invoice.getSubTotal(),
                invoice.getDiscountAmount(),
                MoneyUtil.round(invoice.getSubTotal().subtract(invoice.getDiscountAmount())),
                invoice.getCgstAmount(), invoice.getSgstAmount(), invoice.getGstAmount(),
                invoice.getGrandTotal(), items);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
