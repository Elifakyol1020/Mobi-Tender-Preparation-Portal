package com.mobivisor.mobivisortechnicalinfoportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "specification_item")
public class SpecificationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", length = 2000)
    private String article;

    private String suitability;

    @Column(name = "mobi_comment", columnDefinition = "TEXT", length = 2000)
    private String mobiComment;

    @ManyToOne
    @JoinColumn(name = "specification_id", nullable = false)
    private Specification specification;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public SpecificationItem() {
    }

    public Long getId() {
        return id;
    }

    public String getArticle() {
        return article;
    }

    public void setArticle(String article) {
        this.article = article;
    }

    public String getSuitability() {
        return suitability;
    }

    public void setSuitability(String suitability) {
        this.suitability = suitability;
    }

    public String getMobiComment() {
        return mobiComment;
    }

    public void setMobiComment(String mobiComment) {
        this.mobiComment = mobiComment;
    }

    public Specification getSpecification() {
        return specification;
    }

    public void setSpecification(Specification specification) {
        this.specification = specification;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
