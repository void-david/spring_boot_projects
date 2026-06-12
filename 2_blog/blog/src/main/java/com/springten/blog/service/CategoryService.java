package com.springten.blog.service;

import com.springten.blog.dto.request.CategoryRequest;
import com.springten.blog.dto.response.CategoryResponse;
import com.springten.blog.model.Category;
import com.springten.blog.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository){
        this.categoryRepository = categoryRepository;
    }

    private CategoryResponse toCategoryResponse(Category category){
        return new CategoryResponse(category.getId(), category.getName());
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    public Optional<CategoryResponse> getCategoryById(Long id) {
        return categoryRepository.findById(id).map(this::toCategoryResponse);
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        return toCategoryResponse(categoryRepository.save(category));
    }

    public Optional<CategoryResponse> updateCategory(Long id, CategoryRequest request) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(request.getName());
            return toCategoryResponse(categoryRepository.save(existing));
        });
    }

    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
