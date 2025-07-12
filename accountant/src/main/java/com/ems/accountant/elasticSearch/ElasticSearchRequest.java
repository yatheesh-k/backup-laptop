package com.ems.accountant.elasticSearch;

import co.elastic.clients.util.ObjectBuilder;
import com.ems.accountant.controller.filter.Filter;
import com.ems.accountant.daoImpl.DocumentIndex;
import lombok.Getter;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Function;

/**
 * @author Susmitha
 * Builder calss to build the Elastic search request.
 */
@Getter
public class ElasticSearchRequest {

    private static final Integer SIZE_ELASTIC_SEARCH_MAX_VAL = 9999;

    private final Collection<DocumentIndex> indices;
    private final Set<Filter> filters;
    private final int size;

    private ElasticSearchRequest(Builder builder) {
        this.indices = builder.indices;
        this.filters = builder.filters;
        this.size = builder.size;
    }

    public static ElasticSearchRequest of(Function<Builder
            , ObjectBuilder<ElasticSearchRequest>> fn) {
        return fn.apply(new Builder()).build();
    }

    /**
     * @author Susmitha
     * Builder class to hold the search data for ElasticSearch Builder.
     */
    public static class Builder {

        private final Collection<DocumentIndex> indices = new HashSet<>();
        private final Set<Filter> filters = new HashSet<>();
        private int size = SIZE_ELASTIC_SEARCH_MAX_VAL;

        public final Builder index(@Nonnull DocumentIndex value) {
            this.indices.add(value);
            return this;
        }

        public final Builder indices(@Nonnull Collection<DocumentIndex> value) {
            this.indices.addAll(new ArrayList<>(value));
            return this;
        }

        public final Builder filter(@Nonnull Filter value) {
            this.filters.add(value);
            return this;
        }

        public final Builder filter(@Nonnull Collection<Filter> values) {
            this.filters.addAll(values);
            return this;
        }

        public final Builder size(int value) {
            this.size = value;
            return this;
        }

        public final ElasticSearchRequest build() {
            return new ElasticSearchRequest(this);
        }
    }

}
