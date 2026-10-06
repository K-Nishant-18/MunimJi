package com.munimji.service;

import com.munimji.dto.PagedResponse;
import com.munimji.dto.product.ProductRequest;
import com.munimji.dto.product.ProductResponse;
import com.munimji.entity.Category;
import com.munimji.entity.Product;
import com.munimji.exception.ConflictException;
import com.munimji.exception.ResourceNotFoundException;
import com.munimji.repository.CategoryRepository;
import com.munimji.repository.InvoiceItemRepository;
import com.munimji.repository.ProductRepository;
import com.munimji.repository.PurchaseItemRepository;
import com.munimji.security.CurrentTenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          PurchaseItemRepository purchaseItemRepository,
                          InvoiceItemRepository invoiceItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.purchaseItemRepository = purchaseItemRepository;
        this.invoiceItemRepository = invoiceItemRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> search(String search, int page, int size) {
        String query = search == null ? "" : search.trim();
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        Page<Product> result = productRepository.search(CurrentTenant.id(), query, pageable);

        List<ProductResponse> content = new ArrayList<>();
        for (Product product : result.getContent()) {
            content.add(toResponse(product));
        }
        return new PagedResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Long ownerId = CurrentTenant.id();
        if (productRepository.existsByOwnerIdAndBarcode(ownerId, request.getBarcode())) {
            throw new ConflictException("A product with this barcode already exists");
        }
        Product product = new Product();
        product.setOwnerId(ownerId);
        applyRequest(product, request);
        productRepository.save(product);
        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findById(id);
        String barcode = blankToNull(request.getBarcode());
        if (barcode != null
                && productRepository.existsByOwnerIdAndBarcodeAndIdNot(product.getOwnerId(), barcode, id)) {
            throw new ConflictException("A product with this barcode already exists");
        }
        applyRequest(product, request);
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        Product product = findById(id);
        if (purchaseItemRepository.existsByProductId(id)) {
            throw new ConflictException("Product is used in a purchase and cannot be deleted");
        }
        if (invoiceItemRepository.existsByProductId(id)) {
            throw new ConflictException("Product is used in an invoice and cannot be deleted");
        }
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setBarcode(blankToNull(request.getBarcode()));
        product.setUnit(request.getUnit().trim());
        product.setHsnCode(blankToNull(request.getHsnCode()));
        product.setGstRate(request.getGstRate());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderLevel(request.getReorderLevel());

        if (request.getCategoryId() == null) {
            product.setCategory(null);
        } else {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found with id " + request.getCategoryId()));
            if (!product.getOwnerId().equals(category.getOwnerId())) {
                throw new ResourceNotFoundException(
                        "Category not found with id " + request.getCategoryId());
            }
            product.setCategory(category);
        }
    }

    private Product findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
        if (!CurrentTenant.id().equals(product.getOwnerId())) {
            throw new ResourceNotFoundException("Product not found with id " + id);
        }
        return product;
    }

    private ProductResponse toResponse(Product product) {
        String categoryName = null;
        Long categoryId = null;
        if (product.getCategory() != null) {
            categoryId = product.getCategory().getId();
            categoryName = product.getCategory().getName();
        }
        return new ProductResponse(product.getId(), product.getName(), product.getBarcode(),
                product.getUnit(), product.getHsnCode(), product.getGstRate(),
                product.getSellingPrice(), product.getReorderLevel(), categoryId, categoryName);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
