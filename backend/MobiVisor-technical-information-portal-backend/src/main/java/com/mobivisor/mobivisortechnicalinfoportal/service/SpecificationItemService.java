package com.mobivisor.mobivisortechnicalinfoportal.service;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.DuplicateExportRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationItemUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationItemResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.Category;
import com.mobivisor.mobivisortechnicalinfoportal.entity.Specification;
import com.mobivisor.mobivisortechnicalinfoportal.entity.SpecificationItem;
import com.mobivisor.mobivisortechnicalinfoportal.entity.elasticsearch.SpecificationItemElastic;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.CategoryRepository;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.SpecificationItemRepository;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.SpecificationRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SpecificationItemService {

    private static final Logger logger = LoggerFactory.getLogger(SpecificationItemService.class);

    private final SpecificationItemRepository specificationItemRepository;
    private final SpecificationItemSearchService specificationItemSearchService;
    private final CategoryRepository categoryRepository;
    private final SpecificationRepository specificationRepository;

    public SpecificationItemService(SpecificationItemRepository specificationItemRepository,
                                    SpecificationItemSearchService specificationItemSearchService,
                                    CategoryRepository categoryRepository,
                                    SpecificationRepository specificationRepository) {
        this.specificationItemRepository = specificationItemRepository;
        this.specificationItemSearchService = specificationItemSearchService;
        this.categoryRepository = categoryRepository;
        this.specificationRepository = specificationRepository;
    }

    public SpecificationItem save(SpecificationItem specificationItem) {
        SpecificationItem saved = specificationItemRepository.save(specificationItem);

        SpecificationItemElastic elastic = new SpecificationItemElastic();
        elastic.setId(saved.getId());
        elastic.setArticle(saved.getArticle());
        elastic.setSuitability(saved.getSuitability());
        elastic.setMobiComment(saved.getMobiComment());
        elastic.setSpecificationName(saved.getSpecification().getSpecificationName());
        elastic.setCategoryName(
                saved.getCategory() != null ? saved.getCategory().getCategoryName() : null
        );
        specificationItemSearchService.indexSpecification(elastic);
        logger.info("Specification kaydedildi ve Elasticsearch indekslendi - id: {}", saved.getId());
        return saved;
    }


    public List<SpecificationItem> findByIds(List<Long> ids) {
        logger.info("Specification aranıyor - ids: {}", ids);
        List<SpecificationItem> specs = specificationItemRepository.findAllById(ids);
        logger.info("Specification bulundu - sayısı: {}", specs.size());
        return specs;
    }

    public List<SpecificationItemResponse> getAllItems() {
        logger.info("Tüm specification item verileri getiriliyor");
        return specificationItemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<SpecificationItemResponse> getBySpecificationId(Long specificationId) {
        logger.info("SpecificationId'ye göre veriler getiriliyor - specificationId: {}", specificationId);
        Optional<Specification> specificationOpt = specificationRepository.findById(specificationId);
        if (specificationOpt.isEmpty()) {
            logger.warn("Belirtilen specification bulunamadı - id: {}", specificationId);
            return List.of();
        }
        List<SpecificationItem> items = specificationItemRepository.findBySpecificationId(specificationOpt.get().getId());
        logger.info("SpecificationItem sayısı: {}", items.size());
        return items.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public boolean updateSpecification(Long id, SpecificationItemUpdateRequest request) {
        logger.info("SpecificationItem güncelleme isteği alındı - id: {}, request: {}", id, request);

        Optional<SpecificationItem> optionalItem = specificationItemRepository.findById(id);
        if (optionalItem.isEmpty()) {
            logger.warn("Güncellenecek SpecificationItem bulunamadı - id: {}", id);
            return false;
        }

        SpecificationItem item = optionalItem.get();

        if (request.specificationId() != null) {
            Optional<Specification> specOpt = specificationRepository.findById(request.specificationId());
            if (specOpt.isEmpty()) {
                logger.warn("Belirtilen specification bulunamadı - id: {}", request.specificationId());
                return false;
            }
            item.setSpecification(specOpt.get());
        }

        item.setArticle(request.article());
        item.setSuitability(request.suitability());
        item.setMobiComment(request.mobiComment());

        if (request.categoryId() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(request.categoryId());
            if (categoryOpt.isEmpty()) {
                logger.warn("Belirtilen kategori bulunamadı - id: {}", request.categoryId());
                return false;
            }
            item.setCategory(categoryOpt.get());
        }

        SpecificationItem updated = specificationItemRepository.save(item);
        logger.info("SpecificationItem veritabanında güncellendi - id: {}", updated.getId());

        SpecificationItemElastic elastic = new SpecificationItemElastic();
        elastic.setId(updated.getId());
        elastic.setArticle(updated.getArticle());
        elastic.setSuitability(updated.getSuitability());
        elastic.setMobiComment(updated.getMobiComment());
        elastic.setSpecificationName(updated.getSpecification().getSpecificationName());
        elastic.setCategoryName(
                updated.getCategory() != null ? updated.getCategory().getCategoryName() : null
        );

        specificationItemSearchService.indexSpecification(elastic);
        logger.info("SpecificationItem Elasticsearch indeksine eklendi/güncellendi - id: {}", updated.getId());

        return true;
    }

    public ResponseEntity<String> duplicateAndExport(DuplicateExportRequest request){
        try {
            String newName = request.newSpecificationName();
            if (specificationRepository.existsBySpecificationName(newName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Bu isimde bir specification zaten var: " + newName);
            }

            Specification specification = new Specification();
            specification.setSpecificationName(newName);
            specification = specificationRepository.save(specification);


            List<SpecificationItem> originalSpecs = findByIds(request.selectedIds());

            Category generalCategory = categoryRepository.findByCategoryName("GENERAL")
                    .orElseGet(() -> {
                        Category newCategory = new Category();
                        newCategory.setCategoryName("GENERAL");
                        return categoryRepository.save(newCategory);
                    });

            List<SpecificationItem> copiedSpecs = new ArrayList<>();
            for (SpecificationItem spec : originalSpecs) {
                SpecificationItem copy = new SpecificationItem();
                copy.setArticle(spec.getArticle());
                copy.setSuitability(spec.getSuitability());
                copy.setMobiComment(spec.getMobiComment());
                copy.setSpecification(specification);
                if (spec.getCategory() != null) {
                    copy.setCategory(spec.getCategory());
                } else {
                    copy.setCategory(generalCategory);
                }

                SpecificationItem saved = save(copy);
                copiedSpecs.add(saved);
            }

            String filename = exportSpecificationsToExcel(copiedSpecs, specification.getId());

            return ResponseEntity.ok(filename);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Hata: " + e.getMessage());
        }
    }

    public ResponseEntity<Resource> downloadFile(String filename) {
        try {
            Path filePath = Paths.get("exports").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentDisposition = "attachment; filename=\"" + resource.getFilename() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);

        } catch (MalformedURLException e) {
            logger.error("Dosya indirilemedi: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    public String exportSpecificationsToExcel(List<SpecificationItem> specifications, Long specificationId) throws IOException {

        Specification specification = specificationRepository.findById(specificationId)
                .orElseThrow(() -> new IllegalArgumentException("Belirtilen ID ile bir specification bulunamadı: " + specificationId));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Specifications");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setBorderBottom(BorderStyle.THIN);
            dataCellStyle.setBorderTop(BorderStyle.THIN);
            dataCellStyle.setBorderLeft(BorderStyle.THIN);
            dataCellStyle.setBorderRight(BorderStyle.THIN);

            Row header = sheet.createRow(0);
            String[] headers = {"Article", "Suitability", "Mobi Comment", "Specification Name", "Category"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (SpecificationItem spec : specifications) {
                Row row = sheet.createRow(rowIdx++);

                Cell cell0 = row.createCell(0);
                cell0.setCellValue(spec.getArticle());
                cell0.setCellStyle(dataCellStyle);

                Cell cell1 = row.createCell(1);
                cell1.setCellValue(spec.getSuitability());
                cell1.setCellStyle(dataCellStyle);

                Cell cell2 = row.createCell(2);
                cell2.setCellValue(spec.getMobiComment());
                cell2.setCellStyle(dataCellStyle);

                Cell cell3 = row.createCell(3);
                cell3.setCellValue(spec.getSpecification().getSpecificationName());
                cell3.setCellStyle(dataCellStyle);

                Cell cell4 = row.createCell(4);
                String categoryName = spec.getCategory() != null ? spec.getCategory().getCategoryName() : "GENERAL";
                cell4.setCellValue(categoryName);
                cell4.setCellStyle(dataCellStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            Path exportDir = Paths.get("exports");
            if (!Files.exists(exportDir)) {
                Files.createDirectories(exportDir);
            }

            String safeName = specification.getSpecificationName().trim().replaceAll("[^a-zA-Z0-9\\-]", "_");
            String filename = safeName + ".xlsx";

            Path filePath = exportDir.resolve(filename);

            Files.write(filePath, out.toByteArray(), StandardOpenOption.CREATE);

            logger.info("Excel dosyası kaydedildi: {}", filePath.toAbsolutePath());

            return filename;
        }
    }

    public ResponseEntity<Resource> exportSelectedItemsToExcel(DuplicateExportRequest request) {
        try {
            List<SpecificationItem> items = specificationItemRepository.findAllById(request.selectedIds());

            byte[] excelData = exportItemsToExcelInMemory(items, request.newSpecificationName());

            String filename = (request.newSpecificationName() == null || request.newSpecificationName().trim().isEmpty())
                    ? "exported-specification.xlsx"
                    : request.newSpecificationName().trim().replaceAll("[^a-zA-Z0-9\\-]", "_") + ".xlsx";

            ByteArrayResource resource = new ByteArrayResource(excelData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (Exception e) {
            logger.error("Excel export sırasında hata: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    public byte[] exportItemsToExcelInMemory(List<SpecificationItem> items, String fileTitle) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Specifications");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setBorderBottom(BorderStyle.THIN);
            dataCellStyle.setBorderTop(BorderStyle.THIN);
            dataCellStyle.setBorderLeft(BorderStyle.THIN);
            dataCellStyle.setBorderRight(BorderStyle.THIN);

            Row header = sheet.createRow(0);
            String[] headers = {"Article", "Suitability", "Mobi Comment", "Specification Name", "Category"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (SpecificationItem item : items) {
                Row row = sheet.createRow(rowIdx++);

                Cell cell0 = row.createCell(0);
                cell0.setCellValue(item.getArticle() != null ? item.getArticle() : "");
                cell0.setCellStyle(dataCellStyle);

                Cell cell1 = row.createCell(1);
                cell1.setCellValue(item.getSuitability() != null ? item.getSuitability() : "");
                cell1.setCellStyle(dataCellStyle);

                Cell cell2 = row.createCell(2);
                cell2.setCellValue(item.getMobiComment() != null ? item.getMobiComment() : "");
                cell2.setCellStyle(dataCellStyle);

                Cell cell3 = row.createCell(3);
                cell3.setCellValue(fileTitle);
                cell3.setCellStyle(dataCellStyle);

                Cell cell4 = row.createCell(3);
                String categoryName = (item.getCategory() != null && item.getCategory().getCategoryName() != null)
                        ? item.getCategory().getCategoryName()
                        : "GENERAL";
                cell4.setCellValue(categoryName);
                cell4.setCellStyle(dataCellStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    public boolean deleteById(Long id) {
        logger.info("Specification silme isteği alındı - id: {}", id);
        if (specificationItemRepository.existsById(id)) {
            specificationItemRepository.deleteById(id);
            logger.info("Specification veritabanından silindi - id: {}", id);
            specificationItemSearchService.deleteFromIndex(id);
            logger.info("Specification Elasticsearch indeksinden silindi - id: {}", id);
            return true;
        }
        logger.warn("Silinecek Specification bulunamadı - id: {}", id);
        return false;
    }

    private SpecificationItemResponse convertToResponse(SpecificationItem item) {
        return new SpecificationItemResponse(
                item.getId(),
                item.getArticle(),
                item.getSuitability(),
                item.getMobiComment(),
                item.getSpecification().getSpecificationName(),
                item.getCategory() != null ? item.getCategory().getCategoryName() : "GENERAL",
                item.getSpecification() != null ? item.getSpecification().getId() : null,
                item.getCategory() != null ? item.getCategory().getId() : null
        );
    }
}
