package com.mobivisor.mobivisortechnicalinfoportal.repository.jpa;

import com.mobivisor.mobivisortechnicalinfoportal.entity.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecificationRepository extends JpaRepository<Specification, Long> {

    boolean existsBySpecificationName(String specificationName);
}
