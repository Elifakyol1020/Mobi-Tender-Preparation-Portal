package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.CategoryRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.CategoryResponse;
import com.mobivisor.mobivisortechnicalinfoportal.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Bu method yeni bir kategori oluşturmak için kullanılır.
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        logger.info("Kategori oluşturma isteği alındı. İsim: {}", request.categoryName());
        CategoryResponse response = categoryService.createCategory(request);
        logger.info("Kategori oluşturuldu. ID: {}", response.id());
        return ResponseEntity.ok(response);
    }

    // Bu method var olan bir kategoriyi güncellemek için kullanılır.
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        logger.info("Kategori güncelleme isteği alındı. ID: {}, Yeni İsim: {}", id, request.categoryName());
        CategoryResponse response = categoryService.updateCategory(id, request);
        logger.info("Kategori güncellendi. ID: {}", response.id());
        return ResponseEntity.ok(response);
    }

    // Bu method var olan bir kategoriyi silmek için kullanılır.
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        logger.info("Kategori silme isteği alındı. ID: {}", id);
        categoryService.deleteCategory(id);
        logger.info("Kategori silindi. ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    // Bu method ID'ye göre bir kategoriyi getirmek için kullanılır.
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        logger.info("ID'ye göre kategori getirme isteği alındı. ID: {}", id);
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    // Bu method tüm kategorileri listelemek için kullanılır.
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        logger.info("Tüm kategorileri getirme isteği alındı");
        List<CategoryResponse> responses = categoryService.getAllCategories();
        return ResponseEntity.ok(responses);
    }
}
