package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationCreateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationResponse;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationWithCountResponse;
import com.mobivisor.mobivisortechnicalinfoportal.service.SpecificationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/specifications")
@PreAuthorize("hasAnyRole('ADMIN','USER')")
public class SpecificationController {

    private static final Logger logger = LoggerFactory.getLogger(SpecificationController.class);
    private final SpecificationService specificationService;

    public SpecificationController(SpecificationService specificationService) {
        this.specificationService = specificationService;
    }

    // Bu method yeni bir specification oluşturur.
    @PostMapping
    public ResponseEntity<SpecificationResponse> createSpecification(@Valid @RequestBody SpecificationCreateRequest specificationCreateRequest) {
        logger.info("Yeni specification oluşturuluyor: {}", specificationCreateRequest.specificationName());
        SpecificationResponse createdSpecification = specificationService.create(specificationCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSpecification);
    }

    // Bu method tüm specification verilerini getirir.
    @GetMapping
    public ResponseEntity<List<SpecificationResponse>> getAllSpecifications() {
        logger.info("Tüm specification verileri getiriliyor");
        List<SpecificationResponse> specifications = specificationService.getAll();
        if (specifications.isEmpty()) {
            logger.warn("Kayıtlı specification verileri bulunamadı");
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(specifications);
    }

    // Bu method ID ile bir specification verisini getirir.
    @GetMapping("/{id}")
    public ResponseEntity<SpecificationResponse> getSpecificationById(@PathVariable Long id) {
        logger.info("ID ile specification getiriliyor: {}", id);
        SpecificationResponse specificationResponse = specificationService.getById(id);
        if (specificationResponse == null) {
            logger.warn("ID ile eşleşen specification bulunamadı: {}", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(specificationResponse);
    }

    // Bu method ID ile bir specification verisini günceller.
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SpecificationResponse> updateSpecification(@PathVariable Long id,
                                                                     @Valid @RequestBody SpecificationUpdateRequest specificationUpdateRequest) {
        logger.info("Specification güncelleniyor: ID = {}", id);
        SpecificationResponse updated = specificationService.update(id, specificationUpdateRequest);
        return ResponseEntity.ok(updated);
    }

    // Bu method tüm specification isimlerini ve içerisinde kaç adet madde olduğunu getirir.
    @GetMapping("/with-item-count")
    public ResponseEntity<List<SpecificationWithCountResponse>> getSpecificationsWithItemCount() {
        logger.info("Specification'lar ve item sayıları getiriliyor");
        List<SpecificationWithCountResponse> result = specificationService.getAllWithItemCount();
        if (result.isEmpty()) {
            logger.warn("Kayıtlı specification bulunamadı");
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    // Bu method tüm specification verilerini siler.
    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllSpecifications() {
        logger.info("Tüm specificationlar siliniyor");
        specificationService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    // Bu method ID ile bir specification verisini siler.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSpecification(@PathVariable Long id) {
        logger.info("Specification siliniyor: ID = {}", id);
        specificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}