package com.mobivisor.mobivisortechnicalinfoportal.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.mobivisor.mobivisortechnicalinfoportal.entity.elasticsearch.SpecificationItemElastic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SpecificationItemSearchService {

    private static final Logger logger = LoggerFactory.getLogger(SpecificationItemSearchService.class);

    private final ElasticsearchClient elasticsearchClient;

    public SpecificationItemSearchService(ElasticsearchClient elasticsearchClient) {
        this.elasticsearchClient = elasticsearchClient;
    }

    public List<SpecificationItemElastic> searchByKeyword(String keyword) {
        logger.info("Keyword ile arama başlatıldı: '{}'", keyword);
        try {
            SearchRequest request = SearchRequest.of(s -> s
                    .index("specifications")
                    .size(1000)
                    .query(q -> q
                            .bool(b -> b
                                    .should(sh -> sh
                                            .matchPhrase(mp -> mp
                                                    .field("article")
                                                    .query(keyword)
                                                    .boost(5.0f)
                                            )
                                    )
                                    .should(sh -> sh
                                            .multiMatch(mm -> mm
                                                    .fields("article^3", "mobiComment^2", "specificationName", "suitability", "categoryName^2")
                                                    .query(keyword)
                                                    .fuzziness("AUTO")
                                                    .prefixLength(1)
                                                    .minimumShouldMatch("75%")
                                            )
                                    )
                                    .minimumShouldMatch("1")
                            )
                    )
            );

            SearchResponse<SpecificationItemElastic> response =
                    elasticsearchClient.search(request, SpecificationItemElastic.class);

            int hitCount = response.hits().hits().size();
            logger.info("Arama tamamlandı: {} sonuç bulundu", hitCount);

            return response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Keyword arama hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Elasticsearch arama hatası: " + e.getMessage(), e);
        }
    }

    public List<SpecificationItemElastic> searchByKeywordAndSpecificationName(String keyword, String specificationName) {
        logger.info("Keyword ve specificationName ile arama başlatıldı: keyword='{}', specificationName='{}'", keyword, specificationName);

        try {
            SearchRequest request = SearchRequest.of(s -> s
                    .index("specifications")
                    .size(1000)
                    .query(q -> q
                            .bool(b -> b
                                    .must(m -> m
                                            .term(t -> t
                                                    .field("specificationName")
                                                    .value(specificationName)
                                            )
                                    )
                                    .must(m -> m
                                            .bool(inner -> inner
                                                    .should(sh -> sh
                                                            .matchPhrase(mp -> mp
                                                                    .field("article")
                                                                    .query(keyword)
                                                                    .boost(5.0f)
                                                            )
                                                    )
                                                    .should(sh -> sh
                                                            .multiMatch(mm -> mm
                                                                    .fields("article^3", "mobiComment^2", "categoryName^2", "suitability")
                                                                    .query(keyword)
                                                                    .fuzziness("AUTO")
                                                                    .prefixLength(1)
                                                                    .minimumShouldMatch("75%")
                                                            )
                                                    )
                                                    .minimumShouldMatch("1")
                                            )
                                    )
                            )
                    )
            );


            SearchResponse<SpecificationItemElastic> response =
                    elasticsearchClient.search(request, SpecificationItemElastic.class);

            int hitCount = response.hits().hits().size();
            logger.info("Filtreli arama tamamlandı: {} sonuç bulundu", hitCount);

            return response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Keyword + specificationName arama hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Elasticsearch arama hatası: " + e.getMessage(), e);
        }
    }

    public List<SpecificationItemElastic> searchBySpecificationName(String specificationName) {
        logger.info("SpecificationName ile arama: '{}'", specificationName);
        try {
            SearchRequest request = SearchRequest.of(s -> s
                    .index("specifications")
                    .size(10000)
                    .query(q -> q
                            .term(t -> t
                                    .field("specificationName")
                                    .value(specificationName)
                            )
                    )
            );

            SearchResponse<SpecificationItemElastic> response =
                    elasticsearchClient.search(request, SpecificationItemElastic.class);

            int hitCount = response.hits().hits().size();
            logger.info("SpecificationName araması tamamlandı: {} sonuç", hitCount);

            return response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("SpecificationName arama hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Elasticsearch specification name arama hatası: " + e.getMessage(), e);
        }
    }

    public void indexSpecification(SpecificationItemElastic specification) {
        try {
            elasticsearchClient.index(i -> i
                    .index("specifications")
                    .id(specification.getId().toString())
                    .document(specification)
            );
            logger.info("Elasticsearch indexlendi: id={}", specification.getId());
        } catch (Exception e) {
            logger.error("Indexleme hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Indexleme hatası: " + e.getMessage(), e);
        }
    }

    public void deleteFromIndex(Long id) {
        logger.info("Elasticsearch index siliniyor: id={}", id);
        try {
            elasticsearchClient.delete(d -> d
                    .index("specifications")
                    .id(id.toString())
            );
        } catch (Exception e) {
            logger.error("Silme hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Index silme hatası: " + e.getMessage(), e);
        }
    }

    public void deleteAllFromIndex() {
        logger.warn("Tüm Elasticsearch index verileri siliniyor!");
        try {
            elasticsearchClient.deleteByQuery(d -> d
                    .index("specifications")
                    .query(q -> q.matchAll(m -> m))
            );
        } catch (Exception e) {
            logger.error("Toplu silme hatası: {}", e.getMessage(), e);
            throw new RuntimeException("Toplu silme hatası: " + e.getMessage(), e);
        }
    }

}
