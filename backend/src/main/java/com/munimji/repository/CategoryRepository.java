package com.munimji.repository;

import com.munimji.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    // Names are unique per shop, two shops can both sell "Kirana"
    boolean existsByOwnerIdAndName(Long ownerId, String name);

    List<Category> findByOwnerId(Long ownerId);
}
