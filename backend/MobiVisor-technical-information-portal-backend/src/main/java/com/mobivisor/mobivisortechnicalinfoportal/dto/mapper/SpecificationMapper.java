package com.mobivisor.mobivisortechnicalinfoportal.dto.mapper;

import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationCreateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.Specification;
import org.springframework.stereotype.Component;

@Component
public class SpecificationMapper {

    public Specification toEntity(SpecificationCreateRequest request) {
        Specification spec = new Specification();
        spec.setSpecificationName(request.specificationName());
        return spec;
    }

    public void updateEntity(Specification specification, SpecificationUpdateRequest request) {
        specification.setSpecificationName(request.specificationName());
    }

    public SpecificationResponse toResponse(Specification specification) {
        return new SpecificationResponse(
                specification.getId(),
                specification.getSpecificationName()
        );
    }

}
