package com.mobivisor.mobivisortechnicalinfoportal.service;

import com.mobivisor.mobivisortechnicalinfoportal.dto.mapper.SpecificationMapper;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationCreateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.request.SpecificationUpdateRequest;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationResponse;
import com.mobivisor.mobivisortechnicalinfoportal.dto.response.SpecificationWithCountResponse;
import com.mobivisor.mobivisortechnicalinfoportal.entity.Specification;
import com.mobivisor.mobivisortechnicalinfoportal.repository.jpa.SpecificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SpecificationService {

    private final SpecificationRepository specificationRepository;
    private final SpecificationMapper specificationMapper;

    public SpecificationService(SpecificationRepository specificationRepository, SpecificationMapper specificationMapper
                               ) {
        this.specificationRepository = specificationRepository;
        this.specificationMapper = specificationMapper;
    }

    public SpecificationResponse create(SpecificationCreateRequest specificationCreateRequest) {
        Specification specification = specificationMapper.toEntity(specificationCreateRequest);
        return specificationMapper.toResponse(specificationRepository.save(specification));
    }

    public List<SpecificationResponse> getAll() {
        return specificationRepository.findAll()
                .stream()
                .map(specificationMapper::toResponse)
                .toList();
    }

    public SpecificationResponse getById(Long id) {
        return specificationRepository.findById(id)
                .map(specificationMapper::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Specification not found with id: " + id));
    }

    public SpecificationResponse update(Long id, SpecificationUpdateRequest specificationUpdateRequest) {
        Specification specification = specificationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Specification not found with id: " + id));

        specificationMapper.updateEntity(specification, specificationUpdateRequest);
        Specification updatedSpecification = specificationRepository.save(specification);
        return specificationMapper.toResponse(updatedSpecification);
    }

    public void delete(Long id) {
        if (!specificationRepository.existsById(id)) {
            throw new NoSuchElementException("Specification not found with id: " + id);
        }
        specificationRepository.deleteById(id);
    }

    public List<SpecificationWithCountResponse> getAllWithItemCount() {
        return specificationRepository.findAll().stream()
                .map(spec -> new SpecificationWithCountResponse(
                        spec.getId(),
                        spec.getSpecificationName(),
                        (long) spec.getItems().size()
                ))
                .toList();
    }

    public void deleteAll() {
        specificationRepository.deleteAll();
    }
}
