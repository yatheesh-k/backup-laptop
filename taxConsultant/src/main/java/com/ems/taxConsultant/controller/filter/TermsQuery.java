package com.ems.taxConsultant.controller.filter;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;

import java.util.stream.Stream;

public final class TermsQuery extends BaseQuery {

    TermsQuery(final Filter filter) {
        super(filter);
    }

    @Override
    public void apply(BoolQuery.Builder builder) {
        builder.filter(b -> b.terms(termsQuery(filter.getField(), filter.getValue())));
    }

    private static co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery termsQuery(String key, String... values) {
        return new co.elastic.clients.elasticsearch._types.query_dsl.TermsQuery.Builder()
                .field(key)
                .terms(t -> t.value(Stream.of(values).map(FieldValue::of).toList()))
                .build();
    }
}
