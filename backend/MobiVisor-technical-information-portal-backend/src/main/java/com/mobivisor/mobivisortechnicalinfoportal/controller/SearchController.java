package com.mobivisor.mobivisortechnicalinfoportal.controller;

import com.mobivisor.mobivisortechnicalinfoportal.entity.elasticsearch.SpecificationItemElastic;
import com.mobivisor.mobivisortechnicalinfoportal.service.SpecificationItemSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    private final SpecificationItemSearchService searchService;

    public SearchController(SpecificationItemSearchService searchService) {
        this.searchService = searchService;
    }

    //Bu method keyword ile arama sonucu dönen verileri getirir.
    @GetMapping("/advanced")
    public List<SpecificationItemElastic> searchAdvanced(@RequestParam String keyword) {
        logger.info("Gelişmiş arama yapılıyor: keyword='{}'", keyword);
        return searchService.searchByKeyword(keyword);
    }

    //Bu method specificationName ile arama sonucu dönen verileri getirir.
    @GetMapping("/by-specification")
    public List<SpecificationItemElastic> searchBySpecificationName(@RequestParam String specificationName) {
        logger.info("Şartname adına göre arama yapılıyor: '{}'", specificationName);
        return searchService.searchBySpecificationName(specificationName);
    }

    // Bu method keyword ve specificationName ile arama yapar.
    @GetMapping("/by-specification-and-keyword")
    public List<SpecificationItemElastic> searchBySpecAndKeyword(@RequestParam String keyword,
                                                                 @RequestParam String specificationName) {
        logger.info("Şartname '{}' içinde keyword '{}' ile arama yapılıyor", specificationName, keyword);
        return searchService.searchByKeywordAndSpecificationName(keyword, specificationName);
    }

}
