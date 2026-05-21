package com.mobivisor.mobivisortechnicalinfoportal.entity.elasticsearch;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

@JsonIgnoreProperties(ignoreUnknown = true)
@Document(indexName = "specifications")
public class SpecificationItemElastic {

    @Id
    private Long id;

    @Field(type = FieldType.Text)
    private String article;

    @Field(type = FieldType.Text)
    private String suitability;

    @Field(type = FieldType.Text)
    private String mobiComment;

    @Field(type = FieldType.Text)
    private String specificationName;

    @Field(type = FieldType.Text)
    private String categoryName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getArticle() { return article; }
    public void setArticle(String article) { this.article = article; }

    public String getSuitability() { return suitability; }
    public void setSuitability(String suitability) { this.suitability = suitability; }

    public String getMobiComment() { return mobiComment; }
    public void setMobiComment(String mobiComment) { this.mobiComment = mobiComment; }

    public String getSpecificationName() { return specificationName; }
    public void setSpecificationName(String specificationName) { this.specificationName = specificationName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
