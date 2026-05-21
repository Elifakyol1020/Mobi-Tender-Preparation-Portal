package com.mobivisor.mobivisortechnicalinfoportal.repository.jpa;

import com.mobivisor.mobivisortechnicalinfoportal.entity.Specification;
import com.mobivisor.mobivisortechnicalinfoportal.entity.SpecificationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SpecificationItemRepository extends JpaRepository<SpecificationItem, Long> {

    Optional<SpecificationItem> findBySpecificationAndArticle(Specification specification, String article);

    @Query("SELECT si FROM SpecificationItem si WHERE si.specification.id = :specId")
    List<SpecificationItem> findBySpecificationId(@Param("specId") Long specificationId);

}
