package com.ems.taxConsultant.controller.filter;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;

public abstract class BaseQuery {

    protected final Filter filter;
    BaseQuery(final Filter filter) {
        this.filter = filter;
    }

    public abstract void apply(BoolQuery.Builder builder);
}
