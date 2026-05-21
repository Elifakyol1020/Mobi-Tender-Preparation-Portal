package com.mobivisor.mobivisortechnicalinfoportal.dto.response;

public record SpecificationItemResponse(
        Long id,
        String article,
        String suitability,
        String mobiComment,
        String specificationName,
        String categoryName
) {}
