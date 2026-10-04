package com.munimji.service;

import com.munimji.dto.supplier.SupplierRequest;
import com.munimji.dto.supplier.SupplierResponse;
import com.munimji.entity.Supplier;
import com.munimji.exception.ConflictException;
import com.munimji.exception.ResourceNotFoundException;
import com.munimji.repository.PurchaseRepository;
import com.munimji.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;

    public SupplierService(SupplierRepository supplierRepository, PurchaseRepository purchaseRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> findAll() {
        List<SupplierResponse> result = new ArrayList<>();
        for (Supplier supplier : supplierRepository.findAllByOrderByNameAsc()) {
            result.add(toResponse(supplier));
        }
        return result;
    }

    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = new Supplier();
        applyRequest(supplier, request);
        supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findById(id);
        applyRequest(supplier, request);
        return toResponse(supplier);
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = findById(id);
        if (purchaseRepository.existsBySupplierId(id)) {
            throw new ConflictException("Supplier has purchases and cannot be deleted");
        }
        supplierRepository.delete(supplier);
    }

    private void applyRequest(Supplier supplier, SupplierRequest request) {
        supplier.setName(request.getName().trim());
        supplier.setPhone(blankToNull(request.getPhone()));
        supplier.setEmail(blankToNull(request.getEmail()));
        supplier.setAddress(blankToNull(request.getAddress()));
        supplier.setGstin(blankToNull(request.getGstin()));
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id " + id));
    }

    private SupplierResponse toResponse(Supplier supplier) {
        return new SupplierResponse(supplier.getId(), supplier.getName(), supplier.getPhone(),
                supplier.getEmail(), supplier.getAddress(), supplier.getGstin());
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
