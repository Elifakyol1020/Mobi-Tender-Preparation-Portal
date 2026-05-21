package com.mobivisor.mobivisortechnicalinfoportal.dto.request;

public record SpecificationItemUpdateRequest(
        String article,
        String suitability,
        String mobiComment,
        Long specificationId,
        Long categoryId
) {
}

