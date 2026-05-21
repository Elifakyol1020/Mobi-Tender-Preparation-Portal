package com.mobivisor.mobivisortechnicalinfoportal.service;

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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelImportService {

    private final SpecificationItemRepository specificationItemRepository;
    private final SpecificationItemSearchService specificationItemSearchService;
    private final CategoryRepository categoryRepository;
    private final SpecificationRepository specificationRepository;
    private static final Logger logger = LoggerFactory.getLogger(ExcelImportService.class);

    public ExcelImportService(SpecificationItemRepository specificationItemRepository,
                              SpecificationItemSearchService specificationItemSearchService,
                              CategoryRepository categoryRepository,
                              SpecificationRepository specificationRepository) {
        this.specificationItemRepository = specificationItemRepository;
        this.specificationItemSearchService = specificationItemSearchService;
        this.categoryRepository = categoryRepository;
        this.specificationRepository = specificationRepository;
    }

    public List<SpecificationItem> importOrUpdateFromExcel(MultipartFile file, Long specificationId) throws IOException {
        logger.info("Excel içe aktarılıyor: file={}, specificationId={}", file.getOriginalFilename(), specificationId);

        Specification specification = specificationRepository.findById(specificationId)
                .orElseThrow(() -> new IllegalArgumentException("Belirtilen ID ile bir specification bulunamadı: " + specificationId));

        Category generalCategory = categoryRepository.findByCategoryName("GENERAL")
                .orElseGet(() -> {
                    Category newCategory = new Category();
                    newCategory.setCategoryName("GENERAL");
                    return categoryRepository.save(newCategory);
                });

        List<SpecificationItem> savedSpecifications = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                String rawArticle = getCellValue(row.getCell(0));
                String article = cleanLeadingNumber(rawArticle);

                if (article.isEmpty()) continue;

                String suitability = getCellValue(row.getCell(1));
                String mobiComment = getCellValue(row.getCell(2));

                SpecificationItem specItem = specificationItemRepository
                        .findBySpecificationAndArticle(specification, article)
                        .orElse(new SpecificationItem());

                specItem.setArticle(article);
                specItem.setSuitability(suitability);
                specItem.setMobiComment(mobiComment);
                specItem.setSpecification(specification);
                specItem.setCategory(generalCategory);

                SpecificationItem saved = specificationItemRepository.save(specItem);
                savedSpecifications.add(saved);

                SpecificationItemElastic elastic = convertToElastic(saved);
                specificationItemSearchService.indexSpecification(elastic);
            }
        }

        return savedSpecifications;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String cleanLeadingNumber(String input) {
        if (input == null) return "";
        return input.replaceFirst("^\\s*\\d+(\\.\\d+)*\\.?\\s*", "").trim();
    }

    private SpecificationItemElastic convertToElastic(SpecificationItem spec) {
        SpecificationItemElastic elastic = new SpecificationItemElastic();
        elastic.setId(spec.getId());
        elastic.setArticle(spec.getArticle());
        elastic.setSuitability(spec.getSuitability());
        elastic.setMobiComment(spec.getMobiComment());
        elastic.setSpecificationName(spec.getSpecification().getSpecificationName());
        if (spec.getCategory() != null) {
            elastic.setCategoryName(spec.getCategory().getCategoryName());
        } else {
            elastic.setCategoryName("GENERAL");
        }
        return elastic;
    }
}
