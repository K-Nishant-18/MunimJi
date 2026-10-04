package com.munimji.repository;

import com.munimji.entity.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    boolean existsByProductId(Long productId);
}
