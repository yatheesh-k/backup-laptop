package com.ems.accountant.elasticSearch;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.GetResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.controller.filter.OperatorQueryBuilder;
import com.ems.accountant.daoImpl.DocumentIndex;
import com.ems.accountant.persistance.model.IDEntity;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class ElasticSearchUtil {

    public static SearchRequest buildSearchRequest(ElasticSearchRequest searchRequest) {
        BoolQuery.Builder builder = new BoolQuery.Builder();
        addRequestFilters(searchRequest.getFilters(), builder);

        return new SearchRequest.Builder()
                .index(getIndices(searchRequest.getIndices()))
                .query(Query.of(q -> q.bool(builder.build())))
                .size(searchRequest.getSize())
                .build();
    }

    public static <T extends IDEntity> T toDocument(GetResponse<T> response) {
        if (Objects.nonNull(response) && Objects.nonNull(response.source())) {
            T entity = response.source();
            entity.setId(response.id()); // Set the _id from the response
            return entity;
        }
        return null;
    }

    public static <T extends IDEntity> Collection<T> toDocuments(SearchResponse<T> searchResponse) {
        List<Hit<T>> hits = searchResponse.hits().hits();
        if (Objects.nonNull(hits) && !hits.isEmpty()) {
            return hits.stream()
                    .map(Hit::source)
                    .toList();
        }
        return Collections.emptyList();
    }

    private static void addRequestFilters(Collection<Filter> filters, BoolQuery.Builder builder) {
        filters.forEach(f -> addFilters(f, builder));
    }

    private static void addFilters(final Filter filter, BoolQuery.Builder builder) {
        OperatorQueryBuilder.build(filter).apply(builder);
    }

    private static List<String> getIndices(Collection<DocumentIndex> indices) {
        return indices.stream()
                .map(DocumentIndex::getName)
                .toList();
    }

}
