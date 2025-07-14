package com.ems.accountant.controller.filter;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhraseQuery;

public final class MatchQuery extends BaseQuery {

    MatchQuery(final Filter filter) {
        super(filter);
    }

    @Override
    public void apply(BoolQuery.Builder builder) {
        builder.must(b -> b.matchPhrase(matchPhraseQuery(filter.getField(), filter.getValue()[0])));
    }


    private static MatchPhraseQuery matchPhraseQuery(String key, String value) {
        return new MatchPhraseQuery.Builder()
                .field(key)
                .query(value)
                .build();
    }
}
