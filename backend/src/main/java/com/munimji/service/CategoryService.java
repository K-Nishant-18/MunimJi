package com.munimji.service;

import com.munimji.dto.category.CategoryRequest;
import com.munimji.dto.category.CategoryResponse;
import com.munimji.entity.Category;
import com.munimji.exception.ConflictException;
import com.munimji.exception.ResourceNotFoundException;
import com.munimji.repository.CategoryRepository;
import com.munimji.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        List<CategoryResponse> result = new ArrayList<>();
        for (Category category : categoryRepository.findAll()) {
            result.add(toResponse(category));
        }
        return result;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByName(name)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        Category category = new Category(name);
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);
        String name = request.getName().trim();
        if (!category.getName().equals(name) && categoryRepository.existsByName(name)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        category.setName(name);
        return toResponse(category);
    }

    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        if (productRepository.existsByCategoryId(id)) {
            throw new ConflictException("Category has products. Move or delete those products first.");
        }
        categoryRepository.delete(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
