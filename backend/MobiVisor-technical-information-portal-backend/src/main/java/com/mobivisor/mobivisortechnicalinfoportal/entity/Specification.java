package com.mobivisor.mobivisortechnicalinfoportal.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "specification", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"specification_name"})
})
public class Specification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "specification_name", nullable = false)
    private String specificationName;

    @OneToMany(mappedBy = "specification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpecificationItem> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public String getSpecificationName() {
        return specificationName;
    }

    public void setSpecificationName(String specificationName) {
        this.specificationName = specificationName;
    }

    public List<SpecificationItem> getItems() {
        return items;
    }

    public void setItems(List<SpecificationItem> items) {
        this.items = items;
    }
}
