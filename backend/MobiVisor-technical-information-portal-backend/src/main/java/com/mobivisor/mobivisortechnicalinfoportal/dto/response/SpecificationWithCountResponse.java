package com.mobivisor.mobivisortechnicalinfoportal.dto.response;

public record SpecificationWithCountResponse(
        Long id,
        String specificationName,
        long itemCount
) {
}
