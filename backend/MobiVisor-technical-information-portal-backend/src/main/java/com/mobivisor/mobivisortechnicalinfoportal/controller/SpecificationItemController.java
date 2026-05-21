package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.DuplicateExportRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationItemUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationItemResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.SpecificationItem;
import com.mobivisor.mobivisortechnicalinfoportal.service.ExcelImportService;
import com.mobivisor.mobivisortechnicalinfoportal.service.SpecificationItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/specification-items")
public class SpecificationItemController {

    private static final Logger logger = LoggerFactory.getLogger(SpecificationItemController.class);
    private final ExcelImportService excelImportService;
    private final SpecificationItemService specificationItemService;

    public SpecificationItemController(ExcelImportService excelImportService, SpecificationItemService specificationItemService) {
        this.excelImportService = excelImportService;
        this.specificationItemService = specificationItemService;
    }

    // Bu method, Excel dosyasını yükler ve içeriğini işler.
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> uploadExcel(@RequestPart("file") MultipartFile file,
                                              @RequestParam("specificationId") Long specificationId) {
        logger.info("Excel yükleme isteği alındı: specificationId='{}'", specificationId);
        try {
            List<SpecificationItem> imported = excelImportService.importOrUpdateFromExcel(file, specificationId);
            String filename = specificationItemService.exportSpecificationsToExcel(imported, specificationId);
            return ResponseEntity.ok("Excel başarıyla işlendi. İndirilebilir dosya: " + filename);
        } catch (Exception e) {
            logger.error("Excel yükleme sırasında hata: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Yükleme sırasında hata: " + e.getMessage());
        }
    }

    // Bu method, belirli bir SpecificationItem'ı ID'sine göre günceller.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<String> updateSpecification(@PathVariable Long id,
                                                      @RequestBody SpecificationItemUpdateRequest request) {
        logger.info("SpecificationItem güncelleme isteği: id={}", id);
        boolean updated = specificationItemService.updateSpecification(id, request);
        if (updated) {
            logger.info("SpecificationItem güncellendi: id={}", id);
            return ResponseEntity.ok("SpecificationItem güncellendi.");
        } else {
            logger.warn("Güncellenecek SpecificationItem bulunamadı: id={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("SpecificationItem bulunamadı.");
        }
    }

    // Bu method, Specification'da bulunan tüm SpecificationItem'ları getirir.
    @GetMapping("/by-specification")
    public ResponseEntity<List<SpecificationItemResponse>> getBySpecificationId(@RequestParam Long specificationId) {
        logger.info("SpecificationId'e göre veriler getiriliyor: {}", specificationId);
        List<SpecificationItemResponse> specs = specificationItemService.getBySpecificationId(specificationId);
        return ResponseEntity.ok(specs);
    }

    // Bu method, yeni bir excel dosasını oluşturur ve indirilebilir hale getirir.
    @PostMapping("/duplicate-and-export")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<String> duplicateAndExport(@RequestBody DuplicateExportRequest request) {
        logger.info("Duplicate ve export işlemi başlatıldı: {}", request);
        return specificationItemService.duplicateAndExport(request);
    }

    // Bu method, gelen dosya ismine göre dosyayı indirir.
    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        logger.info("Export edilen dosya indiriliyor: {}", filename);
        return specificationItemService.downloadFile(filename);
    }

    // Bu method, ID ile bir SpecificationItem'ı siler.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteById(@PathVariable Long id) {
        logger.info("Silme isteği: id={}", id);
        boolean deleted = specificationItemService.deleteById(id);
        if (deleted) {
            logger.info("Specification silindi: id={}", id);
            return ResponseEntity.ok("Specification silindi.");
        } else {
            logger.warn("Silinecek specification bulunamadı: id={}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bulunamadı.");
        }
    }

    // Bu method, seçilen SpecificationItem'ları Excel formatında dışa aktarır, kaydetme işlemi yapılmaz.
    @PostMapping("/export-selected")
    public ResponseEntity<Resource> exportSelectedToExcel(@RequestBody DuplicateExportRequest request) {
        return specificationItemService.exportSelectedItemsToExcel(request);
    }

}
