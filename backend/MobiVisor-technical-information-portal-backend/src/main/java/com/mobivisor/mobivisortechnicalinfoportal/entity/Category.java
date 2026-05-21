package com.mobivisor.mobivisortechnicalinfoportal.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name", nullable = false, unique = true)
    private String categoryName;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<SpecificationItem> specificationItems;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public List<SpecificationItem> getSpecificationItems() {
        return specificationItems;
    }

    public void setSpecificationItems(List<SpecificationItem> specificationItems) {
        this.specificationItems = specificationItems;
    }
}
